import { sleep, assert, log, WAIT_AFTER_COMMAND } from '../e2e-timer-test.mjs';

// ─── Chain: settings_behavior ────────────────────────────────────────────────
// Tests that settings changes affect timer behavior

export async function chain_settings_behavior(runner) {
    // SET-01 & SET-02: timerInsertLocation
    let settingsTimerId = null;

    // Save original settings
    const origSettings = await runner.eval(`(() => {
        const p = app.plugins.plugins['text-block-timer'];
        return JSON.stringify({
            timerInsertLocation: p.settings.timerInsertLocation,
            runningIcon: p.settings.runningIcon,
            pausedIcon: p.settings.pausedIcon,
            timeDisplayFormat: p.settings.timeDisplayFormat
        });
    })()`);
    const orig = JSON.parse(origSettings);
    log('⚙️', `Original settings: insertLocation=${orig.timerInsertLocation}`);

    // Create test line for tail insertion
    const setTestLine = await runner.eval(`(() => {
        const ed = app.workspace.activeEditor.editor;
        const last = ed.lineCount() - 1;
        ed.replaceRange('\\nE2E_SETTINGS_TEST_' + Date.now(), { line: last, ch: ed.getLine(last).length });
        const n = ed.lineCount() - 1;
        ed.setCursor({ line: n, ch: 0 });
        return n;
    })()`);
    await sleep(500);

    await runner.run('SET-01: timerInsertLocation=tail inserts timer at end of line', async() => {
        // Set to tail
        await runner.eval(`(() => {
            const p = app.plugins.plugins['text-block-timer'];
            p.settings.timerInsertLocation = 'tail';
            return true;
        })()`);

        await runner.setCursorToLine(setTestLine);
        await sleep(200);
        await runner.executeCommand('text-block-timer:toggle-timer');
        await sleep(WAIT_AFTER_COMMAND);

        const lineText = await runner.eval(`app.workspace.activeEditor.editor.getLine(${setTestLine})`);
        assert(lineText.includes('class="timer-r"'), 'Expected timer-r span');

        // Timer should be at the end: line text starts with 'E2E_SETTINGS_TEST_'
        assert(lineText.startsWith('E2E_SETTINGS_TEST_'), `Expected line to start with test prefix, got: "${lineText?.substring(0, 40)}"`);
        // Extract timer span position
        const spanIdx = lineText.indexOf('<span');
        const textBeforeSpan = lineText.substring(0, spanIdx).trim();
        assert(textBeforeSpan.startsWith('E2E_SETTINGS_TEST_'), 'Timer span should be at tail');
        log('📊', `Tail insert verified: spanIdx=${spanIdx}, lineLen=${lineText.length}`);

        const match = lineText.match(/id="([^"]+)"/);
        settingsTimerId = match?.[1];
    });

    // Pause and delete for next test
    if (settingsTimerId) {
        await runner.setCursorToLine(setTestLine);
        await sleep(200);
        await runner.executeCommand('text-block-timer:toggle-timer');
        await sleep(WAIT_AFTER_COMMAND);
        await runner.executeCommand('text-block-timer:delete-timer');
        await sleep(WAIT_AFTER_COMMAND);
    }

    await runner.run('SET-02: timerInsertLocation=head inserts timer at start (after checkbox/list prefix)', async() => {
        // Set to head
        await runner.eval(`(() => {
            const p = app.plugins.plugins['text-block-timer'];
            p.settings.timerInsertLocation = 'head';
            return true;
        })()`);

        // Create a line with a list prefix
        const headTestLine = await runner.eval(`(() => {
            const ed = app.workspace.activeEditor.editor;
            const last = ed.lineCount() - 1;
            ed.replaceRange('\\n- E2E_HEAD_TEST_' + Date.now(), { line: last, ch: ed.getLine(last).length });
            const n = ed.lineCount() - 1;
            ed.setCursor({ line: n, ch: 0 });
            return n;
        })()`);
        await sleep(500);

        await runner.setCursorToLine(headTestLine);
        await sleep(200);
        await runner.executeCommand('text-block-timer:toggle-timer');
        await sleep(WAIT_AFTER_COMMAND);

        const lineText = await runner.eval(`app.workspace.activeEditor.editor.getLine(${headTestLine})`);
        assert(lineText.includes('class="timer-r"'), 'Expected timer-r span');

        // Timer should be right after the "- " prefix
        assert(lineText.startsWith('- <span'), `Expected line to start with '- <span', got: "${lineText?.substring(0, 40)}"`);
        log('📊', `Head insert verified: line starts with "- <span"`);

        // Cleanup: pause and delete
        const match = lineText.match(/id="([^"]+)"/);
        if (match) {
            await runner.setCursorToLine(headTestLine);
            await sleep(200);
            await runner.executeCommand('text-block-timer:toggle-timer');
            await sleep(WAIT_AFTER_COMMAND);
            await runner.executeCommand('text-block-timer:delete-timer');
            await sleep(WAIT_AFTER_COMMAND);
        }

        // Remove test line
        await runner.eval(`(() => {
            const ed = app.workspace.activeEditor.editor;
            for (let i = ed.lineCount() - 1; i >= 0; i--) {
                if (ed.getLine(i).includes('E2E_HEAD_TEST_')) {
                    const from = Math.max(0, i - 1);
                    const fromCh = i > 0 ? ed.getLine(from).length : 0;
                    ed.replaceRange('', { line: from, ch: fromCh }, { line: i, ch: ed.getLine(i).length });
                    break;
                }
            }
            return true;
        })()`);
    });

    // Restore original settings
    await runner.eval(`(() => {
        const p = app.plugins.plugins['text-block-timer'];
        p.settings.timerInsertLocation = '${orig.timerInsertLocation || 'head'}';
        return true;
    })()`);

    // Cleanup settings test line
    await runner.eval(`(() => {
        const ed = app.workspace.activeEditor.editor;
        for (let i = ed.lineCount() - 1; i >= 0; i--) {
            if (ed.getLine(i).includes('E2E_SETTINGS_TEST_')) {
                const from = Math.max(0, i - 1);
                const fromCh = i > 0 ? ed.getLine(from).length : 0;
                ed.replaceRange('', { line: from, ch: fromCh }, { line: i, ch: ed.getLine(i).length });
                break;
            }
        }
        return true;
    })()`);
    await sleep(500);
    log('🧹', 'Settings test cleaned up');
}

