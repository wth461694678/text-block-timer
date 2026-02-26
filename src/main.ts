import { Plugin, Notice, FileView, TFile, WorkspaceLeaf } from 'obsidian';
import { EditorView } from '@codemirror/view';

import { TimerData, TimerDataUpdater } from './core/TimerDataUpdater';
import { TimerManager } from './core/TimerManager';
import { POTENTIAL_CHECKBOX_REGEX, CHECKBOX_REGEX, DEBUG } from './core/constants';
import { PerfMonitor } from './debug/PerfMonitor';
import { getTranslation } from './i18n/translations';
import { TimerFileManager } from './io/TimerFileManager';
import { TimerParser } from './io/TimerParser';
import { TimerSettings, TimerSettingTab } from './ui/TimerSettingTab';
import { TimePickerModal } from './ui/TimePickerModal';
import { timerFoldingField, timerWidgetKeymap, timerCursorEscape } from './ui/TimerWidget';
import { TimerDatabase } from './core/TimerDatabase';
import { TimerScanner } from './core/TimerScanner';
import { TimerSidebarView, TIMER_SIDEBAR_VIEW_TYPE } from './ui/TimerSidebarView';
import { TimeFormatter } from './io/TimeFormatter';

// —�?Main plugin class —�?//
export default class TimerPlugin extends Plugin {
    manager!: TimerManager;
    fileManager!: TimerFileManager;
    settings!: TimerSettings;
    fileFirstOpen = true;
    database!: TimerDatabase;
    scanner!: TimerScanner;
    statusBarItem!: HTMLElement;

    readonly default_settings: TimerSettings = {
        autoStopTimers: 'quit',
        timerInsertLocation: 'head',
        enableCheckboxToTimer: true,
        runningCheckboxState: '/',
        pausedCheckboxState: '-xX',
        checkboxToTimerPathRestriction: 'disable',
        pathRestrictionPaths: [],
        checkboxPathGroups: [],
        runningIcon: '⏱',
        pausedIcon: '💐',
        timeDisplayFormat: 'full',
        timerDisplayStyle: 'badge',
        runningTextColor: '#10b981',
        runningBgColor: 'rgba(16, 185, 129, 0.15)',
        pausedTextColor: '#6b7280',
        pausedBgColor: 'rgba(107, 114, 128, 0.12)',
        showStatusBar: true,
        statusBarMode: 'max' as 'max' | 'total',
        sidebarDefaultScope: 'open-tabs',
        sidebarDefaultFilter: 'all',
        sidebarDefaultSort: 'status',
        autoRefreshSidebar: true,
        sidebarTabPosition: 4,
        timerFileGroups: []
    };

    async onload() {
        PerfMonitor.initGlobalMonitor();
        const perf = (window as any).__PerfMonitor as PerfMonitor;
        perf.clearStartupMarks();
        perf.startupMark('onload start');

        this.manager = new TimerManager();
        this.fileFirstOpen = true;

        await this.loadSettings();
        perf.startupMark('loadSettings done');

        this.applyDisplayStyle();
        perf.startupMark('applyDisplayStyle done');

        this.fileManager = new TimerFileManager(this.app, this.settings);
        perf.startupMark('TimerFileManager created');

        // Initialize database and scanner
        this.database = new TimerDatabase(this);
        await this.database.load();
        perf.startupMark('database.load() done');

        await this.database.recoverCrashedSessions();
        perf.startupMark('recoverCrashedSessions done');

        this.scanner = new TimerScanner(this.app, this.manager);
        perf.startupMark('TimerScanner created');

        // Register sidebar view
        this.registerView(TIMER_SIDEBAR_VIEW_TYPE, (leaf) => new TimerSidebarView(leaf, this));

        // Ribbon icon to open sidebar
        this.addRibbonIcon('clock', 'Timer Sidebar', () => this.openSidebar());
        // Auto-open sidebar on first load (restore persisted leaf)
        this.app.workspace.onLayoutReady(() => {
            perf.startupMark('onLayoutReady fired');
            const existing = this.app.workspace.getLeavesOfType(TIMER_SIDEBAR_VIEW_TYPE);
            if (existing.length === 0) {
                // First install: open sidebar automatically
                this.openSidebar().then(() => {
                    perf.startupMark('openSidebar done');
                    perf.startupReport();
                });
            } else {
                // Already exists (restored from layout): ensure it's at the configured position
                const leaf = existing[0];
                this.moveSidebarLeafToPosition(leaf);
                perf.startupMark('moveSidebarLeafToPosition done');
                perf.startupReport();
            }
        });

        // Add to editor context menu
        this.registerEvent(
            this.app.workspace.on('editor-menu', this.onEditorMenu.bind(this))
        );

        // Register "Toggle timer" command
        this.addCommand({
            id: 'toggle-timer',
            icon: 'timer',
            name: getTranslation('command_name').toggle,
            editorCallback: (editor, view) => {
                const cursor = editor.getCursor();
                const lineNum = cursor.line;
                const lineText = editor.getLine(lineNum);
                const parsed = TimerParser.parse(lineText, 'auto');

                if (parsed) {
                    if (parsed.class === 'timer-r') {
                        this.handlePause(view, lineNum, parsed);
                    } else if (parsed.class === 'timer-p') {
                        this.handleContinue(view, lineNum, parsed);
                    }
                } else {
                    this.handleStart(view, lineNum, null);
                }
            },
        });

        // Register "Delete timer" command
        this.addCommand({
            id: 'delete-timer',
            icon: 'timer-off',
            name: getTranslation('command_name').delete,
            editorCallback: (editor, view) => {
                const cursor = editor.getCursor();
                const lineNum = cursor.line;
                const lineText = editor.getLine(lineNum);
                const parsed = TimerParser.parse(lineText, 'auto');
                this.handleDelete(view, lineNum, parsed);
            },
        });

        // Register "Time Adjustment" command
        this.addCommand({
            id: 'time-adjustment',
            icon: 'clock',
            name: getTranslation('command_name').timeAdjust,
            editorCallback: (editor, view) => {
                const cursor = editor.getCursor();
                const lineNum = cursor.line;
                const lineText = editor.getLine(lineNum);
                const parsed = TimerParser.parse(lineText, 'auto');

                if (parsed && parsed.class === 'timer-p') {
                    const backfillLang = getTranslation('timeBackfill');
                    const modal = new TimePickerModal(
                        this.app,
                        parsed.dur,
                        backfillLang,
                        (newDur) => this.handleSetDuration(view, lineNum, parsed, newDur)
                    );
                    modal.open();
                } else {
                    new Notice(getTranslation('timeBackfill').disabledTip);
                }
            },
        });

        perf.startupMark('all events registered');

        // Listen to file open event
        this.registerEvent(
            this.app.workspace.on('file-open', this.onFileOpen.bind(this))
        );

        // Sidebar: layout-change and active-leaf-change
        this.registerEvent(
            this.app.workspace.on('layout-change', () => {
                const view = this.getSidebarView();
                if (view instanceof TimerSidebarView) view.onLayoutChange();
            })
        );
        this.registerEvent(
            this.app.workspace.on('active-leaf-change', (leaf: WorkspaceLeaf | null) => {
                const view = this.getSidebarView();
                if (view instanceof TimerSidebarView) view.onActiveLeafChange(leaf);
            })
        );

        // File delete/rename events (T22)
        this.registerEvent(
            this.app.vault.on('delete', (file) => {
                if (file instanceof TFile) {
                    this.database.removeFile(file.path);
                }
            })
        );
        this.registerEvent(
            this.app.vault.on('rename', (file, oldPath) => {
                if (file instanceof TFile) {
                    this.database.renameFile(oldPath, file.path);
                }
            })
        );

        // Register settings
        this.addSettingTab(new TimerSettingTab(this.app, this));

        // Status bar (T17)
        this.initStatusBar();

        // Register timer folding decoration + cursor escape
        this.registerEditorExtension([
            timerFoldingField,
            timerWidgetKeymap,
            timerCursorEscape
        ]);

        // Checkbox to timer listener
        this.registerEditorExtension(
            EditorView.updateListener.of((update) => {
                if (update.docChanged && this.settings.enableCheckboxToTimer && this.checkPathRestriction()) {
                    const view = this.app.workspace.getActiveViewOfType(FileView);
                    const oldDoc = update.startState.doc;
                    const newDoc = update.state.doc;

                    update.changes.iterChanges((oldFrom, oldTo, newFrom, newTo, _inserted) => {
                        const oldStartLine = oldDoc.lineAt(oldFrom).number;
                        const oldEndLine = oldDoc.lineAt(oldTo).number;
                        const newStartLine = newDoc.lineAt(newFrom).number;
                        const newEndLine = newDoc.lineAt(newTo).number;

                        if (Math.max(oldStartLine, oldEndLine, newStartLine, newEndLine) !== Math.min(oldStartLine, oldEndLine, newStartLine, newEndLine)) return;
                        const lineNum = newStartLine - 1;

                        const oldLineText = oldDoc.lineAt(oldFrom).text;
                        const newLineText = newDoc.lineAt(newFrom).text;

                        if (!POTENTIAL_CHECKBOX_REGEX.test(oldLineText) || !CHECKBOX_REGEX.test(newLineText)) return;

                        const oldCheckboxState = oldLineText.match(POTENTIAL_CHECKBOX_REGEX)![2];
                        const newCheckboxState = newLineText.match(CHECKBOX_REGEX)![2];

                        if (oldCheckboxState !== newCheckboxState) {
                            this.toggleTimerbyCheckboxState(oldCheckboxState, newCheckboxState, newLineText, view, lineNum);
                        }
                    });
                }
            })
        );

        this.registerDomEvent(document, 'pointerdown', (e) => {
            if ((e.target as HTMLElement).classList.contains('task-list-item-checkbox')) {
                if (this.settings.enableCheckboxToTimer && this.checkPathRestriction()) {
                    const view = this.app.workspace.getActiveViewOfType(FileView);
                    if (!view) return;
                    if ((view as any).getMode() !== 'preview') return;

                    const file = (view as any).file;
                    const beforeLines = (view as any).data.split('\n');

                    const handlePointerUp = () => {
                        if (DEBUG) console.log('pointerup');
                        document.removeEventListener('pointerup', handlePointerUp);

                        let count = 0;
                        const max = 10;
                        const id = setInterval(async () => {
                            count++;
                            const content = await this.app.vault.read(file);
                            const afterLines = content.split('\n');

                            let found = false;
                            for (let lineNum = 0; lineNum < beforeLines.length; lineNum++) {
                                const oldLineText = beforeLines[lineNum];
                                const newLineText = afterLines[lineNum];
                                if (oldLineText === newLineText) continue;
                                if (!CHECKBOX_REGEX.test(oldLineText) || !CHECKBOX_REGEX.test(newLineText)) continue;
                                const oldCheckboxState = oldLineText.match(CHECKBOX_REGEX)![2];
                                const newCheckboxState = newLineText.match(CHECKBOX_REGEX)![2];
                                if (oldCheckboxState !== newCheckboxState) {
                                    if (DEBUG) {
                                        console.log(`�?${lineNum} 行发生变化`);
                                        console.log('变化前：' + beforeLines[lineNum]);
                                        console.log('变化后：' + afterLines[lineNum]);
                                    }
                                    this.toggleTimerbyCheckboxState(oldCheckboxState, newCheckboxState, newLineText, view, lineNum);
                                    found = true;
                                }
                            }
                            if (found) {
                                if (DEBUG) console.log('找到变化');
                                clearInterval(id);
                            }
                            if (count === max) {
                                if (DEBUG) console.log('次数达到上限，未找到变化，停止监控');
                                clearInterval(id);
                            }
                        }, 100);
                    };

                    document.addEventListener('pointerup', handlePointerUp);
                }
            }
        });
    }

    onunload() {
        // T18: Sync-report plugin_unload sessions before clearing
        const runningTimers = this.manager.getAllTimers();
        runningTimers.forEach((data, timerId) => {
            if (data.class === 'timer-r') {
                this.database.appendSessionSync(timerId, 'plugin_unload');
                this.database.updateEntrySync(timerId, {
                    state: 'paused',
                    last_ts: Math.floor(Date.now() / 1000)
                });
            }
        });
        this.database.flushSync();

        this.manager.clearAll();
        this.fileManager.clearLocations();
        document.body.classList.remove('timer-style-badge', 'timer-style-plain');
        const root = document.documentElement;
        [
            '--timer-running-color', '--timer-running-bg', '--timer-running-border',
            '--timer-running-bg-hover', '--timer-running-border-hover',
            '--timer-paused-color', '--timer-paused-bg', '--timer-paused-border',
            '--timer-paused-bg-hover', '--timer-paused-border-hover'
        ].forEach(prop => root.style.removeProperty(prop));
    }

    onEditorMenu(menu: any, editor: any, view: any) {
        const cursor = editor.getCursor();
        const lineNum = cursor.line;
        const lineText = editor.getLine(lineNum);
        const parsed = TimerParser.parse(lineText, 'auto');
        const className = parsed ? parsed.class : null;

        menu.addSeparator();

        if (className === 'timer-r') {
            menu.addItem((item: any) =>
                item.setTitle(getTranslation('action_paused')).setIcon('pause').onClick(() => this.handlePause(view, lineNum, parsed))
            );
        } else if (className === 'timer-p') {
            menu.addItem((item: any) =>
                item.setTitle(getTranslation('action_continue')).setIcon('play').onClick(() => this.handleContinue(view, lineNum, parsed))
            );
        } else {
            menu.addItem((item: any) =>
                item.setTitle(getTranslation('action_start')).setIcon('play').onClick(() => this.handleStart(view, lineNum, null))
            );
        }

        if (parsed && parsed.timerId) {
            menu.addItem((item: any) =>
                item.setTitle(getTranslation('command_name').delete).setIcon('trash').onClick(() => this.handleDelete(view, lineNum, parsed))
            );
        }

        const backfillLang = getTranslation('timeBackfill');
        const isPaused = className === 'timer-p';

        menu.addItem((item: any) => {
            item.setTitle(backfillLang.menu).setIcon('clock');
            if (isPaused) {
                item.onClick(() => {
                    const modal = new TimePickerModal(
                        this.app,
                        parsed!.dur,
                        backfillLang,
                        (newDur) => this.handleSetDuration(view, lineNum, parsed!, newDur)
                    );
                    modal.open();
                });
            } else {
                item.setDisabled(true);
                item.dom.addClass('timer-menu-disabled');
                let tipEl: HTMLElement | null = null;
                let tipTimer: ReturnType<typeof setTimeout> | null = null;
                item.dom.addEventListener('mouseenter', () => {
                    tipTimer = setTimeout(() => {
                        tipEl = document.createElement('div');
                        tipEl.className = 'timer-menu-tooltip';
                        tipEl.textContent = backfillLang.disabledTip;
                        document.body.appendChild(tipEl);
                        const rect = item.dom.getBoundingClientRect();
                        tipEl.style.top = `${rect.top - tipEl.offsetHeight - 4}px`;
                        tipEl.style.left = `${rect.left + rect.width / 2 - tipEl.offsetWidth / 2}px`;
                    }, 100);
                });
                item.dom.addEventListener('mouseleave', () => {
                    if (tipTimer) clearTimeout(tipTimer);
                    if (tipEl) { tipEl.remove(); tipEl = null; }
                });
            }
        });
    }

    checkPathRestriction(): boolean {
        const currentFile = this.app.workspace.getActiveFile();
        if (!currentFile) return false;
        const filePath = currentFile.path;

        // ── New: file-group based path control ──────────────────────────────
        const groups: import('./core/TimerFileGroupFilter').TimerFileGroup[] =
            this.settings.checkboxPathGroups ?? [];

        // Migrate legacy settings on first use: convert old whitelist/blacklist
        // to a single group. Old patterns without /.../ wrapping are treated as
        // regex (legacy behavior was plain prefix, but user request says default
        // to regex for migrated entries).
        if (groups.length === 0) {
            const restriction = this.settings.checkboxToTimerPathRestriction;
            const paths: string[] = this.settings.pathRestrictionPaths ?? [];
            if (restriction !== 'disable' && paths.length > 0) {
                // Wrap bare strings as regex patterns for backward compat
                const wrapAsRegex = (p: string) =>
                    (p.startsWith('/') && p.endsWith('/')) ? p : `/${p}/`;
                const migratedGroup: import('./core/TimerFileGroupFilter').TimerFileGroup = {
                    id: crypto.randomUUID(),
                    name: 'Migrated',
                    whitelist: restriction === 'whitelist' ? paths.map(wrapAsRegex) : [],
                    blacklist: restriction === 'blacklist' ? paths.map(wrapAsRegex) : [],
                };
                this.settings.checkboxPathGroups = [migratedGroup];
                // Clear legacy fields
                this.settings.checkboxToTimerPathRestriction = 'disable';
                this.settings.pathRestrictionPaths = [];
                this.saveSettings();
                // Use migrated group for this check
                return this.checkFileAgainstGroups(filePath, [migratedGroup]);
            }
            // No groups and no legacy config → apply to all files
            return true;
        }

        return this.checkFileAgainstGroups(filePath, groups);
    }

    private checkFileAgainstGroups(
        filePath: string,
        groups: import('./core/TimerFileGroupFilter').TimerFileGroup[]
    ): boolean {
        // File must match at least one group
        return groups.some(group => {
            // Blacklist takes priority
            if (group.blacklist.some(p => this.matchesPattern(filePath, p))) return false;
            // Empty whitelist = match all
            if (group.whitelist.length === 0) return true;
            return group.whitelist.some(p => this.matchesPattern(filePath, p));
        });
    }

    private matchesPattern(path: string, pattern: string): boolean {
        const regexMatch = pattern.match(/^\/(.+)\/([gimsuy]*)$/);
        if (regexMatch) {
            try {
                const re = new RegExp(regexMatch[1], regexMatch[2]);
                return re.test(path);
            } catch {
                return path.startsWith(pattern);
            }
        }
        // Plain text: if no explicit extension, treat as folder (append /)
        let normalizedPattern = pattern;
        if (!normalizedPattern.endsWith('/')) {
            const lastSegment = normalizedPattern.split('/').pop() ?? '';
            if (!lastSegment.includes('.')) {
                normalizedPattern = normalizedPattern + '/';
            }
        }
        return path.startsWith(normalizedPattern);
    }

    handleStart(view: any, lineNum: number, _parsedData: TimerData | null) {
        const initialData = TimerDataUpdater.calculate('init', {});
        const timerId = initialData.timerId;
        const file = view.file;

        // Read current line text (before writing timer span) as context
        const rawLineText = view.editor?.getLine?.(lineNum) ?? '';

        this.manager.startTimer(timerId, initialData, this.onTick.bind(this));
        this.fileManager.locations.set(timerId, { view, file, lineNum });
        this.fileManager.writeTimer(timerId, initialData, view, file, lineNum, null);

        // T16: Sync to database
        const now = Math.floor(Date.now() / 1000);
        this.database.updateEntry(timerId, {
            timer_id: timerId,
            file_path: file?.path ?? '',
            line_num: lineNum,
            line_text: rawLineText,
            project: null,
            state: 'running',
            total_dur_sec: 0,
            last_ts: now,
            created_at: now,
            updated_at: now
        });
        this.database.recordSessionStart(timerId);

        // Immediately sync UI
        this.updateStatusBar();
        this.notifySidebarTimerAdded({
            timerId,
            filePath: file?.path ?? '',
            lineNum,
            lineText: rawLineText,
            state: 'timer-r',
            dur: 0,
            ts: now,
            project: null
        });
    }

    handleContinue(view: any, lineNum: number, parsedData: TimerData | null) {
        if (!parsedData || !parsedData.timerId) return;

        const timerId = parsedData.timerId;
        const currentData = this.manager.getTimerData(timerId) || parsedData;
        const newData = TimerDataUpdater.calculate('continue', currentData);
        const file = view.file;

        // Read current line text as context
        const rawLineText = view.editor?.getLine?.(lineNum) ?? '';

        this.manager.startTimer(timerId, newData, this.onTick.bind(this));
        this.fileManager.locations.set(timerId, { view, file, lineNum });
        this.fileManager.writeTimer(timerId, newData, view, view.file, lineNum, parsedData);

        // T16: Sync to database
        const now = Math.floor(Date.now() / 1000);
        this.database.updateEntry(timerId, {
            state: 'running',
            last_ts: now,
            file_path: file?.path ?? '',
            line_num: lineNum,
            line_text: rawLineText
        });
        this.database.recordSessionStart(timerId);

        // Immediately sync UI
        this.updateStatusBar();
        this.notifySidebarStateChanged(timerId, 'timer-r');
    }

    handlePause(view: any, lineNum: number, parsedData: TimerData | null) {
        if (!parsedData || !parsedData.timerId) return;

        const timerId = parsedData.timerId;
        const currentData = this.manager.getTimerData(timerId) || parsedData;
        const newData = TimerDataUpdater.calculate('pause', currentData);

        // Read current line text as context
        const rawLineText = view.editor?.getLine?.(lineNum) ?? '';

        this.manager.stopTimer(timerId);
        this.fileManager.writeTimer(timerId, newData, view, view.file, lineNum, parsedData);

        // T16: Sync to database
        const now = Math.floor(Date.now() / 1000);
        const startTs = (this.database as any).sessionStartTs?.get(timerId) ?? now;
        const duration = Math.max(0, now - startTs);
        this.database.updateEntry(timerId, {
            state: 'paused',
            total_dur_sec: newData.dur,
            last_ts: now,
            file_path: view.file?.path ?? '',
            line_num: lineNum,
            line_text: rawLineText
        });
        this.database.appendSession({
            session_id: crypto.randomUUID(),
            timer_id: timerId,
            stat_date: new Date().toLocaleDateString('sv'),
            duration_sec: duration,
            end_reason: 'paused',
            reported_at: now
        });
        this.database.clearSessionStart(timerId);

        // Immediately sync UI
        this.updateStatusBar();
        this.notifySidebarStateChanged(timerId, 'timer-p');
    }

    handleDelete(view: any, lineNum: number, parsedData: TimerData | null) {
        if (!parsedData || !parsedData.timerId) return;
        const timerId = parsedData.timerId;

        // T16: Sync to database
        const now = Math.floor(Date.now() / 1000);
        const wasRunning = parsedData.class === 'timer-r';
        this.database.updateEntry(timerId, { state: 'deleted', last_ts: now });
        if (wasRunning) {
            const startTs = (this.database as any).sessionStartTs?.get(timerId) ?? now;
            this.database.appendSession({
                session_id: crypto.randomUUID(),
                timer_id: timerId,
                stat_date: new Date().toLocaleDateString('sv'),
                duration_sec: Math.max(0, now - startTs),
                end_reason: 'deleted',
                reported_at: now
            });
            this.database.clearSessionStart(timerId);
        }

        this.manager.stopTimer(timerId);
        this.fileManager.locations.delete(timerId);

        // Immediately sync UI
        this.updateStatusBar();
        this.notifySidebarTimerRemoved(timerId);

        if (view.getMode() === 'source') {
            const editor = view.editor;
            const lineText = editor.getLine(lineNum);
            let delFrom = parsedData.beforeIndex!;
            let delTo = parsedData.afterIndex!;

            const charBefore = delFrom > 0 ? lineText[delFrom - 1] : null;
            const charAfter = delTo < lineText.length ? lineText[delTo] : null;
            if (charBefore === ' ' && charAfter === ' ') {
                delTo += 1;
            } else if (charBefore === ' ' && delTo >= lineText.length) {
                delFrom -= 1;
            } else if (delFrom === 0 && charAfter === ' ') {
                delTo += 1;
            }

            editor.replaceRange('', { line: lineNum, ch: delFrom }, { line: lineNum, ch: delTo });
        }
    }

    handleRestore(view: any, lineNum: number, parsedData: TimerData | null) {
        if (!parsedData || !parsedData.timerId) return;
        const timerId = parsedData.timerId;
        const newData = TimerDataUpdater.calculate('restore', parsedData);
        const file = view.file;

        this.manager.startTimer(timerId, newData, this.onTick.bind(this));
        this.fileManager.locations.set(timerId, { view, file, lineNum });
        this.fileManager.writeTimer(timerId, newData, view, file, lineNum, parsedData);
    }

    handleForcePause(view: any, lineNum: number, parsedData: TimerData | null) {
        if (!parsedData || !parsedData.timerId) return;
        const timerId = parsedData.timerId;
        const newData = TimerDataUpdater.calculate('forcepause', parsedData);
        this.fileManager.writeTimer(timerId, newData, view, view.file, lineNum, parsedData);
    }

    handleSetDuration(view: any, lineNum: number, parsedData: TimerData, newDur: number) {
        if (!parsedData || !parsedData.timerId) return;
        if (parsedData.class !== 'timer-p') return;

        const timerId = parsedData.timerId;
        const newData = TimerDataUpdater.calculate('setDuration', { ...parsedData, newDur });
        this.fileManager.writeTimer(timerId, newData, view, view.file, lineNum, parsedData);

        // Sync database
        this.database.updateEntry(timerId, {
            total_dur_sec: newData.dur,
            last_ts: Math.floor(Date.now() / 1000)
        });

        // Immediately sync UI
        this.updateStatusBar();
        this.notifySidebarDurChanged(timerId, newData.dur);
    }

    async onTick(timerId: string) {
        if (this.manager.shouldSkipTick()) {
            if (DEBUG) console.log(`页面后台超过1分钟，跳过 onTick: ${timerId}`);
            return;
        }

        if (this.manager.runningTicks.has(timerId)) {
            if (DEBUG) console.log(`跳过重叠的 onTick: ${timerId}`);
            return;
        }

        this.manager.runningTicks.add(timerId);

        try {
            const oldData = this.manager.getTimerData(timerId);
            if (!oldData || oldData.class !== 'timer-r') return;

            const newData = TimerDataUpdater.calculate('update', oldData);
            this.manager.updateTimerData(timerId, newData);

            // updateTimerByIdWithSearch now returns { ok, lineText }
            // lineText is the raw line content already read during the tick — zero extra I/O
            const result = await this.fileManager.updateTimerByIdWithSearch(timerId, newData);
            if (!result.ok) {
                this.manager.stopTimer(timerId);
            }

            // Update last_ts in memory only (no flush) — used for crash recovery calculation.
            // line_text / line_num / file_path are updated on state changes (pause/continue/start),
            // so we don't need to persist them every second.
            this.database.updateEntryInMemory(timerId, {
                last_ts: Math.floor(Date.now() / 1000)
            });

            // Patch sidebar card text in-place (no full re-render)
            if (result.lineText !== null) {
                this.notifySidebarLineTextChanged(timerId, result.lineText);
            }

            // T16: Day boundary check (must await)
            await this.database.checkDayBoundary(timerId);

            // T12: Refresh sidebar duration display
            if (this.settings.autoRefreshSidebar !== false) {
                this.refreshSidebar();
            }

            // T17: Update status bar
            this.updateStatusBar();
        } finally {
            this.manager.runningTicks.delete(timerId);
        }
    }

    async onFileOpen(event: TFile | null) {
        if (event) {
            const t0 = Date.now();
            await this.fileManager.upgradeOldTimers(event);
            const perf = (window as any).__PerfMonitor as PerfMonitor | undefined;
            perf?.startupMark?.(`upgradeOldTimers(${event.path}) done [${Date.now() - t0}ms]`);
        }

        if (this.fileFirstOpen) {
            const t1 = Date.now();
            const leaves = this.app.workspace.getLeavesOfType('markdown');
            for (const leaf of leaves) {
                if ((leaf.view as any).editor) {
                    this.restoreTimers(leaf.view);
                }
            }
            const perf = (window as any).__PerfMonitor as PerfMonitor | undefined;
            perf?.startupMark?.(`restoreTimers (first open, ${leaves.length} leaves) done [${Date.now() - t1}ms]`);
            this.fileFirstOpen = false;
        } else {
            const leaves = this.app.workspace.getLeavesOfType('markdown');
            for (const leaf of leaves) {
                if ((leaf.view as any).editor && (leaf.view as any).file === event) {
                    const editor = (leaf.view as any).editor;
                    const checkInterval = setInterval(() => {
                        const lineCount = editor.lineCount();
                        if (lineCount > 1) {
                            this.restoreTimers(leaf.view);
                            clearInterval(checkInterval);
                        }
                    }, 100);
                }
            }
        }
    }

    restoreTimers(view: any) {
        const editor = view.editor;
        const lineCount = editor.lineCount();

        for (let i = 0; i < lineCount; i++) {
            const lineText = editor.getLine(i);
            const parsed = TimerParser.parse(lineText, 'auto');
            if (parsed && parsed.class === 'timer-r') {
                if (this.settings.autoStopTimers === 'never') {
                    this.handleRestore(view, i, parsed);
                } else if (this.settings.autoStopTimers === 'quit') {
                    if (this.manager.isStartedInThisSession(parsed.timerId)) {
                        this.handleRestore(view, i, parsed);
                    } else {
                        this.handleForcePause(view, i, parsed);
                    }
                } else if (this.settings.autoStopTimers === 'close') {
                    this.handleForcePause(view, i, parsed);
                }
            }
        }
    }

    // ===== Sidebar helpers =====

    private getSidebarView(): TimerSidebarView | null {
        const leaves = this.app.workspace.getLeavesOfType(TIMER_SIDEBAR_VIEW_TYPE);
        if (leaves.length === 0) return null;
        const view = leaves[0].view;
        if (view instanceof TimerSidebarView) return view;
        return null;
    }

    async openSidebar(): Promise<void> {
        const existing = this.app.workspace.getLeavesOfType(TIMER_SIDEBAR_VIEW_TYPE);
        if (existing.length > 0) {
            this.app.workspace.revealLeaf(existing[0]);
            return;
        }
        // Try right sidebar first, fall back to creating a new leaf
        const leaf = this.app.workspace.getRightLeaf(false) ?? this.app.workspace.getLeaf('tab');
        await leaf.setViewState({ type: TIMER_SIDEBAR_VIEW_TYPE, active: true });
        // Move sidebar leaf to the configured position in its tab group
        this.moveSidebarLeafToPosition(leaf);
        this.app.workspace.revealLeaf(leaf);
    }

    private moveSidebarLeafToPosition(leaf: WorkspaceLeaf): void {
        const targetIndex = Math.max(0, (this.settings.sidebarTabPosition ?? 4) - 1);
        const parent = (leaf as any).parent;
        if (parent && Array.isArray(parent.children)) {
            const idx = parent.children.indexOf(leaf);
            if (idx !== targetIndex) {
                parent.children.splice(idx, 1);
                const insertAt = Math.min(targetIndex, parent.children.length);
                parent.children.splice(insertAt, 0, leaf);
                parent.recomputeChildrenDimensions?.();
            }
        }
    }

    refreshSidebar(): void {
        const view = this.getSidebarView();
        if (view) view.refreshRunningTimers();
    }

    /** Notify sidebar that a timer's running/paused state changed. */
    notifySidebarStateChanged(timerId: string, newState: 'timer-r' | 'timer-p'): void {
        const view = this.getSidebarView();
        if (!view) return;
        view.onTimerStateChanged(timerId, newState);
    }

    /** Notify sidebar that a new timer was added. */
    notifySidebarTimerAdded(timer: import('./core/TimerScanner').ScannedTimer): void {
        const view = this.getSidebarView();
        if (!view) return;
        view.onTimerAdded(timer);
    }

    /** Notify sidebar that a timer was deleted. */
    notifySidebarTimerRemoved(timerId: string): void {
        const view = this.getSidebarView();
        if (!view) return;
        view.onTimerRemoved(timerId);
    }

    /** Notify sidebar that a paused timer's duration was manually adjusted. */
    notifySidebarDurChanged(timerId: string, newDur: number): void {
        const view = this.getSidebarView();
        if (!view) return;
        view.onTimerDurChanged(timerId, newDur);
    }

    /** Notify sidebar to patch the line text of a running timer card in-place (called every tick). */
    notifySidebarLineTextChanged(timerId: string, lineText: string): void {
        const view = this.getSidebarView();
        if (!view) return;
        view.onTimerLineTextChanged(timerId, lineText);
    }

    /** Notify sidebar that settings (e.g. file groups) changed — re-render toolbar immediately. */
    notifySidebarSettingsChanged(): void {
        const view = this.getSidebarView();
        if (!view) return;
        view.onSettingsChanged();
    }

    // ===== Status bar (T17) =====

    initStatusBar(): void {
        this.statusBarItem = this.addStatusBarItem();
        this.statusBarItem.style.display = 'none';
        this.statusBarItem.style.cursor = 'pointer';
        this.statusBarItem.title = 'Open Timer Sidebar';
        this.statusBarItem.addEventListener('click', () => this.openSidebar());
        if (this.settings.showStatusBar === false) return;
        this.updateStatusBar();
    }

    updateStatusBar(): void {
        if (!this.statusBarItem) return;
        if (this.settings.showStatusBar === false) {
            this.statusBarItem.style.display = 'none';
            return;
        }
        const runningTimers = this.manager.getAllTimers();
        let totalSec = 0;
        let maxSec = 0;
        let runningCount = 0;
        runningTimers.forEach((data) => {
            if (data.class === 'timer-r') {
                totalSec += data.dur;
                if (data.dur > maxSec) maxSec = data.dur;
                runningCount++;
            }
        });
        this.statusBarItem.style.display = '';
        const sbLang = getTranslation('settings').statusBar;
        if (runningCount === 0) {
            const pausedIcon = this.settings?.pausedIcon || '💐';
            this.statusBarItem.textContent = `${pausedIcon} ${sbLang.noRunning}`;
        } else {
            const icon = this.settings?.runningIcon || '⏱';
            const mode = this.settings?.statusBarMode ?? 'max';
            const displaySec = mode === 'total' ? totalSec : maxSec;
            this.statusBarItem.textContent = `${icon} ${runningCount} ${sbLang.running} · ${TimeFormatter.formatTime(displaySec, 'full')}`;
        }
    }

    async loadSettings() {
        this.settings = Object.assign({}, this.default_settings, await this.loadData());
    }

    async saveSettings() {
        await this.saveData(this.settings);
        if (this.fileManager) {
            this.fileManager.settings = this.settings;
        }
    }

    applyDisplayStyle() {
        const style = this.settings.timerDisplayStyle || 'badge';
        document.body.classList.remove('timer-style-badge', 'timer-style-plain');
        document.body.classList.add(`timer-style-${style}`);
        this.applyTimerColors();
    }

    hexToRgba(hex: string, alpha: number): string {
        const r = parseInt(hex.slice(1, 3), 16);
        const g = parseInt(hex.slice(3, 5), 16);
        const b = parseInt(hex.slice(5, 7), 16);
        return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    }

    applyTimerColors() {
        const root = document.documentElement;
        const s = this.settings;

        const runningColor = s.runningTextColor || '#10b981';
        const runningBg = s.runningBgColor || 'rgba(16, 185, 129, 0.15)';
        root.style.setProperty('--timer-running-color', runningColor);
        root.style.setProperty('--timer-running-bg', runningBg);

        const runningBgMatch = runningBg.match(/rgba?\((\d+),\s*(\d+),\s*(\d+),?\s*([\d.]*)\)/);
        if (runningBgMatch) {
            const [, rr, rg, rb, ra] = runningBgMatch;
            const baseAlpha = parseFloat(ra) || 0.15;
            root.style.setProperty('--timer-running-border', `rgba(${rr}, ${rg}, ${rb}, ${Math.min(baseAlpha + 0.15, 1)})`);
            root.style.setProperty('--timer-running-bg-hover', `rgba(${rr}, ${rg}, ${rb}, ${Math.min(baseAlpha + 0.1, 1)})`);
            root.style.setProperty('--timer-running-border-hover', `rgba(${rr}, ${rg}, ${rb}, ${Math.min(baseAlpha + 0.35, 1)})`);
        }

        const pausedColor = s.pausedTextColor || '#6b7280';
        const pausedBg = s.pausedBgColor || 'rgba(107, 114, 128, 0.12)';
        root.style.setProperty('--timer-paused-color', pausedColor);
        root.style.setProperty('--timer-paused-bg', pausedBg);

        const pausedBgMatch = pausedBg.match(/rgba?\((\d+),\s*(\d+),\s*(\d+),?\s*([\d.]*)\)/);
        if (pausedBgMatch) {
            const [, pr, pg, pb, pa] = pausedBgMatch;
            const baseAlpha = parseFloat(pa) || 0.12;
            root.style.setProperty('--timer-paused-border', `rgba(${pr}, ${pg}, ${pb}, ${Math.min(baseAlpha + 0.13, 1)})`);
            root.style.setProperty('--timer-paused-bg-hover', `rgba(${pr}, ${pg}, ${pb}, ${Math.min(baseAlpha + 0.08, 1)})`);
            root.style.setProperty('--timer-paused-border-hover', `rgba(${pr}, ${pg}, ${pb}, ${Math.min(baseAlpha + 0.28, 1)})`);
        }
    }

    toggleTimerbyCheckboxState(oldCheckboxState: string, newCheckboxState: string, newLineText: string, view: any, lineNum: number) {
        if (oldCheckboxState === '') oldCheckboxState = ' ';

        if (!this.settings.runningCheckboxState.includes(oldCheckboxState) && this.settings.runningCheckboxState.includes(newCheckboxState)) {
            const parsed = TimerParser.parse(newLineText, 'auto');
            if (!parsed) {
                this.handleStart(view, lineNum, null);
            } else if (parsed.class === 'timer-p') {
                this.handleContinue(view, lineNum, parsed);
            }
        }

        if (!this.settings.pausedCheckboxState.includes(oldCheckboxState) && this.settings.pausedCheckboxState.includes(newCheckboxState)) {
            const parsed = TimerParser.parse(newLineText, 'auto');
            if (parsed && parsed.class === 'timer-r') {
                this.handlePause(view, lineNum, parsed);
            }
        }
    }
}
