import { assert, log, shared } from '../e2e-timer-test.mjs';

// ─── Chain: preflight ────────────────────────────────────────────────────────

export async function chain_preflight(runner) {
    shared.today = new Date().toLocaleDateString('sv'); // YYYY-MM-DD

    // ══════════════════════════════════════════════════════════════════════════
    // PHASE 0: Pre-flight
    // ══════════════════════════════════════════════════════════════════════════

    await runner.run('Plugin is loaded', async() => {
        const loaded = await runner.eval(`!!app.plugins.plugins['text-block-timer']`);
        assert(loaded, 'text-block-timer plugin is not loaded');
    });

    await runner.run('Active file is open in editor', async() => {
        const has = await runner.eval(`!!app.workspace.activeEditor?.editor`);
        assert(has, 'No active editor — please open a markdown file');
    });

    await runner.run('IDB is initialized', async() => {
        const ok = await runner.eval(`!!app.plugins.plugins['text-block-timer'].idb`);
        assert(ok, 'IndexedDB instance (plugin.idb) is not available');
    });

    // Disable background tick throttle
    await runner.eval(`(() => {
        const p = app.plugins.plugins['text-block-timer'];
        p.manager._origBgThreshold = p.manager.backgroundThreshold;
        p.manager.backgroundThreshold = 600000;
        return true;
    })()`);
    log('⚙️', 'Disabled background tick throttle');

    const initial = JSON.parse(await runner.eval(`(() => {
        const p = app.plugins.plugins['text-block-timer'];
        const ed = app.workspace.activeEditor.editor;
        return JSON.stringify({
            lineCount: ed.lineCount(),
            filePath: app.workspace.getActiveFile()?.path ?? ''
        });
    })()`));
    shared.initial = initial;
    log('📋', `File: ${initial.filePath}, ${initial.lineCount} lines`);
}

