import { Plugin } from 'obsidian';

// ===== Data Interfaces =====

export interface TimerDbFile {
    version: number;
    lastFullScan: string;
    timers: Record<string, TimerEntry>;
    /**
     * Per-timer per-date duration totals.
     * Outer key: stat_date (YYYY-MM-DD)
     * Inner key: timer_id
     * Value: total seconds for that timer on that date
     */
    daily_dur: Record<string, Record<string, number>>;
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
            // Migrate: ensure daily_dur exists
            if (!this.data.daily_dur || typeof this.data.daily_dur !== 'object') {
                this.data.daily_dur = {};
            }
            // Migrate: ensure timers object exists
            if (!this.data.timers || typeof this.data.timers !== 'object') {
                this.data.timers = {};
            }
            // Migrate: remove legacy sessions array if present
            if ((this.data as any).sessions) {
                // Convert legacy sessions to daily_dur
                this.migrateLegacySessions((this.data as any).sessions);
                delete (this.data as any).sessions;
            }
        } catch {
            this.data = this.createEmptyDb();
        }
        this.buildIndexes();
    }

    /**
     * Migrate legacy sessions[] to daily_dur structure.
     * Called once during load if old data format is detected.
     */
    private migrateLegacySessions(sessions: any[]): void {
        if (!this.data || !Array.isArray(sessions)) return;
        for (const session of sessions) {
            const timerId: string = session.timer_id;
            const date: string = session.stat_date;
            const dur: number = session.duration_sec ?? 0;
            if (!timerId || !date || dur <= 0) continue;
            if (!this.data.daily_dur[date]) this.data.daily_dur[date] = {};
            this.data.daily_dur[date][timerId] = (this.data.daily_dur[date][timerId] ?? 0) + dur;
        }
    }

    exists(): boolean {
        return this.data !== null && Object.keys(this.data.timers).length > 0;
    }

    getLastFullScan(): string | null {
        return this.data?.lastFullScan ?? null;
    }

    private createEmptyDb(): TimerDbFile {
        return {
            version: 2,
            lastFullScan: '',
            timers: {},
            daily_dur: {}
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

    // ===== Timer CRUD =====

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
     * Used for high-frequency tick updates (last_ts, total_dur_sec).
     * IndexedDB is the authoritative real-time source; JSON is flushed on state changes.
     */
    updateEntryInMemory(timerId: string, patch: Partial<TimerEntry>): void {
        if (!this.data) return;
        const existing = this.data.timers[timerId];
        if (existing) {
            Object.assign(existing, patch);
        }
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

    async rebuild(entries: TimerEntry[]): Promise<void> {
        const now = new Date().toISOString();
        const newDb: TimerDbFile = {
            version: 2,
            lastFullScan: now,
            timers: {},
            daily_dur: this.data?.daily_dur ?? {}
        };
        for (const entry of entries) {
            newDb.timers[entry.timer_id] = entry;
        }
        this.data = newDb;
        this.buildIndexes();
        await this.flush();
    }

    // ===== Daily Duration =====

    /**
     * Add delta seconds to a timer's daily duration in memory.
     * Called on state changes (pause/stop). Flush is scheduled automatically.
     */
    addDailyDurInMemory(timerId: string, date: string, deltaSec: number): void {
        if (!this.data || deltaSec <= 0) return;
        if (!this.data.daily_dur[date]) this.data.daily_dur[date] = {};
        this.data.daily_dur[date][timerId] = (this.data.daily_dur[date][timerId] ?? 0) + deltaSec;
    }

    /**
     * Set (overwrite) a timer's daily duration for a specific date in memory.
     * Used when user manually adjusts total duration.
     */
    setDailyDurInMemory(timerId: string, date: string, durationSec: number): void {
        if (!this.data) return;
        if (!this.data.daily_dur[date]) this.data.daily_dur[date] = {};
        this.data.daily_dur[date][timerId] = Math.max(0, durationSec);
    }

    /**
     * Adjust daily durations for a timer when user manually sets total duration.
     * Deducts from most recent dates first (LIFO).
     */
    adjustDailyDurForSetDuration(timerId: string, newTotalDur: number): void {
        if (!this.data) return;
        // Collect all date entries for this timer, sorted ascending (oldest first)
        const dateEntries: { date: string; dur: number }[] = [];
        for (const [date, timerMap] of Object.entries(this.data.daily_dur)) {
            if (timerMap[timerId] !== undefined && timerMap[timerId] > 0) {
                dateEntries.push({ date, dur: timerMap[timerId] });
            }
        }
        // Sort ascending: oldest date first, so we preserve older dates first
        // and deduct from the most recent dates first
        dateEntries.sort((a, b) => a.date.localeCompare(b.date));

        let remaining = newTotalDur;
        for (const entry of dateEntries) {
            if (remaining <= 0) {
                this.data.daily_dur[entry.date][timerId] = 0;
            } else if (remaining >= entry.dur) {
                remaining -= entry.dur;
                // unchanged — this date is fully preserved
            } else {
                this.data.daily_dur[entry.date][timerId] = remaining;
                remaining = 0;
            }
        }
    }

    /** Get all daily_dur data (for seeding IndexedDB on load). */
    getDailyDur(): Record<string, Record<string, number>> {
        return this.data?.daily_dur ?? {};
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

    getSessionStartTs(timerId: string): number | undefined {
        return this.sessionStartTs.get(timerId);
    }

    getSessionStartDate(timerId: string): string | undefined {
        return this.sessionStartDate.get(timerId);
    }

    // ===== Day Boundary Detection =====

    /**
     * Check if the timer has crossed midnight since its session started.
     * Returns an array of { date, deltaSec } for each day that was crossed,
     * so the caller can update both JSON and IndexedDB.
     */
    checkDayBoundary(timerId: string): { date: string; deltaSec: number }[] {
        const startDate = this.sessionStartDate.get(timerId);
        if (!startDate) return [];

        const today = new Date().toLocaleDateString('sv');
        if (startDate === today) return [];

        const now = Math.floor(Date.now() / 1000);
        let currentDate = startDate;
        let currentTs = this.sessionStartTs.get(timerId) ?? now;
        const segments: { date: string; deltaSec: number }[] = [];

        while (currentDate !== today) {
            const dateObj = new Date(currentDate);
            dateObj.setDate(dateObj.getDate() + 1);
            dateObj.setHours(0, 0, 0, 0);
            const midnightTs = Math.floor(dateObj.getTime() / 1000);
            const duration = Math.max(0, midnightTs - currentTs);
            segments.push({ date: currentDate, deltaSec: duration });
            currentDate = dateObj.toLocaleDateString('sv');
            currentTs = midnightTs;
        }

        // Update session start to today
        this.sessionStartDate.set(timerId, today);
        this.sessionStartTs.set(timerId, currentTs);

        return segments;
    }

    // ===== Crash Recovery =====

    /**
     * Recover timers that were running when the plugin crashed.
     * Returns list of { timerId, date, deltaSec } for caller to update IndexedDB.
     */
    recoverCrashedTimers(): { timerId: string; date: string; deltaSec: number }[] {
        if (!this.data) return [];
        const now = Math.floor(Date.now() / 1000);
        const recoveries: { timerId: string; date: string; deltaSec: number }[] = [];

        for (const [timerId, entry] of Object.entries(this.data.timers)) {
            if (entry.state === 'running') {
                const endTs = entry.last_ts;
                const statDate = new Date(endTs * 1000).toLocaleDateString('sv');
                const crashDuration = Math.max(0, now - endTs);

                // Add to daily_dur in memory
                this.addDailyDurInMemory(timerId, statDate, crashDuration);

                // Mark as paused
                entry.state = 'paused';
                entry.updated_at = now;

                recoveries.push({ timerId, date: statDate, deltaSec: crashDuration });
            }
        }

        return recoveries;
    }

    /**
     * Compute the duration of the current running session for a timer
     * (from session start to now), split by date if it crossed midnight.
     * Returns segments for caller to update daily_dur.
     */
    computeRunningSessionSegments(timerId: string): { date: string; deltaSec: number }[] {
        const startTs = this.sessionStartTs.get(timerId);
        const startDate = this.sessionStartDate.get(timerId);
        if (!startTs || !startDate) return [];

        const now = Math.floor(Date.now() / 1000);
        const today = new Date().toLocaleDateString('sv');
        const segments: { date: string; deltaSec: number }[] = [];

        let currentDate = startDate;
        let currentTs = startTs;

        while (currentDate !== today) {
            const dateObj = new Date(currentDate);
            dateObj.setDate(dateObj.getDate() + 1);
            dateObj.setHours(0, 0, 0, 0);
            const midnightTs = Math.floor(dateObj.getTime() / 1000);
            segments.push({ date: currentDate, deltaSec: Math.max(0, midnightTs - currentTs) });
            currentDate = dateObj.toLocaleDateString('sv');
            currentTs = midnightTs;
        }

        // Today's segment
        segments.push({ date: today, deltaSec: Math.max(0, now - currentTs) });
        return segments;
    }
}
