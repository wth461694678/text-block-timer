import { App, TFile } from 'obsidian';
import { Transaction } from '@codemirror/state';
import { TimerData } from '../core/TimerDataUpdater';
import { CHECKBOX_REGEX, ORDERED_LIST, UNORDERED_LIST, HEADER } from '../core/constants';
import { TimerRenderer } from './TimerRenderer';
import { TimerParser } from './TimerParser';
import { TimerSettings } from '../ui/TimerSettingTab';

interface TimerLocation {
    view: any;
    file: TFile;
    lineNum: number;
}

// —— TimerFileManager - File operations and location management —— //
export class TimerFileManager {
    app: App;
    settings: TimerSettings;
    locations: Map<string, TimerLocation> = new Map();

    constructor(app: App, settings: TimerSettings) {
        this.app = app;
        this.settings = settings;
    }

    async writeTimer(timerId: string, timerData: TimerData, view: any, file: TFile, lineNum: number, parsedResult: TimerData | null = null): Promise<string> {
        if (view.getMode && view.getMode() === 'preview') {
            // ===== Preview mode =====
            const content = await this.app.vault.read(file);
            const lines = content.split('\n');
            let modified = false;
            const line = lines[lineNum];
            const newSpan = TimerRenderer.render(timerData, this.settings);
            const timerRE = /<span class="timer-[rp]"[^>]*>.*?<\/span>/;

            if (line.match(timerRE)) {
                lines[lineNum] = line.replace(timerRE, newSpan);
                modified = true;
            } else if (parsedResult === null) {
                const position = this.calculateInsertPosition(
                    { getLine: () => line },
                    0,
                    this.settings.timerInsertLocation
                );
                if (position.before === 0) {
                    lines[lineNum] = newSpan + line;
                } else if (position.before === line.length) {
                    lines[lineNum] = line + newSpan;
                } else {
                    lines[lineNum] = line.substring(0, position.before) + newSpan + line.substring(position.before);
                }
                modified = true;
            }

            if (modified) {
                await this.app.vault.modify(file, lines.join('\n'));
            }
            return timerId;

        } else {
            // ===== Edit mode =====
            const editor = view.editor;
            const newSpan = TimerRenderer.render(timerData, this.settings);

            let before: number, after: number;
            if (parsedResult && parsedResult.timerId === timerId) {
                before = parsedResult.beforeIndex!;
                after = parsedResult.afterIndex!;
            } else {
                const position = this.calculateInsertPosition(
                    editor,
                    lineNum,
                    this.settings.timerInsertLocation
                );
                before = position.before;
                after = position.after;
            }

            if (editor.cm && editor.cm.dispatch) {
                const from = editor.posToOffset({ line: lineNum, ch: before });
                const to = editor.posToOffset({ line: lineNum, ch: after });
                editor.cm.dispatch({
                    changes: { from, to, insert: newSpan },
                    annotations: Transaction.addToHistory.of(false)
                });
            } else {
                editor.replaceRange(
                    newSpan,
                    { line: lineNum, ch: before },
                    { line: lineNum, ch: after }
                );
            }

            this.locations.set(timerId, { view, file, lineNum });
        }

        return timerId;
    }

    async updateTimerByIdWithSearch(timerId: string, timerData: TimerData): Promise<{ ok: boolean; lineText: string | null }> {
        const { view, file, lineNum } = this.locations.get(timerId)!;

        // File closed: respect autoStopTimers setting
        if (!view.file) {
            return { ok: this.settings.autoStopTimers !== 'close', lineText: null };
        }

        let lineText: string;
        if (view.getMode() === 'source') {
            lineText = view.editor.getLine(lineNum);
        } else if (view.getMode() === 'preview') {
            const content = await this.app.vault.read(file);
            lineText = content.split('\n')[lineNum] || '';
        } else {
            lineText = '';
        }

        const parsed = TimerParser.parse(lineText, 'auto', timerId);
        if (parsed) {
            this.writeTimer(timerId, timerData, view, file, lineNum, parsed);
            return { ok: true, lineText };
        }

        // Global search fallback
        const foundparsed = await this.findTimerGlobally(timerId);
        if (foundparsed) {
            this.writeTimer(timerId, timerData, foundparsed.view, foundparsed.file, foundparsed.lineNum, foundparsed.parsed);
            return { ok: true, lineText: null };
        }

        console.warn(`Timer with ID ${timerId} not found in file ${file.path}, stop Timer`);
        return { ok: false, lineText: null };
    }

    async findTimerGlobally(timerId: string): Promise<{ view: any; file: TFile; lineNum: number; parsed: TimerData } | null> {
        const { view, file } = this.locations.get(timerId)!;

        if (view.getMode() === 'source') {
            const editor = view.editor;
            for (let i = 0; i < editor.lineCount(); i++) {
                const lineText = editor.getLine(i);
                const parsed = TimerParser.parse(lineText, 'auto', timerId);
                if (parsed && parsed.timerId === timerId) {
                    return { view, file, lineNum: i, parsed };
                }
            }
        } else if (view.getMode() === 'preview') {
            const content = await this.app.vault.read(file);
            const lines = content.split('\n');
            for (let i = 0; i < lines.length; i++) {
                const parsed = TimerParser.parse(lines[i], 'auto', timerId);
                if (parsed && parsed.timerId === timerId) {
                    return { view, file, lineNum: i, parsed };
                }
            }
        }

        return null;
    }

    calculateInsertPosition(editor: any, lineNum: number, insertLocation: string): { before: number; after: number } {
        const lineText = editor.getLine(lineNum) || '';

        if (insertLocation === 'head') {
            const checkboxMatch = CHECKBOX_REGEX.exec(lineText);
            const checkboxLen = checkboxMatch ? checkboxMatch[0].length : 0;
            const orderedListMatch = ORDERED_LIST.exec(lineText);
            const orderedListLen = orderedListMatch ? orderedListMatch[0].length : 0;
            const ulMatch = UNORDERED_LIST.exec(lineText);
            const ulLen = ulMatch ? ulMatch[0].length : 0;
            const headerMatch = HEADER.exec(lineText);
            const headerLen = headerMatch ? headerMatch[0].length : 0;

            let position = 0;
            if (checkboxLen > 0) {
                position = checkboxLen;
            } else if (orderedListLen > 0) {
                position = orderedListLen;
            } else if (ulLen > 0) {
                position = ulLen;
            } else if (headerLen > 0) {
                position = headerLen;
            }
            return { before: position, after: position };
        } else if (insertLocation === 'tail') {
            const len = lineText.length;
            return { before: len, after: len };
        }

        return { before: 0, after: 0 };
    }

    clearLocations() {
        this.locations.clear();
    }

    async upgradeOldTimers(file: TFile): Promise<void> {
        const content = await this.app.vault.read(file);
        const lines = content.split('\n');
        let modified = false;

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            const parsed = TimerParser.parse(line, 'v1');
            if (parsed) {
                modified = true;
                const newSpan = TimerRenderer.render(parsed, this.settings);
                const oldSpanRegex = new RegExp(`<span class="timer-btn"[^>]*>.*?<\/span>`);
                lines[i] = line.replace(oldSpanRegex, newSpan);
            }
        }

        if (modified) {
            await this.app.vault.modify(file, lines.join('\n'));
        }
    }
}
