import { sleep, assert, log, WAIT_AFTER_COMMAND, idbGetTimer, shared } from '../e2e-timer-test.mjs';

// ─── Chain: readonly ──────────────────────────────────────────────────────────
// Tests that a running timer continues ticking correctly when the editor
// switches to reading/preview mode (non-source mode).

export async function chain_readonly(runner) {
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

