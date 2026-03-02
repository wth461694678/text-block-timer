import { sleep, assert, log, WAIT_AFTER_COMMAND, idbGetTimer, idbGetTimersByState, shared } from '../e2e-timer-test.mjs';

// ─── Chain: delete ────────────────────────────────────────────────────────────

export async function chain_delete(runner) {
    const today = shared.today;
    const testLineNum = shared.testLineNum;
    const createdTimerId = shared.createdTimerId;

    // ══════════════════════════════════════════════════════════════════════════
    // PHASE 15: DELETE timer → verify IDB + sidebar
    // ══════════════════════════════════════════════════════════════════════════

    await runner.run('DELETE timer', async() => {
        await runner.setCursorToLine(testLineNum);
        await sleep(200);
        await runner.executeCommand('text-block-timer:delete-timer');
        await sleep(WAIT_AFTER_COMMAND);

        const lineText = await runner.eval(`app.workspace.activeEditor.editor.getLine(${testLineNum})`);
        assert(!lineText.includes('class="timer-'), `Timer span should be removed`);
        assert(lineText.includes('E2E_SIDEBAR_TEST_'), 'Original text should remain');
    });

    await runner.run('IDB: timer state=deleted after DELETE', async() => {
        const raw = await runner.evalAsync(idbGetTimer(createdTimerId));
        assert(raw, 'Timer should still exist in IDB with deleted state');
        const entry = JSON.parse(raw);
        assert(entry.state === 'deleted', `Expected deleted, got ${entry.state}`);
    });

    await runner.run('Sidebar: timer card removed after DELETE', async() => {
        const hasTimer = await runner.eval(`(() => {
            const leaves = app.workspace.getLeavesOfType('timer-sidebar');
            if (!leaves.length) return false;
            const c = leaves[0].view.containerEl;
            const cards = c.querySelectorAll('.timer-card');
            for (const card of cards) {
                const fileEl = card.querySelector('.timer-card-file-source');
                if (fileEl?.textContent?.includes(':${testLineNum + 1}')) return true;
            }
            return false;
        })()`);
        assert(!hasTimer, 'Timer card should be removed from sidebar after delete');
    });

    // ══════════════════════════════════════════════════════════════════════════
    // PHASE 16: IDB getTimersByState excludes deleted timers
    // ══════════════════════════════════════════════════════════════════════════

    await runner.run('IDB: getTimersByState([running,paused]) excludes deleted timer', async() => {
        const raw = await runner.evalAsync(idbGetTimersByState(['running', 'paused']));
        const entries = JSON.parse(raw);
        const ours = entries.find(e => e.timer_id === createdTimerId);
        assert(!ours, 'Deleted timer should not appear in getTimersByState(running,paused)');
    });

    // ══════════════════════════════════════════════════════════════════════════
    // PHASE 17: Final cross-layer consistency check
    // ══════════════════════════════════════════════════════════════════════════

    await runner.run('Final: JSON and IDB both reflect deleted state', async() => {
        await sleep(500);
        const jsonState = await runner.eval(`(() => {
            const p = app.plugins.plugins['text-block-timer'];
            return p.database.data?.timers?.['${createdTimerId}']?.state ?? 'missing';
        })()`);
        const idbRaw = await runner.evalAsync(idbGetTimer(createdTimerId));
        const idbState = idbRaw ? JSON.parse(idbRaw).state : 'missing';

        log('📊', `Final: JSON state=${jsonState}, IDB state=${idbState}`);
        assert(jsonState === 'deleted', `JSON should be deleted, got ${jsonState}`);
        assert(idbState === 'deleted', `IDB should be deleted, got ${idbState}`);
    });

    await runner.run('Final: Sidebar summary counts are consistent with visible cards', async() => {
        const result = JSON.parse(await runner.eval(`(() => {
            const leaves = app.workspace.getLeavesOfType('timer-sidebar');
            if (!leaves.length) return JSON.stringify({ skip: true });
            const c = leaves[0].view.containerEl;
            return JSON.stringify({
                skip: false,
                runningCards: c.querySelectorAll('.timer-card-running').length,
                pausedCards: c.querySelectorAll('.timer-card-paused').length,
                summaryTotal: parseInt(c.querySelector('[data-summary-count]')?.textContent ?? '0'),
                summaryRunning: parseInt(c.querySelector('[data-summary-running-count]')?.textContent ?? '0'),
                summaryPaused: parseInt(c.querySelector('[data-summary-paused-count]')?.textContent ?? '0')
            });
        })()`));
        if (result.skip) {
            log('⚠️', 'Sidebar not available — skipping');
            return;
        }
        const visibleTotal = result.runningCards + result.pausedCards;
        assert(result.summaryTotal >= visibleTotal,
            `Summary total (${result.summaryTotal}) should be >= visible (${visibleTotal})`);
        assert(result.summaryRunning >= result.runningCards,
            `Summary running (${result.summaryRunning}) should be >= running cards (${result.runningCards})`);
        assert(result.summaryPaused >= result.pausedCards,
            `Summary paused (${result.summaryPaused}) should be >= paused cards (${result.pausedCards})`);
        log('📊', `Summary: ${result.summaryTotal} total (${result.summaryRunning}R + ${result.summaryPaused}P), ` +
            `Cards: ${visibleTotal} (${result.runningCards}R + ${result.pausedCards}P)`);
    });
}

