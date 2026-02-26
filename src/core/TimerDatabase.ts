import { Plugin } from 'obsidian';

// ===== Data Interfaces =====

export interface TimerDbFile {
    version: number;
    lastFullScan: string;
    timers: Record<string, TimerEntry>;
    sessions: TimerSession[];
}

export interface TimerEntry {
    timer_id: string;
    file_path: string;
    line_num: number;
    line_text: string;
    project: string | null;
    state: 'running' | 'paused' | 'deleted' | 'lost';
    total_dur_sec: number;
    last_ts: number;
    created_at: number;
    updated_at: number;
}

export interface TimerSession {
    session_id: string;
    timer_id: string;
    stat_date: string;
    duration_sec: number;
    end_reason: 'paused' | 'deleted' | 'day_boundary' | 'plugin_unload' | 'crash_recovery';
    reported_at: number;
}

export interface TimerFilter {
    state?: TimerEntry['state'] | TimerEntry['state'][];
    filePath?: string;
    project?: string | null;
}

export type TimerSort = 'status' | 'dur-desc' | 'dur-asc' | 'filename-desc' | 'filename-asc' | 'updated';

// ===== TimerDatabase =====

export class TimerDatabase {
    private plugin: Plugin;
    private data: TimerDbFile | null = null;
    private flushTimer: ReturnType<typeof setTimeout> | null = null;

    // Memory indexes
    private timersByFile: Map<string, Set<string>> = new Map();

    // Day-boundary tracking: timerId → 'YYYY-MM-DD'
    private sessionStartDate: Map<string, string> = new Map();
    // Session start timestamps: timerId → Unix seconds
    private sessionStartTs: Map<string, number> = new Map();

    private get DB_PATH(): string {
        return `${this.plugin.app.vault.configDir}/plugins/text-block-timer/timer-db.json`;
    }

    constructor(plugin: Plugin) {
        this.plugin = plugin;
    }

    // ===== Load / Init =====

    async load(): Promise<void> {
        try {
            const raw = await this.plugin.app.vault.adapter.read(this.DB_PATH);
            this.data = JSON.parse(raw) as TimerDbFile;
        } catch {
            this.data = this.createEmptyDb();
        }
        this.buildIndexes();
    }

    exists(): boolean {
        return this.data !== null && Object.keys(this.data.timers).length > 0;
    }

    getLastFullScan(): string | null {
        return this.data?.lastFullScan ?? null;
    }

    private createEmptyDb(): TimerDbFile {
        return {
            version: 1,
            lastFullScan: '',
            timers: {},
            sessions: []
        };
    }

    private buildIndexes(): void {
        this.timersByFile.clear();
        if (!this.data) return;
        for (const [timerId, entry] of Object.entries(this.data.timers)) {
            const fp = entry.file_path;
            if (!this.timersByFile.has(fp)) this.timersByFile.set(fp, new Set());
            this.timersByFile.get(fp)!.add(timerId);
        }
    }

    // ===== Flush =====

    private scheduleFlush(): void {
        if (this.flushTimer) clearTimeout(this.flushTimer);
        this.flushTimer = setTimeout(() => this.flush(), 100);
    }

    async flush(): Promise<void> {
        if (!this.data) return;
        await this.plugin.app.vault.adapter.write(this.DB_PATH, JSON.stringify(this.data));
    }

    flushSync(): void {
        if (!this.data) return;
        const fs = (window as any).require('fs');
        const path = (window as any).require('path');
        const basePath = (this.plugin.app.vault.adapter as any).basePath;
        const fullPath = path.join(basePath, this.DB_PATH);
        fs.writeFileSync(fullPath, JSON.stringify(this.data));
    }

    // ===== CRUD =====

    async updateEntry(timerId: string, patch: Partial<TimerEntry>): Promise<void> {
        if (!this.data) return;
        const now = Math.floor(Date.now() / 1000);
        const existing = this.data.timers[timerId];
        if (existing) {
            Object.assign(existing, patch, { updated_at: now });
        } else {
            this.data.timers[timerId] = {
                timer_id: timerId,
                file_path: '',
                line_num: 0,
                line_text: '',
                project: null,
                state: 'paused',
                total_dur_sec: 0,
                last_ts: now,
                created_at: now,
                updated_at: now,
                ...patch
            };
        }
        // Update timersByFile index
        const fp = this.data.timers[timerId].file_path;
        if (fp) {
            if (!this.timersByFile.has(fp)) this.timersByFile.set(fp, new Set());
            this.timersByFile.get(fp)!.add(timerId);
        }
        this.scheduleFlush();
    }

    updateEntrySync(timerId: string, patch: Partial<TimerEntry>): void {
        if (!this.data) return;
        const now = Math.floor(Date.now() / 1000);
        const existing = this.data.timers[timerId];
        if (existing) {
            Object.assign(existing, patch, { updated_at: now });
        }
        // No flush here — caller must call flushSync()
    }

    /**
     * Update entry in memory only — no flush scheduled.
     * Use this for high-frequency tick updates (e.g. last_ts, line_text)
     * to avoid serializing the entire JSON file every second.
     */
    updateEntryInMemory(timerId: string, patch: Partial<TimerEntry>): void {
        if (!this.data) return;
        const existing = this.data.timers[timerId];
        if (existing) {
            Object.assign(existing, patch);
        }
    }

    async appendSession(session: TimerSession): Promise<void> {
        if (!this.data) return;
        this.data.sessions.push(session);
        this.scheduleFlush();
    }

    appendSessionSync(timerId: string, endReason: TimerSession['end_reason']): void {
        if (!this.data) return;
        const now = Math.floor(Date.now() / 1000);
        const startTs = this.sessionStartTs.get(timerId) ?? now;
        const duration = Math.max(0, now - startTs);
        const today = new Date().toLocaleDateString('sv');
        const session: TimerSession = {
            session_id: crypto.randomUUID(),
            timer_id: timerId,
            stat_date: today,
            duration_sec: duration,
            end_reason: endReason,
            reported_at: now
        };
        this.data.sessions.push(session);
        // No flush — caller must call flushSync()
    }

    async removeFile(filePath: string): Promise<void> {
        if (!this.data) return;
        const ids = this.timersByFile.get(filePath);
        if (!ids) return;
        for (const id of ids) {
            delete this.data.timers[id];
        }
        this.timersByFile.delete(filePath);
        this.scheduleFlush();
    }

    async renameFile(oldPath: string, newPath: string): Promise<void> {
        if (!this.data) return;
        const ids = this.timersByFile.get(oldPath);
        if (!ids) return;
        for (const id of ids) {
            if (this.data.timers[id]) {
                this.data.timers[id].file_path = newPath;
            }
        }
        this.timersByFile.set(newPath, ids);
        this.timersByFile.delete(oldPath);
        this.scheduleFlush();
    }

    async rebuild(entries: TimerEntry[], sessions: TimerSession[]): Promise<void> {
        const now = new Date().toISOString();
        const newDb: TimerDbFile = {
            version: 1,
            lastFullScan: now,
            timers: {},
            sessions
        };
        for (const entry of entries) {
            newDb.timers[entry.timer_id] = entry;
        }
        this.data = newDb;
        this.buildIndexes();
        await this.flush();
    }

    // ===== Query =====

    queryTimers(filter: TimerFilter = {}, sort: TimerSort = 'status'): TimerEntry[] {
        if (!this.data) return [];
        let entries = Object.values(this.data.timers);

        // Filter
        if (filter.state) {
            const states = Array.isArray(filter.state) ? filter.state : [filter.state];
            entries = entries.filter(e => states.includes(e.state));
        }
        if (filter.filePath) {
            entries = entries.filter(e => e.file_path === filter.filePath);
        }
        if (filter.project !== undefined) {
            entries = entries.filter(e => e.project === filter.project);
        }

        // Sort
        entries.sort((a, b) => {
            switch (sort) {
                case 'status':
                    if (a.state === 'running' && b.state !== 'running') return -1;
                    if (a.state !== 'running' && b.state === 'running') return 1;
                    return b.total_dur_sec - a.total_dur_sec;
                case 'dur-desc':
                    return b.total_dur_sec - a.total_dur_sec;
                case 'dur-asc':
                    return a.total_dur_sec - b.total_dur_sec;
                case 'filename-desc':
                    return b.file_path.localeCompare(a.file_path);
                case 'filename-asc':
                    return a.file_path.localeCompare(b.file_path);
                case 'updated':
                    return b.last_ts - a.last_ts;
                default:
                    return 0;
            }
        });

        return entries;
    }

    querySessionsByDate(date: string): TimerSession[] {
        if (!this.data) return [];
        return this.data.sessions.filter(s => s.stat_date === date);
    }

    querySessionsByTimerId(timerId: string, days?: number): TimerSession[] {
        if (!this.data) return [];
        let sessions = this.data.sessions.filter(s => s.timer_id === timerId);
        if (days !== undefined) {
            const cutoff = Math.floor(Date.now() / 1000) - days * 86400;
            sessions = sessions.filter(s => s.reported_at >= cutoff);
        }
        return sessions;
    }

    // ===== Session Start Tracking =====

    recordSessionStart(timerId: string): void {
        const today = new Date().toLocaleDateString('sv');
        this.sessionStartDate.set(timerId, today);
        this.sessionStartTs.set(timerId, Math.floor(Date.now() / 1000));
    }

    clearSessionStart(timerId: string): void {
        this.sessionStartDate.delete(timerId);
        this.sessionStartTs.delete(timerId);
    }

    // ===== Day Boundary Detection =====

    async checkDayBoundary(timerId: string): Promise<void> {
        const startDate = this.sessionStartDate.get(timerId);
        if (!startDate) return;

        const today = new Date().toLocaleDateString('sv');
        if (startDate === today) return;

        // Day has changed — record a day_boundary session
        const now = Math.floor(Date.now() / 1000);
        const startTs = this.sessionStartTs.get(timerId) ?? now;

        // Calculate duration up to midnight of the start date
        const startDateObj = new Date(startDate);
        startDateObj.setDate(startDateObj.getDate() + 1);
        startDateObj.setHours(0, 0, 0, 0);
        const midnightTs = Math.floor(startDateObj.getTime() / 1000);
        const duration = Math.max(0, midnightTs - startTs);

        const session: TimerSession = {
            session_id: crypto.randomUUID(),
            timer_id: timerId,
            stat_date: startDate,
            duration_sec: duration,
            end_reason: 'day_boundary',
            reported_at: now
        };
        await this.appendSession(session);

        // Update session start to today
        this.sessionStartDate.set(timerId, today);
        this.sessionStartTs.set(timerId, midnightTs);
    }

    // ===== Crash Recovery =====

    async recoverCrashedSessions(): Promise<void> {
        if (!this.data) return;
        const now = Math.floor(Date.now() / 1000);
        const today = new Date().toLocaleDateString('sv');
        let hasRecovery = false;

        for (const [timerId, entry] of Object.entries(this.data.timers)) {
            if (entry.state === 'running') {
                // This timer was running when the plugin crashed
                const duration = Math.max(0, now - entry.last_ts);
                const session: TimerSession = {
                    session_id: crypto.randomUUID(),
                    timer_id: timerId,
                    stat_date: today,
                    duration_sec: duration,
                    end_reason: 'crash_recovery',
                    reported_at: now
                };
                this.data.sessions.push(session);
                entry.state = 'paused';
                entry.updated_at = now;
                hasRecovery = true;
            }
        }

        if (hasRecovery) {
            await this.flush();
        }
    }
}
