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
import { TimerIndexedDB, IDBTimerEntry } from './core/TimerIndexedDB';
import { TimerScanner } from './core/TimerScanner';
import { TimerSidebarView, TIMER_SIDEBAR_VIEW_TYPE } from './ui/TimerSidebarView';
import { TimeFormatter } from './io/TimeFormatter';

// ===== Module-level helper: lightweight regex-based timer ID extraction =====

/**
 * Extract timer IDs and their attributes from a text fragment using regex.
 * Lightweight — no DOM parsing, suitable for updateListener hot path.
 *
 * @param text - Raw text to scan for timer spans
 * @returns Map of timerId → { dur, ts, project }
 */
function extractTimerIdsFromText(text: string): Map<string, { dur: number; ts: number; project: string | null }> {
    const result = new Map<string, { dur: number; ts: number; project: string | null }>();
    const spanRegex = /<span\s+[^>]*class="timer-[rp]"[^>]*>/g;
    let match;
    while ((match = spanRegex.exec(text)) !== null) {
        const spanTag = match[0];
        const idMatch = spanTag.match(/\bid="([^"]+)"/);
        const durMatch = spanTag.match(/data-dur="([^"]+)"/);
        const tsMatch = spanTag.match(/data-ts="([^"]+)"/);
        const projMatch = spanTag.match(/data-project="([^"]+)"/);
        if (idMatch) {
            result.set(idMatch[1], {
                dur: durMatch ? parseInt(durMatch[1], 10) : 0,
                ts: tsMatch ? parseInt(tsMatch[1], 10) : 0,
                project: projMatch ? projMatch[1] : null
            });
        }
    }
    return result;
}

// — Main plugin class — //
export default class TimerPlugin extends Plugin {    manager!: TimerManager;
    fileManager!: TimerFileManager;
    settings!: TimerSettings;
    fileFirstOpen = true;
    database!: TimerDatabase;
    idb!: TimerIndexedDB;
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
        sidebarDefaultGroup: '',
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

        // Initialize IndexedDB cache layer
        this.idb = new TimerIndexedDB();
        await this.idb.open();
        perf.startupMark('idb.open() done');

        // Crash recovery: fix running timers left from previous session
        const recoveries = this.database.recoverCrashedTimers();
        if (recoveries.length > 0) {
            // Persist recovery to JSON
            await this.database.flush();
            // Update IndexedDB daily_dur for recovered timers
            for (const r of recoveries) {
                await this.idb.addDailyDur(r.timerId, r.date, r.deltaSec);
            }
        }
        perf.startupMark('recoverCrashedTimers done');

        // Seed IndexedDB from JSON (timers + daily_dur)
        await this.seedIndexedDB();
        perf.startupMark('seedIndexedDB done');

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

        // Passive deletion/restoration detector
        this.registerPassiveDeletionDetector();

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
        // Sync running timers to JSON before unload
        const runningTimers = this.manager.getAllTimers();
        const unloadNow = Math.floor(Date.now() / 1000);
        runningTimers.forEach((data, timerId) => {
            if (data.class === 'timer-r') {
                // Compute session segments and add to daily_dur in memory
                const segments = this.database.computeRunningSessionSegments(timerId);
                for (const seg of segments) {
                    this.database.addDailyDurInMemory(timerId, seg.date, seg.deltaSec);
                }
                this.database.updateEntrySync(timerId, {
                    state: 'paused',
                    total_dur_sec: data.dur,
                    last_ts: unloadNow,
                    updated_at: unloadNow
                });
                this.database.clearSessionStart(timerId);
            }
        });
        this.database.flushSync();
        // Note: IndexedDB is async, cannot reliably write in onunload.
        // JSON flush above is the authoritative persistent record.
        this.idb.close();

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
        const cleanLineText = TimerScanner.extractLineText(rawLineText);

        this.manager.startTimer(timerId, initialData, this.onTick.bind(this));
        this.fileManager.locations.set(timerId, { view, file, lineNum });
        this.fileManager.writeTimer(timerId, initialData, view, file, lineNum, null);

        // Sync to database (JSON + IndexedDB)
        const now = Math.floor(Date.now() / 1000);
        const newEntry: IDBTimerEntry = {
            timer_id: timerId,
            file_path: file?.path ?? '',
            line_num: lineNum,
            line_text: cleanLineText,
            project: null,
            state: 'running',
            total_dur_sec: 0,
            last_ts: now,
            created_at: now,
            updated_at: now
        };
        this.database.updateEntry(timerId, newEntry);
        this.database.recordSessionStart(timerId);
        this.idb.putTimer(newEntry); // async, fire-and-forget

        // Immediately sync UI
        this.updateStatusBar();
        this.notifySidebarTimerAdded({
            timerId,
            filePath: file?.path ?? '',
            lineNum,
            lineText: cleanLineText,
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
        const cleanLineText = TimerScanner.extractLineText(rawLineText);

        this.manager.startTimer(timerId, newData, this.onTick.bind(this));
        this.fileManager.locations.set(timerId, { view, file, lineNum });
        this.fileManager.writeTimer(timerId, newData, view, view.file, lineNum, parsedData);

        // Sync to database (JSON + IndexedDB)
        const now = Math.floor(Date.now() / 1000);
        const patch = {
            state: 'running' as const,
            total_dur_sec: newData.dur,
            last_ts: now,
            file_path: file?.path ?? '',
            line_num: lineNum,
            line_text: cleanLineText,
            project: newData.project ?? null,
            updated_at: now
        };
        this.database.updateEntry(timerId, patch);
        this.database.recordSessionStart(timerId);
        this.idb.patchTimer(timerId, patch); // async, fire-and-forget

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
        const cleanLineText = TimerScanner.extractLineText(rawLineText);

        this.manager.stopTimer(timerId);
        this.fileManager.writeTimer(timerId, newData, view, view.file, lineNum, parsedData);

        // Compute session segments (may span multiple days)
        const segments = this.database.computeRunningSessionSegments(timerId);

        // Sync to database (JSON + IndexedDB)
        const now = Math.floor(Date.now() / 1000);
        const patch = {
            state: 'paused' as const,
            total_dur_sec: newData.dur,
            last_ts: now,
            file_path: view.file?.path ?? '',
            line_num: lineNum,
            line_text: cleanLineText,
            project: newData.project ?? null,
            updated_at: now
        };
        this.database.updateEntry(timerId, patch);
        for (const seg of segments) {
            this.database.addDailyDurInMemory(timerId, seg.date, seg.deltaSec);
        }
        this.database.clearSessionStart(timerId);
        // JSON flush is already scheduled by updateEntry

        // Update IndexedDB timer state only (daily_dur is already accumulated by tick)
        this.idb.patchTimer(timerId, patch);

        // Immediately sync UI
        this.updateStatusBar();
        this.notifySidebarStateChanged(timerId, 'timer-p', newData.dur);
    }

    handleDelete(view: any, lineNum: number, parsedData: TimerData | null) {
        if (!parsedData || !parsedData.timerId) return;
        const timerId = parsedData.timerId;

        // Sync to database (JSON + IndexedDB)
        const now = Math.floor(Date.now() / 1000);
        const wasRunning = parsedData.class === 'timer-r';
        const currentDataForDelete = this.manager.getTimerData(timerId) || parsedData;
        const patch = {
            state: 'deleted' as const,
            total_dur_sec: currentDataForDelete.dur,
            last_ts: now,
            updated_at: now
        };
        this.database.updateEntry(timerId, patch);
        if (wasRunning) {
            const segments = this.database.computeRunningSessionSegments(timerId);
            for (const seg of segments) {
                this.database.addDailyDurInMemory(timerId, seg.date, seg.deltaSec);
            }
            this.database.clearSessionStart(timerId);
            // Note: IDB daily_dur is already accumulated by tick — no need to write again
        }
        this.idb.patchTimer(timerId, patch);

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
        const oldDur = parsedData.dur;
        const newData = TimerDataUpdater.calculate('setDuration', { ...parsedData, newDur });

        // 1. Update the file's front-end display with the new duration
        this.fileManager.writeTimer(timerId, newData, view, view.file, lineNum, parsedData);

        // 2. Sync total_dur_sec to JSON database
        const now = Math.floor(Date.now() / 1000);
        this.database.updateEntry(timerId, {
            total_dur_sec: newData.dur,
            last_ts: now
        });

        // 3. Adjust daily_dur based on increase vs decrease
        const today = new Date().toLocaleDateString('sv');
        const delta = newData.dur - oldDur;

        if (delta < 0) {
            // Duration decreased: deduct from most recent dates first (LIFO)
            this.database.adjustDailyDurForSetDuration(timerId, newData.dur);
            this.idb.adjustDailyDurForSetDuration(timerId, newData.dur);
        } else if (delta > 0) {
            // Duration increased: add the delta to today's date
            this.database.addDailyDurInMemory(timerId, today, delta);
            this.idb.addDailyDur(timerId, today, delta);
        }
        // delta === 0: no change needed

        // Persist JSON (updateEntry already scheduled flush, but ensure daily_dur is included)
        this.database.flush();

        // Update IndexedDB timer entry
        this.idb.patchTimer(timerId, { total_dur_sec: newData.dur, last_ts: now });

        // 4. Immediately sync UI (sidebar list + charts + status bar)
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

            // Save old timestamp BEFORE calculate to compute accurate tickDelta
            const oldTs = oldData.ts ?? Math.floor(Date.now() / 1000);

            const newData = TimerDataUpdater.calculate('update', oldData);
            this.manager.updateTimerData(timerId, newData);

            // updateTimerByIdWithSearch now returns { ok, lineText }
            // lineText is the raw line content already read during the tick — zero extra I/O
            const result = await this.fileManager.updateTimerByIdWithSearch(timerId, newData);
            if (!result.ok) {
                this.manager.stopTimer(timerId);
            }

            // Update last_ts and total_dur_sec in memory only (no JSON flush)
            const tickNow = Math.floor(Date.now() / 1000);
            const tickDelta = tickNow - oldTs; // seconds elapsed this tick (accurate ~1s)
            this.database.updateEntryInMemory(timerId, {
                last_ts: tickNow,
                total_dur_sec: newData.dur
            });

            // Write to IndexedDB (hot cache) — atomic tick update
            const tickToday = new Date().toLocaleDateString('sv');
            this.idb.tickUpdate(timerId, newData.dur, tickNow, tickToday, tickDelta);

            // Patch sidebar card text in-place (no full re-render)
            if (result.lineText !== null) {
                this.notifySidebarLineTextChanged(timerId, result.lineText);
            }

            // Day boundary check — when timer crosses midnight, split duration
            // into per-day segments and write to JSON memory only.
            // Note: IDB daily_dur is already correctly split by date via tickUpdate,
            // which writes to `today` at each tick (the date naturally changes at midnight).
            // JSON memory has no tick writes, so it needs boundary segments.
            const boundarySegments = this.database.checkDayBoundary(timerId);
            for (const seg of boundarySegments) {
                this.database.addDailyDurInMemory(timerId, seg.date, seg.deltaSec);
            }

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

    /**
     * Seed IndexedDB from JSON data on plugin load.
     * Populates the "timers" and "daily_dur" stores from the persisted JSON.
     */
    private async seedIndexedDB(): Promise<void> {
        // Clear stale IDB data before seeding (handles deleted timers, etc.)
        await this.idb.clearAll();

        // Seed timers store
        const entries = this.database.queryTimers();
        const idbEntries: IDBTimerEntry[] = entries.map(e => ({
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
        await this.idb.bulkPutTimers(idbEntries);

        // Seed daily_dur store
        const dailyDur = this.database.getDailyDur();
        const dailyRecords: import('./core/TimerIndexedDB').DailyDurRecord[] = [];
        for (const [date, timerMap] of Object.entries(dailyDur)) {
            for (const [timerId, dur] of Object.entries(timerMap)) {
                dailyRecords.push({
                    key: `${timerId}|${date}`,
                    timer_id: timerId,
                    stat_date: date,
                    duration_sec: dur
                });
            }
        }
        await this.idb.bulkPutDailyDur(dailyRecords);
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
    notifySidebarStateChanged(timerId: string, newState: 'timer-r' | 'timer-p', newDur?: number): void {
        const view = this.getSidebarView();
        if (!view) return;
        view.onTimerStateChanged(timerId, newState, newDur);
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

    // ===== Passive Deletion / Restoration Detection =====

    /**
     * Register a CM6 EditorView.updateListener extension that detects
     * timer spans disappearing or reappearing in document changes.
     */
    private registerPassiveDeletionDetector(): void {
        this.registerEditorExtension(
            EditorView.updateListener.of((update) => {
                if (!update.docChanged) return;

                const oldDoc = update.startState.doc;
                const newDoc = update.state.doc;

                // Get active file path for restore context
                const activeView = this.app.workspace.getActiveViewOfType(FileView);
                const filePath = (activeView as any)?.file?.path ?? '';

                update.changes.iterChanges((oldFrom, oldTo, newFrom, newTo) => {
                    // Extract affected line ranges in old and new documents
                    const oldStartLine = oldDoc.lineAt(oldFrom).number;
                    const oldEndLine = oldDoc.lineAt(Math.min(oldTo, oldDoc.length)).number;
                    const newStartLine = newDoc.lineAt(newFrom).number;
                    const newEndLine = newDoc.lineAt(Math.min(newTo, newDoc.length)).number;

                    // Collect old text (lines that were replaced/deleted)
                    let oldText = '';
                    for (let ln = oldStartLine; ln <= oldEndLine; ln++) {
                        oldText += oldDoc.line(ln).text + '\n';
                    }

                    // Collect new text (lines that replaced/were inserted)
                    let newText = '';
                    for (let ln = newStartLine; ln <= newEndLine; ln++) {
                        newText += newDoc.line(ln).text + '\n';
                    }

                    const oldTimers = extractTimerIdsFromText(oldText);
                    const newTimers = extractTimerIdsFromText(newText);

                    // Detect disappeared timers → passive delete
                    for (const [timerId] of oldTimers) {
                        if (!newTimers.has(timerId)) {
                            this.handlePassiveDelete(timerId);
                        }
                    }

                    // Detect appeared timers → passive restore (if was deleted)
                    for (const [timerId, attrs] of newTimers) {
                        if (!oldTimers.has(timerId)) {
                            const entry = this.database.getEntry(timerId);
                            if (entry && entry.state === 'deleted') {
                                // Find which line within newStartLine..newEndLine contains this timer
                                let timerLineNum = newStartLine - 1; // 0-based
                                for (let ln = newStartLine; ln <= newEndLine; ln++) {
                                    const lineText = newDoc.line(ln).text;
                                    if (lineText.includes(`id="${timerId}"`)) {
                                        timerLineNum = ln - 1; // CM6 lines are 1-based, our lineNum is 0-based
                                        break;
                                    }
                                }
                                this.handlePassiveRestore(
                                    timerId,
                                    attrs.dur,
                                    attrs.ts,
                                    filePath,
                                    timerLineNum,
                                    attrs.project
                                );
                            }
                        }
                    }
                });
            })
        );
    }

    /**
     * Handle passive deletion detected by CM6 updateListener.
     * Called when a timer span disappears from the document due to user editing.
     * Idempotent: skips if timer is already in 'deleted' state.
     *
     * @param timerId - The ID of the timer that disappeared
     */
    handlePassiveDelete(timerId: string): void {
        // Idempotent check: skip if already deleted or not found
        const entry = this.database.getEntry(timerId);
        if (!entry || entry.state === 'deleted') return;

        if (DEBUG) console.log(`[PassiveDelete] timerId=${timerId}, wasRunning=${entry.state === 'running'}`);

        const now = Math.floor(Date.now() / 1000);
        const wasRunning = entry.state === 'running';

        // If running, settle duration first
        if (wasRunning) {
            const currentData = this.manager.getTimerData(timerId);
            const totalDur = currentData ? currentData.dur : entry.total_dur_sec;

            // Compute session segments for daily_dur
            const segments = this.database.computeRunningSessionSegments(timerId);
            for (const seg of segments) {
                this.database.addDailyDurInMemory(timerId, seg.date, seg.deltaSec);
                this.idb.addDailyDur(timerId, seg.date, seg.deltaSec);
            }
            this.database.clearSessionStart(timerId);

            // Stop the in-memory timer
            this.manager.stopTimer(timerId);

            // Update state
            const patch = {
                state: 'deleted' as const,
                total_dur_sec: totalDur,
                last_ts: now,
                updated_at: now
            };
            this.database.updateEntry(timerId, patch);
            this.idb.patchTimer(timerId, patch);
        } else {
            // Paused timer: just mark deleted
            const patch = {
                state: 'deleted' as const,
                last_ts: now,
                updated_at: now
            };
            this.database.updateEntry(timerId, patch);
            this.idb.patchTimer(timerId, patch);
        }

        // Clean up file manager location
        this.fileManager.locations.delete(timerId);

        // Sync UI
        this.updateStatusBar();
        this.notifySidebarTimerRemoved(timerId);
    }

    /**
     * Handle passive restoration detected by CM6 updateListener.
     * Called when a previously deleted timer span reappears in the document (e.g., Ctrl+Z).
     * Idempotent: skips if timer is not in 'deleted' state.
     * Restores timer to 'paused' state (never auto-resumes to 'running').
     *
     * @param timerId - The timer ID from the span
     * @param spanDur - Duration from span's data-dur attribute (authoritative)
     * @param spanTs - Timestamp from span's data-ts attribute
     * @param filePath - File path where the span reappeared
     * @param lineNum - Line number (0-based) where the span reappeared
     * @param project - Project from span's data-project attribute
     */
    handlePassiveRestore(
        timerId: string,
        spanDur: number,
        spanTs: number,
        filePath: string,
        lineNum: number,
        project: string | null
    ): void {
        // Idempotent check: only restore if currently deleted
        const entry = this.database.getEntry(timerId);
        if (!entry || entry.state !== 'deleted') return;

        if (DEBUG) console.log(`[PassiveRestore] timerId=${timerId}, spanDur=${spanDur}, filePath=${filePath}`);

        const now = Math.floor(Date.now() / 1000);

        // Restore to paused state, using span attributes as authoritative data
        const patch = {
            state: 'paused' as const,
            total_dur_sec: spanDur,
            last_ts: spanTs,
            file_path: filePath,
            line_num: lineNum,
            project: project,
            updated_at: now
        };
        this.database.updateEntry(timerId, patch);
        this.idb.patchTimer(timerId, patch);

        // Sync UI
        this.updateStatusBar();
        this.notifySidebarTimerAdded({
            timerId,
            filePath,
            lineNum,
            lineText: entry.line_text, // Reuse existing line_text from DB
            state: 'timer-p',
            dur: spanDur,
            ts: spanTs,
            project
        });

        // Async: fix editor span class to match paused state (timer-r → timer-p)
        // Must be deferred because we're inside a CM6 updateListener callback
        setTimeout(() => {
            const activeView = this.app.workspace.getActiveViewOfType(FileView);
            if (!activeView || !(activeView as any).editor) return;
            const editor = (activeView as any).editor;
            const file = (activeView as any).file as TFile;
            if (!file) return;

            const lineText = editor.getLine(lineNum);
            if (!lineText || !lineText.includes(`id="${timerId}"`)) return;

            // Only fix if span is still timer-r (class mismatch)
            if (!lineText.includes('class="timer-r"')) return;

            const parsed = TimerParser.parse(lineText, 'auto', timerId);
            if (!parsed || parsed.timerId !== timerId) return;

            // Build paused TimerData and rewrite the span
            const pausedData: TimerData = {
                class: 'timer-p',
                timerId,
                dur: spanDur,
                ts: spanTs,
                project: project ?? undefined
            };
            this.fileManager.writeTimer(timerId, pausedData, activeView, file, lineNum, parsed);
        }, 0);
    }
}
