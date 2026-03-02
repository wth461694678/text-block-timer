import { sleep, log } from '../e2e-timer-test.mjs';

// ─── Chain: cleanup_basic ────────────────────────────────────────────────────
// Cleanup for the basic/adjust/seed/delete chains (removes E2E_SIDEBAR_TEST_ line)

export async function chain_cleanup_basic(runner) {
    // Restore background tick throttle
    await runner.eval(`(() => {
        const p = app.plugins.plugins['text-block-timer'];
        if (p.manager._origBgThreshold !== undefined) {
            p.manager.backgroundThreshold = p.manager._origBgThreshold;
            delete p.manager._origBgThreshold;
        }
        return true;
    })()`);
    log('⚙️', 'Restored background tick throttle');

    await runner.run('Cleanup: remove test line', async() => {
        await runner.eval(`(() => {
            const ed = app.workspace.activeEditor.editor;
            for (let i = ed.lineCount() - 1; i >= 0; i--) {
                if (ed.getLine(i).includes('E2E_SIDEBAR_TEST_')) {
                    const from = Math.max(0, i - 1);
                    const fromCh = i > 0 ? ed.getLine(from).length : 0;
                    ed.replaceRange('', { line: from, ch: fromCh }, { line: i, ch: ed.getLine(i).length });
                    break;
                }
            }
            return true;
        })()`);
        await sleep(500);
        log('🧹', 'Test line removed');
    });
}

