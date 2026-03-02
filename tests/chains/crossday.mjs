import { sleep, assert, log, WAIT_AFTER_COMMAND, TICK_TOLERANCE, idbGetTimer, idbGetDailyByTimer } from '../e2e-timer-test.mjs';

// ─── Chain: crossday ─────────────────────────────────────────────────────────
// Uses Date monkey-patch to shift time to yesterday 23:59:55.
// Since the offset is fixed and added to real Date.now(), real wall-clock
// passage of ~8s naturally advances the patched time past midnight into today.
// No second Date patch needed!
// ─────────────────────────────────────────────────────────────────────────────

export async function chain_crossday(runner) {

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

