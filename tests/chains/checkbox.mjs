import { sleep, assert, log, WAIT_AFTER_COMMAND } from '../e2e-timer-test.mjs';

// ─── Chain: checkbox ─────────────────────────────────────────────────────────
// Tests Checkbox toggle → timer start/pause/continue automation

export async function chain_checkbox(runner) {
    let cbTimerId = null;

    // Create a fresh test line with a checkbox
    const cbTestLine = await runner.eval(`(() => {
        const ed = app.workspace.activeEditor.editor;
        const last = ed.lineCount() - 1;
        ed.replaceRange('\\n- [ ] E2E_CB_TEST_' + Date.now(), { line: last, ch: ed.getLine(last).length });
        const n = ed.lineCount() - 1;
        ed.setCursor({ line: n, ch: 0 });
        return n;
    })()`);
    log('📝', `Checkbox test line at L${cbTestLine}`);
    await sleep(500);

    // Ensure checkbox-to-timer is enabled with default symbols
    await runner.eval(`(() => {
        const p = app.plugins.plugins['text-block-timer'];
        p.settings.enableCheckboxToTimer = true;
        p.settings.runningCheckboxState = '/';
        p.settings.pausedCheckboxState = '-xX';
        p.settings.checkboxPathGroups = [];
        return true;
    })()`);

    // CB-01: Checkbox [ ] → [/] should auto-start a timer
    await runner.run('CB-01: Checkbox [ ]→[/] auto-starts timer', async() => {
        // Simulate changing checkbox from [ ] to [/]
        await runner.eval(`(() => {
            const ed = app.workspace.activeEditor.editor;
            const line = ed.getLine(${cbTestLine});
            const newLine = line.replace('- [ ] ', '- [/] ');
            ed.replaceRange(newLine, { line: ${cbTestLine}, ch: 0 }, { line: ${cbTestLine}, ch: line.length });
            return true;
        })()`);
        await sleep(WAIT_AFTER_COMMAND);

        const lineText = await runner.eval(`app.workspace.activeEditor.editor.getLine(${cbTestLine})`);
        assert(lineText.includes('class="timer-r"'), `Expected timer-r span after [/], got: "${lineText?.substring(0, 100)}"`);

        const match = lineText.match(/id="([^"]+)"/);
        assert(match, 'Timer ID not found');
        cbTimerId = match[1];
        log('🆔', `Checkbox timer ID: ${cbTimerId}`);
    });

    // CB-02: Checkbox [/] → [x] should auto-pause the timer
    await runner.run('CB-02: Checkbox [/]→[x] auto-pauses timer', async() => {
        await runner.eval(`(() => {
            const ed = app.workspace.activeEditor.editor;
            const line = ed.getLine(${cbTestLine});
            const newLine = line.replace('- [/] ', '- [x] ');
            ed.replaceRange(newLine, { line: ${cbTestLine}, ch: 0 }, { line: ${cbTestLine}, ch: line.length });
            return true;
        })()`);
        await sleep(WAIT_AFTER_COMMAND);

        const lineText = await runner.eval(`app.workspace.activeEditor.editor.getLine(${cbTestLine})`);
        assert(lineText.includes('class="timer-p"'), `Expected timer-p span after [x], got: "${lineText?.substring(0, 100)}"`);
        log('✅', 'Timer paused by checkbox [x]');
    });

    // CB-03: Checkbox [x] → [/] should resume the timer
    await runner.run('CB-03: Checkbox [x]→[/] resumes timer', async() => {
        await runner.eval(`(() => {
            const ed = app.workspace.activeEditor.editor;
            const line = ed.getLine(${cbTestLine});
            const newLine = line.replace('- [x] ', '- [/] ');
            ed.replaceRange(newLine, { line: ${cbTestLine}, ch: 0 }, { line: ${cbTestLine}, ch: line.length });
            return true;
        })()`);
        await sleep(WAIT_AFTER_COMMAND);

        const lineText = await runner.eval(`app.workspace.activeEditor.editor.getLine(${cbTestLine})`);
        assert(lineText.includes('class="timer-r"'), `Expected timer-r span after resume [/], got: "${lineText?.substring(0, 100)}"`);
        log('✅', 'Timer resumed by checkbox [/]');
    });

    // Pause for next test
    await runner.eval(`(() => {
        const ed = app.workspace.activeEditor.editor;
        const line = ed.getLine(${cbTestLine});
        const newLine = line.replace('- [/] ', '- [x] ');
        ed.replaceRange(newLine, { line: ${cbTestLine}, ch: 0 }, { line: ${cbTestLine}, ch: line.length });
        return true;
    })()`);
    await sleep(WAIT_AFTER_COMMAND);

    // CB-04: Checkbox [ ] → [x] should NOT create a timer (paused symbol, no existing timer on new line)
    await runner.run('CB-04: Checkbox [ ]→[x] on new line does not create timer', async() => {
        const newLine2 = await runner.eval(`(() => {
            const ed = app.workspace.activeEditor.editor;
            const last = ed.lineCount() - 1;
            ed.replaceRange('\\n- [ ] E2E_CB_NOOP_' + Date.now(), { line: last, ch: ed.getLine(last).length });
            return ed.lineCount() - 1;
        })()`);
        await sleep(300);

        // Change [ ] directly to [x]
        await runner.eval(`(() => {
            const ed = app.workspace.activeEditor.editor;
            const line = ed.getLine(${newLine2});
            const newLine = line.replace('- [ ] ', '- [x] ');
            ed.replaceRange(newLine, { line: ${newLine2}, ch: 0 }, { line: ${newLine2}, ch: line.length });
            return true;
        })()`);
        await sleep(WAIT_AFTER_COMMAND);

        const lineText = await runner.eval(`app.workspace.activeEditor.editor.getLine(${newLine2})`);
        assert(!lineText.includes('class="timer-r"') && !lineText.includes('class="timer-p"'),
            `Expected no timer span on direct [x], got: "${lineText?.substring(0, 100)}"`);
        log('✅', 'No timer created for direct [ ]→[x]');

        // Cleanup noop line
        await runner.eval(`(() => {
            const ed = app.workspace.activeEditor.editor;
            for (let i = ed.lineCount() - 1; i >= 0; i--) {
                if (ed.getLine(i).includes('E2E_CB_NOOP_')) {
                    const from = Math.max(0, i - 1);
                    const fromCh = i > 0 ? ed.getLine(from).length : 0;
                    ed.replaceRange('', { line: from, ch: fromCh }, { line: i, ch: ed.getLine(i).length });
                    break;
                }
            }
            return true;
        })()`);
    });

    // CB-05: enableCheckboxToTimer=false disables all checkbox automation
    await runner.run('CB-05: enableCheckboxToTimer=false disables automation', async() => {
        // Disable
        await runner.eval(`(() => {
            const p = app.plugins.plugins['text-block-timer'];
            p.settings.enableCheckboxToTimer = false;
            return true;
        })()`);

        const newLine3 = await runner.eval(`(() => {
            const ed = app.workspace.activeEditor.editor;
            const last = ed.lineCount() - 1;
            ed.replaceRange('\\n- [ ] E2E_CB_DISABLED_' + Date.now(), { line: last, ch: ed.getLine(last).length });
            return ed.lineCount() - 1;
        })()`);
        await sleep(300);

        // Change [ ] → [/] with checkbox disabled
        await runner.eval(`(() => {
            const ed = app.workspace.activeEditor.editor;
            const line = ed.getLine(${newLine3});
            const newLine = line.replace('- [ ] ', '- [/] ');
            ed.replaceRange(newLine, { line: ${newLine3}, ch: 0 }, { line: ${newLine3}, ch: line.length });
            return true;
        })()`);
        await sleep(WAIT_AFTER_COMMAND);

        const lineText = await runner.eval(`app.workspace.activeEditor.editor.getLine(${newLine3})`);
        assert(!lineText.includes('class="timer-r"') && !lineText.includes('class="timer-p"'),
            `Expected no timer when disabled, got: "${lineText?.substring(0, 100)}"`);
        log('✅', 'No timer created when enableCheckboxToTimer=false');

        // Re-enable and cleanup
        await runner.eval(`(() => {
            const p = app.plugins.plugins['text-block-timer'];
            p.settings.enableCheckboxToTimer = true;
            const ed = app.workspace.activeEditor.editor;
            for (let i = ed.lineCount() - 1; i >= 0; i--) {
                if (ed.getLine(i).includes('E2E_CB_DISABLED_')) {
                    const from = Math.max(0, i - 1);
                    const fromCh = i > 0 ? ed.getLine(from).length : 0;
                    ed.replaceRange('', { line: from, ch: fromCh }, { line: i, ch: ed.getLine(i).length });
                    break;
                }
            }
            return true;
        })()`);
    });

    // Cleanup: delete checkbox timer and remove test line
    if (cbTimerId) {
        await runner.eval(`(async () => {
            const p = app.plugins.plugins['text-block-timer'];
            await p.database.updateEntry('${cbTimerId}', { state: 'deleted' });
            await p.idb.patchTimer('${cbTimerId}', { state: 'deleted' });
            return true;
        })()`);
    }
    await runner.eval(`(() => {
        const ed = app.workspace.activeEditor.editor;
        for (let i = ed.lineCount() - 1; i >= 0; i--) {
            if (ed.getLine(i).includes('E2E_CB_TEST_')) {
                const from = Math.max(0, i - 1);
                const fromCh = i > 0 ? ed.getLine(from).length : 0;
                ed.replaceRange('', { line: from, ch: fromCh }, { line: i, ch: ed.getLine(i).length });
                break;
            }
        }
        return true;
    })()`);
    await sleep(500);
    log('🧹', 'Checkbox test line cleaned up');
}

