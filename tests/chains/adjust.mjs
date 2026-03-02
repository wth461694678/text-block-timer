import { sleep, assert, log, WAIT_AFTER_COMMAND, TICK_TOLERANCE, idbGetTimer, idbGetDailyByTimer, shared } from '../e2e-timer-test.mjs';

// ─── Chain: adjust ────────────────────────────────────────────────────────────

export async function chain_adjust(runner) {
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
        assert(lineText?.includes('class="timer-p"'), 'Expected timer-p');
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
        assert(lineText?.includes('class="timer-r"'), 'Expected timer-r');
    });

    log('⏳', 'Waiting 4s for tick accumulation...');
    await sleep(4000);

    await runner.run('PAUSE after accumulation', async() => {
        await runner.setCursorToLine(testLineNum);
        await sleep(200);
        await runner.executeCommand('text-block-timer:toggle-timer');
        await sleep(WAIT_AFTER_COMMAND);
        const lineText = await runner.eval(`app.workspace.activeEditor.editor.getLine(${testLineNum})`);
        assert(lineText?.includes('class="timer-p"'), 'Expected timer-p');
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

