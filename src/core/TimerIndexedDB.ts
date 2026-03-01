/**
 * TimerIndexedDB — IndexedDB cache layer for real-time timer state.
 *
 * Stores two object stores:
 *   - "timers":    All timer entries (mirrors TimerEntry from JSON, always up-to-date)
 *   - "daily_dur": Per-timer per-date duration totals
 *                  key: `${timer_id}|${stat_date}`, value: DailyDurRecord
 *
 * Design principles:
 *   - JSON file = cold persistent storage (written on state changes, not every tick)
 *   - IndexedDB  = hot authoritative cache (written on every change including tick)
 *   - Sidebar / StatusBar read from IndexedDB for real-time display
 */

export interface IDBTimerEntry {
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

export interface DailyDurRecord {
    /** Composite key: `${timer_id}|${stat_date}` */
    key: string;
    timer_id: string;
    /** YYYY-MM-DD */
    stat_date: string;
    duration_sec: number;
}

const DB_NAME = 'text-block-timer';
const DB_VERSION = 1;
const STORE_TIMERS = 'timers';
const STORE_DAILY = 'daily_dur';

export class TimerIndexedDB {
    private db: IDBDatabase | null = null;

    // ===== Open / Init =====

    async open(): Promise<void> {
        return new Promise((resolve, reject) => {
            const req = indexedDB.open(DB_NAME, DB_VERSION);

            req.onupgradeneeded = (event) => {
                const db = (event.target as IDBOpenDBRequest).result;
                // timers store — keyed by timer_id
                if (!db.objectStoreNames.contains(STORE_TIMERS)) {
                    db.createObjectStore(STORE_TIMERS, { keyPath: 'timer_id' });
                }
                // daily_dur store — keyed by composite key
                if (!db.objectStoreNames.contains(STORE_DAILY)) {
                    const dailyStore = db.createObjectStore(STORE_DAILY, { keyPath: 'key' });
                    // Index by timer_id for per-timer queries
                    dailyStore.createIndex('by_timer', 'timer_id', { unique: false });
                    // Index by stat_date for per-date aggregation
                    dailyStore.createIndex('by_date', 'stat_date', { unique: false });
                }
            };

            req.onsuccess = (event) => {
                this.db = (event.target as IDBOpenDBRequest).result;
                resolve();
            };

            req.onerror = () => reject(req.error);
        });
    }

    close(): void {
        this.db?.close();
        this.db = null;
    }

    async destroy(): Promise<void> {
        this.close();
        return new Promise((resolve, reject) => {
            const req = indexedDB.deleteDatabase(DB_NAME);
            req.onsuccess = () => resolve();
            req.onerror = () => reject(req.error);
        });
    }

    /** Clear all data from both object stores. Used before seeding from JSON. */
    async clearAll(): Promise<void> {
        if (!this.db) return;
        return new Promise((resolve, reject) => {
            const tx = this.db!.transaction([STORE_TIMERS, STORE_DAILY], 'readwrite');
            tx.objectStore(STORE_TIMERS).clear();
            tx.objectStore(STORE_DAILY).clear();
            tx.oncomplete = () => resolve();
            tx.onerror = () => reject(tx.error);
        });
    }

    // ===== Timer CRUD =====

    /** Upsert a timer entry (full or partial patch). */
    async putTimer(entry: IDBTimerEntry): Promise<void> {
        if (!this.db) return;
        return new Promise((resolve, reject) => {
            const tx = this.db!.transaction(STORE_TIMERS, 'readwrite');
            tx.objectStore(STORE_TIMERS).put(entry);
            tx.oncomplete = () => resolve();
            tx.onerror = () => reject(tx.error);
        });
    }

    /** Patch specific fields of a timer entry. */
    async patchTimer(timerId: string, patch: Partial<IDBTimerEntry>): Promise<void> {
        if (!this.db) return;
        return new Promise((resolve, reject) => {
            const tx = this.db!.transaction(STORE_TIMERS, 'readwrite');
            const store = tx.objectStore(STORE_TIMERS);
            const getReq = store.get(timerId);
            getReq.onsuccess = () => {
                const existing = getReq.result as IDBTimerEntry | undefined;
                if (!existing) { resolve(); return; }
                store.put({ ...existing, ...patch });
            };
            tx.oncomplete = () => resolve();
            tx.onerror = () => reject(tx.error);
        });
    }

    /** Get a single timer entry. */
    async getTimer(timerId: string): Promise<IDBTimerEntry | null> {
        if (!this.db) return null;
        return new Promise((resolve, reject) => {
            const tx = this.db!.transaction(STORE_TIMERS, 'readonly');
            const req = tx.objectStore(STORE_TIMERS).get(timerId);
            req.onsuccess = () => resolve((req.result as IDBTimerEntry) ?? null);
            req.onerror = () => reject(req.error);
        });
    }

    /** Get all timer entries. */
    async getAllTimers(): Promise<IDBTimerEntry[]> {
        if (!this.db) return [];
        return new Promise((resolve, reject) => {
            const tx = this.db!.transaction(STORE_TIMERS, 'readonly');
            const req = tx.objectStore(STORE_TIMERS).getAll();
            req.onsuccess = () => resolve(req.result as IDBTimerEntry[]);
            req.onerror = () => reject(req.error);
        });
    }

    /** Get timers filtered by state. */
    async getTimersByState(states: IDBTimerEntry['state'][]): Promise<IDBTimerEntry[]> {
        const all = await this.getAllTimers();
        return all.filter(e => states.includes(e.state));
    }

    /** Bulk upsert timers (used during onload to seed from JSON). */
    async bulkPutTimers(entries: IDBTimerEntry[]): Promise<void> {
        if (!this.db || entries.length === 0) return;
        return new Promise((resolve, reject) => {
            const tx = this.db!.transaction(STORE_TIMERS, 'readwrite');
            const store = tx.objectStore(STORE_TIMERS);
            for (const entry of entries) store.put(entry);
            tx.oncomplete = () => resolve();
            tx.onerror = () => reject(tx.error);
        });
    }

    // ===== Daily Duration CRUD =====

    private dailyKey(timerId: string, date: string): string {
        return `${timerId}|${date}`;
    }

    /** Get daily duration record for a specific timer+date. */
    async getDailyDur(timerId: string, date: string): Promise<DailyDurRecord | null> {
        if (!this.db) return null;
        return new Promise((resolve, reject) => {
            const tx = this.db!.transaction(STORE_DAILY, 'readonly');
            const req = tx.objectStore(STORE_DAILY).get(this.dailyKey(timerId, date));
            req.onsuccess = () => resolve((req.result as DailyDurRecord) ?? null);
            req.onerror = () => reject(req.error);
        });
    }

    /** Add delta seconds to a timer's daily duration (upsert). */
    async addDailyDur(timerId: string, date: string, deltaSec: number): Promise<void> {
        if (!this.db) return;
        return new Promise((resolve, reject) => {
            const tx = this.db!.transaction(STORE_DAILY, 'readwrite');
            const store = tx.objectStore(STORE_DAILY);
            const key = this.dailyKey(timerId, date);
            const getReq = store.get(key);
            getReq.onsuccess = () => {
                const existing = getReq.result as DailyDurRecord | undefined;
                const newDur = (existing?.duration_sec ?? 0) + deltaSec;
                store.put({ key, timer_id: timerId, stat_date: date, duration_sec: Math.max(0, newDur) });
            };
            tx.oncomplete = () => resolve();
            tx.onerror = () => reject(tx.error);
        });
    }

    /** Set (overwrite) a timer's daily duration for a specific date. */
    async setDailyDur(timerId: string, date: string, durationSec: number): Promise<void> {
        if (!this.db) return;
        return new Promise((resolve, reject) => {
            const tx = this.db!.transaction(STORE_DAILY, 'readwrite');
            const key = this.dailyKey(timerId, date);
            tx.objectStore(STORE_DAILY).put({ key, timer_id: timerId, stat_date: date, duration_sec: Math.max(0, durationSec) });
            tx.oncomplete = () => resolve();
            tx.onerror = () => reject(tx.error);
        });
    }

    /** Get all daily duration records for a specific date. */
    async getDailyDurByDate(date: string): Promise<DailyDurRecord[]> {
        if (!this.db) return [];
        return new Promise((resolve, reject) => {
            const tx = this.db!.transaction(STORE_DAILY, 'readonly');
            const index = tx.objectStore(STORE_DAILY).index('by_date');
            const req = index.getAll(date);
            req.onsuccess = () => resolve(req.result as DailyDurRecord[]);
            req.onerror = () => reject(req.error);
        });
    }

    /** Get all daily duration records for a specific timer. */
    async getDailyDurByTimer(timerId: string): Promise<DailyDurRecord[]> {
        if (!this.db) return [];
        return new Promise((resolve, reject) => {
            const tx = this.db!.transaction(STORE_DAILY, 'readonly');
            const index = tx.objectStore(STORE_DAILY).index('by_timer');
            const req = index.getAll(timerId);
            req.onsuccess = () => resolve(req.result as DailyDurRecord[]);
            req.onerror = () => reject(req.error);
        });
    }

    /** Get all daily duration records. */
    async getAllDailyDur(): Promise<DailyDurRecord[]> {
        if (!this.db) return [];
        return new Promise((resolve, reject) => {
            const tx = this.db!.transaction(STORE_DAILY, 'readonly');
            const req = tx.objectStore(STORE_DAILY).getAll();
            req.onsuccess = () => resolve(req.result as DailyDurRecord[]);
            req.onerror = () => reject(req.error);
        });
    }

    /** Bulk upsert daily duration records (used during onload to seed from JSON). */
    async bulkPutDailyDur(records: DailyDurRecord[]): Promise<void> {
        if (!this.db || records.length === 0) return;
        return new Promise((resolve, reject) => {
            const tx = this.db!.transaction(STORE_DAILY, 'readwrite');
            const store = tx.objectStore(STORE_DAILY);
            for (const r of records) store.put(r);
            tx.oncomplete = () => resolve();
            tx.onerror = () => reject(tx.error);
        });
    }

    /**
     * Adjust daily durations for a timer when user manually sets total duration.
     * Deducts from most recent dates first (LIFO).
     * @param timerId  The timer being adjusted
     * @param newTotalDur  The new total duration in seconds
     */
    async adjustDailyDurForSetDuration(timerId: string, newTotalDur: number): Promise<void> {
        if (!this.db) return;
        const records = await this.getDailyDurByTimer(timerId);
        if (records.length === 0) return;

        // Sort by date ascending (oldest first), so we preserve older dates first
        // and deduct from the most recent dates first
        records.sort((a, b) => a.stat_date.localeCompare(b.stat_date));

        let remaining = newTotalDur;
        const updates: DailyDurRecord[] = [];

        for (const rec of records) {
            if (remaining <= 0) {
                updates.push({ ...rec, duration_sec: 0 });
            } else if (remaining >= rec.duration_sec) {
                remaining -= rec.duration_sec;
                updates.push({ ...rec }); // unchanged — this date is fully preserved
            } else {
                updates.push({ ...rec, duration_sec: remaining });
                remaining = 0;
            }
        }

        await this.bulkPutDailyDur(updates);
    }

    /**
     * Atomic tick update: patch timer's total_dur_sec + last_ts,
     * and add delta to today's daily_dur — all in one transaction.
     */
    async tickUpdate(
        timerId: string,
        newTotalDur: number,
        lastTs: number,
        today: string,
        deltaSec: number
    ): Promise<void> {
        if (!this.db) return;
        return new Promise((resolve, reject) => {
            const tx = this.db!.transaction([STORE_TIMERS, STORE_DAILY], 'readwrite');

            // Patch timer
            const timerStore = tx.objectStore(STORE_TIMERS);
            const getReq = timerStore.get(timerId);
            getReq.onsuccess = () => {
                const existing = getReq.result as IDBTimerEntry | undefined;
                if (existing) {
                    timerStore.put({ ...existing, total_dur_sec: newTotalDur, last_ts: lastTs });
                }
            };

            // Add delta to daily_dur
            const dailyStore = tx.objectStore(STORE_DAILY);
            const dailyKey = `${timerId}|${today}`;
            const dailyGetReq = dailyStore.get(dailyKey);
            dailyGetReq.onsuccess = () => {
                const existing = dailyGetReq.result as DailyDurRecord | undefined;
                const newDur = (existing?.duration_sec ?? 0) + deltaSec;
                dailyStore.put({ key: dailyKey, timer_id: timerId, stat_date: today, duration_sec: Math.max(0, newDur) });
            };

            tx.oncomplete = () => resolve();
            tx.onerror = () => reject(tx.error);
        });
    }
}
