import { sleep, assert, log, WAIT_AFTER_COMMAND, idbGetTimer, idbGetDailyByTimer, shared } from '../e2e-timer-test.mjs';

// ─── Chain: passive_delete ───────────────────────────────────────────────────
// Tests passive deletion detection (user deletes timer span in editor) and
// passive restoration (Ctrl+Z / paste restores deleted timer span).
// Self-contained: creates its own test lines and cleans up after itself.
// ─────────────────────────────────────────────────────────────────────────────

export async function chain_passive_delete(runner) {
    const today = shared.today;

    // ── Setup: create a test line with a paused timer ────────────────────────

    const pdTestLine = await runner.eval(`(() => {
        const ed = app.workspace.activeEditor.editor;
        const last = ed.lineCount() - 1;
        ed.replaceRange('\\nE2E_PASSIVE_DELETE_' + Date.now(), { line: last, ch: ed.getLine(last).length });
        const n = ed.lineCount() - 1;
        ed.setCursor({ line: n, ch: 0 });
        return n;
    })()`);
    log('📝', `Passive delete test line at L${pdTestLine}`);
    await sleep(500);

    // Create a timer (running) then pause it
    await runner.setCursorToLine(pdTestLine);
    await sleep(200);
    await runner.executeCommand('text-block-timer:toggle-timer');
    await sleep(WAIT_AFTER_COMMAND);

    let lineText = await runner.eval(`app.workspace.activeEditor.editor.getLine(${pdTestLine})`);
    const pdTimerId = lineText.match(/id="([^"]+)"/)?.[1];
    assert(pdTimerId, 'Failed to create timer for passive delete test');
    log('🆔', `Passive delete timer ID: ${pdTimerId}`);

    // Pause it
    await runner.setCursorToLine(pdTestLine);
    await sleep(200);
    await runner.executeCommand('text-block-timer:toggle-timer');
    await sleep(WAIT_AFTER_COMMAND);

    // Verify it's paused
    const stateBeforeDelete = await runner.eval(`(() => {
        const p = app.plugins.plugins['text-block-timer'];
        return p.database.getEntry('${pdTimerId}')?.state ?? 'missing';
    })()`);
    assert(stateBeforeDelete === 'paused', `Expected paused before delete, got ${stateBeforeDelete}`);

    // Save the paused line text for restore tests
    const pdOriginalLineText = await runner.eval(`app.workspace.activeEditor.editor.getLine(${pdTestLine})`);
    log('📝', `Original line text saved (${pdOriginalLineText.length} chars)`);

    // ══════════════════════════════════════════════════════════════════════════
    // TC-01: Passive delete paused timer
    // ══════════════════════════════════════════════════════════════════════════

    await runner.run('TC-01: Passive delete paused timer', async() => {
        // Delete line content via CM6 dispatch (ensures undo history is recorded)
        await runner.eval(`(() => {
            const view = app.workspace.activeEditor.editor.cm;
            const line = view.state.doc.line(${pdTestLine} + 1);
            view.dispatch({ changes: { from: line.from, to: line.to, insert: '' } });
            return true;
        })()`);
        await sleep(WAIT_AFTER_COMMAND);

        // Verify JSON state
        const jsonState = await runner.eval(`(() => {
            const p = app.plugins.plugins['text-block-timer'];
            return p.database.getEntry('${pdTimerId}')?.state ?? 'missing';
        })()`);
        assert(jsonState === 'deleted', `JSON state should be deleted, got ${jsonState}`);

        // Verify IDB state
        const idbRaw = await runner.evalAsync(idbGetTimer(pdTimerId));
        assert(idbRaw, 'Timer should still exist in IDB');
        const idbEntry = JSON.parse(idbRaw);
        assert(idbEntry.state === 'deleted', `IDB state should be deleted, got ${idbEntry.state}`);

        log('📊', `TC-01: JSON=${jsonState}, IDB=${idbEntry.state}`);
    });

    // ══════════════════════════════════════════════════════════════════════════
    // TC-03: Ctrl+Z restore paused timer
    // ══════════════════════════════════════════════════════════════════════════

    await runner.run('TC-03: Restore passively deleted timer to paused (simulated undo)', async() => {
        // Restore the original line text via CM6 dispatch to simulate undo/paste-back
        // This triggers updateListener which should detect the timer span reappearing
        await runner.eval(`(() => {
            const view = app.workspace.activeEditor.editor.cm;
            const line = view.state.doc.line(${pdTestLine} + 1);
            view.dispatch({ changes: { from: line.from, to: line.to, insert: ${JSON.stringify(pdOriginalLineText)} } });
            return true;
        })()`);
        await sleep(WAIT_AFTER_COMMAND);

        // Check state
        const jsonState = await runner.eval(`(() => {
            const p = app.plugins.plugins['text-block-timer'];
            return p.database.getEntry('${pdTimerId}')?.state ?? 'missing';
        })()`);
        assert(jsonState === 'paused', `JSON state should be paused after restore, got ${jsonState}`);

        // Verify IDB state
        const idbRaw = await runner.evalAsync(idbGetTimer(pdTimerId));
        const idbEntry = JSON.parse(idbRaw);
        assert(idbEntry.state === 'paused', `IDB state should be paused after restore, got ${idbEntry.state}`);

        // Verify span is back in the line
        const restoredLine = await runner.eval(`app.workspace.activeEditor.editor.getLine(${pdTestLine})`);
        assert(restoredLine.includes(`id="${pdTimerId}"`), 'Timer span should be restored in editor');

        log('📊', `TC-03: JSON=${jsonState}, IDB=${idbEntry.state}, span restored`);
    });

    // ══════════════════════════════════════════════════════════════════════════
    // TC-07: Idempotency — calling handlePassiveDelete on already deleted timer
    // ══════════════════════════════════════════════════════════════════════════

    await runner.run('TC-07: Idempotency — handlePassiveDelete on deleted timer is no-op', async() => {
        // First, passive delete again
        await runner.eval(`(() => {
            const ed = app.workspace.activeEditor.editor;
            const lineLen = ed.getLine(${pdTestLine}).length;
            ed.replaceRange('', { line: ${pdTestLine}, ch: 0 }, { line: ${pdTestLine}, ch: lineLen });
            return true;
        })()`);
        await sleep(WAIT_AFTER_COMMAND);

        const stateBefore = await runner.eval(`(() => {
            const p = app.plugins.plugins['text-block-timer'];
            return p.database.getEntry('${pdTimerId}')?.state ?? 'missing';
        })()`);
        assert(stateBefore === 'deleted', `Should be deleted before idempotency test, got ${stateBefore}`);

        // Get daily_dur count before
        const dailyBefore = await runner.evalAsync(idbGetDailyByTimer(pdTimerId));
        const dailyBeforeCount = JSON.parse(dailyBefore).length;

        // Call handlePassiveDelete directly — should be no-op
        await runner.eval(`(() => {
            const p = app.plugins.plugins['text-block-timer'];
            p.handlePassiveDelete('${pdTimerId}');
            return true;
        })()`);
        await sleep(500);

        // Verify state unchanged
        const stateAfter = await runner.eval(`(() => {
            const p = app.plugins.plugins['text-block-timer'];
            return p.database.getEntry('${pdTimerId}')?.state ?? 'missing';
        })()`);
        assert(stateAfter === 'deleted', `State should still be deleted, got ${stateAfter}`);

        // Verify daily_dur unchanged
        const dailyAfter = await runner.evalAsync(idbGetDailyByTimer(pdTimerId));
        const dailyAfterCount = JSON.parse(dailyAfter).length;
        assert(dailyAfterCount === dailyBeforeCount, `daily_dur count changed: ${dailyBeforeCount} → ${dailyAfterCount}`);

        log('📊', `TC-07: Idempotent — state=${stateAfter}, daily_dur count unchanged (${dailyAfterCount})`);
    });

    // Restore for TC-05 (write back original text via CM6 dispatch)
    await runner.eval(`(() => {
        const view = app.workspace.activeEditor.editor.cm;
        const line = view.state.doc.line(${pdTestLine} + 1);
        view.dispatch({ changes: { from: line.from, to: line.to, insert: ${JSON.stringify(pdOriginalLineText)} } });
        return true;
    })()`);
    await sleep(WAIT_AFTER_COMMAND);

    // ══════════════════════════════════════════════════════════════════════════
    // TC-05: Cut and paste in same file
    // ══════════════════════════════════════════════════════════════════════════

    await runner.run('TC-05: Cut-paste same file — delete then restore', async() => {
        // Save the line content
        const savedLine = await runner.eval(`app.workspace.activeEditor.editor.getLine(${pdTestLine})`);
        assert(savedLine.includes(`id="${pdTimerId}"`), 'Timer should be present before cut');

        // Cut (delete the line content) via CM6 dispatch
        await runner.eval(`(() => {
            const view = app.workspace.activeEditor.editor.cm;
            const line = view.state.doc.line(${pdTestLine} + 1);
            view.dispatch({ changes: { from: line.from, to: line.to, insert: '' } });
            return true;
        })()`);
        await sleep(WAIT_AFTER_COMMAND);

        // Verify deleted after cut
        const cutState = await runner.eval(`(() => {
            const p = app.plugins.plugins['text-block-timer'];
            return p.database.getEntry('${pdTimerId}')?.state ?? 'missing';
        })()`);
        assert(cutState === 'deleted', `After cut, state should be deleted, got ${cutState}`);

        // Paste back the saved line content via CM6 dispatch
        await runner.eval(`(() => {
            const view = app.workspace.activeEditor.editor.cm;
            const line = view.state.doc.line(${pdTestLine} + 1);
            view.dispatch({ changes: { from: line.from, to: line.to, insert: ${JSON.stringify(pdOriginalLineText)} } });
            return true;
        })()`);
        await sleep(WAIT_AFTER_COMMAND);

        // Verify restored after paste/undo
        const pasteState = await runner.eval(`(() => {
            const p = app.plugins.plugins['text-block-timer'];
            return p.database.getEntry('${pdTimerId}')?.state ?? 'missing';
        })()`);
        assert(pasteState === 'paused', `After paste, state should be paused, got ${pasteState}`);

        log('📊', `TC-05: Cut state=${cutState}, Paste state=${pasteState}`);
    });

    // ══════════════════════════════════════════════════════════════════════════
    // TC-08: Editing non-timer line does not trigger passive delete
    // ══════════════════════════════════════════════════════════════════════════

    await runner.run('TC-08: Editing non-timer line does not affect timer state', async() => {
        const stateBefore = await runner.eval(`(() => {
            const p = app.plugins.plugins['text-block-timer'];
            return p.database.getEntry('${pdTimerId}')?.state ?? 'missing';
        })()`);

        // Edit a different line (line 0)
        await runner.eval(`(() => {
            const ed = app.workspace.activeEditor.editor;
            const line0 = ed.getLine(0);
            ed.replaceRange(' ', { line: 0, ch: line0.length });
            return true;
        })()`);
        await sleep(1000);

        const stateAfter = await runner.eval(`(() => {
            const p = app.plugins.plugins['text-block-timer'];
            return p.database.getEntry('${pdTimerId}')?.state ?? 'missing';
        })()`);
        assert(stateAfter === stateBefore, `Timer state changed from ${stateBefore} to ${stateAfter} after editing unrelated line`);

        // Clean up the extra space
        await runner.eval(`(() => {
            const ed = app.workspace.activeEditor.editor;
            const line0 = ed.getLine(0);
            ed.replaceRange('', { line: 0, ch: line0.length - 1 }, { line: 0, ch: line0.length });
            return true;
        })()`);

        log('📊', `TC-08: State unchanged (${stateAfter})`);
    });

    // ══════════════════════════════════════════════════════════════════════════
    // TC-02: Passive delete running timer + duration settlement
    // ══════════════════════════════════════════════════════════════════════════

    // First, make the timer running again
    await runner.setCursorToLine(pdTestLine);
    await sleep(200);
    await runner.executeCommand('text-block-timer:toggle-timer');
    await sleep(WAIT_AFTER_COMMAND);

    // Verify it's running
    const runState = await runner.eval(`(() => {
        const p = app.plugins.plugins['text-block-timer'];
        return p.database.getEntry('${pdTimerId}')?.state ?? 'missing';
    })()`);
    assert(runState === 'running', `Expected running before TC-02, got ${runState}`);

    // Save the running line text for restore test (TC-04)
    const pdRunningLineText = await runner.eval(`app.workspace.activeEditor.editor.getLine(${pdTestLine})`);

    // Wait a bit so there's some accumulated time
    log('⏳', 'Waiting for timer to accumulate time...');
    await sleep(3000);

    await runner.run('TC-02: Passive delete running timer — settles duration', async() => {
        // Record daily_dur before delete
        const dailyBefore = await runner.evalAsync(idbGetDailyByTimer(pdTimerId));
        const dailyBeforeRecs = JSON.parse(dailyBefore);
        const dailyBeforeDur = dailyBeforeRecs.find(r => r.stat_date === today)?.duration_sec ?? 0;

        // Delete the line via CM6 dispatch
        await runner.eval(`(() => {
            const view = app.workspace.activeEditor.editor.cm;
            const line = view.state.doc.line(${pdTestLine} + 1);
            view.dispatch({ changes: { from: line.from, to: line.to, insert: '' } });
            return true;
        })()`);
        await sleep(WAIT_AFTER_COMMAND);

        // Verify state = deleted
        const jsonState = await runner.eval(`(() => {
            const p = app.plugins.plugins['text-block-timer'];
            return p.database.getEntry('${pdTimerId}')?.state ?? 'missing';
        })()`);
        assert(jsonState === 'deleted', `JSON state should be deleted, got ${jsonState}`);

        // Verify total_dur_sec > 0
        const totalDur = await runner.eval(`(() => {
            const p = app.plugins.plugins['text-block-timer'];
            return p.database.getEntry('${pdTimerId}')?.total_dur_sec ?? 0;
        })()`);
        assert(totalDur > 0, `total_dur_sec should be > 0, got ${totalDur}`);

        // Verify TimerManager no longer has this timer
        const managerHas = await runner.eval(`(() => {
            const p = app.plugins.plugins['text-block-timer'];
            return p.manager.getTimerData('${pdTimerId}') !== null;
        })()`);
        assert(!managerHas, 'TimerManager should not have the timer after passive delete');

        // Verify daily_dur was written
        await sleep(500); // Wait for IDB async
        const dailyAfter = await runner.evalAsync(idbGetDailyByTimer(pdTimerId));
        const dailyAfterRecs = JSON.parse(dailyAfter);
        const dailyAfterDur = dailyAfterRecs.find(r => r.stat_date === today)?.duration_sec ?? 0;
        assert(dailyAfterDur >= dailyBeforeDur, `daily_dur should not decrease: ${dailyBeforeDur} → ${dailyAfterDur}`);

        log('📊', `TC-02: state=${jsonState}, totalDur=${totalDur}s, daily: ${dailyBeforeDur}→${dailyAfterDur}s`);
    });

    // ══════════════════════════════════════════════════════════════════════════
    // TC-04: Ctrl+Z restore running timer → becomes paused (not running)
    // ══════════════════════════════════════════════════════════════════════════

    await runner.run('TC-04: Restore running timer as paused (not running)', async() => {
        // Restore via CM6 dispatch (simulating undo/paste-back)
        await runner.eval(`(() => {
            const view = app.workspace.activeEditor.editor.cm;
            const line = view.state.doc.line(${pdTestLine} + 1);
            view.dispatch({ changes: { from: line.from, to: line.to, insert: ${JSON.stringify(pdRunningLineText)} } });
            return true;
        })()`);
        await sleep(WAIT_AFTER_COMMAND);

        // Verify state = paused (NOT running)
        const jsonState = await runner.eval(`(() => {
            const p = app.plugins.plugins['text-block-timer'];
            return p.database.getEntry('${pdTimerId}')?.state ?? 'missing';
        })()`);
        assert(jsonState === 'paused', `After restore, state should be paused (not running), got ${jsonState}`);

        // Verify TimerManager does NOT have it running
        const managerHas = await runner.eval(`(() => {
            const p = app.plugins.plugins['text-block-timer'];
            return p.manager.getTimerData('${pdTimerId}') !== null;
        })()`);
        assert(!managerHas, 'TimerManager should not auto-resume timer after restore');

        // Verify span is back
        const restoredLine = await runner.eval(`app.workspace.activeEditor.editor.getLine(${pdTestLine})`);
        assert(restoredLine.includes(`id="${pdTimerId}"`), 'Timer span should be restored after dispatch');

        // Verify span class consistency: timer-r should have been patched to timer-p
        // The async span fix runs via setTimeout(0), wait a bit for it to apply
        await sleep(500);
        const fixedLine = await runner.eval(`app.workspace.activeEditor.editor.getLine(${pdTestLine})`);
        const hasTimerP = fixedLine.includes('class="timer-p"');
        const hasTimerR = fixedLine.includes('class="timer-r"');
        log('🔍', `TC-04 span class check: timer-p=${hasTimerP}, timer-r=${hasTimerR}`);
        assert(hasTimerP && !hasTimerR, `Span class should be timer-p after restore, got line: ${fixedLine.substring(0, 120)}`);

        log('📊', `TC-04: state=${jsonState}, managerRunning=${managerHas}, spanClass=timer-p ✓`);
    });

    // ══════════════════════════════════════════════════════════════════════════
    // Cleanup: remove passive delete test lines
    // ══════════════════════════════════════════════════════════════════════════

    await runner.run('Cleanup: remove passive delete test lines', async() => {
        await runner.eval(`(() => {
            const ed = app.workspace.activeEditor.editor;
            for (let i = ed.lineCount() - 1; i >= 0; i--) {
                if (ed.getLine(i).includes('E2E_PASSIVE_DELETE_')) {
                    const from = Math.max(0, i - 1);
                    const fromCh = i > 0 ? ed.getLine(from).length : 0;
                    ed.replaceRange('', { line: from, ch: fromCh }, { line: i, ch: ed.getLine(i).length });
                }
            }
            return true;
        })()`);
        await sleep(500);
        log('🧹', 'Passive delete test lines removed');
    });
}

