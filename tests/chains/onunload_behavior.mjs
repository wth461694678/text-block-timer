import { sleep, assert, log, WAIT_AFTER_COMMAND } from '../e2e-timer-test.mjs';

// ─── Chain: onunload_behavior ────────────────────────────────────────────────
// Tests that onunload properly flushes running timer data

export async function chain_onunload_behavior(runner) {
    let unlTimerId = null;

    const unlTestLine = await runner.eval(`(() => {
        const ed = app.workspace.activeEditor.editor;
        const last = ed.lineCount() - 1;
        ed.replaceRange('\\nE2E_UNL_TEST_' + Date.now(), { line: last, ch: ed.getLine(last).length });
        const n = ed.lineCount() - 1;
        ed.setCursor({ line: n, ch: 0 });
        return n;
    })()`);
    await sleep(500);

    // Start a timer
    await runner.run('UNL-01: Start timer for onunload test', async() => {
        await runner.setCursorToLine(unlTestLine);
        await sleep(200);
        await runner.executeCommand('text-block-timer:toggle-timer');
        await sleep(WAIT_AFTER_COMMAND);

        const lineText = await runner.eval(`app.workspace.activeEditor.editor.getLine(${unlTestLine})`);
        assert(lineText.includes('class="timer-r"'), 'Expected timer-r span');
        const match = lineText.match(/id="([^"]+)"/);
        assert(match, 'Timer ID not found');
        unlTimerId = match[1];

        // Verify it's in manager
        const inManager = await runner.eval(`app.plugins.plugins['text-block-timer'].manager.hasTimer('${unlTimerId}')`);
        assert(inManager, 'Timer should be in manager');
        log('🆔', `Onunload test timer: ${unlTimerId}`);
    });

    // Let it run for a bit
    await sleep(3000);

    // Test: simulate onunload flush behavior (without actually unloading)
    await runner.run('UNL-02: flushSync persists running timer data to JSON', async() => {
        // Get current in-memory state before flush
        const memDur = await runner.eval(`(() => {
            const p = app.plugins.plugins['text-block-timer'];
            const e = p.database.getEntry('${unlTimerId}');
            return e ? e.total_dur_sec : -1;
        })()`);
        assert(memDur > 0, `Expected positive total_dur in memory, got ${memDur}`);

        // Call flushSync (the critical onunload operation)
        await runner.eval(`(() => {
            const p = app.plugins.plugins['text-block-timer'];
            p.database.flushSync();
            return true;
        })()`);
        await sleep(500);

        // Read back the JSON file and verify it matches memory
        const jsonDur = await runner.evalAsync(`
            const p = app.plugins.plugins['text-block-timer'];
            const adapter = app.vault.adapter;
            const dbPath = app.vault.configDir + '/plugins/text-block-timer/timer-db.json';
            const raw = await adapter.read(dbPath);
            const data = JSON.parse(raw);
            const entry = data.timers['${unlTimerId}'];
            return entry ? entry.total_dur_sec : -1;
        `);

        log('📊', `flushSync: memDur=${memDur}, jsonFileDur=${jsonDur}`);
        assert(jsonDur >= memDur - 1, `JSON file dur (${jsonDur}) should be >= memory dur (${memDur}) - 1`);
        assert(jsonDur > 0, `JSON file should have positive dur, got ${jsonDur}`);
    });

    // UNL-03: Verify JSON entry state is still 'running' (onunload doesn't change state)
    await runner.run('UNL-03: JSON state remains running after flushSync', async() => {
        const state = await runner.evalAsync(`
            const adapter = app.vault.adapter;
            const dbPath = app.vault.configDir + '/plugins/text-block-timer/timer-db.json';
            const raw = await adapter.read(dbPath);
            const data = JSON.parse(raw);
            return data.timers['${unlTimerId}']?.state ?? 'missing';
        `);
        assert(state === 'running', `Expected state=running in JSON file, got ${state}`);
        log('📊', `JSON file state after flushSync: ${state}`);
    });

    // Cleanup
    if (unlTimerId) {
        await runner.eval(`(() => {
            const p = app.plugins.plugins['text-block-timer'];
            p.manager.stopTimer('${unlTimerId}');
            return true;
        })()`);
        await sleep(200);
        await runner.setCursorToLine(unlTestLine);
        await sleep(200);
        await runner.executeCommand('text-block-timer:toggle-timer'); // pause
        await sleep(WAIT_AFTER_COMMAND);
        await runner.executeCommand('text-block-timer:delete-timer');
        await sleep(WAIT_AFTER_COMMAND);
    }
    await runner.eval(`(() => {
        const ed = app.workspace.activeEditor.editor;
        for (let i = ed.lineCount() - 1; i >= 0; i--) {
            if (ed.getLine(i).includes('E2E_UNL_TEST_')) {
                const from = Math.max(0, i - 1);
                const fromCh = i > 0 ? ed.getLine(from).length : 0;
                ed.replaceRange('', { line: from, ch: fromCh }, { line: i, ch: ed.getLine(i).length });
                break;
            }
        }
        return true;
    })()`);
    await sleep(500);
    log('🧹', 'Onunload test cleaned up');
}

