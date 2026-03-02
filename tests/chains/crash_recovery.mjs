import { assert, log } from '../e2e-timer-test.mjs';

// ─── Chain: crash_recovery ───────────────────────────────────────────────────
// Tests crash recovery: simulates crashed state in JSON, then triggers recovery

export async function chain_crash_recovery(runner) {
    const crTestId = 'E2ECR' + Date.now().toString(36).slice(-4);
    const crDate = new Date().toLocaleDateString('sv');

    // CR-01: Inject a fake "crashed" timer entry into JSON (state=running)
    await runner.run('CR-01: Inject fake crashed timer (state=running) into JSON', async() => {
        const now = Math.floor(Date.now() / 1000);
        // Inject a timer that was "running" 10 seconds ago (simulating crash)
        const crashTs = now - 10;
        await runner.evalAsync(`
            const p = app.plugins.plugins['text-block-timer'];
            await p.database.updateEntry('${crTestId}', {
                timer_id: '${crTestId}',
                file_path: 'fake/crash-test.md',
                line_num: 0,
                line_text: 'crash test',
                project: null,
                state: 'running',
                total_dur_sec: 100,
                last_ts: ${crashTs},
                created_at: ${crashTs - 100},
                updated_at: ${crashTs}
            });
            await p.database.flush();
            return true;
        `);

        const entry = await runner.eval(`(() => {
            const p = app.plugins.plugins['text-block-timer'];
            const e = p.database.getEntry('${crTestId}');
            return e ? JSON.stringify(e) : null;
        })()`);
        assert(entry, 'Crashed timer should exist in JSON');
        const parsed = JSON.parse(entry);
        assert(parsed.state === 'running', `Expected state=running, got ${parsed.state}`);
        log('📊', `Injected crashed timer: id=${crTestId}, state=${parsed.state}, last_ts=${parsed.last_ts}`);
    });

    // CR-02: Call recoverCrashedTimers and verify state changes to paused
    await runner.run('CR-02: recoverCrashedTimers changes state to paused', async() => {
        const recoveries = await runner.evalAsync(`
            const p = app.plugins.plugins['text-block-timer'];
            const result = p.database.recoverCrashedTimers();
            await p.database.flush();
            return JSON.stringify(result);
        `);
        const parsed = JSON.parse(recoveries);
        const ours = parsed.find(r => r.timerId === crTestId);
        assert(ours, 'Our timer should be in recovered list');
        assert(ours.deltaSec >= 9 && ours.deltaSec <= 30,
            `Expected crash delta ~10s, got ${ours.deltaSec}s`);
        log('📊', `Crash recovery: deltaSec=${ours.deltaSec}, date=${ours.date}`);

        // Verify state is now paused
        const entry = await runner.eval(`(() => {
            const p = app.plugins.plugins['text-block-timer'];
            const e = p.database.getEntry('${crTestId}');
            return e ? JSON.stringify(e) : null;
        })()`);
        const entryParsed = JSON.parse(entry);
        assert(entryParsed.state === 'paused', `Expected state=paused after recovery, got ${entryParsed.state}`);
    });

    // CR-03: daily_dur has crash duration recorded
    await runner.run('CR-03: daily_dur has crash duration recorded', async() => {
        const dailyDur = await runner.eval(`(() => {
            const p = app.plugins.plugins['text-block-timer'];
            const dd = p.database.getDailyDur();
            return dd?.['${crDate}']?.['${crTestId}'] ?? 0;
        })()`);
        assert(dailyDur >= 9, `Expected daily_dur >= 9s for crash recovery, got ${dailyDur}s`);
        log('📊', `Crash recovery daily_dur: ${dailyDur}s`);
    });

    // Cleanup: remove fake timer
    await runner.evalAsync(`
        const p = app.plugins.plugins['text-block-timer'];
        await p.database.updateEntry('${crTestId}', { state: 'deleted' });
        await p.database.flush();
        return true;
    `);
    log('🧹', 'Crash recovery test cleaned up');
}

