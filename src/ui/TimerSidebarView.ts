import { ItemView, MarkdownView, Notice, TFile, WorkspaceLeaf } from 'obsidian';
import { ScannedTimer } from '../core/TimerScanner';
import { TimerSummary } from '../core/TimerSummary';
import { TimerFileGroupFilter, TimerFileGroup } from '../core/TimerFileGroupFilter';
import { TimerEntry, TimerSort } from '../core/TimerDatabase';
import { TimeFormatter } from '../io/TimeFormatter';
import { TimerParser } from '../io/TimerParser';
import { TimerDataUpdater } from '../core/TimerDataUpdater';
import { getTranslation } from '../i18n/translations';

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
        const lastScan = db.getLastFullScan();
        const now = Date.now();
        const oneDayMs = 24 * 60 * 60 * 1000;

        // Use cached data if scanned within 24 hours
        if (db.exists() && lastScan && (now - new Date(lastScan).getTime()) < oneDayMs) {
            const entries = db.queryTimers({ state: ['running', 'paused'] }, this.currentSort);
            this.timerList = this.entriesToScannedTimers(entries);
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
            await db.rebuild(entries, []);
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

    // ===== Render =====

    render(): void {
        this.renderSummary();
        this.renderTimerList();
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

        // ── 分割线 ────────────────────────────────────────────────────────────────────────────────
        const divider = this.summaryEl.createEl('hr');
        divider.style.cssText = 'margin: 4px 0; border: none; border-top: 1px solid var(--background-modifier-border);';

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
    onTimerStateChanged(timerId: string, newState: 'timer-r' | 'timer-p'): void {
        const idx = this.timerList.findIndex(t => t.timerId === timerId);
        if (idx !== -1) {
            const updated: ScannedTimer = { ...this.timerList[idx], state: newState };
            // Always sync the latest dur and ts from manager on state change
            const memData = this.plugin.manager.getTimerData(timerId);
            if (memData) {
                updated.dur = memData.dur;
                updated.ts = Math.floor(Date.now() / 1000);
            }
            this.timerList[idx] = updated;
        }
        this.render();
    }

    /**
     * Called when a new timer is created (handleStart).
     * Adds it to the in-memory timerList immediately.
     */
    onTimerAdded(timer: ScannedTimer): void {
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
        this.timerList = this.timerList.filter(t => t.timerId !== timerId);
        this.render();
    }

    /**
     * Called when a paused timer's duration is manually adjusted (handleSetDuration).
     * Directly updates the in-memory dur so the card re-renders with the new value.
     */
    onTimerDurChanged(timerId: string, newDur: number): void {
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

    // ===== T12: Real-time refresh (called every tick) =====

    refreshRunningTimers(): void {
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
                new Notice('⚠️ File not found');
                return;
            }
            const leaf = this.plugin.app.workspace.getLeaf(false);
            await leaf.openFile(file);

            // Wait for editor to load then scroll to line
            setTimeout(() => {
                const view = this.plugin.app.workspace.getActiveViewOfType(MarkdownView);
                if (view?.editor) {
                    view.editor.setCursor({ line: timer.lineNum, ch: 0 });
                    view.editor.scrollIntoView(
                        { from: { line: timer.lineNum, ch: 0 }, to: { line: timer.lineNum, ch: 0 } },
                        true
                    );
                }
            }, 100);
        } catch {
            new Notice('⚠️ Failed to open file');
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
        await this.fallbackPause(timer);
        this.onTimerStateChanged(timer.timerId, 'timer-p');
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

    private async fallbackPause(timer: ScannedTimer): Promise<void> {
        try {
            const file = this.plugin.app.vault.getAbstractFileByPath(timer.filePath) as TFile;
            if (!file) return;
            const content = await this.plugin.app.vault.read(file);
            const lines = content.split('\n');
            const lineText = lines[timer.lineNum];
            const parsed = TimerParser.parse(lineText, 'auto');
            if (!parsed || parsed.class !== 'timer-r') return;

            const newData = TimerDataUpdater.calculate('pause', parsed);
            const { TimerRenderer } = await import('../io/TimerRenderer');
            const newSpan = TimerRenderer.render(newData, this.plugin.settings);
            lines[timer.lineNum] = lineText.slice(0, parsed.beforeIndex!) + newSpan + lineText.slice(parsed.afterIndex!);
            await this.plugin.app.vault.modify(file, lines.join('\n'));
        } catch (e) {
            new Notice('⚠️ Failed to pause timer');
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
