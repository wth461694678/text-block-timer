import { App, TFile } from 'obsidian';
import { TimerParser } from '../io/TimerParser';
import { TimerManager } from './TimerManager';

export interface ScannedTimer {
    timerId: string;
    filePath: string;
    lineNum: number;
    lineText: string;
    state: 'timer-r' | 'timer-p';
    dur: number;
    ts: number;
    project: string | null;
}

export class TimerScanner {
    private app: App;
    private manager: TimerManager;

    constructor(app: App, manager: TimerManager) {
        this.app = app;
        this.manager = manager;
    }

    // Scan a single file and return all timers found
    async scanFile(file: TFile): Promise<ScannedTimer[]> {
        try {
            const content = await this.app.vault.read(file);
            return this.parseFileContent(content, file.path);
        } catch {
            return [];
        }
    }

    // Scan multiple files concurrently
    async scanFiles(files: TFile[]): Promise<ScannedTimer[]> {
        const results = await Promise.all(files.map(f => this.scanFile(f)));
        return ([] as ScannedTimer[]).concat(...results);
    }

    // Stream scan entire vault — yields timers file by file
    async *scanVaultStream(
        onProgress: (scanned: number, total: number) => void,
        signal: AbortSignal
    ): AsyncGenerator<ScannedTimer> {
        const files = this.app.vault.getMarkdownFiles();
        const total = files.length;

        for (let i = 0; i < files.length; i++) {
            if (signal.aborted) return;

            const timers = await this.scanFile(files[i]);
            for (const t of timers) yield t;

            if (i % 50 === 0) {
                onProgress(i + 1, total);
                await new Promise(r => setTimeout(r, 0));
            }
        }
        onProgress(total, total);
    }

    // Collect all results from scanVaultStream; returns null if cancelled
    async scanVault(
        onProgress: (scanned: number, total: number) => void,
        signal: AbortSignal
    ): Promise<ScannedTimer[] | null> {
        const results: ScannedTimer[] = [];
        for await (const timer of this.scanVaultStream(onProgress, signal)) {
            results.push(timer);
        }
        if (signal.aborted) return null;
        return results;
    }

    // Parse file content line by line, merging with in-memory timer state
    private parseFileContent(content: string, filePath: string): ScannedTimer[] {
        const lines = content.split('\n');
        const timers: ScannedTimer[] = [];

        for (let lineNum = 0; lineNum < lines.length; lineNum++) {
            const lineText = lines[lineNum];
            const parsed = TimerParser.parse(lineText, 'auto');
            if (!parsed) continue;

            // Use in-memory dur if timer is currently running
            const memData = this.manager.getTimerData(parsed.timerId);
            const dur = memData ? memData.dur : parsed.dur;

            timers.push({
                timerId: parsed.timerId,
                filePath,
                lineNum,
                lineText: TimerScanner.extractLineText(lineText),
                state: parsed.class,
                dur,
                ts: parsed.ts,
                project: parsed.project ?? null
            });
        }

        return timers;
    }

    // Strip Markdown syntax and return plain text summary (max 50 chars)
    static extractLineText(rawLine: string): string {
        let text = rawLine
            .replace(/<span\s+class="timer-[rp]"[^>]*>[^<]*<\/span>/g, '')  // remove timer HTML spans first
            .replace(/<[^>]+>[\s\S]*?<\/[^>]+>/g, '')  // remove HTML tags with content
            .replace(/<[^>]+>/g, '')                     // remove remaining HTML tags
            .replace(/^#{1,6}\s+/, '')                   // headings
            .replace(/^\s*[-*+]\s+/, '')                 // unordered list
            .replace(/^\s*\d+\.\s+/, '')                 // ordered list
            .replace(/^\s*-\s*\[[ xX\-/]\]\s*/, '')     // checkboxes
            .replace(/\*\*(.+?)\*\*/g, '$1')             // bold
            .replace(/\*(.+?)\*/g, '$1')                 // italic
            .replace(/`(.+?)`/g, '$1')                   // inline code
            .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')    // links
            .trim();

        if (text.length > 50) text = text.slice(0, 50) + '…';
        return text;
    }
}
