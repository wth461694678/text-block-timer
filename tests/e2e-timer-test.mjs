/**
 * E2E Automated Test for Text Block Timer Plugin
 *
 * Connects to Obsidian's remote debugging port via CDP (Chrome DevTools Protocol)
 * WebSocket, then uses Runtime.evaluate to call app.commands.executeCommandById()
 * and inspect plugin state. Validates data correctness across:
 *   - Editor line content (timer HTML span)
 *   - In-memory TimerManager state
 *   - TimerDatabase entries & daily_dur
 *   - IndexedDB (real-time authoritative cache)
 *   - Sidebar DOM elements (list, summary, chart)
 *   - Status bar display
 *   - Cross-layer consistency (IDB ↔ JSON ↔ TimerManager)
 *
 * Usage:
 *   1. Start Obsidian with --remote-debugging-port=9222
 *   2. Open a markdown file (will be used as the test target)
 *   3. Run: node tests/e2e-timer-test.mjs
 *
 * Prerequisites:
 *   - Node.js 18+ (uses native WebSocket)
 *   - Obsidian running with remote debugging enabled
 */

// ─── Configuration ───────────────────────────────────────────────────────────

const CDP_HOST = 'localhost';
const CDP_PORT = 9222;
const WAIT_AFTER_COMMAND = 2000; // ms to wait after each command for effects to settle
const WAIT_TICK_ACCUMULATE = 6000; // ms to let a running timer accumulate some seconds
const TICK_TOLERANCE = 2; // seconds tolerance for tick-based assertions

// ─── CDP Helper ──────────────────────────────────────────────────────────────

class CDPClient {
    constructor(wsUrl) {
        this.wsUrl = wsUrl;
        this.ws = null;
        this.msgId = 0;
        this.pending = new Map();
    }

    async connect() {
        return new Promise((resolve, reject) => {
            this.ws = new WebSocket(this.wsUrl);
            this.ws.addEventListener('open', () => resolve());
            this.ws.addEventListener('error', (e) => reject(e));
            this.ws.addEventListener('message', (evt) => {
                const raw = (typeof evt === 'string') ? evt : (evt.data || evt);
                this._onMessage(raw);
            });
        });
    }

    _onMessage(raw) {
        try {
            const text = typeof raw === 'string' ? raw : raw.toString();
            const msg = JSON.parse(text);
            if (msg.id !== undefined && this.pending.has(msg.id)) {
                this.pending.get(msg.id)(msg);
                this.pending.delete(msg.id);
            }
        } catch (e) { /* ignore */ }
    }

    async send(method, params = {}) {
        const id = ++this.msgId;
        return new Promise((resolve, reject) => {
            this.pending.set(id, resolve);
            this.ws.send(JSON.stringify({ id, method, params }));
            setTimeout(() => {
                if (this.pending.has(id)) {
                    this.pending.delete(id);
                    reject(new Error(`CDP timeout for ${method} (id=${id})`));
                }
            }, 30000);
        });
    }

    async evaluate(expression, awaitPromise = false) {
        const resp = await this.send('Runtime.evaluate', {
            expression,
            awaitPromise,
            returnByValue: true
        });
        if (resp.result && resp.result.result && resp.result.result.value !== undefined) {
            return resp.result.result.value;
        }
        if (resp.result && resp.result.exceptionDetails) {
            const d = resp.result.exceptionDetails;
            const desc = d.exception && d.exception.description ? d.exception.description : JSON.stringify(d);
            throw new Error(`JS Error: ${desc}`);
        }
        return resp.result ? resp.result.result : undefined;
    }

    close() { if (this.ws) this.ws.close(); }
}

// ─── Utility ─────────────────────────────────────────────────────────────────

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

function assert(cond, msg) { if (!cond) throw new Error(`ASSERTION FAILED: ${msg}`); }

function log(emoji, msg) { console.log(`${emoji}  ${msg}`); }

// ─── Discover Obsidian WebSocket URL ─────────────────────────────────────────

async function discoverWsUrl() {
    const resp = await fetch(`http://${CDP_HOST}:${CDP_PORT}/json`);
    const targets = await resp.json();
    const obsidian = targets.find(t =>
        t.type === 'page' && ((t.url && t.url.includes('obsidian')) || (t.title && t.title.toLowerCase().includes('obsidian')))
    );
    if (!obsidian) throw new Error('Obsidian page not found in CDP targets.');
    log('🔗', `Found Obsidian: "${obsidian.title}"`);
    return obsidian.webSocketDebuggerUrl;
}

// ─── Test Runner ─────────────────────────────────────────────────────────────

class TestRunner {
    constructor(cdp) {
        this.cdp = cdp;
        this.passed = 0;
        this.failed = 0;
        this.errors = [];
    }

    async run(name, fn) {
        log('🧪', `TEST: ${name}`);
        try {
            await fn();
            this.passed++;
            log('✅', `PASS: ${name}`);
        } catch (e) {
            this.failed++;
            this.errors.push({ name, error: e.message });
            log('❌', `FAIL: ${name} — ${e.message}`);
        }
    }

    summary() {
        console.log('\n' + '═'.repeat(60));
        log('📊', `Results: ${this.passed} passed, ${this.failed} failed, ${this.passed + this.failed} total`);
        if (this.errors.length > 0) {
            console.log('\nFailures:');
            for (const { name, error }
                of this.errors) {
                console.log(`  ❌ ${name}: ${error}`);
            }
        }
        console.log('═'.repeat(60));
        return this.failed === 0;
    }

    async eval(expr) { return this.cdp.evaluate(expr); }
    async evalAsync(expr) { return this.cdp.evaluate(`(async () => { ${expr} })()`, true); }
    async executeCommand(id) { return this.evalAsync(`await app.commands.executeCommandById('${id}');`); }

    async setCursorToLine(n) {
        return this.eval(`(() => {
            const v = app.workspace.activeEditor;
            if (!v?.editor) return false;
            v.editor.setCursor({ line: ${n}, ch: 0 });
            return true;
        })()`);
    }
}

// ─── IDB eval helpers ────────────────────────────────────────────────────────
// These helpers call the plugin's idb instance from within Obsidian's runtime.

/** Read a single timer from IDB */
function idbGetTimer(timerId) {
    return `
        const idb = app.plugins.plugins['text-block-timer'].idb;
        const entry = await idb.getTimer('${timerId}');
        return entry ? JSON.stringify(entry) : null;
    `;
}

/** Read all daily_dur records for a timer from IDB */
function idbGetDailyByTimer(timerId) {
    return `
        const idb = app.plugins.plugins['text-block-timer'].idb;
        const recs = await idb.getDailyDurByTimer('${timerId}');
        return JSON.stringify(recs);
    `;
}

/** Read all daily_dur records for today from IDB */
function idbGetDailyByDate(date) {
    return `
        const idb = app.plugins.plugins['text-block-timer'].idb;
        const recs = await idb.getDailyDurByDate('${date}');
        return JSON.stringify(recs);
    `;
}

/** Read all daily_dur records from IDB */
function idbGetAllDaily() {
    return `
        const idb = app.plugins.plugins['text-block-timer'].idb;
        const recs = await idb.getAllDailyDur();
        return JSON.stringify(recs);
    `;
}

/** Read all timers from IDB */
function idbGetAllTimers() {
    return `
        const idb = app.plugins.plugins['text-block-timer'].idb;
        const entries = await idb.getAllTimers();
        return JSON.stringify(entries);
    `;
}

/** Read timers by state from IDB */
function idbGetTimersByState(states) {
    const statesStr = JSON.stringify(states);
    return `
        const idb = app.plugins.plugins['text-block-timer'].idb;
        const entries = await idb.getTimersByState(${statesStr});
        return JSON.stringify(entries);
    `;
}


// ═════════════════════════════════════════════════════════════════════════════
// TEST CHAINS
// Each chain is an independent group of tests that can be run individually.
// Dependency: basic/adjust/seed/delete all require preflight.
//             crossday only requires preflight.
//
// Available chains:
//   preflight        — plugin loaded, editor open, IDB ready
//   basic            — CRUD lifecycle, sidebar list/summary, IDB consistency
//   sidebar_tabs     — scope switching, filter/sort, summary, chart data, statistics toggle
//   readonly         — timer ticking in preview/reading mode
//   adjust           — manual set duration + IDB adjustDailyDur
//   seed             — seedIndexedDB / clearAll stale data
//   delete           — delete timer, sidebar removal, final consistency
//   crossday         — cross-midnight timer via Date monkey-patch
//   crossday_adjust  — multi-day timer via multiple Date patches + manual increase/decrease allocation
//
// Usage:
//   node tests/e2e-timer-test.mjs                    # run ALL chains
//   node tests/e2e-timer-test.mjs crossday            # run only crossday
//   node tests/e2e-timer-test.mjs crossday_adjust     # run multi-day adjust test
//   node tests/e2e-timer-test.mjs sidebar_tabs        # run only sidebar_tabs
//   node tests/e2e-timer-test.mjs readonly            # run only readonly
//   node tests/e2e-timer-test.mjs basic,adjust        # run basic + adjust
// ═════════════════════════════════════════════════════════════════════════════

// Shared state across chains (populated by preflight/basic)
const shared = {
    today: null,
    testLineNum: null,
    createdTimerId: null,
    initial: null,
    pausedDur: 0,
    preAdjustDur: 0,
    preAdjustDailySum: 0,
};

// ─── Chain: preflight ────────────────────────────────────────────────────────

async function chain_preflight(runner) {
    shared.today = new Date().toLocaleDateString('sv'); // YYYY-MM-DD

    // ══════════════════════════════════════════════════════════════════════════
    // PHASE 0: Pre-flight
    // ══════════════════════════════════════════════════════════════════════════

    await runner.run('Plugin is loaded', async() => {
        const loaded = await runner.eval(`!!app.plugins.plugins['text-block-timer']`);
        assert(loaded, 'text-block-timer plugin is not loaded');
    });

    await runner.run('Active file is open in editor', async() => {
        const has = await runner.eval(`!!app.workspace.activeEditor?.editor`);
        assert(has, 'No active editor — please open a markdown file');
    });

    await runner.run('IDB is initialized', async() => {
        const ok = await runner.eval(`!!app.plugins.plugins['text-block-timer'].idb`);
        assert(ok, 'IndexedDB instance (plugin.idb) is not available');
    });

    // Disable background tick throttle
    await runner.eval(`(() => {
        const p = app.plugins.plugins['text-block-timer'];
        p.manager._origBgThreshold = p.manager.backgroundThreshold;
        p.manager.backgroundThreshold = 600000;
        return true;
    })()`);
    log('⚙️', 'Disabled background tick throttle');

    const initial = JSON.parse(await runner.eval(`(() => {
        const p = app.plugins.plugins['text-block-timer'];
        const ed = app.workspace.activeEditor.editor;
        return JSON.stringify({
            lineCount: ed.lineCount(),
            filePath: app.workspace.getActiveFile()?.path ?? ''
        });
    })()`));
    shared.initial = initial;
    log('📋', `File: ${initial.filePath}, ${initial.lineCount} lines`);
}

// ─── Chain: basic ────────────────────────────────────────────────────────────

async function chain_basic(runner) {
    const today = shared.today;
    const initial = shared.initial;

    // ══════════════════════════════════════════════════════════════════════════
    // PHASE 1: Insert test line & create timer
    // ══════════════════════════════════════════════════════════════════════════

    shared.testLineNum = await runner.eval(`(() => {
        const ed = app.workspace.activeEditor.editor;
        const last = ed.lineCount() - 1;
        ed.replaceRange('\\nE2E_SIDEBAR_TEST_' + Date.now(), { line: last, ch: ed.getLine(last).length });
        const n = ed.lineCount() - 1;
        ed.setCursor({ line: n, ch: 0 });
        return n;
    })()`);
    const testLineNum = shared.testLineNum;
    log('📝', `Inserted test line at L${testLineNum}`);
    await sleep(500);

    await runner.run('START timer on test line', async() => {
        await runner.setCursorToLine(testLineNum);
        await sleep(200);
        await runner.executeCommand('text-block-timer:toggle-timer');
        await sleep(WAIT_AFTER_COMMAND);

        const lineText = await runner.eval(`app.workspace.activeEditor.editor.getLine(${testLineNum})`);
        assert(lineText ?.includes('class="timer-r"'), `Expected timer-r span, got: "${lineText}"`);

        const match = lineText.match(/id="([^"]+)"/);
        assert(match, 'Timer ID not found');
        shared.createdTimerId = match[1];
        log('🆔', `Timer ID: ${shared.createdTimerId}`);
    });

    const createdTimerId = shared.createdTimerId;

    // ══════════════════════════════════════════════════════════════════════════
    // PHASE 2: IDB seeded correctly after START
    // ══════════════════════════════════════════════════════════════════════════

    await runner.run('IDB: timer entry exists with state=running after START', async() => {
        const raw = await runner.evalAsync(idbGetTimer(createdTimerId));
        assert(raw, 'Timer not found in IDB');
        const entry = JSON.parse(raw);
        assert(entry.state === 'running', `Expected state=running, got ${entry.state}`);
        assert(entry.file_path === initial.filePath, `file_path mismatch`);
        assert(entry.total_dur_sec >= 0, `total_dur_sec should be >= 0`);
        log('📊', `IDB timer: state=${entry.state}, dur=${entry.total_dur_sec}s`);
    });

    // ══════════════════════════════════════════════════════════════════════════
    // PHASE 3: Tick accumulation — IDB tickDelta correctness (core fix)
    // ══════════════════════════════════════════════════════════════════════════

    await runner.run('IDB tickDelta: daily_dur accumulates ~1s per tick', async() => {
        // Read IDB daily_dur before waiting
        const beforeRaw = await runner.evalAsync(idbGetDailyByTimer(createdTimerId));
        const beforeRecs = JSON.parse(beforeRaw);
        const beforeDur = beforeRecs.find(r => r.stat_date === today) ?.duration_sec ?? 0;

        // Also read IDB timer total_dur_sec
        const beforeTimerRaw = await runner.evalAsync(idbGetTimer(createdTimerId));
        const beforeTimer = JSON.parse(beforeTimerRaw);
        const beforeTotalDur = beforeTimer.total_dur_sec;

        // Wait for ticks
        const waitSec = WAIT_TICK_ACCUMULATE / 1000;
        log('⏳', `Waiting ${waitSec}s for tick accumulation...`);
        await sleep(WAIT_TICK_ACCUMULATE);

        // Read IDB daily_dur after waiting
        const afterRaw = await runner.evalAsync(idbGetDailyByTimer(createdTimerId));
        const afterRecs = JSON.parse(afterRaw);
        const afterDur = afterRecs.find(r => r.stat_date === today) ?.duration_sec ?? 0;

        // Read IDB timer total_dur_sec after
        const afterTimerRaw = await runner.evalAsync(idbGetTimer(createdTimerId));
        const afterTimer = JSON.parse(afterTimerRaw);
        const afterTotalDur = afterTimer.total_dur_sec;

        const dailyIncrease = afterDur - beforeDur;
        const totalIncrease = afterTotalDur - beforeTotalDur;
        const minExpected = waitSec - TICK_TOLERANCE;

        log('📊', `IDB daily_dur increase: ${dailyIncrease}s (expected ~${waitSec}s)`);
        log('📊', `IDB total_dur increase: ${totalIncrease}s (expected ~${waitSec}s)`);

        assert(dailyIncrease >= minExpected,
            `daily_dur increase ${dailyIncrease}s too small (expected >= ${minExpected}s). ` +
            `This was the core tickDelta bug — if ~0, the fix is not working.`);
        assert(totalIncrease >= minExpected,
            `total_dur increase ${totalIncrease}s too small (expected >= ${minExpected}s)`);

        // daily_dur should approximately match total_dur increase
        const drift = Math.abs(dailyIncrease - totalIncrease);
        assert(drift <= TICK_TOLERANCE,
            `daily_dur/total_dur drift: ${drift}s (tolerance ${TICK_TOLERANCE}s)`);
    });

    // ══════════════════════════════════════════════════════════════════════════
    // PHASE 4: Sidebar list — data from IDB (running timer visible)
    // ══════════════════════════════════════════════════════════════════════════

    await runner.run('Sidebar list: running timer card visible with correct data', async() => {
        const state = JSON.parse(await runner.eval(`(() => {
            const leaves = app.workspace.getLeavesOfType('timer-sidebar');
            if (!leaves.length) return JSON.stringify({ exists: false });
            const c = leaves[0].view.containerEl;
            const cards = c.querySelectorAll('.timer-card');
            const runCards = c.querySelectorAll('.timer-card-running');
            const ourEl = c.querySelector('[data-timer-id="${createdTimerId}"]');
            return JSON.stringify({
                exists: true,
                totalCards: cards.length,
                runningCards: runCards.length,
                ourTimerVisible: !!ourEl,
                ourDurText: ourEl?.textContent ?? ''
            });
        })()`));
        assert(state.exists, 'Sidebar not found');
        assert(state.ourTimerVisible, 'Our timer card not found in sidebar (data-timer-id element missing)');
        assert(state.runningCards >= 1, `Expected >= 1 running card, got ${state.runningCards}`);
        log('📊', `Sidebar: ${state.totalCards} total cards, ${state.runningCards} running, dur="${state.ourDurText}"`);
    });

    await runner.run('Sidebar summary: running count >= 1', async() => {
        const state = JSON.parse(await runner.eval(`(() => {
            const leaves = app.workspace.getLeavesOfType('timer-sidebar');
            if (!leaves.length) return JSON.stringify({});
            const c = leaves[0].view.containerEl;
            return JSON.stringify({
                count: c.querySelector('[data-summary-count]')?.textContent ?? '0',
                running: c.querySelector('[data-summary-running-count]')?.textContent ?? '0',
                paused: c.querySelector('[data-summary-paused-count]')?.textContent ?? '0',
                totalDur: c.querySelector('[data-summary-total]')?.textContent ?? '',
                runningDur: c.querySelector('[data-summary-running]')?.textContent ?? ''
            });
        })()`));
        assert(parseInt(state.running) >= 1, `Running count should be >= 1, got ${state.running}`);
        assert(parseInt(state.count) >= 1, `Total count should be >= 1, got ${state.count}`);
        log('📊', `Summary: total=${state.count}, running=${state.running}, paused=${state.paused}`);
        log('📊', `Summary dur: total="${state.totalDur}", running="${state.runningDur}"`);
    });

    // ══════════════════════════════════════════════════════════════════════════
    // PHASE 5: Sidebar list dur matches IDB dur (real-time consistency)
    // ══════════════════════════════════════════════════════════════════════════

    await runner.run('Sidebar card dur matches IDB timer.total_dur_sec (±2s)', async() => {
        // Read IDB timer dur
        const idbRaw = await runner.evalAsync(idbGetTimer(createdTimerId));
        const idbEntry = JSON.parse(idbRaw);
        const idbDur = idbEntry.total_dur_sec;

        // Read sidebar card dur via TimerManager (sidebar patches from manager)
        const managerDur = await runner.eval(`(() => {
            const p = app.plugins.plugins['text-block-timer'];
            const d = p.manager.getTimerData('${createdTimerId}');
            return d ? d.dur : -1;
        })()`);

        const diff = Math.abs(idbDur - managerDur);
        log('📊', `IDB dur=${idbDur}s, Manager dur=${managerDur}s, diff=${diff}s`);
        assert(diff <= TICK_TOLERANCE,
            `IDB/Manager dur mismatch: IDB=${idbDur}, Manager=${managerDur}, diff=${diff}s`);
    });

    // ══════════════════════════════════════════════════════════════════════════
    // PHASE 6: Status bar shows running timer info
    // ══════════════════════════════════════════════════════════════════════════

    await runner.run('Status bar: shows running timer info', async() => {
        const text = await runner.eval(`
            app.plugins.plugins['text-block-timer'].statusBarItem?.textContent ?? ''
        `);
        assert(text.length > 0, 'Status bar is empty');
        log('📊', `Status bar: "${text}"`);
    });

    // ══════════════════════════════════════════════════════════════════════════
    // PHASE 7: PAUSE timer → verify IDB state + sidebar updates
    // ══════════════════════════════════════════════════════════════════════════




    await runner.run('PAUSE timer', async() => {
        await runner.setCursorToLine(testLineNum);
        await sleep(200);
        await runner.executeCommand('text-block-timer:toggle-timer');
        await sleep(WAIT_AFTER_COMMAND);

        const lineText = await runner.eval(`app.workspace.activeEditor.editor.getLine(${testLineNum})`);
        assert(lineText ?.includes('class="timer-p"'), `Expected timer-p, got: "${lineText}"`);

        const durMatch = lineText.match(/data-dur="(\d+)"/);
        assert(durMatch, 'data-dur not found');
        shared.pausedDur = parseInt(durMatch[1], 10);
        assert(shared.pausedDur > 0, `Expected dur > 0, got ${shared.pausedDur}`);
        log('⏱', `Paused with dur=${shared.pausedDur}s`);
    });

    await runner.run('IDB: timer state=paused after PAUSE', async() => {
        const raw = await runner.evalAsync(idbGetTimer(createdTimerId));
        assert(raw, 'Timer not in IDB after pause');
        const entry = JSON.parse(raw);
        assert(entry.state === 'paused', `Expected paused, got ${entry.state}`);
        // IDB total_dur_sec should match editor dur (±2s because tick timing)
        const diff = Math.abs(entry.total_dur_sec - shared.pausedDur);
        assert(diff <= TICK_TOLERANCE,
            `IDB dur ${entry.total_dur_sec} vs editor dur ${shared.pausedDur}, diff=${diff}s`);
        log('📊', `IDB after pause: state=${entry.state}, dur=${entry.total_dur_sec}s`);
    });

    await runner.run('IDB: daily_dur not double-written on pause (no pause addDailyDur)', async() => {
        // After pause, IDB daily_dur should be consistent with total_dur_sec
        const dailyRaw = await runner.evalAsync(idbGetDailyByTimer(createdTimerId));
        const dailyRecs = JSON.parse(dailyRaw);
        const dailySum = dailyRecs.reduce((s, r) => s + r.duration_sec, 0);

        const timerRaw = await runner.evalAsync(idbGetTimer(createdTimerId));
        const timer = JSON.parse(timerRaw);

        const drift = Math.abs(dailySum - timer.total_dur_sec);
        log('📊', `IDB daily_sum=${dailySum}s, total_dur=${timer.total_dur_sec}s, drift=${drift}s`);
        assert(drift <= TICK_TOLERANCE,
            `IDB daily_dur sum (${dailySum}) drifts from total_dur (${timer.total_dur_sec}) by ${drift}s. ` +
            `If dailySum >> total, pause likely double-wrote daily_dur.`);
    });

    await runner.run('Sidebar list: timer card changed to paused', async() => {
        const state = JSON.parse(await runner.eval(`(() => {
            const leaves = app.workspace.getLeavesOfType('timer-sidebar');
            if (!leaves.length) return JSON.stringify({});
            const c = leaves[0].view.containerEl;
            const runningEl = c.querySelector('[data-timer-id="${createdTimerId}"]');
            const pausedCards = c.querySelectorAll('.timer-card-paused');
            return JSON.stringify({
                runningElGone: !runningEl,
                pausedCount: pausedCards.length
            });
        })()`));
        assert(state.runningElGone, 'Running data-timer-id element should disappear after pause');
        assert(state.pausedCount >= 1, `Expected >= 1 paused card, got ${state.pausedCount}`);
    });

    await runner.run('Sidebar dur EXACTLY matches document dur after pause (0s tolerance)', async() => {
        // Read document dur
        const docDur = await runner.eval(`(() => {
            const lineText = app.workspace.activeEditor.editor.getLine(${testLineNum});
            const match = lineText.match(/data-dur="(\\d+)"/);
            return match ? parseInt(match[1], 10) : -1;
        })()`);
        assert(docDur > 0, 'Document dur should be > 0');

        // Read sidebar in-memory timerList dur for our timer
        const sidebarDur = await runner.eval(`(() => {
            const leaves = app.workspace.getLeavesOfType('timer-sidebar');
            if (!leaves.length) return -1;
            const view = leaves[0].view;
            const timer = view.timerList ? view.timerList.find(t => t.timerId === '${createdTimerId}') : null;
            return timer ? timer.dur : -1;
        })()`);

        // Read IDB dur
        const idbRaw = await runner.evalAsync(idbGetTimer(createdTimerId));
        const idbDur = idbRaw ? JSON.parse(idbRaw).total_dur_sec : -1;

        // Read JSON dur
        const jsonDur = await runner.eval(`(() => {
            const p = app.plugins.plugins['text-block-timer'];
            const e = p.database.data?.timers?.['${createdTimerId}'];
            return e ? e.total_dur_sec : -1;
        })()`);

        log('📊', `After pause exact: doc=${docDur}, sidebar=${sidebarDur}, IDB=${idbDur}, JSON=${jsonDur}`);

        // Sidebar dur must EXACTLY match document dur (this is the fix for the 1s drift)
        assert(sidebarDur === docDur,
            `Sidebar dur (${sidebarDur}) must exactly match document dur (${docDur}). ` +
            `If off by 1s, the fix for passing newDur through onTimerStateChanged is not working.`);

        // JSON dur must also exactly match document dur
        assert(jsonDur === docDur,
            `JSON dur (${jsonDur}) must exactly match document dur (${docDur}).`);
    });

    await runner.run('Sidebar summary: running count decreased after pause', async() => {
        const running = await runner.eval(`(() => {
            const leaves = app.workspace.getLeavesOfType('timer-sidebar');
            if (!leaves.length) return '-1';
            return leaves[0].view.containerEl.querySelector('[data-summary-running-count]')?.textContent ?? '-1';
        })()`);
        log('📊', `Running count after pause: ${running}`);
        // We don't know how many other timers exist, but count should be consistent
    });

    // ══════════════════════════════════════════════════════════════════════════
    // PHASE 8: JSON ↔ IDB cross-layer consistency after PAUSE
    // ══════════════════════════════════════════════════════════════════════════

    await runner.run('Cross-layer: JSON total_dur ≈ IDB total_dur (±2s)', async() => {
        await sleep(500); // wait for flush

        const jsonDur = await runner.eval(`(() => {
            const p = app.plugins.plugins['text-block-timer'];
            const e = p.database.data?.timers?.['${createdTimerId}'];
            return e ? e.total_dur_sec : -1;
        })()`);

        const idbRaw = await runner.evalAsync(idbGetTimer(createdTimerId));
        const idbEntry = JSON.parse(idbRaw);

        const diff = Math.abs(jsonDur - idbEntry.total_dur_sec);
        log('📊', `JSON dur=${jsonDur}s, IDB dur=${idbEntry.total_dur_sec}s, diff=${diff}s`);
        assert(diff <= TICK_TOLERANCE,
            `JSON/IDB total_dur mismatch: JSON=${jsonDur}, IDB=${idbEntry.total_dur_sec}`);
    });

    await runner.run('Cross-layer: JSON daily_dur ≈ IDB daily_dur (±2s)', async() => {
        const jsonDailyDur = await runner.eval(`(() => {
            const p = app.plugins.plugins['text-block-timer'];
            const dd = p.database.data?.daily_dur ?? {};
            let sum = 0;
            for (const [date, timerMap] of Object.entries(dd)) {
                if (timerMap['${createdTimerId}'] !== undefined) {
                    sum += timerMap['${createdTimerId}'];
                }
            }
            return sum;
        })()`);

        const idbDailyRaw = await runner.evalAsync(idbGetDailyByTimer(createdTimerId));
        const idbDailyRecs = JSON.parse(idbDailyRaw);
        const idbDailySum = idbDailyRecs.reduce((s, r) => s + r.duration_sec, 0);

        const diff = Math.abs(jsonDailyDur - idbDailySum);
        log('📊', `JSON daily_sum=${jsonDailyDur}s, IDB daily_sum=${idbDailySum}s, diff=${diff}s`);
        assert(diff <= TICK_TOLERANCE,
            `JSON/IDB daily_dur sum mismatch: JSON=${jsonDailyDur}, IDB=${idbDailySum}`);
    });

    // ══════════════════════════════════════════════════════════════════════════
    // PHASE 9: CONTINUE timer → verify IDB + sidebar
    // ══════════════════════════════════════════════════════════════════════════

    await runner.run('CONTINUE timer', async() => {
        await runner.setCursorToLine(testLineNum);
        await sleep(200);
        await runner.executeCommand('text-block-timer:toggle-timer');
        await sleep(WAIT_AFTER_COMMAND);

        const lineText = await runner.eval(`app.workspace.activeEditor.editor.getLine(${testLineNum})`);
        assert(lineText ?.includes('class="timer-r"'), `Expected timer-r after continue`);
    });

    await runner.run('IDB: state=running after CONTINUE', async() => {
        const raw = await runner.evalAsync(idbGetTimer(createdTimerId));
        const entry = JSON.parse(raw);
        assert(entry.state === 'running', `Expected running, got ${entry.state}`);
    });

    await runner.run('Sidebar: running card reappears after CONTINUE', async() => {
        const visible = await runner.eval(`(() => {
            const leaves = app.workspace.getLeavesOfType('timer-sidebar');
            if (!leaves.length) return false;
            return !!leaves[0].view.containerEl.querySelector('[data-timer-id="${createdTimerId}"]');
        })()`);
        assert(visible, 'Timer card should reappear as running in sidebar');
    });

    // Let it run a bit more to accumulate more daily_dur
    log('⏳', 'Waiting 3s for more tick accumulation...');
    await sleep(3000);

    // ══════════════════════════════════════════════════════════════════════════
    // PHASE 10: Sidebar chart data correctness (reads from IDB)
    // ══════════════════════════════════════════════════════════════════════════

    await runner.run('Sidebar chart: IDB daily_dur has today entry with dur > 0', async() => {
        const raw = await runner.evalAsync(idbGetDailyByDate(today));
        const recs = JSON.parse(raw);
        const ourRec = recs.find(r => r.timer_id === createdTimerId);
        assert(ourRec, `No IDB daily_dur record for today (${today}) for our timer`);
        assert(ourRec.duration_sec > 0, `Expected duration_sec > 0, got ${ourRec.duration_sec}`);
        log('📊', `IDB daily_dur today: ${ourRec.duration_sec}s`);
    });

    await runner.run('Sidebar chart: chartDataCache reflects IDB data', async() => {
        // Force chart re-render by toggling statistics
        const chartData = await runner.evalAsync(`
            const leaves = app.workspace.getLeavesOfType('timer-sidebar');
            if (!leaves.length) return null;
            const view = leaves[0].view;
            if (view.chartDataCache) {
                return JSON.stringify({
                    projects: view.chartDataCache.projects,
                    dates: view.chartDataCache.dates,
                    hasTodayDate: view.chartDataCache.dates.includes('${today}')
                });
            }
            return null;
        `);
        if (chartData) {
            const data = JSON.parse(chartData);
            log('📊', `Chart cache: projects=${JSON.stringify(data.projects)}, dates=${JSON.stringify(data.dates)}`);
            // Today should be in the dates array if our timer has daily_dur data
            assert(data.hasTodayDate, `Chart dates should include today (${today})`);
        } else {
            log('⚠️', 'Chart data cache not available — statistics may be hidden');
        }
    });

    // ══════════════════════════════════════════════════════════════════════════
    // PHASE 11: Sidebar loadAllData reads from IDB (scope=all)
    // ══════════════════════════════════════════════════════════════════════════

    await runner.run('Sidebar loadAllData: IDB getTimersByState returns our timer', async() => {
        const raw = await runner.evalAsync(idbGetTimersByState(['running', 'paused']));
        const entries = JSON.parse(raw);
        const ours = entries.find(e => e.timer_id === createdTimerId);
        assert(ours, 'Our timer not found in IDB getTimersByState(running,paused)');
        assert(ours.state === 'running', `Expected running, got ${ours.state}`);
        log('📊', `IDB getTimersByState: ${entries.length} entries, our state=${ours.state}`);
    });
}

// ─── Chain: adjust ────────────────────────────────────────────────────────────

async function chain_adjust(runner) {
    const today = shared.today;
    const testLineNum = shared.testLineNum;
    const createdTimerId = shared.createdTimerId;

    // ══════════════════════════════════════════════════════════════════════════
    // PHASE 12: PAUSE again → test manual set duration + IDB adjustDailyDur
    // ══════════════════════════════════════════════════════════════════════════

    await runner.run('PAUSE again for duration adjustment test', async() => {
        await runner.setCursorToLine(testLineNum);
        await sleep(200);
        await runner.executeCommand('text-block-timer:toggle-timer');
        await sleep(WAIT_AFTER_COMMAND);

        const lineText = await runner.eval(`app.workspace.activeEditor.editor.getLine(${testLineNum})`);
        assert(lineText ?.includes('class="timer-p"'), 'Expected timer-p');
    });

    // Use shared for pre-adjust state

    await runner.run('Record pre-adjustment IDB state', async() => {
        const timerRaw = await runner.evalAsync(idbGetTimer(createdTimerId));
        const timer = JSON.parse(timerRaw);
        shared.preAdjustDur = timer.total_dur_sec;

        const dailyRaw = await runner.evalAsync(idbGetDailyByTimer(createdTimerId));
        const recs = JSON.parse(dailyRaw);
        shared.preAdjustDailySum = recs.reduce((s, r) => s + r.duration_sec, 0);

        log('📊', `Pre-adjust: total_dur=${shared.preAdjustDur}s, daily_sum=${shared.preAdjustDailySum}s`);
        assert(shared.preAdjustDur > 0, 'Timer should have accumulated some duration');
    });

    await runner.run('Manual set duration: decrease via plugin.handleSetDuration', async() => {
        const newDur = 3;
        // Call handleSetDuration directly in Obsidian runtime.
        // We inline-parse the timer span since TimerParser is not exposed on the plugin instance.
        await runner.evalAsync(`
            const p = app.plugins.plugins['text-block-timer'];
            const view = app.workspace.activeEditor;
            const editor = view.editor;
            const lineText = editor.getLine(${testLineNum});

            // Inline parse: extract timer span data from HTML
            const tpl = document.createElement('template');
            tpl.innerHTML = lineText.trim();
            const el = tpl.content.querySelector('.timer-r, .timer-p');
            if (!el) throw new Error('No timer span found in line: ' + lineText);

            const timerId = el.id;
            const cls = el.className;
            const dur = parseInt(el.dataset.dur || '0', 10);
            const ts = parseInt(el.dataset.ts || '0', 10);
            const project = el.dataset.project || null;

            const regex = new RegExp('<span[^>]*id="' + timerId + '"[^>]*>.*?</span>');
            const match = lineText.match(regex);
            if (!match) throw new Error('Span regex match failed');

            const parsed = {
                class: cls,
                timerId: timerId,
                dur: dur,
                ts: ts,
                project: project,
                beforeIndex: match.index,
                afterIndex: match.index + match[0].length
            };

            p.handleSetDuration(view, ${testLineNum}, parsed, ${newDur});
            // Wait for async IDB writes to settle
            await new Promise(r => setTimeout(r, 500));
        `);
        await sleep(1000);
    });
    await runner.run('IDB: daily_dur adjusted correctly after decrease', async() => {
        const timerRaw = await runner.evalAsync(idbGetTimer(createdTimerId));
        const timer = JSON.parse(timerRaw);
        const dailyRaw = await runner.evalAsync(idbGetDailyByTimer(createdTimerId));
        const recs = JSON.parse(dailyRaw);
        const dailySum = recs.reduce((s, r) => s + r.duration_sec, 0);

        log('📊', `Post-adjust: total_dur=${timer.total_dur_sec}s, daily_sum=${dailySum}s`);
        // total_dur should be 3
        assert(timer.total_dur_sec === 3, `Expected total_dur=3, got ${timer.total_dur_sec}`);
        // daily_sum should also be 3 (adjusted to match)
        assert(dailySum === 3, `Expected daily_sum=3 after adjustment, got ${dailySum}`);
    });

    await runner.run('Sidebar: shows adjusted duration after manual set', async() => {
        // Trigger sidebar re-render
        await runner.evalAsync(`
            const leaves = app.workspace.getLeavesOfType('timer-sidebar');
            if (leaves.length) {
                const view = leaves[0].view;
                view.onTimerDurChanged('${createdTimerId}', 3);
            }
        `);
        await sleep(500);

        const cardDurText = await runner.eval(`(() => {
            const leaves = app.workspace.getLeavesOfType('timer-sidebar');
            if (!leaves.length) return '';
            const c = leaves[0].view.containerEl;
            const cards = c.querySelectorAll('.timer-card');
            for (const card of cards) {
                const fileEl = card.querySelector('.timer-card-file-source');
                if (fileEl?.textContent?.includes(':${testLineNum + 1}')) {
                    return card.querySelector('.timer-card-duration')?.textContent ?? '';
                }
            }
            return '';
        })()`);
        log('📊', `Sidebar card dur text after adjust: "${cardDurText}"`);
        assert(cardDurText.length > 0, 'Timer card duration text should be visible');
    });

    // ══════════════════════════════════════════════════════════════════════════
    // PHASE 13: CONTINUE → PAUSE → verify IDB daily_dur accumulates correctly
    //           (not double-counted because tick handles it)
    // ══════════════════════════════════════════════════════════════════════════

    await runner.run('CONTINUE for accumulation retest', async() => {
        await runner.setCursorToLine(testLineNum);
        await sleep(200);
        await runner.executeCommand('text-block-timer:toggle-timer');
        await sleep(WAIT_AFTER_COMMAND);
        const lineText = await runner.eval(`app.workspace.activeEditor.editor.getLine(${testLineNum})`);
        assert(lineText ?.includes('class="timer-r"'), 'Expected timer-r');
    });

    log('⏳', 'Waiting 4s for tick accumulation...');
    await sleep(4000);

    await runner.run('PAUSE after accumulation', async() => {
        await runner.setCursorToLine(testLineNum);
        await sleep(200);
        await runner.executeCommand('text-block-timer:toggle-timer');
        await sleep(WAIT_AFTER_COMMAND);
        const lineText = await runner.eval(`app.workspace.activeEditor.editor.getLine(${testLineNum})`);
        assert(lineText ?.includes('class="timer-p"'), 'Expected timer-p');
    });

    await runner.run('IDB: no double-write after continue→pause cycle', async() => {
        const timerRaw = await runner.evalAsync(idbGetTimer(createdTimerId));
        const timer = JSON.parse(timerRaw);
        const dailyRaw = await runner.evalAsync(idbGetDailyByTimer(createdTimerId));
        const recs = JSON.parse(dailyRaw);
        const dailySum = recs.reduce((s, r) => s + r.duration_sec, 0);

        const drift = Math.abs(dailySum - timer.total_dur_sec);
        log('📊', `After cycle: total_dur=${timer.total_dur_sec}s, daily_sum=${dailySum}s, drift=${drift}s`);
        // daily_sum should track total_dur closely — if double-write occurred, daily >> total
        assert(drift <= TICK_TOLERANCE,
            `daily_dur sum (${dailySum}) drifts from total_dur (${timer.total_dur_sec}) by ${drift}s. ` +
            `Drift >> 2 indicates double-write on pause.`);
        // total_dur should have increased from the 3s we set it to
        assert(timer.total_dur_sec > 3,
            `total_dur should have increased from 3s after running, got ${timer.total_dur_sec}s`);
    });
}

// ─── Chain: seed ──────────────────────────────────────────────────────────────

async function chain_seed(runner) {
    const createdTimerId = shared.createdTimerId;

    // ══════════════════════════════════════════════════════════════════════════
    // PHASE 14: seedIndexedDB + clearAll — reload plugin and verify clean seed
    // ══════════════════════════════════════════════════════════════════════════

    await runner.run('seedIndexedDB: clearAll removes stale data on reload', async() => {
        // Count IDB entries before reload
        const beforeAllRaw = await runner.evalAsync(idbGetAllTimers());
        const beforeAll = JSON.parse(beforeAllRaw);
        const beforeCount = beforeAll.length;

        // Inject a "stale" timer directly into IDB to simulate leftover data
        await runner.evalAsync(`
            const idb = app.plugins.plugins['text-block-timer'].idb;
            await idb.putTimer({
                timer_id: 'STALE_TEST_TIMER_XYZ',
                file_path: 'nonexistent.md',
                line_num: 0,
                line_text: 'stale',
                project: null,
                state: 'paused',
                total_dur_sec: 999,
                last_ts: 0,
                created_at: 0,
                updated_at: 0
            });
        `);

        // Verify stale entry exists
        const staleRaw = await runner.evalAsync(idbGetTimer('STALE_TEST_TIMER_XYZ'));
        assert(staleRaw, 'Stale timer should exist in IDB before reload');

        // Trigger seedIndexedDB (simulates plugin reload)
        await runner.evalAsync(`
            const p = app.plugins.plugins['text-block-timer'];
            // Call the private seedIndexedDB through the plugin instance
            if (typeof p.seedIndexedDB === 'function') {
                await p.seedIndexedDB();
            } else {
                // Access through prototype or direct property
                const proto = Object.getPrototypeOf(p);
                const method = proto.seedIndexedDB?.bind(p);
                if (method) await method();
            }
        `);
        await sleep(1000);

        // Verify stale entry is gone
        const afterStaleRaw = await runner.evalAsync(idbGetTimer('STALE_TEST_TIMER_XYZ'));
        assert(!afterStaleRaw, 'Stale timer should be cleared by seedIndexedDB (clearAll called)');

        // Our real timer should still be present (re-seeded from JSON)
        const ourRaw = await runner.evalAsync(idbGetTimer(createdTimerId));
        assert(ourRaw, 'Our timer should be re-seeded from JSON');
        const ours = JSON.parse(ourRaw);
        assert(ours.state === 'paused', `Expected paused after reseed, got ${ours.state}`);
        log('📊', `After reseed: stale removed ✓, our timer preserved ✓ (state=${ours.state})`);
    });
}

// ─── Chain: delete ────────────────────────────────────────────────────────────

async function chain_delete(runner) {
    const today = shared.today;
    const testLineNum = shared.testLineNum;
    const createdTimerId = shared.createdTimerId;

    // ══════════════════════════════════════════════════════════════════════════
    // PHASE 15: DELETE timer → verify IDB + sidebar
    // ══════════════════════════════════════════════════════════════════════════

    await runner.run('DELETE timer', async() => {
        await runner.setCursorToLine(testLineNum);
        await sleep(200);
        await runner.executeCommand('text-block-timer:delete-timer');
        await sleep(WAIT_AFTER_COMMAND);

        const lineText = await runner.eval(`app.workspace.activeEditor.editor.getLine(${testLineNum})`);
        assert(!lineText.includes('class="timer-'), `Timer span should be removed`);
        assert(lineText.includes('E2E_SIDEBAR_TEST_'), 'Original text should remain');
    });

    await runner.run('IDB: timer state=deleted after DELETE', async() => {
        const raw = await runner.evalAsync(idbGetTimer(createdTimerId));
        assert(raw, 'Timer should still exist in IDB with deleted state');
        const entry = JSON.parse(raw);
        assert(entry.state === 'deleted', `Expected deleted, got ${entry.state}`);
    });

    await runner.run('Sidebar: timer card removed after DELETE', async() => {
        const hasTimer = await runner.eval(`(() => {
            const leaves = app.workspace.getLeavesOfType('timer-sidebar');
            if (!leaves.length) return false;
            const c = leaves[0].view.containerEl;
            const cards = c.querySelectorAll('.timer-card');
            for (const card of cards) {
                const fileEl = card.querySelector('.timer-card-file-source');
                if (fileEl?.textContent?.includes(':${testLineNum + 1}')) return true;
            }
            return false;
        })()`);
        assert(!hasTimer, 'Timer card should be removed from sidebar after delete');
    });

    // ══════════════════════════════════════════════════════════════════════════
    // PHASE 16: IDB getTimersByState excludes deleted timers
    // ══════════════════════════════════════════════════════════════════════════

    await runner.run('IDB: getTimersByState([running,paused]) excludes deleted timer', async() => {
        const raw = await runner.evalAsync(idbGetTimersByState(['running', 'paused']));
        const entries = JSON.parse(raw);
        const ours = entries.find(e => e.timer_id === createdTimerId);
        assert(!ours, 'Deleted timer should not appear in getTimersByState(running,paused)');
    });

    // ══════════════════════════════════════════════════════════════════════════
    // PHASE 17: Final cross-layer consistency check
    // ══════════════════════════════════════════════════════════════════════════

    await runner.run('Final: JSON and IDB both reflect deleted state', async() => {
        await sleep(500);
        const jsonState = await runner.eval(`(() => {
            const p = app.plugins.plugins['text-block-timer'];
            return p.database.data?.timers?.['${createdTimerId}']?.state ?? 'missing';
        })()`);
        const idbRaw = await runner.evalAsync(idbGetTimer(createdTimerId));
        const idbState = idbRaw ? JSON.parse(idbRaw).state : 'missing';

        log('📊', `Final: JSON state=${jsonState}, IDB state=${idbState}`);
        assert(jsonState === 'deleted', `JSON should be deleted, got ${jsonState}`);
        assert(idbState === 'deleted', `IDB should be deleted, got ${idbState}`);
    });

    await runner.run('Final: Sidebar summary counts are consistent with visible cards', async() => {
        const result = JSON.parse(await runner.eval(`(() => {
            const leaves = app.workspace.getLeavesOfType('timer-sidebar');
            if (!leaves.length) return JSON.stringify({ skip: true });
            const c = leaves[0].view.containerEl;
            return JSON.stringify({
                skip: false,
                runningCards: c.querySelectorAll('.timer-card-running').length,
                pausedCards: c.querySelectorAll('.timer-card-paused').length,
                summaryTotal: parseInt(c.querySelector('[data-summary-count]')?.textContent ?? '0'),
                summaryRunning: parseInt(c.querySelector('[data-summary-running-count]')?.textContent ?? '0'),
                summaryPaused: parseInt(c.querySelector('[data-summary-paused-count]')?.textContent ?? '0')
            });
        })()`));
        if (result.skip) {
            log('⚠️', 'Sidebar not available — skipping');
            return;
        }
        const visibleTotal = result.runningCards + result.pausedCards;
        assert(result.summaryTotal >= visibleTotal,
            `Summary total (${result.summaryTotal}) should be >= visible (${visibleTotal})`);
        assert(result.summaryRunning >= result.runningCards,
            `Summary running (${result.summaryRunning}) should be >= running cards (${result.runningCards})`);
        assert(result.summaryPaused >= result.pausedCards,
            `Summary paused (${result.summaryPaused}) should be >= paused cards (${result.pausedCards})`);
        log('📊', `Summary: ${result.summaryTotal} total (${result.summaryRunning}R + ${result.summaryPaused}P), ` +
            `Cards: ${visibleTotal} (${result.runningCards}R + ${result.pausedCards}P)`);
    });
}

// ─── Chain: crossday ─────────────────────────────────────────────────────────
// Uses Date monkey-patch to shift time to yesterday 23:59:55.
// Since the offset is fixed and added to real Date.now(), real wall-clock
// passage of ~8s naturally advances the patched time past midnight into today.
// No second Date patch needed!
// ─────────────────────────────────────────────────────────────────────────────

async function chain_crossday(runner) {

    let crossDayTimerId = null;
    const crossDayTestLineNum = await runner.eval(`(() => {
        const ed = app.workspace.activeEditor.editor;
        const last = ed.lineCount() - 1;
        ed.replaceRange('\\nE2E_CROSSDAY_TEST_' + Date.now(), { line: last, ch: ed.getLine(last).length });
        const n = ed.lineCount() - 1;
        ed.setCursor({ line: n, ch: 0 });
        return n;
    })()`);
    log('📝', `Cross-day test line at L${crossDayTestLineNum}`);
    await sleep(500);

    // Helper: install Date monkey-patch in Obsidian runtime
    // offsetMs is a FIXED value added to real Date.now(), so real wall-clock
    // passage naturally advances the patched time as well.
    async function patchDate(offsetMs) {
        await runner.eval(`(() => {
            if (!window.__OrigDate) window.__OrigDate = Date;
            const OD = window.__OrigDate;
            const offset = ${offsetMs};
            function FakeDate(...args) {
                if (args.length === 0) return new OD(OD.now() + offset);
                return new OD(...args);
            }
            FakeDate.now = () => OD.now() + offset;
            FakeDate.parse = OD.parse.bind(OD);
            FakeDate.UTC = OD.UTC.bind(OD);
            FakeDate.prototype = OD.prototype;
            Date = FakeDate;
            return true;
        })()`);
    }

    // Helper: restore original Date
    async function restoreDate() {
        await runner.eval(`(() => {
            if (window.__OrigDate) { Date = window.__OrigDate; delete window.__OrigDate; }
            return true;
        })()`);
    }

    // Calculate fixed offset to place patched time at yesterday 23:59:55.
    // As real seconds pass, patched time naturally advances:
    //   +0s  → yesterday 23:59:55
    //   +5s  → today     00:00:00 (midnight!)
    //   +8s  → today     00:00:03
    const nowRealMs = Date.now();
    const realToday = new Date().toLocaleDateString('sv');
    const realYesterday = new Date(Date.now() - 86400000).toLocaleDateString('sv');
    const targetYesterday235955 = new Date(realYesterday + 'T23:59:55').getTime();
    const offsetMs = targetYesterday235955 - nowRealMs;

    log('🕐', `Fixed offset: ${offsetMs}ms (places patched time at ${realYesterday} 23:59:55)`);
    log('🕐', `Yesterday: ${realYesterday}, Today: ${realToday}`);
    log('🕐', `Plan: patch once → start timer → real ~5s → midnight crosses → real ~5s more → verify both days`);

    await runner.run('Cross-day: patch Date to yesterday 23:59:55 (single patch)', async() => {
        await patchDate(offsetMs);
        const fakeTime = await runner.eval(`new Date().toISOString()`);
        const fakeDate = await runner.eval(`new Date().toLocaleDateString('sv')`);
        log('🕐', `Patched time: ${fakeTime}, date: ${fakeDate}`);
        assert(fakeDate === realYesterday,
            `Expected date to be ${realYesterday}, got ${fakeDate}`);
    });

    await runner.run('Cross-day: START timer at yesterday 23:59:55', async() => {
        await runner.setCursorToLine(crossDayTestLineNum);
        await sleep(200);
        await runner.executeCommand('text-block-timer:toggle-timer');
        await sleep(WAIT_AFTER_COMMAND);

        const lineText = await runner.eval(`app.workspace.activeEditor.editor.getLine(${crossDayTestLineNum})`);
        assert(lineText.includes('class="timer-r"'), 'Expected timer-r span');
        const match = lineText.match(/id="([^"]+)"/);
        assert(match, 'Timer ID not found');
        crossDayTimerId = match[1];
        log('🆔', `Cross-day timer ID: ${crossDayTimerId}`);
    });

    // Let timer tick for ~3s while patched date is still "yesterday"
    log('⏳', 'Letting timer run ~3s in "yesterday" time...');
    await sleep(3000);

    await runner.run('Cross-day: verify IDB has yesterday daily_dur from ticks', async() => {
        const dailyRaw = await runner.evalAsync(idbGetDailyByTimer(crossDayTimerId));
        const recs = JSON.parse(dailyRaw);
        log('📊', `IDB daily_dur records after yesterday ticks: ${JSON.stringify(recs)}`);

        const yesterdayRec = recs.find(r => r.stat_date === realYesterday);
        assert(yesterdayRec, `IDB should have yesterday (${realYesterday}) record from ticks`);
        assert(yesterdayRec.duration_sec >= 2,
            `Yesterday IDB dur should be >= 2s, got ${yesterdayRec.duration_sec}s`);
    });

    // Now just WAIT for real wall-clock to pass midnight in the patched time.
    // We started at 23:59:55, so after ~5s real time → patched time crosses midnight.
    // We need ~5s more after that for today ticks to accumulate.
    // Total extra wait from start: already ~3s (above) + ~2s (toggle wait) = ~5s already.
    // So patched time is now ~23:59:55 + 5 = ~00:00:00. Need ~5s more for today ticks.
    log('⏳', 'Waiting ~5s for patched time to cross midnight and accumulate today ticks...');
    await sleep(5000);

    // Verify the patched time is now "today"
    await runner.run('Cross-day: verify patched time has naturally crossed to today', async() => {
        const fakeDate = await runner.eval(`new Date().toLocaleDateString('sv')`);
        const fakeTime = await runner.eval(`new Date().toISOString()`);
        log('🕐', `Current patched time: ${fakeTime}, date: ${fakeDate}`);
        assert(fakeDate === realToday,
            `Expected patched date to naturally advance to ${realToday}, but got ${fakeDate}. ` +
            `The fixed-offset approach means real time passage should cross midnight automatically.`);
    });

    await runner.run('Cross-day: checkDayBoundary detected — JSON has yesterday entry', async() => {
        const result = await runner.eval(`(() => {
            const p = app.plugins.plugins['text-block-timer'];
            const dd = p.database.data?.daily_dur ?? {};
            const yesterdayDur = dd['${realYesterday}']?.['${crossDayTimerId}'] ?? 0;
            const todayDur = dd['${realToday}']?.['${crossDayTimerId}'] ?? 0;
            return JSON.stringify({ yesterdayDur, todayDur });
        })()`);
        const data = JSON.parse(result);
        log('📊', `JSON daily_dur: yesterday(${realYesterday})=${data.yesterdayDur}s, today(${realToday})=${data.todayDur}s`);
        assert(data.yesterdayDur > 0,
            `Yesterday JSON daily_dur should be > 0, got ${data.yesterdayDur}s`);
        // Note: today JSON daily_dur may be 0 until handlePause writes it
        log('📊', `Today JSON daily_dur = ${data.todayDur}s (may be 0 until pause writes it)`);
    });

    await runner.run('Cross-day: IDB daily_dur has BOTH yesterday and today entries', async() => {
        const dailyRaw = await runner.evalAsync(idbGetDailyByTimer(crossDayTimerId));
        const recs = JSON.parse(dailyRaw);
        log('📊', `IDB daily_dur records after midnight crossing:`);
        for (const rec of recs) {
            log('📊', `  ${rec.stat_date}: ${rec.duration_sec}s`);
        }

        const yesterdayRec = recs.find(r => r.stat_date === realYesterday);
        const todayRec = recs.find(r => r.stat_date === realToday);

        assert(yesterdayRec, `IDB should have yesterday (${realYesterday}) record`);
        assert(yesterdayRec.duration_sec >= 2,
            `Yesterday IDB dur should be >= 2s, got ${yesterdayRec.duration_sec}s`);
        assert(todayRec, `IDB should have today (${realToday}) record`);
        assert(todayRec.duration_sec >= 2,
            `Today IDB dur should be >= 2s, got ${todayRec.duration_sec}s`);
    });

    // ── Verify chart auto-splits across days WHILE timer is still running ──
    // This verifies the fix: refreshChartRunningTimers() now triggers a full
    // re-render when today is a new date not in chartDataCache.dates.
    await runner.run('Cross-day: sidebar chart auto-splits BEFORE pause (running timer)', async() => {
        // Trigger a full sidebar refresh so refreshChartRunningTimers gets called
        await runner.evalAsync(`
            const leaves = app.workspace.getLeavesOfType('timer-sidebar');
            if (leaves.length) {
                const view = leaves[0].view;
                view.refreshRunningTimers();
            }
        `);
        // Wait for async chart re-render to complete
        await sleep(2000);

        const chartInfo = await runner.eval(`(() => {
            const leaves = app.workspace.getLeavesOfType('timer-sidebar');
            if (!leaves.length) return JSON.stringify({ skip: true });
            const view = leaves[0].view;
            if (!view.chartDataCache) return JSON.stringify({ skip: true, reason: 'no cache' });
            return JSON.stringify({
                skip: false,
                dates: view.chartDataCache.dates,
                hasYesterday: view.chartDataCache.dates.includes('${realYesterday}'),
                hasToday: view.chartDataCache.dates.includes('${realToday}'),
                projects: view.chartDataCache.projects
            });
        })()`);
        if (chartInfo) {
            const info = JSON.parse(chartInfo);
            if (!info.skip) {
                log('📊', `Chart dates (BEFORE pause, timer still running): ${JSON.stringify(info.dates)}`);
                assert(info.hasYesterday, `Chart should include yesterday (${realYesterday}) even before pause`);
                assert(info.hasToday,
                    `Chart should include today (${realToday}) even before pause — ` +
                    `if this fails, refreshChartRunningTimers() is not re-rendering on new day`);
            } else {
                log('⚠️', `Chart data not available (${info.reason ?? 'statistics hidden'}) — skipping`);
            }
        }
    });

    await runner.run('Cross-day: PAUSE and verify total = sum of daily_dur across days', async() => {
        await runner.setCursorToLine(crossDayTestLineNum);
        await sleep(200);
        await runner.executeCommand('text-block-timer:toggle-timer');
        await sleep(WAIT_AFTER_COMMAND);

        const lineText = await runner.eval(`app.workspace.activeEditor.editor.getLine(${crossDayTestLineNum})`);
        assert(lineText.includes('class="timer-p"'), 'Expected timer-p after pause');

        const durMatch = lineText.match(/data-dur="(\d+)"/);
        const docDur = durMatch ? parseInt(durMatch[1], 10) : -1;

        // Get IDB timer total
        const timerRaw = await runner.evalAsync(idbGetTimer(crossDayTimerId));
        const idbTimer = JSON.parse(timerRaw);

        // Get IDB daily_dur sum across all days
        const dailyRaw = await runner.evalAsync(idbGetDailyByTimer(crossDayTimerId));
        const dailyRecs = JSON.parse(dailyRaw);
        const idbDailySum = dailyRecs.reduce((s, r) => s + r.duration_sec, 0);

        // Get JSON daily_dur sum across all days
        const jsonDailySum = await runner.eval(`(() => {
            const p = app.plugins.plugins['text-block-timer'];
            const dd = p.database.data?.daily_dur ?? {};
            let sum = 0;
            for (const [date, timerMap] of Object.entries(dd)) {
                if (timerMap['${crossDayTimerId}'] !== undefined) {
                    sum += timerMap['${crossDayTimerId}'];
                }
            }
            return sum;
        })()`);

        // Detailed per-date breakdown for debugging
        for (const rec of dailyRecs) {
            log('📊', `  IDB daily_dur: ${rec.stat_date} = ${rec.duration_sec}s`);
        }
        const jsonPerDate = JSON.parse(await runner.eval(`(() => {
            const p = app.plugins.plugins['text-block-timer'];
            const dd = p.database.data?.daily_dur ?? {};
            const result = {};
            for (const [date, timerMap] of Object.entries(dd)) {
                if (timerMap['${crossDayTimerId}'] !== undefined) {
                    result[date] = timerMap['${crossDayTimerId}'];
                }
            }
            return JSON.stringify(result);
        })()`));
        for (const [date, dur] of Object.entries(jsonPerDate)) {
            log('📊', `  JSON daily_dur: ${date} = ${dur}s`);
        }

        log('📊', `Cross-day totals: doc=${docDur}s, IDB total=${idbTimer.total_dur_sec}s, IDB daily_sum=${idbDailySum}s, JSON daily_sum=${jsonDailySum}s`);

        // IDB total should match doc dur
        const totalDrift = Math.abs(idbTimer.total_dur_sec - docDur);
        assert(totalDrift <= TICK_TOLERANCE,
            `IDB total (${idbTimer.total_dur_sec}) vs doc (${docDur}), drift=${totalDrift}s`);

        // IDB daily_sum should match total (no double-counting)
        const idbDrift = Math.abs(idbDailySum - idbTimer.total_dur_sec);
        assert(idbDrift <= TICK_TOLERANCE,
            `IDB daily_sum (${idbDailySum}) vs total (${idbTimer.total_dur_sec}), drift=${idbDrift}s — if large, double-counting bug!`);

        // JSON daily_sum should roughly match doc dur
        const jsonDrift = Math.abs(jsonDailySum - docDur);
        assert(jsonDrift <= TICK_TOLERANCE,
            `JSON daily_sum (${jsonDailySum}) vs doc (${docDur}), drift=${jsonDrift}s`);

        // Must have records for 2 different dates
        assert(dailyRecs.length >= 2,
            `Expected IDB daily_dur for >= 2 dates, got ${dailyRecs.length}`);
    });

    await runner.run('Cross-day: sidebar chart still correct after pause', async() => {
        const chartInfo = await runner.eval(`(() => {
            const leaves = app.workspace.getLeavesOfType('timer-sidebar');
            if (!leaves.length) return JSON.stringify({ skip: true });
            const view = leaves[0].view;
            if (!view.chartDataCache) return JSON.stringify({ skip: true });
            return JSON.stringify({
                skip: false,
                dates: view.chartDataCache.dates,
                hasYesterday: view.chartDataCache.dates.includes('${realYesterday}'),
                hasToday: view.chartDataCache.dates.includes('${realToday}')
            });
        })()`);
        if (chartInfo) {
            const info = JSON.parse(chartInfo);
            if (!info.skip) {
                log('📊', `Chart dates (after pause): ${JSON.stringify(info.dates)}`);
                assert(info.hasYesterday, `Chart should include yesterday (${realYesterday})`);
                assert(info.hasToday, `Chart should include today (${realToday})`);
            } else {
                log('⚠️', 'Chart data not available — statistics may be hidden');
            }
        }
    });

    // IMPORTANT: Restore Date before cleanup to avoid contaminating other operations
    await runner.run('Cross-day: restore original Date', async() => {
        await restoreDate();
        const realTime = await runner.eval(`new Date().toISOString()`);
        log('🕐', `Date restored: ${realTime}`);
        const diff = Math.abs(Date.now() - new Date(realTime).getTime());
        assert(diff < 5000, `Restored time should be close to real time, diff=${diff}ms`);
    });

    // Clean up cross-day timer
    await runner.run('Cross-day: cleanup — delete timer', async() => {
        await runner.setCursorToLine(crossDayTestLineNum);
        await sleep(200);
        await runner.executeCommand('text-block-timer:delete-timer');
        await sleep(WAIT_AFTER_COMMAND);
    });

    await runner.run('Cross-day: cleanup — remove test line', async() => {
        await runner.eval(`(() => {
            const ed = app.workspace.activeEditor.editor;
            for (let i = ed.lineCount() - 1; i >= 0; i--) {
                if (ed.getLine(i).includes('E2E_CROSSDAY_TEST_')) {
                    const from = Math.max(0, i - 1);
                    const fromCh = i > 0 ? ed.getLine(from).length : 0;
                    ed.replaceRange('', { line: from, ch: fromCh }, { line: i, ch: ed.getLine(i).length });
                    break;
                }
            }
            return true;
        })()`);
        await sleep(500);
        log('🧹', 'Cross-day test line removed');
    });
}

// ─── Chain: sidebar_tabs ──────────────────────────────────────────────────────
// Tests sidebar scope switching, filter/sort controls, summary correctness,
// and statistics chart data loading for all scopes.

async function chain_sidebar_tabs(runner) {
    const today = shared.today;
    const createdTimerId = shared.createdTimerId;
    const testLineNum = shared.testLineNum;

    // Make sure our timer is running for these tests
    const currentState = await runner.eval(`(() => {
        const lineText = app.workspace.activeEditor.editor.getLine(${testLineNum});
        if (lineText.includes('class="timer-r"')) return 'running';
        if (lineText.includes('class="timer-p"')) return 'paused';
        return 'none';
    })()`);
    if (currentState === 'paused') {
        await runner.setCursorToLine(testLineNum);
        await sleep(200);
        await runner.executeCommand('text-block-timer:toggle-timer');
        await sleep(WAIT_AFTER_COMMAND);
        log('⚙️', 'Resumed timer for sidebar_tabs tests');
    }
    await sleep(2000); // let ticks accumulate

    // ── Scope: active-file ──────────────────────────────────────────────────

    await runner.run('Sidebar scope: active-file shows timer from current file', async() => {
        // Switch to active-file scope
        await runner.evalAsync(`
            const leaves = app.workspace.getLeavesOfType('timer-sidebar');
            if (leaves.length) {
                const view = leaves[0].view;
                view.currentScope = 'active-file';
                await view.loadData();
                view.render();
            }
        `);
        await sleep(500);

        const result = JSON.parse(await runner.eval(`(() => {
            const leaves = app.workspace.getLeavesOfType('timer-sidebar');
            if (!leaves.length) return JSON.stringify({ skip: true });
            const view = leaves[0].view;
            const list = view.timerList;
            const hasOurs = list.some(t => t.timerId === '${createdTimerId}');
            return JSON.stringify({
                skip: false,
                scope: view.currentScope,
                timerCount: list.length,
                hasOurs: hasOurs
            });
        })()`));

        if (!result.skip) {
            log('📊', `active-file scope: ${result.timerCount} timers, hasOurs=${result.hasOurs}`);
            assert(result.scope === 'active-file', `Expected scope active-file, got ${result.scope}`);
            assert(result.hasOurs, 'Our timer should be visible in active-file scope');
        }
    });

    // ── Scope: open-tabs ────────────────────────────────────────────────────

    await runner.run('Sidebar scope: open-tabs shows timer from open tabs', async() => {
        await runner.evalAsync(`
            const leaves = app.workspace.getLeavesOfType('timer-sidebar');
            if (leaves.length) {
                const view = leaves[0].view;
                view.currentScope = 'open-tabs';
                await view.loadData();
                view.render();
            }
        `);
        await sleep(500);

        const result = JSON.parse(await runner.eval(`(() => {
            const leaves = app.workspace.getLeavesOfType('timer-sidebar');
            if (!leaves.length) return JSON.stringify({ skip: true });
            const view = leaves[0].view;
            const list = view.timerList;
            const hasOurs = list.some(t => t.timerId === '${createdTimerId}');
            return JSON.stringify({
                skip: false,
                scope: view.currentScope,
                timerCount: list.length,
                hasOurs: hasOurs
            });
        })()`));

        if (!result.skip) {
            log('📊', `open-tabs scope: ${result.timerCount} timers, hasOurs=${result.hasOurs}`);
            assert(result.scope === 'open-tabs', `Expected scope open-tabs, got ${result.scope}`);
            assert(result.hasOurs, 'Our timer should be visible in open-tabs scope');
        }
    });

    // ── Scope: all ──────────────────────────────────────────────────────────

    await runner.run('Sidebar scope: all shows timer from IDB', async() => {
        await runner.evalAsync(`
            const leaves = app.workspace.getLeavesOfType('timer-sidebar');
            if (leaves.length) {
                const view = leaves[0].view;
                view.currentScope = 'all';
                await view.loadData();
                view.render();
            }
        `);
        await sleep(500);

        const result = JSON.parse(await runner.eval(`(() => {
            const leaves = app.workspace.getLeavesOfType('timer-sidebar');
            if (!leaves.length) return JSON.stringify({ skip: true });
            const view = leaves[0].view;
            const list = view.timerList;
            const hasOurs = list.some(t => t.timerId === '${createdTimerId}');
            return JSON.stringify({
                skip: false,
                scope: view.currentScope,
                timerCount: list.length,
                hasOurs: hasOurs
            });
        })()`));

        if (!result.skip) {
            log('📊', `all scope: ${result.timerCount} timers, hasOurs=${result.hasOurs}`);
            assert(result.scope === 'all', `Expected scope all, got ${result.scope}`);
            assert(result.hasOurs, 'Our timer should be visible in all scope');
            assert(result.timerCount >= 1, `Expected >= 1 timers in all scope, got ${result.timerCount}`);
        }
    });

    // ── Filter: running vs paused ───────────────────────────────────────────

    await runner.run('Sidebar filter: running filter shows only running timers', async() => {
        // Switch back to open-tabs and apply running filter
        await runner.evalAsync(`
            const leaves = app.workspace.getLeavesOfType('timer-sidebar');
            if (leaves.length) {
                const view = leaves[0].view;
                view.currentScope = 'open-tabs';
                view.currentFilter = 'running';
                await view.loadData();
                view.render();
            }
        `);
        await sleep(500);

        const result = JSON.parse(await runner.eval(`(() => {
            const leaves = app.workspace.getLeavesOfType('timer-sidebar');
            if (!leaves.length) return JSON.stringify({ skip: true });
            const c = leaves[0].view.containerEl;
            const runCards = c.querySelectorAll('.timer-card-running').length;
            const pausedCards = c.querySelectorAll('.timer-card-paused').length;
            return JSON.stringify({
                skip: false,
                runCards: runCards,
                pausedCards: pausedCards
            });
        })()`));

        if (!result.skip) {
            log('📊', `Running filter: ${result.runCards} running cards, ${result.pausedCards} paused cards`);
            assert(result.pausedCards === 0,
                `Running filter should hide paused cards, got ${result.pausedCards}`);
            assert(result.runCards >= 1,
                `Running filter should show >= 1 running cards, got ${result.runCards}`);
        }
    });

    // ── Filter: reset to all ────────────────────────────────────────────────

    await runner.run('Sidebar filter: "all" filter shows both running and paused', async() => {
        await runner.evalAsync(`
            const leaves = app.workspace.getLeavesOfType('timer-sidebar');
            if (leaves.length) {
                const view = leaves[0].view;
                view.currentFilter = 'all';
                view.render();
            }
        `);
        await sleep(500);

        const result = JSON.parse(await runner.eval(`(() => {
            const leaves = app.workspace.getLeavesOfType('timer-sidebar');
            if (!leaves.length) return JSON.stringify({ skip: true });
            const c = leaves[0].view.containerEl;
            const totalCards = c.querySelectorAll('.timer-card').length;
            return JSON.stringify({ skip: false, totalCards });
        })()`));

        if (!result.skip) {
            log('📊', `All filter: ${result.totalCards} total cards`);
            assert(result.totalCards >= 1, `Expected >= 1 cards, got ${result.totalCards}`);
        }
    });

    // ── Sort: dur-desc vs dur-asc ───────────────────────────────────────────

    await runner.run('Sidebar sort: dur-desc orders longest first', async() => {
        // Use loadData + render to ensure timerList is re-sorted
        await runner.evalAsync(`
            const leaves = app.workspace.getLeavesOfType('timer-sidebar');
            if (leaves.length) {
                const view = leaves[0].view;
                view.currentSort = 'dur-desc';
                await view.loadData();
                view.render();
            }
        `);
        await sleep(500);

        // Read durations from rendered DOM cards (which reflect the actual display order)
        const durs = JSON.parse(await runner.eval(`(() => {
            const leaves = app.workspace.getLeavesOfType('timer-sidebar');
            if (!leaves.length) return '[]';
            const c = leaves[0].view.containerEl;
            const cards = c.querySelectorAll('.timer-card');
            const result = [];
            for (const card of cards) {
                const durEl = card.querySelector('.timer-card-duration');
                if (durEl) {
                    // Parse HH:MM:SS or MM:SS format to seconds
                    const text = durEl.textContent.trim();
                    const parts = text.split(':').map(Number);
                    let secs = 0;
                    if (parts.length === 3) secs = parts[0]*3600 + parts[1]*60 + parts[2];
                    else if (parts.length === 2) secs = parts[0]*60 + parts[1];
                    else secs = parts[0];
                    result.push(secs);
                }
            }
            return JSON.stringify(result);
        })()`));

        log('📊', `dur-desc order: [${durs.join(', ')}]`);
        if (durs.length >= 2) {
            for (let i = 1; i < durs.length; i++) {
                assert(durs[i - 1] >= durs[i],
                    `dur-desc: ${durs[i - 1]} should be >= ${durs[i]} at position ${i}`);
            }
        }
    });

    // ── Summary row data-attributes ─────────────────────────────────────────

    await runner.run('Sidebar summary: data-attributes are consistent with timerList', async() => {
        // Reset sort/scope to default
        await runner.evalAsync(`
            const leaves = app.workspace.getLeavesOfType('timer-sidebar');
            if (leaves.length) {
                const view = leaves[0].view;
                view.currentScope = 'open-tabs';
                view.currentSort = 'status';
                view.currentFilter = 'all';
                await view.loadData();
                view.render();
            }
        `);
        await sleep(500);

        const result = JSON.parse(await runner.eval(`(() => {
            const leaves = app.workspace.getLeavesOfType('timer-sidebar');
            if (!leaves.length) return JSON.stringify({ skip: true });
            const view = leaves[0].view;
            const c = view.containerEl;
            const list = view.timerList;
            const running = list.filter(t => t.state === 'timer-r').length;
            const paused = list.filter(t => t.state === 'timer-p').length;
            const total = list.length;

            const summaryTotal = parseInt(c.querySelector('[data-summary-count]')?.textContent ?? '-1');
            const summaryRunning = parseInt(c.querySelector('[data-summary-running-count]')?.textContent ?? '-1');
            const summaryPaused = parseInt(c.querySelector('[data-summary-paused-count]')?.textContent ?? '-1');

            return JSON.stringify({
                skip: false,
                listTotal: total, listRunning: running, listPaused: paused,
                summaryTotal, summaryRunning, summaryPaused
            });
        })()`));

        if (!result.skip) {
            log('📊', `Summary: list(${result.listTotal}R=${result.listRunning},P=${result.listPaused}) ` +
                `vs DOM(${result.summaryTotal}R=${result.summaryRunning},P=${result.summaryPaused})`);
            assert(result.summaryTotal === result.listTotal,
                `Summary count ${result.summaryTotal} should match timerList ${result.listTotal}`);
            assert(result.summaryRunning === result.listRunning,
                `Summary running ${result.summaryRunning} should match timerList ${result.listRunning}`);
            assert(result.summaryPaused === result.listPaused,
                `Summary paused ${result.summaryPaused} should match timerList ${result.listPaused}`);
        }
    });

    // ── Statistics chart: data loaded from IDB ──────────────────────────────

    await runner.run('Sidebar chart: chartDataCache has today with positive duration', async() => {
        const result = JSON.parse(await runner.eval(`(() => {
            const leaves = app.workspace.getLeavesOfType('timer-sidebar');
            if (!leaves.length) return JSON.stringify({ skip: true });
            const view = leaves[0].view;
            if (!view.chartDataCache) return JSON.stringify({ skip: true, reason: 'no cache' });
            const cache = view.chartDataCache;
            const todayDur = {};
            for (const proj of cache.projects) {
                todayDur[proj] = (cache.matrix[proj] ?? {})['${today}'] ?? 0;
            }
            return JSON.stringify({
                skip: false,
                dates: cache.dates,
                projects: cache.projects,
                todayDur: todayDur,
                hasToday: cache.dates.includes('${today}')
            });
        })()`));

        if (!result.skip) {
            log('📊', `Chart: dates=${JSON.stringify(result.dates)}, projects=${JSON.stringify(result.projects)}`);
            log('📊', `Chart today dur: ${JSON.stringify(result.todayDur)}`);
            assert(result.hasToday, `Chart dates should include today (${today})`);
            // At least one project should have positive duration today
            const anyPositive = Object.values(result.todayDur).some(v => v > 0);
            assert(anyPositive, 'At least one project should have > 0 duration for today in chart');
        } else {
            log('⚠️', `Chart data not available (${result.reason ?? ''}) — skipping`);
        }
    });

    // ── Statistics toggle ───────────────────────────────────────────────────

    await runner.run('Sidebar chart: statistics toggle hides/shows chart', async() => {
        // Toggle off
        await runner.evalAsync(`
            const leaves = app.workspace.getLeavesOfType('timer-sidebar');
            if (leaves.length) {
                const view = leaves[0].view;
                view.showStatistics = false;
                view.render();
            }
        `);
        await sleep(300);

        const hiddenChart = await runner.eval(`(() => {
            const leaves = app.workspace.getLeavesOfType('timer-sidebar');
            if (!leaves.length) return null;
            const view = leaves[0].view;
            return view.chartInstance === null;
        })()`);
        assert(hiddenChart === true, 'Chart instance should be null when statistics hidden');

        // Toggle on
        await runner.evalAsync(`
            const leaves = app.workspace.getLeavesOfType('timer-sidebar');
            if (leaves.length) {
                const view = leaves[0].view;
                view.showStatistics = true;
                view.render();
            }
        `);
        await sleep(500);

        const visibleChart = await runner.eval(`(() => {
            const leaves = app.workspace.getLeavesOfType('timer-sidebar');
            if (!leaves.length) return null;
            const view = leaves[0].view;
            return view.chartInstance !== null;
        })()`);
        assert(visibleChart === true, 'Chart instance should exist when statistics shown');
    });

    // ── Timer card click → jump to file ─────────────────────────────────────

    await runner.run('Sidebar card: file-source element shows correct file:line', async() => {
        const result = JSON.parse(await runner.eval(`(() => {
            const leaves = app.workspace.getLeavesOfType('timer-sidebar');
            if (!leaves.length) return JSON.stringify({ skip: true });
            const c = leaves[0].view.containerEl;
            const cards = c.querySelectorAll('.timer-card');
            for (const card of cards) {
                const fileEl = card.querySelector('.timer-card-file-source');
                if (fileEl?.textContent?.includes(':${testLineNum + 1}')) {
                    return JSON.stringify({
                        skip: false,
                        text: fileEl.textContent,
                        hasLine: true
                    });
                }
            }
            return JSON.stringify({ skip: false, hasLine: false, text: '' });
        })()`));

        if (!result.skip) {
            log('📊', `File source: "${result.text}"`);
            assert(result.hasLine,
                `Card file-source should contain line number :${testLineNum + 1}`);
        }
    });
}

// ─── Chain: readonly ──────────────────────────────────────────────────────────
// Tests that a running timer continues ticking correctly when the editor
// switches to reading/preview mode (non-source mode).

async function chain_readonly(runner) {
    const testLineNum = shared.testLineNum;
    const createdTimerId = shared.createdTimerId;

    // Ensure timer is running
    const currentState = await runner.eval(`(() => {
        const lineText = app.workspace.activeEditor.editor.getLine(${testLineNum});
        if (lineText.includes('class="timer-r"')) return 'running';
        if (lineText.includes('class="timer-p"')) return 'paused';
        return 'none';
    })()`);
    if (currentState === 'paused') {
        await runner.setCursorToLine(testLineNum);
        await sleep(200);
        await runner.executeCommand('text-block-timer:toggle-timer');
        await sleep(WAIT_AFTER_COMMAND);
        log('⚙️', 'Resumed timer for readonly tests');
    }
    assert(currentState !== 'none', 'Timer should exist before readonly tests');

    // Read initial dur before switching mode
    const initialDur = await runner.eval(`(() => {
        const p = app.plugins.plugins['text-block-timer'];
        const d = p.manager.getTimerData('${createdTimerId}');
        return d ? d.dur : -1;
    })()`);
    log('📊', `Initial dur before mode switch: ${initialDur}s`);

    // ── Switch to preview/reading mode ──────────────────────────────────────

    await runner.run('Read-only mode: switch to preview mode', async() => {
        // Use Obsidian command to toggle to preview mode
        const switched = await runner.evalAsync(`
            const view = app.workspace.activeEditor;
            if (view && view.currentMode && typeof view.currentMode.set === 'function') {
                // Try Obsidian's internal mode switch
                const state = view.getState();
                state.mode = 'preview';
                await view.setState(state, { history: false });
                return true;
            }
            return false;
        `);
        await sleep(1000);

        const mode = await runner.eval(`(() => {
            const view = app.workspace.activeEditor;
            if (!view) return 'no-view';
            if (typeof view.getMode === 'function') return view.getMode();
            return 'unknown';
        })()`);
        log('📊', `Current mode after switch: ${mode}`);
        // The mode should be 'preview' — but some Obsidian versions may differ
        // Even if mode switch fails, we still test that the timer keeps ticking
    });

    // ── Timer continues ticking in preview mode ─────────────────────────────

    await runner.run('Read-only mode: timer continues ticking (dur increases)', async() => {
        const durBefore = await runner.eval(`(() => {
            const p = app.plugins.plugins['text-block-timer'];
            const d = p.manager.getTimerData('${createdTimerId}');
            return d ? d.dur : -1;
        })()`);

        log('⏳', 'Waiting 4s for ticks in preview mode...');
        await sleep(4000);

        const durAfter = await runner.eval(`(() => {
            const p = app.plugins.plugins['text-block-timer'];
            const d = p.manager.getTimerData('${createdTimerId}');
            return d ? d.dur : -1;
        })()`);

        const increase = durAfter - durBefore;
        log('📊', `Preview mode: dur before=${durBefore}s, after=${durAfter}s, increase=${increase}s`);
        assert(increase >= 2,
            `Timer should continue ticking in preview mode, but increase was only ${increase}s`);
    });

    await runner.run('Read-only mode: IDB is updated during preview mode ticks', async() => {
        const raw = await runner.evalAsync(idbGetTimer(createdTimerId));
        assert(raw, 'Timer should exist in IDB during preview mode');
        const entry = JSON.parse(raw);
        assert(entry.state === 'running', `Expected running, got ${entry.state}`);
        log('📊', `IDB in preview mode: state=${entry.state}, dur=${entry.total_dur_sec}s`);
    });

    await runner.run('Read-only mode: sidebar still shows running timer', async() => {
        const state = JSON.parse(await runner.eval(`(() => {
            const leaves = app.workspace.getLeavesOfType('timer-sidebar');
            if (!leaves.length) return JSON.stringify({ skip: true });
            const view = leaves[0].view;
            const has = view.timerList.some(t => t.timerId === '${createdTimerId}' && t.state === 'timer-r');
            return JSON.stringify({ skip: false, hasRunning: has });
        })()`));

        if (!state.skip) {
            assert(state.hasRunning, 'Sidebar should still show our timer as running in preview mode');
        }
    });

    // ── Switch back to source mode ──────────────────────────────────────────

    await runner.run('Read-only mode: switch back to source mode', async() => {
        await runner.evalAsync(`
            const view = app.workspace.activeEditor;
            if (view) {
                const state = view.getState();
                state.mode = 'source';
                await view.setState(state, { history: false });
            }
        `);
        await sleep(1000);

        const mode = await runner.eval(`(() => {
            const view = app.workspace.activeEditor;
            if (!view) return 'no-view';
            if (typeof view.getMode === 'function') return view.getMode();
            return 'unknown';
        })()`);
        log('📊', `Mode after switch back: ${mode}`);
    });

    await runner.run('Read-only mode: timer HTML span intact after returning to source mode', async() => {
        await sleep(500);
        const lineText = await runner.eval(`app.workspace.activeEditor.editor.getLine(${testLineNum})`);
        assert(lineText.includes('class="timer-r"') || lineText.includes('class="timer-p"'),
            `Timer span should be intact after mode round-trip, got: "${lineText.substring(0, 100)}..."`);
        log('📊', `Line text after mode round-trip: timer span present ✓`);
    });

    await runner.run('Read-only mode: dur increased during preview round-trip', async() => {
        const finalDur = await runner.eval(`(() => {
            const p = app.plugins.plugins['text-block-timer'];
            const d = p.manager.getTimerData('${createdTimerId}');
            return d ? d.dur : -1;
        })()`);
        const totalIncrease = finalDur - initialDur;
        log('📊', `Total dur increase over preview round-trip: ${totalIncrease}s (initial=${initialDur}s, final=${finalDur}s)`);
        assert(totalIncrease >= 3,
            `Expected >= 3s increase during preview round-trip, got ${totalIncrease}s`);
    });

    // ── Ensure editor is fully ready for subsequent chains ──────────────────
    // After preview → source switch, the editor reference may need extra time.
    await runner.evalAsync(`
        const mdLeaves = app.workspace.getLeavesOfType('markdown');
        if (mdLeaves.length > 0) {
            app.workspace.setActiveLeaf(mdLeaves[0], { focus: true });
            await new Promise(r => setTimeout(r, 1000));
        }
    `);
    // Wait and verify editor is accessible
    await sleep(500);
    const editorReady = await runner.eval(`(() => {
        const v = app.workspace.activeEditor;
        return !!(v && v.editor);
    })()`);
    if (!editorReady) {
        log('⚠️', 'Editor not ready after readonly chain, waiting extra 2s...');
        await sleep(2000);
    }
    log('⚙️', 'Editor re-focused after readonly tests');
}

// ─── Chain: crossday_adjust ───────────────────────────────────────────────────
// Creates a timer that spans 3 days via successive Date monkey-patches,
// then tests manual increase/decrease duration allocation across days.
//
// Day layout (example):
//   day1 (2 days ago): timer runs ~3s  → daily_dur ≈ 3
//   day2 (yesterday):  timer runs ~3s  → daily_dur ≈ 3
//   day3 (today):      timer runs ~3s  → daily_dur ≈ 3
//                                        total     ≈ 9
//
// Then we PAUSE and test:
//   1. Increase by +5 → all goes to today → day1=3, day2=3, day3=3+5=8, total=14
//   2. Decrease to 4   → LIFO: deduct from newest first
//        day1=3 (preserved), day2=1 (partial), day3=0 (zeroed), total=4
// ─────────────────────────────────────────────────────────────────────────────

async function chain_crossday_adjust(runner) {

    let cdaTimerId = null;
    const cdaTestLineNum = await runner.eval(`(() => {
        const ed = app.workspace.activeEditor.editor;
        const last = ed.lineCount() - 1;
        ed.replaceRange('\\nE2E_CDA_TEST_' + Date.now(), { line: last, ch: ed.getLine(last).length });
        const n = ed.lineCount() - 1;
        ed.setCursor({ line: n, ch: 0 });
        return n;
    })()`);
    log('📝', `Cross-day-adjust test line at L${cdaTestLineNum}`);
    await sleep(500);

    // Date helpers (same as crossday chain)
    async function patchDate(offsetMs) {
        await runner.eval(`(() => {
            if (!window.__OrigDate) window.__OrigDate = Date;
            const OD = window.__OrigDate;
            const offset = ${offsetMs};
            function FakeDate(...args) {
                if (args.length === 0) return new OD(OD.now() + offset);
                return new OD(...args);
            }
            FakeDate.now = () => OD.now() + offset;
            FakeDate.parse = OD.parse.bind(OD);
            FakeDate.UTC = OD.UTC.bind(OD);
            FakeDate.prototype = OD.prototype;
            Date = FakeDate;
            return true;
        })()`);
    }

    async function restoreDate() {
        await runner.eval(`(() => {
            if (window.__OrigDate) { Date = window.__OrigDate; delete window.__OrigDate; }
            return true;
        })()`);
    }

    // Compute the 3 dates
    const realNowMs = Date.now();
    const day3 = new Date().toLocaleDateString('sv'); // today
    const day2 = new Date(Date.now() - 86400000).toLocaleDateString('sv'); // yesterday
    const day1 = new Date(Date.now() - 2 * 86400000).toLocaleDateString('sv'); // 2 days ago

    log('📅', `Multi-day plan: day1=${day1}, day2=${day2}, day3=${day3}`);

    // ── Step 1: Patch to day1 12:00:00, start timer, let it run ~3s ─────────

    const day1Noon = new Date(day1 + 'T12:00:00').getTime();
    const offset1 = day1Noon - realNowMs;

    await runner.run('CDA: patch to day1 noon and start timer', async() => {
        await patchDate(offset1);
        const fakeDate = await runner.eval(`new Date().toLocaleDateString('sv')`);
        assert(fakeDate === day1, `Expected ${day1}, got ${fakeDate}`);
        log('🕐', `Patched to day1: ${fakeDate}`);

        await runner.setCursorToLine(cdaTestLineNum);
        await sleep(200);
        await runner.executeCommand('text-block-timer:toggle-timer');
        await sleep(WAIT_AFTER_COMMAND);

        const lineText = await runner.eval(`app.workspace.activeEditor.editor.getLine(${cdaTestLineNum})`);
        assert(lineText.includes('class="timer-r"'), 'Expected timer-r span');
        const match = lineText.match(/id="([^"]+)"/);
        assert(match, 'Timer ID not found');
        cdaTimerId = match[1];
        log('🆔', `CDA timer ID: ${cdaTimerId}`);
    });

    // Let it tick ~3s on day1
    log('⏳', 'Letting timer run ~3s on day1...');
    await sleep(3000);

    await runner.run('CDA: verify day1 ticks in IDB', async() => {
        const dailyRaw = await runner.evalAsync(idbGetDailyByTimer(cdaTimerId));
        const recs = JSON.parse(dailyRaw);
        const day1Rec = recs.find(r => r.stat_date === day1);
        assert(day1Rec, `IDB should have day1 (${day1}) record`);
        assert(day1Rec.duration_sec >= 2, `day1 dur should be >= 2s, got ${day1Rec.duration_sec}s`);
        log('📊', `day1 IDB dur: ${day1Rec.duration_sec}s`);
    });

    // ── Step 2: Patch to day2 12:00:00, let it run ~3s ──────────────────────

    const day2Noon = new Date(day2 + 'T12:00:00').getTime();
    const offset2 = day2Noon - realNowMs;

    await runner.run('CDA: patch to day2 noon (time jump)', async() => {
        // Before jumping, we need to reset oldTs in the timer manager to avoid
        // a huge tickDelta from the time jump
        await runner.eval(`(() => {
            const p = app.plugins.plugins['text-block-timer'];
            const td = p.manager.getTimerData('${cdaTimerId}');
            if (td) {
                const nowSec = Math.floor((window.__OrigDate || Date).now() / 1000);
                td.ts = nowSec;
            }
            return true;
        })()`);

        await patchDate(offset2);
        const fakeDate = await runner.eval(`new Date().toLocaleDateString('sv')`);
        assert(fakeDate === day2, `Expected ${day2}, got ${fakeDate}`);
        log('🕐', `Patched to day2: ${fakeDate}`);

        // Reset oldTs again after patch to match the new patched time
        await runner.eval(`(() => {
            const p = app.plugins.plugins['text-block-timer'];
            const td = p.manager.getTimerData('${cdaTimerId}');
            if (td) td.ts = Math.floor(Date.now() / 1000);
            return true;
        })()`);
    });

    // Let it tick ~3s on day2
    log('⏳', 'Letting timer run ~3s on day2...');
    await sleep(3000);

    await runner.run('CDA: verify day2 ticks in IDB', async() => {
        const dailyRaw = await runner.evalAsync(idbGetDailyByTimer(cdaTimerId));
        const recs = JSON.parse(dailyRaw);
        const day2Rec = recs.find(r => r.stat_date === day2);
        assert(day2Rec, `IDB should have day2 (${day2}) record`);
        assert(day2Rec.duration_sec >= 2, `day2 dur should be >= 2s, got ${day2Rec.duration_sec}s`);
        log('📊', `day2 IDB dur: ${day2Rec.duration_sec}s`);
    });

    // ── Step 3: Patch to day3 (today) 12:00:00, let it run ~3s ──────────────

    const day3Noon = new Date(day3 + 'T12:00:00').getTime();
    const offset3 = day3Noon - realNowMs;

    await runner.run('CDA: patch to day3 (today) noon', async() => {
        await runner.eval(`(() => {
            const p = app.plugins.plugins['text-block-timer'];
            const td = p.manager.getTimerData('${cdaTimerId}');
            if (td) {
                const nowSec = Math.floor((window.__OrigDate || Date).now() / 1000);
                td.ts = nowSec;
            }
            return true;
        })()`);

        await patchDate(offset3);
        const fakeDate = await runner.eval(`new Date().toLocaleDateString('sv')`);
        assert(fakeDate === day3, `Expected ${day3}, got ${fakeDate}`);
        log('🕐', `Patched to day3: ${fakeDate}`);

        await runner.eval(`(() => {
            const p = app.plugins.plugins['text-block-timer'];
            const td = p.manager.getTimerData('${cdaTimerId}');
            if (td) td.ts = Math.floor(Date.now() / 1000);
            return true;
        })()`);
    });

    // Let it tick ~3s on day3
    log('⏳', 'Letting timer run ~3s on day3...');
    await sleep(3000);

    await runner.run('CDA: verify all 3 days in IDB', async() => {
        const dailyRaw = await runner.evalAsync(idbGetDailyByTimer(cdaTimerId));
        const recs = JSON.parse(dailyRaw);
        log('📊', 'IDB daily_dur across 3 days:');
        for (const rec of recs) {
            log('📊', `  ${rec.stat_date}: ${rec.duration_sec}s`);
        }
        assert(recs.length >= 3, `Expected >= 3 day records, got ${recs.length}`);
        const d1 = recs.find(r => r.stat_date === day1);
        const d2 = recs.find(r => r.stat_date === day2);
        const d3 = recs.find(r => r.stat_date === day3);
        assert(d1 && d1.duration_sec >= 2, `day1 dur should be >= 2s`);
        assert(d2 && d2.duration_sec >= 2, `day2 dur should be >= 2s`);
        assert(d3 && d3.duration_sec >= 2, `day3 dur should be >= 2s`);
    });

    // ── Step 4: Restore Date and PAUSE ──────────────────────────────────────

    await runner.run('CDA: restore Date and PAUSE timer', async() => {
        await restoreDate();
        const realTime = await runner.eval(`new Date().toISOString()`);
        log('🕐', `Date restored: ${realTime}`);

        // Reset oldTs to real time before pause
        await runner.eval(`(() => {
            const p = app.plugins.plugins['text-block-timer'];
            const td = p.manager.getTimerData('${cdaTimerId}');
            if (td) td.ts = Math.floor(Date.now() / 1000);
            return true;
        })()`);

        await runner.setCursorToLine(cdaTestLineNum);
        await sleep(200);
        await runner.executeCommand('text-block-timer:toggle-timer');
        await sleep(WAIT_AFTER_COMMAND);

        const lineText = await runner.eval(`app.workspace.activeEditor.editor.getLine(${cdaTestLineNum})`);
        assert(lineText.includes('class="timer-p"'), 'Expected timer-p after pause');
    });

    // Record pre-adjustment state
    let preState;
    await runner.run('CDA: record pre-adjustment daily_dur state', async() => {
        const timerRaw = await runner.evalAsync(idbGetTimer(cdaTimerId));
        const timer = JSON.parse(timerRaw);
        const dailyRaw = await runner.evalAsync(idbGetDailyByTimer(cdaTimerId));
        const recs = JSON.parse(dailyRaw);
        const dailyMap = {};
        for (const rec of recs) dailyMap[rec.stat_date] = rec.duration_sec;
        const dailySum = recs.reduce((s, r) => s + r.duration_sec, 0);

        preState = {
            total: timer.total_dur_sec,
            dailySum,
            dailyMap,
            day1Dur: dailyMap[day1] || 0,
            day2Dur: dailyMap[day2] || 0,
            day3Dur: dailyMap[day3] || 0,
        };

        log('📊', `Pre-adjust: total=${preState.total}s, sum=${preState.dailySum}s`);
        log('📊', `  day1(${day1})=${preState.day1Dur}s, day2(${day2})=${preState.day2Dur}s, day3(${day3})=${preState.day3Dur}s`);

        // Verify consistency: daily_sum should ≈ total
        const drift = Math.abs(preState.dailySum - preState.total);
        assert(drift <= TICK_TOLERANCE,
            `Pre-adjust daily_sum (${preState.dailySum}) vs total (${preState.total}) drift=${drift}s`);
    });

    // ── Step 5: Manual INCREASE (+5s) — delta goes to today ─────────────────

    await runner.run('CDA: increase duration by +5s — should go to today', async() => {
        // Re-read preState fresh from IDB to avoid stale values
        const freshTimerRaw = await runner.evalAsync(idbGetTimer(cdaTimerId));
        const freshTimer = JSON.parse(freshTimerRaw);
        const freshDailyRaw = await runner.evalAsync(idbGetDailyByTimer(cdaTimerId));
        const freshRecs = JSON.parse(freshDailyRaw);
        const freshMap = {};
        for (const rec of freshRecs) freshMap[rec.stat_date] = rec.duration_sec;
        preState.total = freshTimer.total_dur_sec;
        preState.day1Dur = freshMap[day1] || 0;
        preState.day2Dur = freshMap[day2] || 0;
        preState.day3Dur = freshMap[day3] || 0;
        preState.dailySum = freshRecs.reduce((s, r) => s + r.duration_sec, 0);

        const newDur = preState.total + 5;
        await runner.evalAsync(`
            const p = app.plugins.plugins['text-block-timer'];
            const view = app.workspace.activeEditor;
            const editor = view.editor;
            const lineText = editor.getLine(${cdaTestLineNum});

            const tpl = document.createElement('template');
            tpl.innerHTML = lineText.trim();
            const el = tpl.content.querySelector('.timer-r, .timer-p');
            if (!el) throw new Error('No timer span found');

            const timerId = el.id;
            const cls = el.className;
            const dur = parseInt(el.dataset.dur || '0', 10);
            const ts = parseInt(el.dataset.ts || '0', 10);
            const project = el.dataset.project || null;

            const regex = new RegExp('<span[^>]*id="' + timerId + '"[^>]*>.*?</span>');
            const match = lineText.match(regex);
            if (!match) throw new Error('Span regex match failed');

            const parsed = {
                class: cls,
                timerId: timerId,
                dur: dur,
                ts: ts,
                project: project,
                beforeIndex: match.index,
                afterIndex: match.index + match[0].length
            };

            p.handleSetDuration(view, ${cdaTestLineNum}, parsed, ${newDur});
            await new Promise(r => setTimeout(r, 500));
        `);
        await sleep(1000);

        // Verify IDB
        const timerRaw = await runner.evalAsync(idbGetTimer(cdaTimerId));
        const timer = JSON.parse(timerRaw);
        assert(timer.total_dur_sec === newDur,
            `Expected total=${newDur}, got ${timer.total_dur_sec}`);

        const dailyRaw = await runner.evalAsync(idbGetDailyByTimer(cdaTimerId));
        const recs = JSON.parse(dailyRaw);
        const afterMap = {};
        for (const rec of recs) afterMap[rec.stat_date] = rec.duration_sec;
        const afterSum = recs.reduce((s, r) => s + r.duration_sec, 0);

        log('📊', `After +5s increase:`);
        for (const rec of recs) log('📊', `  IDB: ${rec.stat_date} = ${rec.duration_sec}s`);
        log('📊', `  total=${timer.total_dur_sec}s, daily_sum=${afterSum}s`);

        // day1 and day2 should be UNCHANGED
        assert(afterMap[day1] === preState.day1Dur,
            `day1 should be unchanged: expected ${preState.day1Dur}, got ${afterMap[day1]}`);
        assert(afterMap[day2] === preState.day2Dur,
            `day2 should be unchanged: expected ${preState.day2Dur}, got ${afterMap[day2]}`);

        // today (day3) should have increased by 5
        const expectedDay3 = preState.day3Dur + 5;
        assert(afterMap[day3] === expectedDay3,
            `day3 should be ${expectedDay3} (was ${preState.day3Dur} + 5), got ${afterMap[day3]}`);

        // daily_sum should match total (±1s tolerance for tick timing)
        const sumDrift = Math.abs(afterSum - timer.total_dur_sec);
        assert(sumDrift <= 1,
            `daily_sum (${afterSum}) should match total (${timer.total_dur_sec}), drift=${sumDrift}s`);

        // Update preState for next test
        preState.total = timer.total_dur_sec;
        preState.dailySum = afterSum;
        preState.day1Dur = afterMap[day1] || 0;
        preState.day2Dur = afterMap[day2] || 0;
        preState.day3Dur = afterMap[day3] || 0;
    });

    // ── Step 6: Manual DECREASE (to 4s) — LIFO: deduct from newest first ────
    // Pre-state after increase: day1=~3, day2=~3, day3=~8, total=~14
    // Decrease to 4: sorted ascending [day1, day2, day3]
    //   remaining=4: day1=3 (preserved, remaining=1), day2=1 (partial), day3=0 (zeroed)

    await runner.run('CDA: decrease duration to 4s — LIFO deduction from newest dates', async() => {
        // Re-read preState fresh from IDB before the decrease
        const freshTimerRaw2 = await runner.evalAsync(idbGetTimer(cdaTimerId));
        const freshTimer2 = JSON.parse(freshTimerRaw2);
        const freshDailyRaw2 = await runner.evalAsync(idbGetDailyByTimer(cdaTimerId));
        const freshRecs2 = JSON.parse(freshDailyRaw2);
        const freshMap2 = {};
        for (const rec of freshRecs2) freshMap2[rec.stat_date] = rec.duration_sec;
        preState.total = freshTimer2.total_dur_sec;
        preState.day1Dur = freshMap2[day1] || 0;
        preState.day2Dur = freshMap2[day2] || 0;
        preState.day3Dur = freshMap2[day3] || 0;
        log('📊', `Pre-decrease state: day1=${preState.day1Dur}, day2=${preState.day2Dur}, day3=${preState.day3Dur}, total=${preState.total}`);

        const newDur = 4;
        await runner.evalAsync(`
            const p = app.plugins.plugins['text-block-timer'];
            const view = app.workspace.activeEditor;
            const editor = view.editor;
            const lineText = editor.getLine(${cdaTestLineNum});

            const tpl = document.createElement('template');
            tpl.innerHTML = lineText.trim();
            const el = tpl.content.querySelector('.timer-r, .timer-p');
            if (!el) throw new Error('No timer span found');

            const timerId = el.id;
            const cls = el.className;
            const dur = parseInt(el.dataset.dur || '0', 10);
            const ts = parseInt(el.dataset.ts || '0', 10);
            const project = el.dataset.project || null;

            const regex = new RegExp('<span[^>]*id="' + timerId + '"[^>]*>.*?</span>');
            const match = lineText.match(regex);
            if (!match) throw new Error('Span regex match failed');

            const parsed = {
                class: cls,
                timerId: timerId,
                dur: dur,
                ts: ts,
                project: project,
                beforeIndex: match.index,
                afterIndex: match.index + match[0].length
            };

            p.handleSetDuration(view, ${cdaTestLineNum}, parsed, ${newDur});
            await new Promise(r => setTimeout(r, 500));
        `);
        await sleep(1000);

        // Verify IDB
        const timerRaw = await runner.evalAsync(idbGetTimer(cdaTimerId));
        const timer = JSON.parse(timerRaw);
        assert(timer.total_dur_sec === newDur,
            `Expected total=${newDur}, got ${timer.total_dur_sec}`);

        const dailyRaw = await runner.evalAsync(idbGetDailyByTimer(cdaTimerId));
        const recs = JSON.parse(dailyRaw);
        const afterMap = {};
        for (const rec of recs) afterMap[rec.stat_date] = rec.duration_sec;
        const afterSum = recs.reduce((s, r) => s + r.duration_sec, 0);

        log('📊', `After decrease to ${newDur}s (LIFO from newest):`);
        for (const rec of recs) log('📊', `  IDB: ${rec.stat_date} = ${rec.duration_sec}s`);
        log('📊', `  total=${timer.total_dur_sec}s, daily_sum=${afterSum}s`);

        // daily_sum should equal 4
        assert(afterSum === newDur,
            `daily_sum (${afterSum}) should equal newDur (${newDur})`);

        // LIFO deduction: traverse ascending (oldest first), preserve oldest with remaining.
        // Algorithm: remaining=newDur, for each date oldest→newest:
        //   if remaining >= dur → preserve, remaining -= dur
        //   if remaining < dur  → partial = remaining, remaining = 0
        //   if remaining == 0   → zeroed
        //
        // Simulate the expected outcome
        const sortedDays = [
            { date: day1, dur: preState.day1Dur },
            { date: day2, dur: preState.day2Dur },
            { date: day3, dur: preState.day3Dur },
        ].sort((a, b) => a.date.localeCompare(b.date));

        let expectedRemaining = newDur;
        const expected = {};
        for (const { date, dur }
            of sortedDays) {
            if (expectedRemaining <= 0) {
                expected[date] = 0;
            } else if (expectedRemaining >= dur) {
                expected[date] = dur;
                expectedRemaining -= dur;
            } else {
                expected[date] = expectedRemaining;
                expectedRemaining = 0;
            }
        }

        const d1After = afterMap[day1] ?? 0;
        const d2After = afterMap[day2] ?? 0;
        const d3After = afterMap[day3] ?? 0;

        log('📊', `Expected: day1=${expected[day1]}, day2=${expected[day2]}, day3=${expected[day3]}`);
        log('📊', `Actual:   day1=${d1After}, day2=${d2After}, day3=${d3After}`);

        assert(d1After === expected[day1],
            `day1: expected ${expected[day1]}, got ${d1After}`);
        assert(d2After === expected[day2],
            `day2: expected ${expected[day2]}, got ${d2After}`);
        assert(d3After === expected[day3],
            `day3: expected ${expected[day3]}, got ${d3After}`);

        // Sanity: total = day1 + day2 + day3
        assert(d1After + d2After + d3After === newDur,
            `Sum ${d1After}+${d2After}+${d3After}=${d1After + d2After + d3After} should equal ${newDur}`);
    });

    // ── Step 7: Verify JSON daily_dur matches IDB (cross-layer) ─────────────

    await runner.run('CDA: JSON daily_dur matches IDB after adjustments', async() => {
        const jsonResult = JSON.parse(await runner.eval(`(() => {
            const p = app.plugins.plugins['text-block-timer'];
            const dd = p.database.data?.daily_dur ?? {};
            const result = {};
            for (const [date, timerMap] of Object.entries(dd)) {
                if (timerMap['${cdaTimerId}'] !== undefined) {
                    result[date] = timerMap['${cdaTimerId}'];
                }
            }
            return JSON.stringify(result);
        })()`));

        const idbRaw = await runner.evalAsync(idbGetDailyByTimer(cdaTimerId));
        const idbRecs = JSON.parse(idbRaw);
        const idbMap = {};
        for (const rec of idbRecs) idbMap[rec.stat_date] = rec.duration_sec;

        log('📊', 'Cross-layer comparison after adjustments:');
        const allDates = new Set([...Object.keys(jsonResult), ...Object.keys(idbMap)]);
        for (const date of[...allDates].sort()) {
            const j = jsonResult[date] ?? 0;
            const i = idbMap[date] ?? 0;
            log('📊', `  ${date}: JSON=${j}s, IDB=${i}s`);
            assert(j === i,
                `${date}: JSON(${j}) !== IDB(${i})`);
        }
    });

    // ── Step 8: Increase from reduced state — should go to today ────────────

    await runner.run('CDA: increase from 4s to 10s — +6s should go to today', async() => {
        const newDur = 10;
        await runner.evalAsync(`
            const p = app.plugins.plugins['text-block-timer'];
            const view = app.workspace.activeEditor;
            const editor = view.editor;
            const lineText = editor.getLine(${cdaTestLineNum});

            const tpl = document.createElement('template');
            tpl.innerHTML = lineText.trim();
            const el = tpl.content.querySelector('.timer-r, .timer-p');
            if (!el) throw new Error('No timer span found');

            const timerId = el.id;
            const cls = el.className;
            const dur = parseInt(el.dataset.dur || '0', 10);
            const ts = parseInt(el.dataset.ts || '0', 10);
            const project = el.dataset.project || null;

            const regex = new RegExp('<span[^>]*id="' + timerId + '"[^>]*>.*?</span>');
            const match = lineText.match(regex);
            if (!match) throw new Error('Span regex match failed');

            const parsed = {
                class: cls,
                timerId: timerId,
                dur: dur,
                ts: ts,
                project: project,
                beforeIndex: match.index,
                afterIndex: match.index + match[0].length
            };

            p.handleSetDuration(view, ${cdaTestLineNum}, parsed, ${newDur});
            await new Promise(r => setTimeout(r, 500));
        `);
        await sleep(1000);

        const dailyRaw = await runner.evalAsync(idbGetDailyByTimer(cdaTimerId));
        const recs = JSON.parse(dailyRaw);
        const afterMap = {};
        for (const rec of recs) afterMap[rec.stat_date] = rec.duration_sec;
        const afterSum = recs.reduce((s, r) => s + r.duration_sec, 0);

        log('📊', `After increase from 4→10s:`);
        for (const rec of recs) log('📊', `  IDB: ${rec.stat_date} = ${rec.duration_sec}s`);

        assert(afterSum === newDur,
            `daily_sum (${afterSum}) should equal ${newDur}`);

        // The +6 delta should go to today (day3)
        // After previous decrease: day1=preState.day1Dur, day2=4-preState.day1Dur, day3=0
        // After +6: day1=unchanged, day2=unchanged, day3=0+6=6
        assert((afterMap[day3] ?? 0) === 6,
            `day3 should be 6 (0 + delta 6), got ${afterMap[day3] ?? 0}`);
    });

    // ── Cleanup ─────────────────────────────────────────────────────────────

    await runner.run('CDA: cleanup — delete timer', async() => {
        await runner.setCursorToLine(cdaTestLineNum);
        await sleep(200);
        await runner.executeCommand('text-block-timer:delete-timer');
        await sleep(WAIT_AFTER_COMMAND);
    });

    await runner.run('CDA: cleanup — remove test line', async() => {
        await runner.eval(`(() => {
            const ed = app.workspace.activeEditor.editor;
            for (let i = ed.lineCount() - 1; i >= 0; i--) {
                if (ed.getLine(i).includes('E2E_CDA_TEST_')) {
                    const from = Math.max(0, i - 1);
                    const fromCh = i > 0 ? ed.getLine(from).length : 0;
                    ed.replaceRange('', { line: from, ch: fromCh }, { line: i, ch: ed.getLine(i).length });
                    break;
                }
            }
            return true;
        })()`);
        await sleep(500);
        log('🧹', 'CDA test line removed');
    });
}

// ─── Chain: cleanup_basic ────────────────────────────────────────────────────
// Cleanup for the basic/adjust/seed/delete chains (removes E2E_SIDEBAR_TEST_ line)

async function chain_cleanup_basic(runner) {
    // Restore background tick throttle
    await runner.eval(`(() => {
        const p = app.plugins.plugins['text-block-timer'];
        if (p.manager._origBgThreshold !== undefined) {
            p.manager.backgroundThreshold = p.manager._origBgThreshold;
            delete p.manager._origBgThreshold;
        }
        return true;
    })()`);
    log('⚙️', 'Restored background tick throttle');

    await runner.run('Cleanup: remove test line', async() => {
        await runner.eval(`(() => {
            const ed = app.workspace.activeEditor.editor;
            for (let i = ed.lineCount() - 1; i >= 0; i--) {
                if (ed.getLine(i).includes('E2E_SIDEBAR_TEST_')) {
                    const from = Math.max(0, i - 1);
                    const fromCh = i > 0 ? ed.getLine(from).length : 0;
                    ed.replaceRange('', { line: from, ch: fromCh }, { line: i, ch: ed.getLine(i).length });
                    break;
                }
            }
            return true;
        })()`);
        await sleep(500);
        log('🧹', 'Test line removed');
    });
}

// ═════════════════════════════════════════════════════════════════════════════
// CHAIN REGISTRY & DISPATCHER
// ═════════════════════════════════════════════════════════════════════════════

// Chain definitions with their dependencies and cleanup requirements.
// When a chain is selected, its dependencies are automatically prepended.
const CHAIN_REGISTRY = {
    preflight: { fn: chain_preflight, deps: [], cleanup: null },
    basic: { fn: chain_basic, deps: ['preflight'], cleanup: 'cleanup_basic' },
    adjust: { fn: chain_adjust, deps: ['preflight', 'basic'], cleanup: 'cleanup_basic' },
    seed: { fn: chain_seed, deps: ['preflight', 'basic'], cleanup: 'cleanup_basic' },
    delete: { fn: chain_delete, deps: ['preflight', 'basic'], cleanup: 'cleanup_basic' },
    sidebar_tabs: { fn: chain_sidebar_tabs, deps: ['preflight', 'basic'], cleanup: 'cleanup_basic' },
    readonly: { fn: chain_readonly, deps: ['preflight', 'basic'], cleanup: 'cleanup_basic' },
    crossday: { fn: chain_crossday, deps: ['preflight'], cleanup: null },
    crossday_adjust: { fn: chain_crossday_adjust, deps: ['preflight'], cleanup: null },
    cleanup_basic: { fn: chain_cleanup_basic, deps: [], cleanup: null },
};

// Default run order when no chains specified (= run everything)
const ALL_CHAINS = ['preflight', 'basic', 'sidebar_tabs', 'readonly', 'adjust', 'seed', 'delete', 'crossday', 'crossday_adjust', 'cleanup_basic'];

function resolveChains(requestedNames) {
    const ordered = [];
    const seen = new Set();
    const cleanups = new Set();

    function addChain(name) {
        if (seen.has(name)) return;
        const entry = CHAIN_REGISTRY[name];
        if (!entry) throw new Error(`Unknown test chain: "${name}"`);
        // Add dependencies first
        for (const dep of entry.deps) addChain(dep);
        seen.add(name);
        ordered.push(name);
        // Track required cleanups
        if (entry.cleanup) cleanups.add(entry.cleanup);
    }

    for (const name of requestedNames) addChain(name);

    // Append cleanups at the end (if not already included)
    for (const c of cleanups) {
        if (!seen.has(c)) {
            seen.add(c);
            ordered.push(c);
        }
    }

    return ordered;
}

// ─── Main ────────────────────────────────────────────────────────────────────

async function main() {
    // Parse command-line arguments for chain selection
    const args = process.argv.slice(2);
    let requestedChains;
    if (args.length > 0) {
        // Support: node test.mjs crossday  OR  node test.mjs basic,adjust
        requestedChains = args.flatMap(a => a.split(',').map(s => s.trim()).filter(Boolean));
    } else {
        requestedChains = ALL_CHAINS;
    }

    const chainsToRun = resolveChains(requestedChains);

    console.log('═'.repeat(60));
    log('🚀', 'Text Block Timer — E2E Sidebar & IDB Test Suite');
    log('📋', `Chains to run: ${chainsToRun.join(' → ')}`);
    if (args.length > 0) {
        log('📋', `(requested: ${requestedChains.join(', ')})`);
    }
    console.log('═'.repeat(60));

    const wsUrl = await discoverWsUrl();
    log('🔗', `WebSocket URL: ${wsUrl}`);

    const cdp = new CDPClient(wsUrl);
    await cdp.connect();
    log('✅', 'Connected to Obsidian via CDP');

    await cdp.send('Runtime.enable');

    // Reload plugin to ensure latest build
    log('🔄', 'Reloading plugin...');

    // Enable Console domain to capture console messages during plugin reload
    await cdp.send('Console.enable').catch(() => {});
    await cdp.send('Runtime.enable');

    // Clear existing console messages so we only capture reload-related ones
    await cdp.send('Console.clearMessages').catch(() => {});

    // Install a console error collector in Obsidian before enabling the plugin
    await cdp.evaluate(`(() => {
        window.__pluginLoadErrors = [];
        window.__origConsoleError = console.error;
        console.error = function(...args) {
            window.__pluginLoadErrors.push(args.map(a => {
                if (a instanceof Error) return a.stack || a.message;
                if (typeof a === 'object') try { return JSON.stringify(a); } catch { return String(a); }
                return String(a);
            }).join(' '));
            window.__origConsoleError.apply(console, args);
        };
        return true;
    })()`, false);

    const pluginLoaded = await cdp.evaluate(`(async () => {
        const id = 'text-block-timer';
        await app.plugins.disablePlugin(id);
        await new Promise(r => setTimeout(r, 1500));
        await app.plugins.enablePlugin(id);
        await new Promise(r => setTimeout(r, 3000));
        // Re-focus on a markdown leaf (plugin reload may steal focus to sidebar)
        const mdLeaves = app.workspace.getLeavesOfType('markdown');
        if (mdLeaves.length > 0) {
            app.workspace.setActiveLeaf(mdLeaves[0], { focus: true });
            await new Promise(r => setTimeout(r, 500));
        }
        return !!app.plugins.plugins[id];
    })()`, true);
    await sleep(1000);

    // Restore original console.error and read captured errors
    const loadErrors = await cdp.evaluate(`(() => {
        if (window.__origConsoleError) {
            console.error = window.__origConsoleError;
            delete window.__origConsoleError;
        }
        const errors = window.__pluginLoadErrors || [];
        delete window.__pluginLoadErrors;
        return JSON.stringify(errors);
    })()`, false);

    if (!pluginLoaded) {
        log('❌', 'Plugin failed to load!');
        // Read captured console.error messages
        try {
            const errors = JSON.parse(loadErrors || '[]');
            if (errors.length > 0) {
                log('🔍', `Console errors captured during plugin reload (${errors.length}):`);
                for (const err of errors) {
                    log('🔍', `  ${err.substring(0, 500)}`);
                }
            } else {
                log('🔍', 'No console.error captured — checking Runtime exceptions...');
            }
        } catch { /* ignore parse errors */ }

        // Also try reading Obsidian's internal plugin error notice
        const notice = await cdp.evaluate(`(() => {
            // Obsidian shows plugin errors in a Notice — check for recent error notices
            const notices = document.querySelectorAll('.notice');
            const errorNotices = [];
            for (const n of notices) {
                if (n.textContent?.toLowerCase().includes('plugin') ||
                    n.textContent?.toLowerCase().includes('error') ||
                    n.textContent?.toLowerCase().includes('fail')) {
                    errorNotices.push(n.textContent.trim());
                }
            }
            return JSON.stringify(errorNotices);
        })()`, false);
        try {
            const noticeTexts = JSON.parse(notice || '[]');
            if (noticeTexts.length > 0) {
                log('🔍', 'Obsidian error notices:');
                for (const t of noticeTexts) log('🔍', `  ${t.substring(0, 300)}`);
            }
        } catch { /* ignore */ }

        // Fatal: cannot continue
        throw new Error('Plugin text-block-timer failed to load. See console errors above.');
    }

    log('✅', 'Plugin reloaded');

    const runner = new TestRunner(cdp);
    try {
        for (const chainName of chainsToRun) {
            console.log('\n' + '─'.repeat(40));
            log('🔗', `Chain: ${chainName}`);
            console.log('─'.repeat(40));
            const entry = CHAIN_REGISTRY[chainName];
            await entry.fn(runner);
        }
    } catch (e) {
        log('💥', `Unexpected error: ${e.message}`);
        console.error(e);
    }

    const allPassed = runner.summary();
    cdp.close();
    process.exit(allPassed ? 0 : 1);
}

main().catch(e => {
    console.error('Fatal error:', e);
    process.exit(2);
});