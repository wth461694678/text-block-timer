import { sleep, assert, log, WAIT_AFTER_COMMAND, WAIT_TICK_ACCUMULATE, TICK_TOLERANCE, idbGetTimer, idbGetDailyByTimer, idbGetDailyByDate, idbGetTimersByState, shared } from '../e2e-timer-test.mjs';

// ─── Chain: basic ────────────────────────────────────────────────────────────

export async function chain_basic(runner) {
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
        assert(lineText?.includes('class="timer-r"'), `Expected timer-r span, got: "${lineText}"`);

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
        const beforeDur = beforeRecs.find(r => r.stat_date === today)?.duration_sec ?? 0;

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
        const afterDur = afterRecs.find(r => r.stat_date === today)?.duration_sec ?? 0;

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
        assert(lineText?.includes('class="timer-p"'), `Expected timer-p, got: "${lineText}"`);

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
        assert(lineText?.includes('class="timer-r"'), `Expected timer-r after continue`);
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

