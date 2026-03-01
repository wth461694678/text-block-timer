import { ItemView, MarkdownView, Notice, TFile, WorkspaceLeaf } from 'obsidian';
import { TimerScanner, ScannedTimer } from '../core/TimerScanner';
import { TimerSummary } from '../core/TimerSummary';
import { TimerFileGroupFilter, TimerFileGroup } from '../core/TimerFileGroupFilter';
import { TimerEntry, TimerSort } from '../core/TimerDatabase';
import { TimeFormatter } from '../io/TimeFormatter';
import { TimerParser } from '../io/TimerParser';
import { TimerDataUpdater } from '../core/TimerDataUpdater';
import { getTranslation } from '../i18n/translations';

import * as echarts from 'echarts';

export const TIMER_SIDEBAR_VIEW_TYPE = 'timer-sidebar';

type ScopeType = 'active-file' | 'open-tabs' | 'all';
type FilterType = 'all' | 'running' | 'paused';

export class TimerSidebarView extends ItemView {
    private plugin: any; // TimerPlugin — use any to avoid circular import
    private currentScope: ScopeType = 'open-tabs';
    private currentFilter: FilterType = 'all';
    private currentSort: TimerSort = 'status';
    private timerList: ScannedTimer[] = [];
    private scanAbortController: AbortController | null = null;
    private resizeObserver: ResizeObserver | null = null;
    private selectedGroup: TimerFileGroup | null = null;
    private isLoading = false; // Guard against concurrent loadData + onLayoutChange

    // DOM containers
    private toolbarEl!: HTMLElement;
    private summaryEl!: HTMLElement;
    private statisticsEl!: HTMLElement;
    private listEl!: HTMLElement;

    constructor(leaf: WorkspaceLeaf, plugin: any) {
        super(leaf);
        this.plugin = plugin;
    }

    getViewType(): string { return TIMER_SIDEBAR_VIEW_TYPE; }
    getDisplayText(): string { return 'Timer Sidebar'; }
    getIcon(): string { return 'timer'; }

    async onOpen(): Promise<void> {
        const container = this.containerEl.children[1] as HTMLElement;
        container.empty();
        container.addClass('timer-sidebar-container');

        this.toolbarEl = container.createDiv({ cls: 'timer-sidebar-toolbar' });
        this.summaryEl = container.createDiv({ cls: 'timer-sidebar-summary' });
        this.statisticsEl = container.createDiv({ cls: 'timer-statistics-container' });
        this.listEl = container.createDiv({ cls: 'timer-sidebar-list' });

        // Apply default settings
        const settings = this.plugin.settings;
        if (settings.sidebarDefaultScope) this.currentScope = settings.sidebarDefaultScope;
        if (settings.sidebarDefaultFilter) this.currentFilter = settings.sidebarDefaultFilter;
        if (settings.sidebarDefaultSort) this.currentSort = settings.sidebarDefaultSort;
        // Pre-select default group filter (only meaningful in 'all' scope)
        if (settings.sidebarDefaultGroup) {
            const groups: TimerFileGroup[] = settings.timerFileGroups ?? [];
            this.selectedGroup = groups.find(g => g.id === settings.sidebarDefaultGroup) ?? null;
        }

        // ResizeObserver for responsive layout
        this.resizeObserver = new ResizeObserver(entries => {
            const width = entries[0].contentRect.width;
            container.toggleClass('timer-sidebar-compact', width < 200);
        });
        this.resizeObserver.observe(container);
        this.register(() => this.resizeObserver?.disconnect());

        this.renderToolbar();
        this.isLoading = true;
        try {
            await this.loadData();
        } finally {
            this.isLoading = false;
        }
        this.render();
    }

    async onClose(): Promise<void> {
        this.scanAbortController?.abort();
    }

    // ===== Data Loading =====

    async loadData(): Promise<void> {
        switch (this.currentScope) {
            case 'active-file':
                await this.loadActiveFileData();
                break;
            case 'open-tabs':
                await this.loadOpenTabsData();
                break;
            case 'all':
                await this.loadAllData();
                break;
        }
    }

    async loadActiveFileData(): Promise<void> {
        const file = this.plugin.app.workspace.getActiveFile() as TFile | null;
        if (!file || file.extension !== 'md') {
            this.timerList = [];
            return;
        }
        this.timerList = await this.plugin.scanner.scanFile(file);
    }

    async loadOpenTabsData(): Promise<void> {
        const leaves = this.plugin.app.workspace.getLeavesOfType('markdown') as WorkspaceLeaf[];
        const files: TFile[] = [];
        const seen = new Set<string>();
        for (const leaf of leaves) {
            const view = leaf.view as MarkdownView;
            if (view.file && !seen.has(view.file.path)) {
                seen.add(view.file.path);
                files.push(view.file);
            }
        }
        this.timerList = await this.plugin.scanner.scanFiles(files);
    }

    async loadAllData(): Promise<void> {
        const db = this.plugin.database;
        const idb = this.plugin.idb;
        const lastScan = db.getLastFullScan();
        const now = Date.now();
        const oneDayMs = 24 * 60 * 60 * 1000;

        // Use IndexedDB as real-time data source (prefer over JSON in-memory)
        if (db.exists() && lastScan && (now - new Date(lastScan).getTime()) < oneDayMs) {
            if (idb) {
                const idbEntries = await idb.getTimersByState(['running', 'paused']);
                this.timerList = idbEntries.map(e => ({
                    timerId: e.timer_id,
                    filePath: e.file_path,
                    lineNum: e.line_num,
                    lineText: e.line_text,
                    state: e.state === 'running' ? 'timer-r' : 'timer-p',
                    dur: e.total_dur_sec,
                    ts: e.last_ts,
                    project: e.project
                } as ScannedTimer));
            } else {
                // Fallback to JSON if IDB not available
                const entries = db.queryTimers({ state: ['running', 'paused'] }, this.currentSort);
                this.timerList = this.entriesToScannedTimers(entries);
            }
            return;
        }

        // Need to scan
        this.scanAbortController?.abort();
        this.scanAbortController = new AbortController();
        const signal = this.scanAbortController.signal;

        // Show progress UI after 3 seconds
        const progressRef = { el: null as HTMLElement | null };
        const progressTimer = setTimeout(() => {
            progressRef.el = this.showScanProgress();
        }, 3000);

        const prevList = [...this.timerList];

        const onProgress = (scanned: number, total: number) => {
            const progressEl = progressRef.el;
            if (progressEl) {
                const text = progressEl.querySelector('.timer-scan-progress-text');
                if (text) text.textContent = `Scanned ${scanned} / ${total} files`;
                const bar = progressEl.querySelector('.timer-scan-progress-bar-fill') as HTMLElement;
                if (bar) bar.style.width = `${Math.round((scanned / total) * 100)}%`;
            }
        };

        const results = await this.plugin.scanner.scanVault(onProgress, signal);

        clearTimeout(progressTimer);
        if (progressRef.el) progressRef.el.remove();

        if (results === null) {
            // Cancelled — restore previous list
            this.timerList = prevList;
        } else {
            // Rebuild database and update list
            const entries = results.map((t: ScannedTimer) => this.scannedTimerToEntry(t));
            await db.rebuild(entries);
            // Re-seed IndexedDB timers store after vault rebuild
            if (this.plugin.idb) {
                const idbEntries = entries.map((e: import('../core/TimerDatabase').TimerEntry) => ({
                    timer_id: e.timer_id,
                    file_path: e.file_path,
                    line_num: e.line_num,
                    line_text: e.line_text,
                    project: e.project,
                    state: e.state,
                    total_dur_sec: e.total_dur_sec,
                    last_ts: e.last_ts,
                    created_at: e.created_at,
                    updated_at: e.updated_at
                }));
                await this.plugin.idb.bulkPutTimers(idbEntries);
            }
            this.timerList = results;
        }
    }

    private showScanProgress(): HTMLElement {
        this.listEl.empty();
        const el = this.listEl.createDiv({ cls: 'timer-scan-progress' });
        el.createDiv({ cls: 'timer-scan-progress-text', text: 'Scanning vault...' });
        const barWrap = el.createDiv({ cls: 'timer-scan-progress-bar' });
        barWrap.createDiv({ cls: 'timer-scan-progress-bar-fill' });
        const cancelBtn = el.createEl('button', { cls: 'timer-scan-cancel-btn', text: 'Cancel' });
        cancelBtn.addEventListener('click', () => this.scanAbortController?.abort());
        return el;
    }

    private entriesToScannedTimers(entries: TimerEntry[]): ScannedTimer[] {
        return entries.map(e => ({
            timerId: e.timer_id,
            filePath: e.file_path,
            lineNum: e.line_num,
            lineText: e.line_text,
            state: e.state === 'running' ? 'timer-r' : 'timer-p',
            dur: e.total_dur_sec,
            ts: e.last_ts,
            project: e.project
        } as ScannedTimer));
    }

    private scannedTimerToEntry(t: ScannedTimer): TimerEntry {
        const now = Math.floor(Date.now() / 1000);
        return {
            timer_id: t.timerId,
            file_path: t.filePath,
            line_num: t.lineNum,
            line_text: t.lineText,
            project: t.project,
            state: t.state === 'timer-r' ? 'running' : 'paused',
            total_dur_sec: t.dur,
            last_ts: t.ts,
            created_at: now,
            updated_at: now
        };
    }

    // ===== Statistics Chart Properties =====
    private showStatistics: boolean = true;
    private chartInstance: any = null;
    // Cache chart data for incremental updates
    private chartDataCache: { projects: string[]; dates: string[]; matrix: Record<string, Record<string, number>> } | null = null;

    // ===== Render =====

    render(): void {
        this.renderSummary();
        this.renderStatisticsChart();
        this.renderTimerList();
    }

    // ===== Statistics Chart Methods =====

    private renderStatisticsChart(): void {
        this.statisticsEl.empty();

        // Dispose previous chart instance
        if (this.chartInstance) {
            this.chartInstance.dispose();
            this.chartInstance = null;
        }
        // Clear chart data cache on full re-render
        this.chartDataCache = null;

        if (!this.showStatistics) return;

        // Add chart container
        const chartContainer = this.statisticsEl.createDiv({ cls: 'timer-chart-container' });
        chartContainer.style.height = '320px';

        // Initialize chart
        this.initChart(chartContainer);
    }

    private async initChart(container: HTMLElement): Promise<void> {
        try {
            this.chartInstance = echarts.init(container);

            const chartData = await this.getChartData();
            // Cache chart data for incremental tick updates
            this.chartDataCache = chartData;
            const projectTotals: Record<string, number> = {};
            for (const proj of chartData.projects) {
                projectTotals[proj] = Object.values(chartData.matrix[proj] ?? {}).reduce((s, v) => s + v, 0);
            }
            const grandTotal = Object.values(projectTotals).reduce((s, v) => s + v, 0);

            // If no data, show placeholder
            if (chartData.projects.length === 0) {
                container.createDiv({ cls: 'timer-chart-empty', text: 'No timer data to display' });
                return;
            }

            // Build dataset source: first row is header ["project", date1, date2, ...]
            // Each subsequent row: [projectName, dur1, dur2, ...]
            const header = ['project', ...chartData.dates];
            const rows: (string | number)[][] = chartData.projects.map(proj => {
                const row: (string | number)[] = [proj];
                for (const date of chartData.dates) {
                    row.push(chartData.matrix[proj]?.[date] ?? 0);
                }
                return row;
            });
            const datasetSource = [header, ...rows];

            // Build line series — one per project
            const lineSeries = chartData.projects.map(() => ({
                type: 'line',
                smooth: true,
                seriesLayoutBy: 'row',
                emphasis: { focus: 'series' }
            }));

            // ── Dynamic Y-axis unit ──────────────────────────────────────────
            // Compute max total seconds across all projects × dates
            let maxSec = 0;
            for (const proj of chartData.projects) {
                for (const date of chartData.dates) {
                    const v = chartData.matrix[proj]?.[date] ?? 0;
                    if (v > maxSec) maxSec = v;
                }
            }
            let yUnit: 's' | 'min' | 'h';
            let yDivisor: number;
            if (maxSec < 60) {
                yUnit = 's'; yDivisor = 1;
            } else if (maxSec < 3600) {
                yUnit = 'min'; yDivisor = 60;
            } else {
                yUnit = 'h'; yDivisor = 3600;
            }
            const fmtYVal = (sec: number) => {
                const v = sec / yDivisor;
                return `${Number.isInteger(v) ? v : v.toFixed(1)}${yUnit}`;
            };
            const fmtDur = (sec: number) => {
                if (yUnit === 'h') return `${(sec / 3600).toFixed(1)}h`;
                if (yUnit === 'min') return `${(sec / 60).toFixed(1)}min`;
                return `${sec}s`;
            };

            // ── Pie label formatter ──────────────────────────────────────────
            const pieLabelFormatter = (params: any) => {
                return `${params.name}: ${fmtDur(params.value)} (${params.percent}%)`;
            };

            // Build pie series — shows distribution for the hovered date
            // Default: show all-date aggregated data
            const allDateAggData = chartData.projects.map(proj => ({
                name: proj,
                value: projectTotals[proj] ?? 0
            }));

            const pieSeries: any = {
                type: 'pie',
                id: 'pie',
                radius: '30%',
                center: ['50%', '22%'],
                emphasis: { focus: 'self' },
                legendHoverLink: false,
                label: {
                    formatter: pieLabelFormatter,
                    overflow: 'truncate',
                    width: 120
                },
                labelLine: { length: 8, length2: 6 },
                // Use explicit data (not dataset encode) for aggregated default view
                data: allDateAggData
            };

            const option: any = {
                legend: {
                    top: 'bottom',
                    type: 'scroll',
                    // Only show line series in legend (exclude pie)
                    data: chartData.projects,
                    formatter: (name: string) => {
                        const total = projectTotals[name] ?? 0;
                        const pct = grandTotal > 0 ? ((total / grandTotal) * 100).toFixed(1) : '0.0';
                        return `${name}: ${fmtDur(total)} (${pct}%)`;
                    }
                },
                tooltip: {
                    trigger: 'axis',
                    axisPointer: {
                        type: 'cross',
                        label: { backgroundColor: '#6a7985' }
                    },
                    showContent: true,
                    formatter: (params: any[]) => {
                        if (!params || params.length === 0) return '';
                        const date = params[0].axisValue;
                        let html = `<b>${date}</b><br/>`;
                        params.forEach((p: any) => {
                            // In seriesLayoutBy:'row' mode, p.value is the full row array
                            // [projectName, val_col0, val_col1, ...].
                            // p.encode.y[0] gives the column index used as Y value.
                            let sec = 0;
                            if (Array.isArray(p.value) && p.encode?.y?.[0] !== undefined) {
                                sec = p.value[p.encode.y[0]] ?? 0;
                            } else if (typeof p.value === 'number') {
                                sec = p.value;
                            }
                            html += `${p.marker}${p.seriesName}: ${fmtDur(sec)}<br/>`;
                        });
                        return html;
                    }
                },
                toolbox: {
                    iconSize: 10,
                    feature: {
                        dataView: { readOnly: false },
                        myClipboard: {
                            show: true,
                            title: 'copy as image',
                            icon: 'path://M19,3H14.82C14.4,1.84 13.3,1 12,1C10.7,1 9.6,1.84 9.18,3H5C3.9,3 3,3.9 3,5V19C3,20.1 3.9,21 5,21H19C20.1,21 21,20.1 21,19V5C21,3.9 20.1,3 19,3ZM12,3C12.55,3 13,3.45 13,4C13,4.55 12.55,5 12,5C11.45,5 11,4.55 11,4C11,3.45 11.45,3 12,3ZM17,17H7V15H17V17ZM17,13H7V11H17V13ZM17,9H7V7H17V9Z',
                            onclick: () => {
                                try {
                                    // Temporarily hide toolbox to exclude it from the screenshot
                                    this.chartInstance.setOption({ toolbox: { show: false } });
                                    // Use setTimeout to let ECharts re-render without toolbox before capturing
                                    setTimeout(() => {
                                        try {
                                            const url = this.chartInstance.getDataURL({ type: 'png', pixelRatio: 2, backgroundColor: '#fff' });
                                            // Restore toolbox immediately after capture
                                            this.chartInstance.setOption({ toolbox: { show: true } });
                                            fetch(url)
                                                .then(res => res.blob())
                                                .then(blob => {
                                                    const item = new ClipboardItem({ 'image/png': blob });
                                                    navigator.clipboard.write([item]).then(() => {
                                                        new Notice('📋 Chart copied to clipboard');
                                                    }).catch(() => {
                                                        new Notice('⚠️ Copy failed: clipboard permission denied');
                                                    });
                                                });
                                        } catch (e) {
                                            this.chartInstance?.setOption({ toolbox: { show: true } });
                                            new Notice('⚠️ Copy to clipboard failed');
                                        }
                                    }, 50);
                                } catch (e) {
                                    new Notice('⚠️ Copy to clipboard failed');
                                }
                            }
                        }
                    }
                },
                dataset: { source: datasetSource },
                xAxis: { type: 'category' },
                yAxis: {
                    gridIndex: 0,
                    axisLabel: {
                        formatter: (val: number) => fmtYVal(val)
                    }
                },
                grid: { top: '50%', bottom: '15%' },
                series: [...lineSeries, pieSeries]
            };

            // When hovering a date on the line chart — update pie to show that date's distribution
            this.chartInstance.on('updateAxisPointer', (event: any) => {
                const xAxisInfo = event.axesInfo?.[0];
                if (xAxisInfo) {
                    const dateIndex = xAxisInfo.value; // 0-based index into dates array
                    const date = chartData.dates[dateIndex];
                    if (!date) return;
                    // IDB daily_dur already includes running increments — use cache matrix directly
                    const dateData = chartData.projects.map(proj => ({
                        name: proj,
                        value: chartData.matrix[proj]?.[date] ?? 0
                    }));
                    this.chartInstance.setOption({
                        series: [{ id: 'pie', data: dateData }]
                    });
                }
            });

            // When mouse leaves the chart — reset pie to all-date aggregated view
            this.chartInstance.getZr().on('mouseout', () => {
                if (!this.chartInstance) return;
                // Use cache matrix directly — IDB data already includes running increments
                const aggData = chartData.projects.map(proj => {
                    let total = 0;
                    for (const date of chartData.dates) {
                        total += chartData.matrix[proj]?.[date] ?? 0;
                    }
                    return { name: proj, value: total };
                });
                this.chartInstance.setOption({
                    series: [{ id: 'pie', data: aggData }]
                });
            });

            this.chartInstance.setOption(option);

            // Handle sidebar resize — observe statisticsEl for size changes
            const chartResizeObserver = new ResizeObserver(() => {
                this.chartInstance?.resize();
            });
            chartResizeObserver.observe(this.statisticsEl);
            // Also listen to window resize as fallback
            const resizeHandler = () => { this.chartInstance?.resize(); };
            window.addEventListener('resize', resizeHandler);
            this.register(() => {
                chartResizeObserver.disconnect();
                window.removeEventListener('resize', resizeHandler);
                this.chartInstance?.dispose();
                this.chartInstance = null;
            });

        } catch (error) {
            console.error('Failed to initialize chart:', error);
            container.createDiv({ cls: 'timer-chart-error', text: 'Chart initialization failed' });
        }
    }

    /**
     * Build chart data: projects × dates matrix.
     * Each cell = total duration (seconds) for that project on that date.
     * Data source: IndexedDB (real-time, includes running timer increments from tick).
     */
    private async getChartData(): Promise<{
        projects: string[];
        dates: string[];
        matrix: Record<string, Record<string, number>>;
    }> {
        const filteredList = this.getGroupFilteredList();
        const filteredIds = new Set(filteredList.map(t => t.timerId));

        // Build a map: timerId → project name
        const timerProjectMap: Record<string, string> = {};
        filteredList.forEach(timer => {
            timerProjectMap[timer.timerId] = timer.project || 'Uncategorized';
        });

        // project → date → total seconds, aggregated from daily_dur
        const matrix: Record<string, Record<string, number>> = {};
        const dateSet = new Set<string>();

        // Read daily_dur from IndexedDB (real-time, already includes running increments)
        const idb = this.plugin.idb;
        if (idb) {
            const allDailyDur = await idb.getAllDailyDur();
            for (const rec of allDailyDur) {
                if (!filteredIds.has(rec.timer_id)) continue;
                if (rec.duration_sec <= 0) continue;
                const project = timerProjectMap[rec.timer_id] ?? 'Uncategorized';
                dateSet.add(rec.stat_date);
                if (!matrix[project]) matrix[project] = {};
                matrix[project][rec.stat_date] = (matrix[project][rec.stat_date] ?? 0) + rec.duration_sec;
            }
        }

        // Fallback: if no daily_dur data, use timer.ts as date bucket
        if (dateSet.size === 0) {
            filteredList.forEach(timer => {
                const project = timer.project || 'Uncategorized';
                const date = timer.ts
                    ? new Date(timer.ts * 1000).toISOString().slice(0, 10)
                    : 'Unknown';
                dateSet.add(date);
                if (!matrix[project]) matrix[project] = {};
                matrix[project][date] = (matrix[project][date] ?? 0) + timer.dur;
            });
        }

        // Sort dates ascending
        const dates = [...dateSet].sort();
        // Sort projects by total duration descending
        const projects = Object.keys(matrix).sort((a, b) => {
            const sumA = Object.values(matrix[a]).reduce((s, v) => s + v, 0);
            const sumB = Object.values(matrix[b]).reduce((s, v) => s + v, 0);
            return sumB - sumA;
        });

        return { projects, dates, matrix };
    }

    renderToolbar(): void {
        this.toolbarEl.empty();
        const sidebarLang = getTranslation('settings')?.sidebar ?? {};

        // Scope switcher
        const scopeRow = this.toolbarEl.createDiv({ cls: 'timer-toolbar-row' });
        const scopeLabels = sidebarLang.scopeLabels ?? { activeFile: 'Current file', openTabs: 'Current session', all: 'All' };
        const scopes: { label: string; value: ScopeType }[] = [
            { label: scopeLabels.activeFile, value: 'active-file' },
            { label: scopeLabels.openTabs, value: 'open-tabs' },
            { label: scopeLabels.all, value: 'all' }
        ];
        const scopeGroup = scopeRow.createDiv({ cls: 'timer-segmented-control' });
        for (const s of scopes) {
            const btn = scopeGroup.createEl('button', {
                cls: 'timer-seg-btn' + (this.currentScope === s.value ? ' is-active' : ''),
                text: s.label
            });
            btn.addEventListener('click', () => {
                if (s.value === 'all' && !this.plugin.database) {
                    new Notice(sidebarLang.allViewNotice ?? 'All-library view is under development');
                    return;
                }
                this.currentScope = s.value;
                this.renderToolbar();
                this.loadData().then(() => this.render());
            });
        }

        // Filter + Sort row
        const controlRow = this.toolbarEl.createDiv({ cls: 'timer-toolbar-row timer-toolbar-controls' });
        const filterLabels = sidebarLang.filterLabels ?? { all: 'All', running: 'Running', paused: 'Paused' };
        const sortLabels = sidebarLang.sortLabels ?? {};

        // Filter dropdown
        const filterSel = controlRow.createEl('select', { cls: 'timer-filter-select' });
        const filterOpts: { label: string; value: FilterType }[] = [
            { label: filterLabels.all, value: 'all' },
            { label: filterLabels.running, value: 'running' },
            { label: filterLabels.paused, value: 'paused' }
        ];
        for (const opt of filterOpts) {
            const o = filterSel.createEl('option', { text: opt.label, value: opt.value });
            if (this.currentFilter === opt.value) o.selected = true;
        }
        filterSel.addEventListener('change', () => {
            this.currentFilter = filterSel.value as FilterType;
            this.render();
        });

        // Sort dropdown
        const sortSel = controlRow.createEl('select', { cls: 'timer-sort-select' });
        const sortOpts: { label: string; value: TimerSort }[] = [
            { label: sortLabels.status ?? 'Status first', value: 'status' },
            { label: sortLabels.durDesc ?? 'Duration ↓', value: 'dur-desc' },
            { label: sortLabels.durAsc ?? 'Duration ↑', value: 'dur-asc' },
            { label: sortLabels.filenameDesc ?? 'Filename ↓', value: 'filename-desc' },
            { label: sortLabels.filenameAsc ?? 'Filename ↑', value: 'filename-asc' },
            { label: sortLabels.updated ?? 'Recently updated', value: 'updated' }
        ];
        for (const opt of sortOpts) {
            const o = sortSel.createEl('option', { text: opt.label, value: opt.value });
            if (this.currentSort === opt.value) o.selected = true;
        }
        sortSel.addEventListener('change', () => {
            this.currentSort = sortSel.value as TimerSort;
            this.render();
        });

        // File group filter row — only shown in "all" scope
        if (this.currentScope === 'all') {
            const groups: TimerFileGroup[] = this.plugin.settings.timerFileGroups ?? [];
            if (groups.length > 0) {
                const groupRow = this.toolbarEl.createDiv({ cls: 'timer-toolbar-row timer-toolbar-group-row' });
                const groupSel = groupRow.createEl('select', { cls: 'timer-group-select' });

                // "All groups" option
                const allOpt = groupSel.createEl('option', { text: sidebarLang.allGroups ?? 'All groups', value: '' });
                if (!this.selectedGroup) allOpt.selected = true;

                for (const g of groups) {
                    const opt = groupSel.createEl('option', { text: g.name, value: g.id });
                    if (this.selectedGroup?.id === g.id) opt.selected = true;
                }

                groupSel.addEventListener('change', () => {
                    const id = groupSel.value;
                    this.selectedGroup = id ? (groups.find(g => g.id === id) ?? null) : null;
                    this.render();
                });
            }
        }
    }

    /**
     * Returns timerList filtered by the active file group (if any).
     * Used by both renderSummary and renderTimerList so totals stay in sync.
     */
    private getGroupFilteredList(): ScannedTimer[] {
        if (this.currentScope === 'all' && this.selectedGroup) {
            return TimerFileGroupFilter.filter(this.timerList, this.selectedGroup);
        }
        return [...this.timerList];
    }

    renderSummary(): void {
        this.summaryEl.empty();

        const sidebarLang = getTranslation('settings')?.sidebar ?? {};
        const summaryLang = sidebarLang.summary ?? { timerCount: 'Timers', duration: 'Duration', total: 'Total' };
        // Use group-filtered list so the total matches what's shown in the list
        const filteredList = this.getGroupFilteredList();
        const summary = TimerSummary.calculate(filteredList, this.plugin.manager);
        const fmt = (sec: number) => TimeFormatter.formatTime(sec, this.plugin.settings.timeDisplayFormat || 'full');

        // ── 计时器个数统计 ─────────────────────────────────────────────────────────────────────────────
        const totalCount = filteredList.length;
        const runningCount = filteredList.filter(t => t.state === 'timer-r').length;
        const pausedCount = filteredList.filter(t => t.state === 'timer-p').length;

        const countRow = this.summaryEl.createDiv({ cls: 'timer-summary-row timer-count-row' });
        // Section title
        const countTitleItem = countRow.createDiv({ cls: 'timer-summary-item' });
        countTitleItem.createSpan({ cls: 'timer-summary-label timer-summary-section-title', text: summaryLang.timerCount });
        // Total count
        const countTotalItem = countRow.createDiv({ cls: 'timer-summary-item' });
        countTotalItem.createSpan({ cls: 'timer-summary-label', text: summaryLang.total });
        countTotalItem.createSpan({ cls: 'timer-summary-value', attr: { 'data-summary-count': '1' }, text: String(totalCount) });
        // Running count
        const countRunItem = countRow.createDiv({ cls: 'timer-summary-item timer-summary-running' });
        countRunItem.innerHTML += '<svg class="timer-summary-icon" viewBox="0 0 8 10" width="8" height="10"><polygon points="0,0 8,5 0,10" fill="currentColor"/></svg>';
        countRunItem.createSpan({ cls: 'timer-summary-value', attr: { 'data-summary-running-count': '1' }, text: String(runningCount) });
        // Paused count
        const countPauseItem = countRow.createDiv({ cls: 'timer-summary-item timer-summary-paused' });
        countPauseItem.innerHTML += '<svg class="timer-summary-icon" viewBox="0 0 8 10" width="8" height="10"><rect x="0" y="0" width="3" height="10" fill="currentColor"/><rect x="5" y="0" width="3" height="10" fill="currentColor"/></svg>';
        countPauseItem.createSpan({ cls: 'timer-summary-value', attr: { 'data-summary-paused-count': '1' }, text: String(pausedCount) });

        // ── 时长统计 ────────────────────────────────────────────────────────────────────────────────
        const row = this.summaryEl.createDiv({ cls: 'timer-summary-row' });
        // Section title
        const titleItem = row.createDiv({ cls: 'timer-summary-item' });
        titleItem.createSpan({ cls: 'timer-summary-label timer-summary-section-title', text: summaryLang.duration });
        // Total
        const totalItem = row.createDiv({ cls: 'timer-summary-item' });
        totalItem.createSpan({ cls: 'timer-summary-label', text: summaryLang.total });
        totalItem.createSpan({ cls: 'timer-summary-value', attr: { 'data-summary-total': '1' }, text: fmt(summary.totalSec) });
        // Running
        const runItem = row.createDiv({ cls: 'timer-summary-item timer-summary-running' });
        runItem.innerHTML += '<svg class="timer-summary-icon" viewBox="0 0 8 10" width="8" height="10"><polygon points="0,0 8,5 0,10" fill="currentColor"/></svg>';
        runItem.createSpan({ cls: 'timer-summary-value', attr: { 'data-summary-running': '1' }, text: fmt(summary.runningSec) });
        // Paused
        const pauseItem = row.createDiv({ cls: 'timer-summary-item timer-summary-paused' });
        pauseItem.innerHTML += '<svg class="timer-summary-icon" viewBox="0 0 8 10" width="8" height="10"><rect x="0" y="0" width="3" height="10" fill="currentColor"/><rect x="5" y="0" width="3" height="10" fill="currentColor"/></svg>';
        pauseItem.createSpan({ cls: 'timer-summary-value', attr: { 'data-summary-paused': '1' }, text: fmt(summary.pausedSec) });

        // ── 统计图表切换按钮（位于时长统计行下方）────────────────────────────────────────────────
        const statsRow = this.summaryEl.createDiv({ cls: 'timer-toolbar-row timer-toolbar-stats-row' });
        const statsBtn = statsRow.createEl('button', {
            cls: 'timer-stats-toggle' + (this.showStatistics ? ' is-active' : ''),
            text: this.showStatistics ? '📊 隐藏统计图表' : '📊 展开统计图表'
        });
        statsBtn.addEventListener('click', () => {
            this.showStatistics = !this.showStatistics;
            // Re-render summary to update button text
            this.renderSummary();
            this.renderStatisticsChart();
        });
    }

    renderTimerList(): void {
        this.listEl.empty();

        // Apply file group filter first (summary uses the same base)
        let list = this.getGroupFilteredList();

        // Apply status filter
        if (this.currentFilter === 'running') {
            list = list.filter(t => t.state === 'timer-r');
        } else if (this.currentFilter === 'paused') {
            list = list.filter(t => t.state === 'timer-p');
        }

        // Apply sort
        list = this.sortTimers(list);

        if (list.length === 0) {
            this.renderEmptyState();
            return;
        }

        for (const timer of list) {
            this.listEl.appendChild(this.renderTimerCard(timer));
        }
    }

    private sortTimers(list: ScannedTimer[]): ScannedTimer[] {
        return [...list].sort((a, b) => {
            switch (this.currentSort) {
                case 'status':
                    if (a.state === 'timer-r' && b.state !== 'timer-r') return -1;
                    if (a.state !== 'timer-r' && b.state === 'timer-r') return 1;
                    return b.dur - a.dur;
                case 'dur-desc': return b.dur - a.dur;
                case 'dur-asc': return a.dur - b.dur;
                case 'filename-desc': return b.filePath.localeCompare(a.filePath);
                case 'filename-asc': return a.filePath.localeCompare(b.filePath);
                case 'updated': return b.ts - a.ts;
                default: return 0;
            }
        });
    }

    renderTimerCard(timer: ScannedTimer): HTMLElement {
        const card = createDiv({ cls: 'timer-card' });
        card.addClass(timer.state === 'timer-r' ? 'timer-card-running' : 'timer-card-paused');

        // Header row: status dot + duration
        const headerRow = card.createDiv({ cls: 'timer-card-header' });
        const dot = headerRow.createSpan({ cls: 'timer-card-dot' });
        dot.addClass(timer.state === 'timer-r' ? 'timer-dot-running' : 'timer-dot-paused');

        const durEl = headerRow.createSpan({
            cls: 'timer-card-duration',
            text: TimeFormatter.formatTime(timer.dur, this.plugin.settings.timeDisplayFormat || 'full')
        });
        if (timer.state === 'timer-r') {
            durEl.setAttribute('data-timer-id', timer.timerId);
        }

        // Project badge
        if (timer.project) {
            headerRow.createSpan({ cls: 'timer-card-project', text: timer.project });
        }

        // Line text
        if (timer.lineText) {
            card.createDiv({ cls: 'timer-card-text', text: timer.lineText });
        }

        // File source (clickable — T14 jump)
        const fileName = timer.filePath.split('/').pop() ?? timer.filePath;
        const fileSourceEl = card.createDiv({ cls: 'timer-card-file-source' });
        fileSourceEl.createSpan({ text: `${fileName}:${timer.lineNum + 1}` });
        fileSourceEl.style.cursor = 'pointer';
        fileSourceEl.addEventListener('click', () => this.jumpToTimer(timer));

        // Action buttons (T15 — enabled)
        const actionsEl = card.createDiv({ cls: 'timer-card-actions' });
        const sidebarLang = getTranslation('settings')?.sidebar ?? {};
        const actionLabels = sidebarLang.actions ?? { pause: 'Pause', resume: 'Resume' };
        if (timer.state === 'timer-r') {
            const pauseBtn = actionsEl.createEl('button', { cls: 'timer-card-btn', text: '⏸' });
            pauseBtn.title = actionLabels.pause;
            pauseBtn.addEventListener('click', async (e) => {
                e.stopPropagation();
                await this.handleCardPause(timer);
            });
        } else {
            const resumeBtn = actionsEl.createEl('button', { cls: 'timer-card-btn', text: '▶' });
            resumeBtn.title = actionLabels.resume;
            resumeBtn.addEventListener('click', async (e) => {
                e.stopPropagation();
                await this.handleCardContinue(timer);
            });
        }

        return card;
    }

    renderEmptyState(): void {
        const sidebarLang = getTranslation('settings')?.sidebar ?? {};
        const emptyState = sidebarLang.emptyState ?? { activeFile: 'No timers in current file', openTabs: 'No timers in current session', all: 'No timer data' };
        const empty = this.listEl.createDiv({ cls: 'timer-empty-state' });
        const msgs: Record<ScopeType, string> = {
            'active-file': emptyState.activeFile,
            'open-tabs': emptyState.openTabs,
            'all': emptyState.all
        };
        empty.createSpan({ text: msgs[this.currentScope] });
    }

    // ===== State change notification (called on start/pause/continue/delete) =====

    /**
     * Called when plugin settings change (e.g. file groups updated).
     * Re-renders the toolbar so the file group selector reflects the latest config immediately.
     */
    onSettingsChanged(): void {
        // If selected group was deleted, clear it
        if (this.selectedGroup) {
            const groups: TimerFileGroup[] = this.plugin.settings.timerFileGroups ?? [];
            if (!groups.find(g => g.id === this.selectedGroup!.id)) {
                this.selectedGroup = null;
            }
        }
        this.renderToolbar();
        this.render();
    }

    /**
     * Called when a timer's state changes (running ↔ paused).
     * Directly mutates the in-memory timerList so the UI updates immediately
     * without waiting for async file I/O to complete.
     */
    onTimerStateChanged(timerId: string, newState: 'timer-r' | 'timer-p', newDur?: number): void {
        if (!this.isVisible()) return;
        const idx = this.timerList.findIndex(t => t.timerId === timerId);
        if (idx !== -1) {
            const updated: ScannedTimer = { ...this.timerList[idx], state: newState };
            // Use the authoritative dur passed from handlePause/handleContinue if available,
            // otherwise fall back to manager data (which may be null after stopTimer)
            if (newDur !== undefined) {
                updated.dur = newDur;
            } else {
                const memData = this.plugin.manager.getTimerData(timerId);
                if (memData) {
                    updated.dur = memData.dur;
                }
            }
            updated.ts = Math.floor(Date.now() / 1000);
            this.timerList[idx] = updated;
        }
        this.render();
        // When a timer stops (paused), the session has already been written to DB by handlePause.
        // Rebuild the chart so the new session data is reflected immediately.
        if (newState === 'timer-p') {
            this.renderStatisticsChart();
        }
    }

    /**
     * Called when a new timer is created (handleStart).
     * Adds it to the in-memory timerList immediately.
     */
    onTimerAdded(timer: ScannedTimer): void {
        if (!this.isVisible()) return;
        // Avoid duplicates
        if (!this.timerList.find(t => t.timerId === timer.timerId)) {
            this.timerList.push(timer);
        }
        this.render();
    }

    /**
     * Called when a timer is deleted (handleDelete).
     * Removes it from the in-memory timerList immediately.
     */
    onTimerRemoved(timerId: string): void {
        if (!this.isVisible()) return;
        this.timerList = this.timerList.filter(t => t.timerId !== timerId);
        this.render();
    }

    /**
     * Called when a paused timer's duration is manually adjusted (handleSetDuration).
     * Directly updates the in-memory dur so the card re-renders with the new value.
     */
    onTimerDurChanged(timerId: string, newDur: number): void {
        if (!this.isVisible()) return;
        const idx = this.timerList.findIndex(t => t.timerId === timerId);
        if (idx !== -1) {
            this.timerList[idx] = { ...this.timerList[idx], dur: newDur };
        }
        this.render();
    }

    /**
     * Called every tick to patch the line text of a running timer card in-place.
     * Strips the timer span from the raw line text before displaying.
     * Does NOT trigger a full re-render — only patches the specific DOM element.
     */
    onTimerLineTextChanged(timerId: string, rawLineText: string): void {
        if (!this.isVisible()) return;
        // Strip timer span from raw line text to get clean display text
        const cleanText = rawLineText.replace(/<span\s+class="timer-[rp]"[^>]*>.*?<\/span>/g, '').trim();

        // Update in-memory timerList
        const idx = this.timerList.findIndex(t => t.timerId === timerId);
        if (idx !== -1 && this.timerList[idx].lineText !== cleanText) {
            this.timerList[idx] = { ...this.timerList[idx], lineText: cleanText };
        }

        // Patch DOM in-place: find the card's text element by data-timer-id on the duration span
        const durEl = this.listEl.querySelector(`[data-timer-id="${timerId}"]`);
        if (!durEl) return;
        const card = durEl.closest('.timer-card');
        if (!card) return;
        const textEl = card.querySelector('.timer-card-text') as HTMLElement | null;
        if (cleanText) {
            if (textEl) {
                if (textEl.textContent !== cleanText) textEl.textContent = cleanText;
            } else {
                // Insert text element after header row
                const headerRow = card.querySelector('.timer-card-header');
                const newTextEl = createDiv({ cls: 'timer-card-text', text: cleanText });
                if (headerRow?.nextSibling) {
                    card.insertBefore(newTextEl, headerRow.nextSibling);
                } else {
                    card.appendChild(newTextEl);
                }
            }
        } else if (textEl) {
            textEl.remove();
        }
    }

    // ===== Visibility check =====

    /**
     * Returns true if this sidebar leaf is currently visible (active in its tab group).
     * When the sidebar is hidden behind another tab, all tick-driven updates are skipped
     * to avoid unnecessary DOM work.
     */
    private isVisible(): boolean {
        // leaf.isVisible() is the official Obsidian API for checking tab visibility
        return (this.leaf as any).isVisible?.() ?? true;
    }

    // ===== T12: Real-time refresh (called every tick) =====

    refreshRunningTimers(): void {
        // Skip all updates when sidebar is not visible
        if (!this.isVisible()) return;

        // Step 1: Sync in-memory timerList dur for running timers from manager
        // This keeps timerList accurate for sort/filter logic even without a full render
        for (let i = 0; i < this.timerList.length; i++) {
            const t = this.timerList[i];
            if (t.state === 'timer-r') {
                const memData = this.plugin.manager.getTimerData(t.timerId);
                if (memData && memData.dur !== t.dur) {
                    this.timerList[i] = { ...t, dur: memData.dur };
                }
            }
        }

        // Step 2: Patch running timer duration DOM elements in-place
        const durEls = this.listEl.querySelectorAll('[data-timer-id]');
        durEls.forEach(el => {
            const timerId = el.getAttribute('data-timer-id');
            if (!timerId) return;
            const memData = this.plugin.manager.getTimerData(timerId);
            if (memData) {
                el.textContent = TimeFormatter.formatTime(
                    memData.dur,
                    this.plugin.settings.timeDisplayFormat || 'full'
                );
            }
        });

        // Step 3: Patch summary in-place — recalculate from updated timerList
        const groupList = this.getGroupFilteredList();
        const summary = TimerSummary.calculate(groupList, this.plugin.manager);
        const fmt = (sec: number) => TimeFormatter.formatTime(sec, this.plugin.settings.timeDisplayFormat || 'full');

        const runValEl = this.summaryEl.querySelector('[data-summary-running]') as HTMLElement | null;
        if (runValEl) {
            runValEl.textContent = fmt(summary.runningSec);
            const totalValEl = this.summaryEl.querySelector('[data-summary-total]') as HTMLElement | null;
            if (totalValEl) totalValEl.textContent = fmt(summary.totalSec);
            const pausedValEl = this.summaryEl.querySelector('[data-summary-paused]') as HTMLElement | null;
            if (pausedValEl) pausedValEl.textContent = fmt(summary.pausedSec);
            // Update count row
            const totalCount = groupList.length;
            const runningCount = groupList.filter(t => t.state === 'timer-r').length;
            const pausedCount = groupList.filter(t => t.state === 'timer-p').length;
            const countTotalEl = this.summaryEl.querySelector('[data-summary-count]') as HTMLElement | null;
            if (countTotalEl) countTotalEl.textContent = String(totalCount);
            const countRunEl = this.summaryEl.querySelector('[data-summary-running-count]') as HTMLElement | null;
            if (countRunEl) countRunEl.textContent = String(runningCount);
            const countPauseEl = this.summaryEl.querySelector('[data-summary-paused-count]') as HTMLElement | null;
            if (countPauseEl) countPauseEl.textContent = String(pausedCount);
        } else {
            // Summary not rendered yet (e.g. first tick before render) — full render
            this.renderSummary();
        }

        // Step 4: Incrementally update ECharts — only patch running timers' today column
        this.refreshChartRunningTimers();
    }

    /**
     * Compute today's seconds per project from IndexedDB.
     * IDB daily_dur already includes running timer increments (updated every tick),
     * so no compensation logic is needed.
     */
    private async computeTodayByProject(): Promise<Record<string, number>> {
        const today = new Date().toLocaleDateString('sv');
        const filteredList = this.getGroupFilteredList();
        const filteredIds = new Set(filteredList.map(t => t.timerId));
        const timerProjectMap: Record<string, string> = {};
        filteredList.forEach(timer => {
            timerProjectMap[timer.timerId] = timer.project || 'Uncategorized';
        });

        const todayByProject: Record<string, number> = {};
        const idb = this.plugin.idb;
        if (idb) {
            const todayRecords = await idb.getDailyDurByDate(today);
            for (const rec of todayRecords) {
                if (!filteredIds.has(rec.timer_id)) continue;
                if (rec.duration_sec <= 0) continue;
                const project = timerProjectMap[rec.timer_id] ?? 'Uncategorized';
                todayByProject[project] = (todayByProject[project] ?? 0) + rec.duration_sec;
            }
        }

        return todayByProject;
    }

    /**
     * Incrementally update the ECharts line chart dataset AND pie chart data
     * for running timers. Reads today's data from IndexedDB (already includes
     * running increments via tick) and patches the chart in-place.
     */
    private async refreshChartRunningTimers(): Promise<void> {
        if (!this.showStatistics || !this.chartInstance || !this.chartDataCache) return;

        const today = new Date().toLocaleDateString('sv');
        const cache = this.chartDataCache;
        const todayIdx = cache.dates.indexOf(today);
        if (todayIdx === -1) {
            // Today is a new date not in the chart cache (e.g. midnight crossed).
            // Do a full chart re-render so the new day's data column is included.
            this.renderStatisticsChart();
            return;
        }

        const todayByProject = await this.computeTodayByProject();

        // Update cache matrix with latest today values
        for (const proj of cache.projects) {
            if (!cache.matrix[proj]) cache.matrix[proj] = {};
            cache.matrix[proj][today] = todayByProject[proj] ?? 0;
        }

        // ── Update line chart dataset (only today column) ──────────────────
        const updatedRows = cache.projects.map(proj => {
            const row: (string | number)[] = [proj];
            for (let i = 0; i < cache.dates.length; i++) {
                const date = cache.dates[i];
                row.push(cache.matrix[proj]?.[date] ?? 0);
            }
            return row;
        });
        const header = ['project', ...cache.dates];

        // ── Update pie chart data (all-date aggregated) ───
        const pieData = cache.projects.map(proj => {
            let total = 0;
            for (const date of cache.dates) {
                total += cache.matrix[proj]?.[date] ?? 0;
            }
            return { name: proj, value: total };
        });

        this.chartInstance.setOption({
            dataset: { source: [header, ...updatedRows] },
            series: [{ id: 'pie', data: pieData }]
        });
    }

    // ===== T13: Active leaf change =====

    onActiveLeafChange(_leaf: WorkspaceLeaf | null): void {
        if (this.currentScope !== 'active-file') return;
        this.loadActiveFileData().then(() => this.render());
    }

    onLayoutChange(): void {
        if (this.currentScope !== 'open-tabs') return;
        // Skip if initial loadData is still in progress to avoid duplicate entries
        if (this.isLoading) return;

        const currentOpenPaths = new Set<string>(
            (this.plugin.app.workspace.getLeavesOfType('markdown') as WorkspaceLeaf[])
                .map(leaf => (leaf.view as MarkdownView).file?.path)
                .filter(Boolean) as string[]
        );

        // Remove timers from closed files, but keep running ones
        this.timerList = this.timerList.filter(timer =>
            currentOpenPaths.has(timer.filePath) ||
            this.plugin.manager.hasTimer(timer.timerId)
        );

        // Scan newly opened files — only files not already represented in timerList
        // Use covered paths (files that already have timer entries) to avoid double-scan
        const coveredPaths = new Set(this.timerList.map(t => t.filePath));
        const newPaths = [...currentOpenPaths].filter(p => !coveredPaths.has(p));
        if (newPaths.length > 0) {
            const newFiles = newPaths
                .map(p => this.plugin.app.vault.getAbstractFileByPath(p))
                .filter((f: any) => f instanceof TFile) as TFile[];
            this.plugin.scanner.scanFiles(newFiles).then((newTimers: ScannedTimer[]) => {
                // Deduplicate: only add timers whose ID is not already in the list
                const existingIds = new Set(this.timerList.map(t => t.timerId));
                const deduped = newTimers.filter(t => !existingIds.has(t.timerId));
                if (deduped.length > 0) {
                    this.timerList = [...this.timerList, ...deduped];
                }
                this.render();
            });
        } else {
            this.render();
        }
    }

    // ===== T14: Jump to timer =====

    private async jumpToTimer(timer: ScannedTimer): Promise<void> {
        try {
            const file = this.plugin.app.vault.getAbstractFileByPath(timer.filePath);
            if (!(file instanceof TFile)) {
                // File not found — trigger global search and re-locate timer
                await this.handleJumpToMissingTimer(timer);
                return;
            }
            
            const leaf = this.plugin.app.workspace.getLeaf(false);
            await leaf.openFile(file);

            // Wait for editor to load then scroll to line
            setTimeout(async () => {
                const view = this.plugin.app.workspace.getActiveViewOfType(MarkdownView);
                if (view?.editor) {
                    // First try to jump to original position
                    view.editor.setCursor({ line: timer.lineNum, ch: 0 });
                    view.editor.scrollIntoView(
                        { from: { line: timer.lineNum, ch: 0 }, to: { line: timer.lineNum, ch: 0 } },
                        true
                    );
                    
                    // Check if timer still exists at original position
                    const lineText = view.editor.getLine(timer.lineNum);
                    const parsed = TimerParser.parse(lineText, 'auto');
                    if (!parsed || parsed.timerId !== timer.timerId) {
                        // Timer not found at original position — search globally in this file
                        await this.searchTimerInFile(file, timer.timerId, view);
                    }
                }
            }, 100);
        } catch {
            new Notice('⚠️ Failed to open file');
        }
    }

    private async handleJumpToMissingTimer(timer: ScannedTimer): Promise<void> {
        new Notice('🔍 Searching for timer in vault...');
        
        try {
            // Search for timer globally in vault
            const foundLocation = await this.searchTimerGlobally(timer.timerId);
            
            if (foundLocation) {
                // Update database with new location
                await this.plugin.database.updateEntry(timer.timerId, {
                    file_path: foundLocation.filePath,
                    line_num: foundLocation.lineNum,
                    line_text: foundLocation.lineText
                });
                
                // Update in-memory timer list
                const timerIndex = this.timerList.findIndex(t => t.timerId === timer.timerId);
                if (timerIndex !== -1) {
                    this.timerList[timerIndex] = {
                        ...this.timerList[timerIndex],
                        filePath: foundLocation.filePath,
                        lineNum: foundLocation.lineNum,
                        lineText: foundLocation.lineText
                    };
                }
                
                // Jump to new location
                const file = this.plugin.app.vault.getAbstractFileByPath(foundLocation.filePath);
                if (file instanceof TFile) {
                    const leaf = this.plugin.app.workspace.getLeaf(false);
                    await leaf.openFile(file);
                    
                    setTimeout(() => {
                        const view = this.plugin.app.workspace.getActiveViewOfType(MarkdownView);
                        if (view?.editor) {
                            view.editor.setCursor({ line: foundLocation.lineNum, ch: 0 });
                            view.editor.scrollIntoView(
                                { from: { line: foundLocation.lineNum, ch: 0 }, to: { line: foundLocation.lineNum, ch: 0 } },
                                true
                            );
                        }
                    }, 100);
                    
                    new Notice('✅ Timer relocated successfully');
                }
            } else {
                // Timer not found — mark as deleted in database and remove from sidebar
                await this.plugin.database.updateEntry(timer.timerId, {
                    state: 'deleted'
                });
                
                // Remove from in-memory list
                this.timerList = this.timerList.filter(t => t.timerId !== timer.timerId);
                this.render();
                
                new Notice('❌ Timer not found — removed from sidebar');
            }
        } catch (error) {
            console.error('Global timer search failed:', error);
            new Notice('⚠️ Timer search failed');
        }
    }

    private async searchTimerGlobally(timerId: string): Promise<{ filePath: string; lineNum: number; lineText: string } | null> {
        const files = this.plugin.app.vault.getMarkdownFiles();
        
        for (const file of files) {
            try {
                const content = await this.plugin.app.vault.read(file);
                const lines = content.split('\n');
                
                for (let lineNum = 0; lineNum < lines.length; lineNum++) {
                    const lineText = lines[lineNum];
                    const parsed = TimerParser.parse(lineText, 'auto');
                    
                    if (parsed && parsed.timerId === timerId) {
                        return {
                            filePath: file.path,
                            lineNum: lineNum,
                            lineText: TimerScanner.extractLineText(lineText)
                        };
                    }
                }
            } catch (error) {
                // Skip files that can't be read
                continue;
            }
        }
        
        return null;
    }

    private async searchTimerInFile(file: TFile, timerId: string, view: MarkdownView): Promise<void> {
        try {
            const content = await this.plugin.app.vault.read(file);
            const lines = content.split('\n');
            
            for (let lineNum = 0; lineNum < lines.length; lineNum++) {
                const lineText = lines[lineNum];
                const parsed = TimerParser.parse(lineText, 'auto');
                
                if (parsed && parsed.timerId === timerId) {
                    // Found timer — scroll to new position
                    view.editor.setCursor({ line: lineNum, ch: 0 });
                    view.editor.scrollIntoView(
                        { from: { line: lineNum, ch: 0 }, to: { line: lineNum, ch: 0 } },
                        true
                    );
                    
                    // Update database with new line number
                    await this.plugin.database.updateEntry(timerId, {
                        line_num: lineNum,
                        line_text: TimerScanner.extractLineText(lineText)
                    });
                    
                    new Notice('✅ Timer relocated within file');
                    return;
                }
            }
            
            // Timer not found in this file — trigger global search
            const timer = this.timerList.find(t => t.timerId === timerId);
            if (timer) {
                await this.handleJumpToMissingTimer(timer);
            }
        } catch (error) {
            console.error('File timer search failed:', error);
        }
    }

    // ===== T15: Sidebar pause/continue =====

    private async handleCardPause(timer: ScannedTimer): Promise<void> {
        const editorView = this.findEditorViewForFile(timer.filePath);

        if (editorView) {
            // File is open — use plugin's handlePause (it will call onTimerStateChanged internally)
            const lineText = editorView.editor.getLine(timer.lineNum);
            const parsed = TimerParser.parse(lineText, 'auto');
            if (parsed) {
                this.plugin.handlePause(editorView, timer.lineNum, parsed);
                // plugin.handlePause already calls notifySidebarStateChanged → onTimerStateChanged
                return;
            }
        }
        // Fallback: read/modify file directly, then update in-memory state
        const fallbackDur = await this.fallbackPause(timer);
        this.onTimerStateChanged(timer.timerId, 'timer-p', fallbackDur);
    }

    private async handleCardContinue(timer: ScannedTimer): Promise<void> {
        const editorView = this.findEditorViewForFile(timer.filePath);

        if (editorView) {
            const lineText = editorView.editor.getLine(timer.lineNum);
            const parsed = TimerParser.parse(lineText, 'auto');
            if (parsed) {
                this.plugin.handleContinue(editorView, timer.lineNum, parsed);
                // plugin.handleContinue already calls notifySidebarStateChanged → onTimerStateChanged
                return;
            }
        }
        // Fallback: read/modify file directly, then update in-memory state
        await this.fallbackContinue(timer);
        this.onTimerStateChanged(timer.timerId, 'timer-r');
    }

    private findEditorViewForFile(filePath: string): MarkdownView | null {
        // Prefer active leaf
        const activeView = this.plugin.app.workspace.getActiveViewOfType(MarkdownView);
        if (activeView?.file?.path === filePath) return activeView;

        // Search all markdown leaves
        const leaves = this.plugin.app.workspace.getLeavesOfType('markdown') as WorkspaceLeaf[];
        for (const leaf of leaves) {
            const view = leaf.view as MarkdownView;
            if (view.file?.path === filePath) return view;
        }
        return null;
    }

    private async fallbackPause(timer: ScannedTimer): Promise<number | undefined> {
        try {
            const file = this.plugin.app.vault.getAbstractFileByPath(timer.filePath) as TFile;
            if (!file) return undefined;
            const content = await this.plugin.app.vault.read(file);
            const lines = content.split('\n');
            const lineText = lines[timer.lineNum];
            const parsed = TimerParser.parse(lineText, 'auto');
            if (!parsed || parsed.class !== 'timer-r') return undefined;

            const newData = TimerDataUpdater.calculate('pause', parsed);
            const { TimerRenderer } = await import('../io/TimerRenderer');
            const newSpan = TimerRenderer.render(newData, this.plugin.settings);
            lines[timer.lineNum] = lineText.slice(0, parsed.beforeIndex!) + newSpan + lineText.slice(parsed.afterIndex!);
            await this.plugin.app.vault.modify(file, lines.join('\n'));
            return newData.dur;
        } catch (e) {
            new Notice('⚠️ Failed to pause timer');
            return undefined;
        }
    }

    private async fallbackContinue(timer: ScannedTimer): Promise<void> {
        try {
            const file = this.plugin.app.vault.getAbstractFileByPath(timer.filePath) as TFile;
            if (!file) return;
            const content = await this.plugin.app.vault.read(file);
            const lines = content.split('\n');
            const lineText = lines[timer.lineNum];
            const parsed = TimerParser.parse(lineText, 'auto');
            if (!parsed || parsed.class !== 'timer-p') return;

            const newData = TimerDataUpdater.calculate('continue', parsed);
            const { TimerRenderer } = await import('../io/TimerRenderer');
            const newSpan = TimerRenderer.render(newData, this.plugin.settings);
            lines[timer.lineNum] = lineText.slice(0, parsed.beforeIndex!) + newSpan + lineText.slice(parsed.afterIndex!);
            await this.plugin.app.vault.modify(file, lines.join('\n'));
        } catch (e) {
            new Notice('⚠️ Failed to continue timer');
        }
    }
}
