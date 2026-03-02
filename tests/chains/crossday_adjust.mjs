import { sleep, assert, log, WAIT_AFTER_COMMAND, TICK_TOLERANCE, idbGetTimer, idbGetDailyByTimer } from '../e2e-timer-test.mjs';

// ─── Chain: crossday_adjust ───────────────────────────────────────────────────
// Creates a timer that spans 3 days via toggle start/pause on each day,
// then tests manual increase/decrease duration allocation across days.
//
// Day layout (example):
//   day1 (2 days ago): toggle start → 3s → toggle pause  → daily_dur ≈ 3
//   day2 (yesterday):  toggle resume → 3s → toggle pause  → daily_dur ≈ 3
//   day3 (today):      paused, manual adjust only          → daily_dur ≈ 0
//                                                            total     ≈ 6
//
// Then we test:
//   1. Increase by +10 → all goes to today → day1≈3, day2≈3, day3≈10, total≈16
//   2. Decrease by -14 (total→≈2) → LIFO: deduct from newest first
//        day3 zeroed, day2 reduced, day1 preserved/reduced, total≈2
// ─────────────────────────────────────────────────────────────────────────────

export async function chain_crossday_adjust(runner) {

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

    // Date helpers
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

    // Helper: verify JSON and IDB internal consistency (total == sum of daily_dur)
    async function verifyDbConsistency(label) {
        // ── JSON consistency ──
        const jsonConsistency = JSON.parse(await runner.eval(`(() => {
            const p = app.plugins.plugins['text-block-timer'];
            const timerId = '${cdaTimerId}';
            const totalDur = p.database.data?.timers?.[timerId]?.total_dur_sec ?? -1;
            const dd = p.database.data?.daily_dur ?? {};
            let dailySum = 0;
            for (const [date, timerMap] of Object.entries(dd)) {
                if (timerMap[timerId] !== undefined) {
                    dailySum += timerMap[timerId];
                }
            }
            return JSON.stringify({ totalDur, dailySum });
        })()`));
        const jsonDrift = Math.abs(jsonConsistency.totalDur - jsonConsistency.dailySum);
        log('📊', `[${label}] JSON consistency: total=${jsonConsistency.totalDur}s, daily_sum=${jsonConsistency.dailySum}s, drift=${jsonDrift}s`);
        assert(jsonDrift <= TICK_TOLERANCE,
            `[${label}] JSON internal inconsistency: total(${jsonConsistency.totalDur}) vs daily_sum(${jsonConsistency.dailySum}), drift=${jsonDrift}s`);

        // ── IDB consistency ──
        const idbTimerRaw = await runner.evalAsync(idbGetTimer(cdaTimerId));
        const idbTimer = JSON.parse(idbTimerRaw);
        const idbDailyRaw = await runner.evalAsync(idbGetDailyByTimer(cdaTimerId));
        const idbRecs = JSON.parse(idbDailyRaw);
        const idbDailySum = idbRecs.reduce((s, r) => s + r.duration_sec, 0);
        const idbDrift = Math.abs(idbTimer.total_dur_sec - idbDailySum);
        log('📊', `[${label}] IDB consistency: total=${idbTimer.total_dur_sec}s, daily_sum=${idbDailySum}s, drift=${idbDrift}s`);
        assert(idbDrift <= TICK_TOLERANCE,
            `[${label}] IDB internal inconsistency: total(${idbTimer.total_dur_sec}) vs daily_sum(${idbDailySum}), drift=${idbDrift}s`);

        return { jsonConsistency, idbTotal: idbTimer.total_dur_sec, idbDailySum };
    }

    // Helper: read IDB state for the timer
    async function readIdbState() {
        const timerRaw = await runner.evalAsync(idbGetTimer(cdaTimerId));
        const timer = JSON.parse(timerRaw);
        const dailyRaw = await runner.evalAsync(idbGetDailyByTimer(cdaTimerId));
        const recs = JSON.parse(dailyRaw);
        const dailyMap = {};
        for (const rec of recs) dailyMap[rec.stat_date] = rec.duration_sec;
        const dailySum = recs.reduce((s, r) => s + r.duration_sec, 0);
        return { total: timer.total_dur_sec, dailyMap, dailySum, recs };
    }

    // Helper: call handleSetDuration to adjust total to newDur
    async function adjustDuration(newDur) {
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
    }

    // Compute the 3 dates
    const realNowMs = Date.now();
    const day3 = new Date().toLocaleDateString('sv'); // today
    const day2 = new Date(Date.now() - 86400000).toLocaleDateString('sv'); // yesterday
    const day1 = new Date(Date.now() - 2 * 86400000).toLocaleDateString('sv'); // 2 days ago

    log('📅', `Multi-day plan: day1=${day1}, day2=${day2}, day3=${day3}`);

    // ── Step 1: Patch to day1 noon, toggle start, 3s, toggle pause ──────────

    const day1Noon = new Date(day1 + 'T12:00:00').getTime();
    const offset1 = day1Noon - realNowMs;

    await runner.run('CDA: day1 — toggle start new timer', async() => {
        await patchDate(offset1);
        const fakeDate = await runner.eval(`new Date().toLocaleDateString('sv')`);
        assert(fakeDate === day1, `Expected ${day1}, got ${fakeDate}`);
        log('🕐', `Patched to day1 noon: ${fakeDate}`);

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

    log('⏳', 'Letting timer run ~3s on day1...');
    await sleep(3000);

    await runner.run('CDA: day1 — toggle pause', async() => {
        await runner.setCursorToLine(cdaTestLineNum);
        await sleep(200);
        await runner.executeCommand('text-block-timer:toggle-timer');
        await sleep(WAIT_AFTER_COMMAND);

        const lineText = await runner.eval(`app.workspace.activeEditor.editor.getLine(${cdaTestLineNum})`);
        assert(lineText.includes('class="timer-p"'), 'Expected timer-p after pause');

        // Verify day1 IDB record exists
        const dailyRaw = await runner.evalAsync(idbGetDailyByTimer(cdaTimerId));
        const recs = JSON.parse(dailyRaw);
        const day1Rec = recs.find(r => r.stat_date === day1);
        assert(day1Rec, `IDB should have day1 (${day1}) record`);
        assert(day1Rec.duration_sec >= 2, `day1 dur should be >= 2s, got ${day1Rec.duration_sec}s`);
        log('📊', `day1 IDB dur: ${day1Rec.duration_sec}s`);

        await restoreDate();
    });

    // ── Step 2: Patch to day2 noon, toggle resume, 3s, toggle pause ─────────

    const day2Noon = new Date(day2 + 'T12:00:00').getTime();
    const offset2 = day2Noon - realNowMs;

    await runner.run('CDA: day2 — toggle resume', async() => {
        await patchDate(offset2);
        const fakeDate = await runner.eval(`new Date().toLocaleDateString('sv')`);
        assert(fakeDate === day2, `Expected ${day2}, got ${fakeDate}`);
        log('🕐', `Patched to day2 noon: ${fakeDate}`);

        await runner.setCursorToLine(cdaTestLineNum);
        await sleep(200);
        await runner.executeCommand('text-block-timer:toggle-timer');
        await sleep(WAIT_AFTER_COMMAND);

        const lineText = await runner.eval(`app.workspace.activeEditor.editor.getLine(${cdaTestLineNum})`);
        assert(lineText.includes('class="timer-r"'), 'Expected timer-r after resume');
    });

    log('⏳', 'Letting timer run ~3s on day2...');
    await sleep(3000);

    await runner.run('CDA: day2 — toggle pause', async() => {
        await runner.setCursorToLine(cdaTestLineNum);
        await sleep(200);
        await runner.executeCommand('text-block-timer:toggle-timer');
        await sleep(WAIT_AFTER_COMMAND);

        const lineText = await runner.eval(`app.workspace.activeEditor.editor.getLine(${cdaTestLineNum})`);
        assert(lineText.includes('class="timer-p"'), 'Expected timer-p after pause');

        // Verify day2 IDB record exists
        const dailyRaw = await runner.evalAsync(idbGetDailyByTimer(cdaTimerId));
        const recs = JSON.parse(dailyRaw);
        const day2Rec = recs.find(r => r.stat_date === day2);
        assert(day2Rec, `IDB should have day2 (${day2}) record`);
        assert(day2Rec.duration_sec >= 2, `day2 dur should be >= 2s, got ${day2Rec.duration_sec}s`);
        log('📊', `day2 IDB dur: ${day2Rec.duration_sec}s`);

        await restoreDate();
    });

    // ── Step 3: Record pre-adjustment state & verify consistency ─────────────

    await runner.run('CDA: record pre-adjustment state', async() => {
        const state = await readIdbState();
        log('📊', `Pre-adjust: total=${state.total}s, daily_sum=${state.dailySum}s`);
        log('📊', `  day1(${day1})=${state.dailyMap[day1] || 0}s, day2(${day2})=${state.dailyMap[day2] || 0}s, day3(${day3})=${state.dailyMap[day3] || 0}s`);

        // total should be ~6 (3s on day1 + 3s on day2)
        assert(state.total >= 4 && state.total <= 10,
            `Pre-adjust total should be ~6s (got ${state.total}s)`);

        // Verify JSON & IDB internal consistency
        await verifyDbConsistency('pre-adjust');
    });

    // ── Step 4: Patch to today noon, increase by +10s ───────────────────────

    const day3Noon = new Date(day3 + 'T12:00:00').getTime();
    const offset3 = day3Noon - realNowMs;

    await runner.run('CDA: today — increase by +10s', async() => {
        await patchDate(offset3);

        const preSt = await readIdbState();
        const newDur = preSt.total + 10;
        log('📊', `Increasing total from ${preSt.total}s to ${newDur}s (+10s)`);

        await adjustDuration(newDur);

        // Verify IDB
        const afterSt = await readIdbState();
        log('📊', `After +10s:`);
        for (const rec of afterSt.recs) log('📊', `  IDB: ${rec.stat_date} = ${rec.duration_sec}s`);
        log('📊', `  total=${afterSt.total}s, daily_sum=${afterSt.dailySum}s`);

        // total should be newDur
        assert(afterSt.total === newDur,
            `Expected total=${newDur}, got ${afterSt.total}`);

        // day1 and day2 should be UNCHANGED (increase goes to today)
        assert(afterSt.dailyMap[day1] === preSt.dailyMap[day1],
            `day1 should be unchanged: expected ${preSt.dailyMap[day1]}, got ${afterSt.dailyMap[day1]}`);
        assert(afterSt.dailyMap[day2] === preSt.dailyMap[day2],
            `day2 should be unchanged: expected ${preSt.dailyMap[day2]}, got ${afterSt.dailyMap[day2]}`);

        // today (day3) should have increased by 10
        const expectedDay3 = (preSt.dailyMap[day3] || 0) + 10;
        assert((afterSt.dailyMap[day3] || 0) === expectedDay3,
            `day3 should be ${expectedDay3}, got ${afterSt.dailyMap[day3] || 0}`);

        // daily_sum should equal total
        const sumDrift = Math.abs(afterSt.dailySum - afterSt.total);
        assert(sumDrift <= 1,
            `IDB daily_sum (${afterSt.dailySum}) should match total (${afterSt.total}), drift=${sumDrift}s`);

        // Verify JSON & IDB internal consistency
        await verifyDbConsistency('after +10s increase');

        await restoreDate();
    });

    // ── Step 5: Decrease by -14s (total → total-14) ─────────────────────────
    // Pre-state after increase: day1≈3, day2≈3, day3≈10, total≈16
    // total - 14 ≈ 2 → LIFO: deduct from newest first
    //   day3 zeroed (10→0), remaining deduction = 4
    //   day2 reduced (3→0), remaining deduction = 1
    //   day1 reduced (3→2)

    await runner.run('CDA: decrease by -14s — LIFO deduction', async() => {
        const preSt = await readIdbState();
        const newDur = preSt.total - 14;
        log('📊', `Decreasing total from ${preSt.total}s to ${newDur}s (-14s)`);
        log('📊', `Pre-decrease: day1=${preSt.dailyMap[day1] || 0}, day2=${preSt.dailyMap[day2] || 0}, day3=${preSt.dailyMap[day3] || 0}`);

        assert(newDur >= 0, `newDur should be >= 0, got ${newDur}`);

        await adjustDuration(newDur);

        // Verify IDB
        const afterSt = await readIdbState();
        log('📊', `After -14s (target ${newDur}s):`);
        for (const rec of afterSt.recs) log('📊', `  IDB: ${rec.stat_date} = ${rec.duration_sec}s`);
        log('📊', `  total=${afterSt.total}s, daily_sum=${afterSt.dailySum}s`);

        // total should be newDur
        assert(afterSt.total === newDur,
            `Expected total=${newDur}, got ${afterSt.total}`);

        // daily_sum should equal newDur
        assert(afterSt.dailySum === newDur,
            `daily_sum (${afterSt.dailySum}) should equal ${newDur}`);

        // LIFO deduction simulation: traverse ascending (oldest first), preserve oldest with remaining
        const sortedDays = [
            { date: day1, dur: preSt.dailyMap[day1] || 0 },
            { date: day2, dur: preSt.dailyMap[day2] || 0 },
            { date: day3, dur: preSt.dailyMap[day3] || 0 },
        ].sort((a, b) => a.date.localeCompare(b.date));

        let expectedRemaining = newDur;
        const expected = {};
        for (const { date, dur } of sortedDays) {
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

        const d1After = afterSt.dailyMap[day1] ?? 0;
        const d2After = afterSt.dailyMap[day2] ?? 0;
        const d3After = afterSt.dailyMap[day3] ?? 0;

        log('📊', `Expected: day1=${expected[day1]}, day2=${expected[day2]}, day3=${expected[day3]}`);
        log('📊', `Actual:   day1=${d1After}, day2=${d2After}, day3=${d3After}`);

        assert(d1After === expected[day1],
            `day1: expected ${expected[day1]}, got ${d1After}`);
        assert(d2After === expected[day2],
            `day2: expected ${expected[day2]}, got ${d2After}`);
        assert(d3After === expected[day3],
            `day3: expected ${expected[day3]}, got ${d3After}`);

        // Sanity: sum should equal newDur
        assert(d1After + d2After + d3After === newDur,
            `Sum ${d1After}+${d2After}+${d3After}=${d1After + d2After + d3After} should equal ${newDur}`);

        // Verify JSON & IDB internal consistency
        await verifyDbConsistency('after -14s decrease');
    });

    // ── Step 6: Cross-layer check — JSON daily_dur matches IDB ──────────────

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
        let mismatchCount = 0;
        for (const date of [...allDates].sort()) {
            const j = jsonResult[date] ?? 0;
            const i = idbMap[date] ?? 0;
            log('📊', `  ${date}: JSON=${j}s, IDB=${i}s${j !== i ? ' ⚠️' : ''}`);
            if (j !== i) mismatchCount++;
        }

        if (mismatchCount > 0) {
            log('⚠️', `JSON vs IDB mismatch on ${mismatchCount} dates`);
        }

        // Verify IDB self-consistency
        const idbSum = idbRecs.reduce((s, r) => s + r.duration_sec, 0);
        const timerRaw = await runner.evalAsync(idbGetTimer(cdaTimerId));
        const timer = JSON.parse(timerRaw);
        const drift = Math.abs(idbSum - timer.total_dur_sec);
        assert(drift <= TICK_TOLERANCE,
            `IDB daily_sum (${idbSum}) vs total (${timer.total_dur_sec}), drift=${drift}s`);

        // Verify JSON self-consistency
        await verifyDbConsistency('cross-layer final');
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

