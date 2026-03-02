import { sleep, assert, log, WAIT_AFTER_COMMAND, TICK_TOLERANCE, idbGetTimer } from '../e2e-timer-test.mjs';

// ─── Chain: restore_behavior ─────────────────────────────────────────────────
// Tests autoStopTimers behavior (close mode — forcepause all timers on file reopen)

export async function chain_restore_behavior(runner) {
    // This test verifies the `close` mode of autoStopTimers:
    // When a file is re-opened with autoStopTimers='close', all running timers should be force-paused.

    let rstTimerId = null;

    const rstTestLine = await runner.eval(`(() => {
        const ed = app.workspace.activeEditor.editor;
        const last = ed.lineCount() - 1;
        ed.replaceRange('\\nE2E_RST_TEST_' + Date.now(), { line: last, ch: ed.getLine(last).length });
        const n = ed.lineCount() - 1;
        ed.setCursor({ line: n, ch: 0 });
        return n;
    })()`);
    await sleep(500);

    // Start a timer
    await runner.run('RST-01: Start timer for restore test', async() => {
        await runner.setCursorToLine(rstTestLine);
        await sleep(200);
        await runner.executeCommand('text-block-timer:toggle-timer');
        await sleep(WAIT_AFTER_COMMAND);

        const lineText = await runner.eval(`app.workspace.activeEditor.editor.getLine(${rstTestLine})`);
        assert(lineText.includes('class="timer-r"'), 'Expected timer-r span');
        const match = lineText.match(/id="([^"]+)"/);
        assert(match, 'Timer ID not found');
        rstTimerId = match[1];
        log('🆔', `Restore test timer ID: ${rstTimerId}`);
    });

    // Test autoStopTimers='close' via restoreTimers
    await runner.run('RST-02: autoStopTimers=close forcepause-s running timer on restoreTimers', async() => {
        // Set autoStopTimers to 'close'
        await runner.eval(`(() => {
            const p = app.plugins.plugins['text-block-timer'];
            p.settings.autoStopTimers = 'close';
            return true;
        })()`);

        // Stop the timer in manager first (simulates plugin restart — manager is empty)
        await runner.eval(`(() => {
            const p = app.plugins.plugins['text-block-timer'];
            p.manager.stopTimer('${rstTimerId}');
            return true;
        })()`);
        await sleep(300);

        // Call restoreTimers (simulates file re-open) — needs active view as argument
        await runner.eval(`(() => {
            const p = app.plugins.plugins['text-block-timer'];
            const view = app.workspace.activeEditor;
            p.restoreTimers(view);
            return true;
        })()`);
        await sleep(WAIT_AFTER_COMMAND);

        // Verify timer is force-paused in Markdown
        const lineText = await runner.eval(`app.workspace.activeEditor.editor.getLine(${rstTestLine})`);
        assert(lineText.includes('class="timer-p"'), `Expected timer-p after close restore, got: "${lineText?.substring(0, 100)}"`);

        // Verify not in TimerManager
        const managerHas = await runner.eval(`app.plugins.plugins['text-block-timer'].manager.hasTimer('${rstTimerId}')`);
        assert(!managerHas, 'Timer should NOT be in manager after forcepause');
        log('✅', 'Timer force-paused by autoStopTimers=close');
    });

    // Test autoStopTimers='never' restores the timer
    await runner.run('RST-03: autoStopTimers=never restores running timer', async() => {
        // First make the span timer-r again (simulate it was running before restore)
        await runner.eval(`(() => {
            const ed = app.workspace.activeEditor.editor;
            const line = ed.getLine(${rstTestLine});
            const newLine = line.replace('class="timer-p"', 'class="timer-r"');
            ed.replaceRange(newLine, { line: ${rstTestLine}, ch: 0 }, { line: ${rstTestLine}, ch: line.length });
            return true;
        })()`);
        await sleep(300);

        // Set autoStopTimers to 'never'
        await runner.eval(`(() => {
            const p = app.plugins.plugins['text-block-timer'];
            p.settings.autoStopTimers = 'never';
            return true;
        })()`);

        await runner.eval(`(() => {
            const p = app.plugins.plugins['text-block-timer'];
            const view = app.workspace.activeEditor;
            p.restoreTimers(view);
            return true;
        })()`);
        await sleep(WAIT_AFTER_COMMAND);

        // Verify timer is restored (running in manager)
        const managerHas = await runner.eval(`app.plugins.plugins['text-block-timer'].manager.hasTimer('${rstTimerId}')`);
        assert(managerHas, 'Timer should be in manager after never-mode restore');
        log('✅', 'Timer restored by autoStopTimers=never');
    });

    // RST-04: Cross-layer consistency after restore
    await runner.run('RST-04: Three-layer consistency after restore', async() => {
        // Get Markdown dur
        const lineText = await runner.eval(`app.workspace.activeEditor.editor.getLine(${rstTestLine})`);
        const mdDurMatch = lineText.match(/data-dur="(\d+)"/);
        const mdDur = mdDurMatch ? parseInt(mdDurMatch[1]) : -1;

        // Get JSON dur
        const jsonDur = await runner.eval(`(() => {
            const p = app.plugins.plugins['text-block-timer'];
            const e = p.database.getEntry('${rstTimerId}');
            return e ? e.total_dur_sec : -1;
        })()`);

        // Get IDB dur
        const idbRaw = await runner.evalAsync(idbGetTimer(rstTimerId));
        const idbEntry = idbRaw ? JSON.parse(idbRaw) : null;
        const idbDur = idbEntry ? idbEntry.total_dur_sec : -1;

        log('📊', `Cross-layer dur: MD=${mdDur}, JSON=${jsonDur}, IDB=${idbDur}`);
        assert(Math.abs(mdDur - jsonDur) <= TICK_TOLERANCE, `MD (${mdDur}) vs JSON (${jsonDur}) diff > ${TICK_TOLERANCE}s`);
        assert(Math.abs(jsonDur - idbDur) <= TICK_TOLERANCE, `JSON (${jsonDur}) vs IDB (${idbDur}) diff > ${TICK_TOLERANCE}s`);
    });

    // Cleanup: stop timer, delete entry, remove test line
    if (rstTimerId) {
        await runner.eval(`(() => {
            const p = app.plugins.plugins['text-block-timer'];
            p.manager.stopTimer('${rstTimerId}');
            return true;
        })()`);
        await runner.evalAsync(`
            const p = app.plugins.plugins['text-block-timer'];
            await p.database.updateEntry('${rstTimerId}', { state: 'deleted' });
            await p.idb.patchTimer('${rstTimerId}', { state: 'deleted' });
            return true;
        `);
    }
    // Restore autoStopTimers to default
    await runner.eval(`(() => {
        const p = app.plugins.plugins['text-block-timer'];
        p.settings.autoStopTimers = 'quit';
        return true;
    })()`);
    await runner.eval(`(() => {
        const ed = app.workspace.activeEditor.editor;
        for (let i = ed.lineCount() - 1; i >= 0; i--) {
            if (ed.getLine(i).includes('E2E_RST_TEST_')) {
                const from = Math.max(0, i - 1);
                const fromCh = i > 0 ? ed.getLine(from).length : 0;
                ed.replaceRange('', { line: from, ch: fromCh }, { line: i, ch: ed.getLine(i).length });
                break;
            }
        }
        return true;
    })()`);
    await sleep(500);
    log('🧹', 'Restore test cleaned up');
}

