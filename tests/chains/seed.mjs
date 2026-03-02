import { sleep, assert, log, idbGetTimer, idbGetAllTimers, shared } from '../e2e-timer-test.mjs';

// ─── Chain: seed ──────────────────────────────────────────────────────────────

export async function chain_seed(runner) {
    const createdTimerId = shared.createdTimerId;

    // ══════════════════════════════════════════════════════════════════════════
    // PHASE 14: seedIndexedDB + clearAll — reload plugin and verify clean seed
    // ══════════════════════════════════════════════════════════════════════════

    await runner.run('seedIndexedDB: clearAll removes stale data on reload', async() => {
        // Count IDB entries before reload
        const beforeAllRaw = await runner.evalAsync(idbGetAllTimers());
        const beforeAll = JSON.parse(beforeAllRaw);
        const beforeCount = beforeAll.length;

        // Inject a "stale" timer directly into IDB to simulate leftover data
        await runner.evalAsync(`
            const idb = app.plugins.plugins['text-block-timer'].idb;
            await idb.putTimer({
                timer_id: 'STALE_TEST_TIMER_XYZ',
                file_path: 'nonexistent.md',
                line_num: 0,
                line_text: 'stale',
                project: null,
                state: 'paused',
                total_dur_sec: 999,
                last_ts: 0,
                created_at: 0,
                updated_at: 0
            });
        `);

        // Verify stale entry exists
        const staleRaw = await runner.evalAsync(idbGetTimer('STALE_TEST_TIMER_XYZ'));
        assert(staleRaw, 'Stale timer should exist in IDB before reload');

        // Trigger seedIndexedDB (simulates plugin reload)
        await runner.evalAsync(`
            const p = app.plugins.plugins['text-block-timer'];
            // Call the private seedIndexedDB through the plugin instance
            if (typeof p.seedIndexedDB === 'function') {
                await p.seedIndexedDB();
            } else {
                // Access through prototype or direct property
                const proto = Object.getPrototypeOf(p);
                const method = proto.seedIndexedDB?.bind(p);
                if (method) await method();
            }
        `);
        await sleep(1000);

        // Verify stale entry is gone
        const afterStaleRaw = await runner.evalAsync(idbGetTimer('STALE_TEST_TIMER_XYZ'));
        assert(!afterStaleRaw, 'Stale timer should be cleared by seedIndexedDB (clearAll called)');

        // Our real timer should still be present (re-seeded from JSON)
        const ourRaw = await runner.evalAsync(idbGetTimer(createdTimerId));
        assert(ourRaw, 'Our timer should be re-seeded from JSON');
        const ours = JSON.parse(ourRaw);
        assert(ours.state === 'paused', `Expected paused after reseed, got ${ours.state}`);
        log('📊', `After reseed: stale removed ✓, our timer preserved ✓ (state=${ours.state})`);
    });
}

