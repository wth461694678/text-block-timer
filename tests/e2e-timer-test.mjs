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

export const CDP_HOST = 'localhost';
export const CDP_PORT = 9222;
export const WAIT_AFTER_COMMAND = 2000; // ms to wait after each command for effects to settle
export const WAIT_TICK_ACCUMULATE = 6000; // ms to let a running timer accumulate some seconds
export const TICK_TOLERANCE = 2; // seconds tolerance for tick-based assertions

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

export function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

export function assert(cond, msg) { if (!cond) throw new Error(`ASSERTION FAILED: ${msg}`); }

export function log(emoji, msg) { console.log(`${emoji}  ${msg}`); }

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
export function idbGetTimer(timerId) {
    return `
        const idb = app.plugins.plugins['text-block-timer'].idb;
        const entry = await idb.getTimer('${timerId}');
        return entry ? JSON.stringify(entry) : null;
    `;
}

/** Read all daily_dur records for a timer from IDB */
export function idbGetDailyByTimer(timerId) {
    return `
        const idb = app.plugins.plugins['text-block-timer'].idb;
        const recs = await idb.getDailyDurByTimer('${timerId}');
        return JSON.stringify(recs);
    `;
}

/** Read all daily_dur records for today from IDB */
export function idbGetDailyByDate(date) {
    return `
        const idb = app.plugins.plugins['text-block-timer'].idb;
        const recs = await idb.getDailyDurByDate('${date}');
        return JSON.stringify(recs);
    `;
}

/** Read all daily_dur records from IDB */
export function idbGetAllDaily() {
    return `
        const idb = app.plugins.plugins['text-block-timer'].idb;
        const recs = await idb.getAllDailyDur();
        return JSON.stringify(recs);
    `;
}

/** Read all timers from IDB */
export function idbGetAllTimers() {
    return `
        const idb = app.plugins.plugins['text-block-timer'].idb;
        const entries = await idb.getAllTimers();
        return JSON.stringify(entries);
    `;
}

/** Read timers by state from IDB */
export function idbGetTimersByState(states) {
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
export const shared = {
    today: null,
    testLineNum: null,
    createdTimerId: null,
    initial: null,
    pausedDur: 0,
    preAdjustDur: 0,
    preAdjustDailySum: 0,
};


// ─── Chain Imports ───────────────────────────────────────────────────────────

import { chain_preflight } from './chains/preflight.mjs';
import { chain_basic } from './chains/basic.mjs';
import { chain_adjust } from './chains/adjust.mjs';
import { chain_seed } from './chains/seed.mjs';
import { chain_delete } from './chains/delete.mjs';
import { chain_crossday } from './chains/crossday.mjs';
import { chain_sidebar_tabs } from './chains/sidebar_tabs.mjs';
import { chain_readonly } from './chains/readonly.mjs';
import { chain_crossday_adjust } from './chains/crossday_adjust.mjs';
import { chain_passive_delete } from './chains/passive_delete.mjs';
import { chain_checkbox } from './chains/checkbox.mjs';
import { chain_crash_recovery } from './chains/crash_recovery.mjs';
import { chain_settings_behavior } from './chains/settings_behavior.mjs';
import { chain_restore_behavior } from './chains/restore_behavior.mjs';
import { chain_onunload_behavior } from './chains/onunload_behavior.mjs';
import { chain_cleanup_basic } from './chains/cleanup_basic.mjs';

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
    passive_delete: { fn: chain_passive_delete, deps: ['preflight'], cleanup: null },
    checkbox: { fn: chain_checkbox, deps: ['preflight'], cleanup: null },
    crash_recovery: { fn: chain_crash_recovery, deps: ['preflight'], cleanup: null },
    settings_behavior: { fn: chain_settings_behavior, deps: ['preflight'], cleanup: null },
    restore_behavior: { fn: chain_restore_behavior, deps: ['preflight'], cleanup: null },
    onunload_behavior: { fn: chain_onunload_behavior, deps: ['preflight'], cleanup: null },
    cleanup_basic: { fn: chain_cleanup_basic, deps: [], cleanup: null },
};

// Default run order when no chains specified (= run everything)
const ALL_CHAINS = ['preflight', 'basic', 'sidebar_tabs', 'readonly', 'adjust', 'seed', 'delete', 'passive_delete', 'checkbox', 'crash_recovery', 'settings_behavior', 'restore_behavior', 'onunload_behavior', 'crossday', 'crossday_adjust', 'cleanup_basic'];

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
    // ── Auto-start Obsidian with remote debugging ──────────────────────
    const OBSIDIAN_EXE = 'C:\\Users\\frankthwang\\AppData\\Local\\Programs\\Obsidian\\Obsidian.exe';
    const OBSIDIAN_PORT = 9222;

    // Check if Obsidian is already running with debug port
    let obsidianReady = false;
    try {
        const checkResp = await fetch(`http://${CDP_HOST}:${CDP_PORT}/json`);
        if (checkResp.ok) obsidianReady = true;
    } catch { /* not running */ }

    if (!obsidianReady) {
        log('🚀', 'Starting Obsidian with remote debugging...');
        const { execSync } = await import('child_process');
        execSync(`Start-Process "${OBSIDIAN_EXE}" -ArgumentList "--remote-debugging-port=${OBSIDIAN_PORT}"`, { shell: 'powershell.exe' });
        // Wait for Obsidian to start and CDP to become available
        for (let attempt = 0; attempt < 30; attempt++) {
            await new Promise(r => setTimeout(r, 2000));
            try {
                const resp = await fetch(`http://${CDP_HOST}:${CDP_PORT}/json`);
                if (resp.ok) { obsidianReady = true; break; }
            } catch { /* retry */ }
            if (attempt % 5 === 4) log('⏳', `Waiting for Obsidian... (${attempt + 1}/30)`);
        }
        if (!obsidianReady) throw new Error('Obsidian failed to start within 60 seconds');
        log('✅', 'Obsidian is ready');
    } else {
        log('✅', 'Obsidian already running with debug port');
    }

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
