import { DEBUG } from '../core/constants';

interface PerfEntry {
    count: number;
    total: number;
    max: number;
}

interface IntervalEntry {
    lastCallTime: number;
    gaps: number[];
}

// Startup phase timing mark
interface StartupMark {
    label: string;
    ts: number;
}

// Performance monitor: lightweight sync/async timing collector
export class PerfMonitor {
    enabled = false;
    data: Map<string, PerfEntry> = new Map();
    sessionName: string | null = null;
    startTime = 0;
    endTime = 0;
    intervalTracking = false;
    intervals: Map<string, IntervalEntry> = new Map();

    // Startup phase marks
    private startupMarks: StartupMark[] = [];
    private startupBegin = 0;

    // ===== Startup Phase Profiling =====

    /**
     * Mark a startup phase checkpoint.
     * Call this at each key step in onload() to measure how long each phase takes.
     */
    startupMark(label: string): void {
        const ts = Date.now();
        if (this.startupMarks.length === 0) {
            this.startupBegin = ts;
        }
        this.startupMarks.push({ label, ts });
    }

    /**
     * Print the startup phase report to console.
     * Shows elapsed time from plugin load start and delta between each phase.
     */
    startupReport(): void {
        if (this.startupMarks.length === 0) {
            console.log('[PerfMonitor] No startup marks recorded.');
            return;
        }
        console.group('[PerfMonitor] Startup Phase Report');
        console.log(`Total marks: ${this.startupMarks.length}`);
        let prev = this.startupBegin;
        for (const mark of this.startupMarks) {
            const elapsed = mark.ts - this.startupBegin;
            const delta = mark.ts - prev;
            console.log(`  [+${String(elapsed).padStart(5)}ms | Δ${String(delta).padStart(4)}ms]  ${mark.label}`);
            prev = mark.ts;
        }
        const total = (this.startupMarks[this.startupMarks.length - 1].ts) - this.startupBegin;
        console.log(`--- Total startup time: ${total}ms ---`);
        console.groupEnd();
    }

    clearStartupMarks(): void {
        this.startupMarks = [];
        this.startupBegin = 0;
    }

    startSession() {
        this.enabled = true;
        this.startTime = Date.now();
        console.log('[PerfMonitor] 使用方法:');
        console.log('• PerfMonitorStart() - 开始监控');
        console.log('• PerfMonitorStop() - 停止监控并查看报告');
        PerfMonitor.wrapCoreClasses();
    }

    stopSession() {
        this.enabled = false;
        this.endTime = Date.now();
        console.log(`[PerfMonitor] session stopped, duration ${this.endTime - this.startTime} ms`);
        this.print();
        this.reset(true);
    }

    reset(silent = false) {
        this.data.clear();
        this.intervals.clear();
        if (!silent) console.log('[PerfMonitor] reset');
    }

    enableIntervalTracking() {
        this.intervalTracking = true;
        console.log('[PerfMonitor] interval tracking enabled');
    }

    disableIntervalTracking() {
        this.intervalTracking = false;
        console.log('[PerfMonitor] interval tracking disabled');
    }

    recordInterval(name: string) {
        if (!this.intervalTracking) return;
        const now = Date.now();
        if (!this.intervals.has(name)) {
            this.intervals.set(name, { lastCallTime: now, gaps: [] });
            return;
        }
        const interval = this.intervals.get(name)!;
        const gap = now - interval.lastCallTime;
        interval.gaps.push(gap);
        interval.lastCallTime = now;
        if (gap > 5000) {
            console.warn(`[PerfMonitor] ${name} 异常间隔: ${gap}ms，可能是后台节流恢复`);
        }
    }

    printIntervals() {
        if (!this.intervalTracking) {
            console.log('[PerfMonitor] interval tracking not enabled');
            return;
        }
        console.group('[PerfMonitor] Interval Analysis');
        this.intervals.forEach((data, name) => {
            if (data.gaps.length === 0) {
                console.log(`${name}: no intervals recorded`);
                return;
            }
            const gaps = data.gaps;
            const min = Math.min(...gaps);
            const max = Math.max(...gaps);
            const avg = Math.round(gaps.reduce((a, b) => a + b, 0) / gaps.length);
            const abnormal = gaps.filter(g => g > 5000).length;
            console.log(`${name}: ${gaps.length} intervals, min ${min}ms, max ${max}ms, avg ${avg}ms, abnormal(>5s) ${abnormal}`);
        });
        console.groupEnd();
    }

    record(name: string, ms: number) {
        if (!this.data.has(name)) this.data.set(name, { count: 0, total: 0, max: 0 });
        const v = this.data.get(name)!;
        v.count += 1;
        v.total += ms;
        if (ms > v.max) v.max = ms;
    }

    timeSync<T>(name: string, fn: (...args: unknown[]) => T, ...args: unknown[]): T {
        const t0 = Date.now();
        const res = fn(...args);
        this.record(name, Date.now() - t0);
        return res;
    }

    timeAsync<T>(name: string, fn: (...args: unknown[]) => Promise<T>, ...args: unknown[]): Promise<T> {
        const t0 = Date.now();
        return Promise.resolve(fn(...args)).then((r) => {
            this.record(name, Date.now() - t0);
            return r;
        });
    }

    print() {
        const rows = Array.from(this.data.entries()).map(([k, v]) => ({
            k,
            count: v.count,
            total: v.total,
            avg: Math.round(v.total / v.count),
            max: v.max
        }));
        rows.sort((a, b) => b.total - a.total);
        console.group('[PerfMonitor] Summary');
        rows.forEach(r => console.log(`${r.k}: ${r.total}ms over ${r.count} calls (avg ${r.avg}ms, max ${r.max}ms)`));
        console.groupEnd();
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    wrapMethod(object: any, methodName: string, displayName: string | null = null) {
        if (!object) return;
        const orig = object[methodName];
        if (!orig || orig._perfmonitor_wrapped) return;
        const name = displayName || `${object.constructor?.name ?? 'obj'}.${methodName}`;
        const self = this;
        object[methodName] = function (...args: unknown[]) {
            if (!(window as any).__PerfMonitor?.enabled) return orig.apply(this, args);
            self.recordInterval(name);
            const t0 = Date.now();
            try {
                const res = orig.apply(this, args);
                if (res && typeof res.then === 'function') {
                    return res.then((r: unknown) => {
                        self.record(name, Date.now() - t0);
                        return r;
                    }).catch((e: unknown) => {
                        self.record(name, Date.now() - t0);
                        throw e;
                    });
                } else {
                    self.record(name, Date.now() - t0);
                    return res;
                }
            } catch (err) {
                self.record(name, Date.now() - t0);
                throw err;
            }
        };
        object[methodName]._perfmonitor_wrapped = true;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    wrapMethods(object: any, methodNames: string[], prefix = '') {
        for (const m of methodNames) this.wrapMethod(object, m, prefix ? `${prefix}.${m}` : m);
    }

    static initGlobalMonitor() {
        const w = window as any;
        if (!w.__PerfMonitor) {
            w.__PerfMonitor = new PerfMonitor();
            w.PerfMonitorStart = () => w.__PerfMonitor.startSession();
            w.PerfMonitorStop = () => w.__PerfMonitor.stopSession();
            w.PerfMonitorPrint = () => w.__PerfMonitor.print();
            w.PerfMonitorIntervalStart = () => w.__PerfMonitor.enableIntervalTracking();
            w.PerfMonitorIntervalStop = () => w.__PerfMonitor.disableIntervalTracking();
            w.PerfMonitorIntervalPrint = () => w.__PerfMonitor.printIntervals();
            w.PerfMonitorStartupMark = (label: string) => w.__PerfMonitor.startupMark(label);
            w.PerfMonitorStartupReport = () => w.__PerfMonitor.startupReport();
            w.PerfMonitorClearStartupMarks = () => w.__PerfMonitor.clearStartupMarks();
            console.log('[PerfMonitor] Debug mode enabled. Use PerfMonitorStart() to begin monitoring.');
        }
    }

    static wrapCoreClasses() {
        if (!DEBUG) return;
        const w = window as any;
        if (!w.__PerfMonitor) return;
        try {
            if (typeof w.TimerManager !== 'undefined') {
                w.__PerfMonitor.wrapMethods(w.TimerManager.prototype, ['startTimer', 'stopTimer', 'updateTimerData', 'getTimerData', 'hasTimer', 'clearAll'], 'TimerManager');
            }
            if (typeof w.TimerFileManager !== 'undefined') {
                w.__PerfMonitor.wrapMethods(w.TimerFileManager.prototype, ['writeTimer', 'updateTimerByIdWithSearch', 'findTimerGlobally', 'calculateInsertPosition', 'upgradeOldTimers'], 'TimerFileManager');
            }
            if (typeof w.TimerParser !== 'undefined') {
                w.__PerfMonitor.wrapMethods(w.TimerParser, ['parse', 'parseOldFormat', 'parseNewFormat'], 'TimerParser');
            }
            if (typeof w.TimerRenderer !== 'undefined') {
                w.__PerfMonitor.wrapMethods(w.TimerRenderer, ['render'], 'TimerRenderer');
            }
            if (typeof w.TimerDataUpdater !== 'undefined') {
                w.__PerfMonitor.wrapMethods(w.TimerDataUpdater, ['calculate'], 'TimerDataUpdater');
            }
            if (typeof w.TimerPlugin !== 'undefined') {
                w.__PerfMonitor.wrapMethods(w.TimerPlugin.prototype, ['onload', 'onunload', 'onEditorMenu', 'onFileOpen', 'restoreTimers', 'handleStart', 'handlePause', 'handleContinue', 'handleDelete', 'handleSetDuration', 'onTick'], 'TimerPlugin');
            }
        } catch (e) {
            console.error('[PerfMonitor] Wrap failed:', e);
        }
    }
}
