import { sleep, assert, log, WAIT_AFTER_COMMAND, shared } from '../e2e-timer-test.mjs';

// ─── Chain: sidebar_tabs ──────────────────────────────────────────────────────
// Tests sidebar scope switching, filter/sort controls, summary correctness,
// and statistics chart data loading for all scopes.

export async function chain_sidebar_tabs(runner) {
    const today = shared.today;
    const createdTimerId = shared.createdTimerId;
    const testLineNum = shared.testLineNum;

    // Make sure our timer is running for these tests
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
        log('⚙️', 'Resumed timer for sidebar_tabs tests');
    }
    await sleep(2000); // let ticks accumulate

    // ── Scope: active-file ──────────────────────────────────────────────────

    await runner.run('Sidebar scope: active-file shows timer from current file', async() => {
        // Switch to active-file scope
        await runner.evalAsync(`
            const leaves = app.workspace.getLeavesOfType('timer-sidebar');
            if (leaves.length) {
                const view = leaves[0].view;
                view.currentScope = 'active-file';
                await view.loadData();
                view.render();
            }
        `);
        await sleep(500);

        const result = JSON.parse(await runner.eval(`(() => {
            const leaves = app.workspace.getLeavesOfType('timer-sidebar');
            if (!leaves.length) return JSON.stringify({ skip: true });
            const view = leaves[0].view;
            const list = view.timerList;
            const hasOurs = list.some(t => t.timerId === '${createdTimerId}');
            return JSON.stringify({
                skip: false,
                scope: view.currentScope,
                timerCount: list.length,
                hasOurs: hasOurs
            });
        })()`));

        if (!result.skip) {
            log('📊', `active-file scope: ${result.timerCount} timers, hasOurs=${result.hasOurs}`);
            assert(result.scope === 'active-file', `Expected scope active-file, got ${result.scope}`);
            assert(result.hasOurs, 'Our timer should be visible in active-file scope');
        }
    });

    // ── Scope: open-tabs ────────────────────────────────────────────────────

    await runner.run('Sidebar scope: open-tabs shows timer from open tabs', async() => {
        await runner.evalAsync(`
            const leaves = app.workspace.getLeavesOfType('timer-sidebar');
            if (leaves.length) {
                const view = leaves[0].view;
                view.currentScope = 'open-tabs';
                await view.loadData();
                view.render();
            }
        `);
        await sleep(500);

        const result = JSON.parse(await runner.eval(`(() => {
            const leaves = app.workspace.getLeavesOfType('timer-sidebar');
            if (!leaves.length) return JSON.stringify({ skip: true });
            const view = leaves[0].view;
            const list = view.timerList;
            const hasOurs = list.some(t => t.timerId === '${createdTimerId}');
            return JSON.stringify({
                skip: false,
                scope: view.currentScope,
                timerCount: list.length,
                hasOurs: hasOurs
            });
        })()`));

        if (!result.skip) {
            log('📊', `open-tabs scope: ${result.timerCount} timers, hasOurs=${result.hasOurs}`);
            assert(result.scope === 'open-tabs', `Expected scope open-tabs, got ${result.scope}`);
            assert(result.hasOurs, 'Our timer should be visible in open-tabs scope');
        }
    });

    // ── Scope: all ──────────────────────────────────────────────────────────

    await runner.run('Sidebar scope: all shows timer from IDB', async() => {
        await runner.evalAsync(`
            const leaves = app.workspace.getLeavesOfType('timer-sidebar');
            if (leaves.length) {
                const view = leaves[0].view;
                view.currentScope = 'all';
                await view.loadData();
                view.render();
            }
        `);
        await sleep(500);

        const result = JSON.parse(await runner.eval(`(() => {
            const leaves = app.workspace.getLeavesOfType('timer-sidebar');
            if (!leaves.length) return JSON.stringify({ skip: true });
            const view = leaves[0].view;
            const list = view.timerList;
            const hasOurs = list.some(t => t.timerId === '${createdTimerId}');
            return JSON.stringify({
                skip: false,
                scope: view.currentScope,
                timerCount: list.length,
                hasOurs: hasOurs
            });
        })()`));

        if (!result.skip) {
            log('📊', `all scope: ${result.timerCount} timers, hasOurs=${result.hasOurs}`);
            assert(result.scope === 'all', `Expected scope all, got ${result.scope}`);
            assert(result.hasOurs, 'Our timer should be visible in all scope');
            assert(result.timerCount >= 1, `Expected >= 1 timers in all scope, got ${result.timerCount}`);
        }
    });

    // ── Filter: running vs paused ───────────────────────────────────────────

    await runner.run('Sidebar filter: running filter shows only running timers', async() => {
        // Switch back to open-tabs and apply running filter
        await runner.evalAsync(`
            const leaves = app.workspace.getLeavesOfType('timer-sidebar');
            if (leaves.length) {
                const view = leaves[0].view;
                view.currentScope = 'open-tabs';
                view.currentFilter = 'running';
                await view.loadData();
                view.render();
            }
        `);
        await sleep(500);

        const result = JSON.parse(await runner.eval(`(() => {
            const leaves = app.workspace.getLeavesOfType('timer-sidebar');
            if (!leaves.length) return JSON.stringify({ skip: true });
            const c = leaves[0].view.containerEl;
            const runCards = c.querySelectorAll('.timer-card-running').length;
            const pausedCards = c.querySelectorAll('.timer-card-paused').length;
            return JSON.stringify({
                skip: false,
                runCards: runCards,
                pausedCards: pausedCards
            });
        })()`));

        if (!result.skip) {
            log('📊', `Running filter: ${result.runCards} running cards, ${result.pausedCards} paused cards`);
            assert(result.pausedCards === 0,
                `Running filter should hide paused cards, got ${result.pausedCards}`);
            assert(result.runCards >= 1,
                `Running filter should show >= 1 running cards, got ${result.runCards}`);
        }
    });

    // ── Filter: reset to all ────────────────────────────────────────────────

    await runner.run('Sidebar filter: "all" filter shows both running and paused', async() => {
        await runner.evalAsync(`
            const leaves = app.workspace.getLeavesOfType('timer-sidebar');
            if (leaves.length) {
                const view = leaves[0].view;
                view.currentFilter = 'all';
                view.render();
            }
        `);
        await sleep(500);

        const result = JSON.parse(await runner.eval(`(() => {
            const leaves = app.workspace.getLeavesOfType('timer-sidebar');
            if (!leaves.length) return JSON.stringify({ skip: true });
            const c = leaves[0].view.containerEl;
            const totalCards = c.querySelectorAll('.timer-card').length;
            return JSON.stringify({ skip: false, totalCards });
        })()`));

        if (!result.skip) {
            log('📊', `All filter: ${result.totalCards} total cards`);
            assert(result.totalCards >= 1, `Expected >= 1 cards, got ${result.totalCards}`);
        }
    });

    // ── Sort: dur-desc vs dur-asc ───────────────────────────────────────────

    await runner.run('Sidebar sort: dur-desc orders longest first', async() => {
        // Use loadData + render to ensure timerList is re-sorted
        await runner.evalAsync(`
            const leaves = app.workspace.getLeavesOfType('timer-sidebar');
            if (leaves.length) {
                const view = leaves[0].view;
                view.currentSort = 'dur-desc';
                await view.loadData();
                view.render();
            }
        `);
        await sleep(500);

        // Read durations from rendered DOM cards (which reflect the actual display order)
        const durs = JSON.parse(await runner.eval(`(() => {
            const leaves = app.workspace.getLeavesOfType('timer-sidebar');
            if (!leaves.length) return '[]';
            const c = leaves[0].view.containerEl;
            const cards = c.querySelectorAll('.timer-card');
            const result = [];
            for (const card of cards) {
                const durEl = card.querySelector('.timer-card-duration');
                if (durEl) {
                    // Parse HH:MM:SS or MM:SS format to seconds
                    const text = durEl.textContent.trim();
                    const parts = text.split(':').map(Number);
                    let secs = 0;
                    if (parts.length === 3) secs = parts[0]*3600 + parts[1]*60 + parts[2];
                    else if (parts.length === 2) secs = parts[0]*60 + parts[1];
                    else secs = parts[0];
                    result.push(secs);
                }
            }
            return JSON.stringify(result);
        })()`));

        log('📊', `dur-desc order: [${durs.join(', ')}]`);
        if (durs.length >= 2) {
            for (let i = 1; i < durs.length; i++) {
                assert(durs[i - 1] >= durs[i],
                    `dur-desc: ${durs[i - 1]} should be >= ${durs[i]} at position ${i}`);
            }
        }
    });

    // ── Summary row data-attributes ─────────────────────────────────────────

    await runner.run('Sidebar summary: data-attributes are consistent with timerList', async() => {
        // Reset sort/scope to default
        await runner.evalAsync(`
            const leaves = app.workspace.getLeavesOfType('timer-sidebar');
            if (leaves.length) {
                const view = leaves[0].view;
                view.currentScope = 'open-tabs';
                view.currentSort = 'status';
                view.currentFilter = 'all';
                await view.loadData();
                view.render();
            }
        `);
        await sleep(500);

        const result = JSON.parse(await runner.eval(`(() => {
            const leaves = app.workspace.getLeavesOfType('timer-sidebar');
            if (!leaves.length) return JSON.stringify({ skip: true });
            const view = leaves[0].view;
            const c = view.containerEl;
            const list = view.timerList;
            const running = list.filter(t => t.state === 'timer-r').length;
            const paused = list.filter(t => t.state === 'timer-p').length;
            const total = list.length;

            const summaryTotal = parseInt(c.querySelector('[data-summary-count]')?.textContent ?? '-1');
            const summaryRunning = parseInt(c.querySelector('[data-summary-running-count]')?.textContent ?? '-1');
            const summaryPaused = parseInt(c.querySelector('[data-summary-paused-count]')?.textContent ?? '-1');

            return JSON.stringify({
                skip: false,
                listTotal: total, listRunning: running, listPaused: paused,
                summaryTotal, summaryRunning, summaryPaused
            });
        })()`));

        if (!result.skip) {
            log('📊', `Summary: list(${result.listTotal}R=${result.listRunning},P=${result.listPaused}) ` +
                `vs DOM(${result.summaryTotal}R=${result.summaryRunning},P=${result.summaryPaused})`);
            assert(result.summaryTotal === result.listTotal,
                `Summary count ${result.summaryTotal} should match timerList ${result.listTotal}`);
            assert(result.summaryRunning === result.listRunning,
                `Summary running ${result.summaryRunning} should match timerList ${result.listRunning}`);
            assert(result.summaryPaused === result.listPaused,
                `Summary paused ${result.summaryPaused} should match timerList ${result.listPaused}`);
        }
    });

    // ── Statistics chart: data loaded from IDB ──────────────────────────────

    await runner.run('Sidebar chart: chartDataCache has today with positive duration', async() => {
        const result = JSON.parse(await runner.eval(`(() => {
            const leaves = app.workspace.getLeavesOfType('timer-sidebar');
            if (!leaves.length) return JSON.stringify({ skip: true });
            const view = leaves[0].view;
            if (!view.chartDataCache) return JSON.stringify({ skip: true, reason: 'no cache' });
            const cache = view.chartDataCache;
            const todayDur = {};
            for (const proj of cache.projects) {
                todayDur[proj] = (cache.matrix[proj] ?? {})['${today}'] ?? 0;
            }
            return JSON.stringify({
                skip: false,
                dates: cache.dates,
                projects: cache.projects,
                todayDur: todayDur,
                hasToday: cache.dates.includes('${today}')
            });
        })()`));

        if (!result.skip) {
            log('📊', `Chart: dates=${JSON.stringify(result.dates)}, projects=${JSON.stringify(result.projects)}`);
            log('📊', `Chart today dur: ${JSON.stringify(result.todayDur)}`);
            assert(result.hasToday, `Chart dates should include today (${today})`);
            // At least one project should have positive duration today
            const anyPositive = Object.values(result.todayDur).some(v => v > 0);
            assert(anyPositive, 'At least one project should have > 0 duration for today in chart');
        } else {
            log('⚠️', `Chart data not available (${result.reason ?? ''}) — skipping`);
        }
    });

    // ── Statistics toggle ───────────────────────────────────────────────────

    await runner.run('Sidebar chart: statistics toggle hides/shows chart', async() => {
        // Toggle off
        await runner.evalAsync(`
            const leaves = app.workspace.getLeavesOfType('timer-sidebar');
            if (leaves.length) {
                const view = leaves[0].view;
                view.showStatistics = false;
                view.render();
            }
        `);
        await sleep(300);

        const hiddenChart = await runner.eval(`(() => {
            const leaves = app.workspace.getLeavesOfType('timer-sidebar');
            if (!leaves.length) return null;
            const view = leaves[0].view;
            return view.chartInstance === null;
        })()`);
        assert(hiddenChart === true, 'Chart instance should be null when statistics hidden');

        // Toggle on
        await runner.evalAsync(`
            const leaves = app.workspace.getLeavesOfType('timer-sidebar');
            if (leaves.length) {
                const view = leaves[0].view;
                view.showStatistics = true;
                view.render();
            }
        `);
        await sleep(500);

        const visibleChart = await runner.eval(`(() => {
            const leaves = app.workspace.getLeavesOfType('timer-sidebar');
            if (!leaves.length) return null;
            const view = leaves[0].view;
            return view.chartInstance !== null;
        })()`);
        assert(visibleChart === true, 'Chart instance should exist when statistics shown');
    });

    // ── Timer card click → jump to file ─────────────────────────────────────

    await runner.run('Sidebar card: file-source element shows correct file:line', async() => {
        const result = JSON.parse(await runner.eval(`(() => {
            const leaves = app.workspace.getLeavesOfType('timer-sidebar');
            if (!leaves.length) return JSON.stringify({ skip: true });
            const c = leaves[0].view.containerEl;
            const cards = c.querySelectorAll('.timer-card');
            for (const card of cards) {
                const fileEl = card.querySelector('.timer-card-file-source');
                if (fileEl?.textContent?.includes(':${testLineNum + 1}')) {
                    return JSON.stringify({
                        skip: false,
                        text: fileEl.textContent,
                        hasLine: true
                    });
                }
            }
            return JSON.stringify({ skip: false, hasLine: false, text: '' });
        })()`));

        if (!result.skip) {
            log('📊', `File source: "${result.text}"`);
            assert(result.hasLine,
                `Card file-source should contain line number :${testLineNum + 1}`);
        }
    });
}

