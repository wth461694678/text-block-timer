import { TimerData } from './TimerDataUpdater';
import { UPDATE_INTERVAL, DEBUG } from './constants';

interface TimerEntry {
    intervalId: ReturnType<typeof setInterval>;
    data: TimerData;
}

// —— Enhanced TimerManager - Data and lifecycle management —— //
export class TimerManager {
    timers: Map<string, TimerEntry> = new Map();
    startedIds: Set<string> = new Set(); // track all timerIds started in this onload session
    runningTicks: Set<string> = new Set(); // prevent overlapping onTick executions

    // Page visibility monitoring
    isVisible: boolean;
    lastVisibleTime: number;
    backgroundThreshold = 1000; // 1 second threshold

    constructor() {
        this.isVisible = !document.hidden;
        this.lastVisibleTime = Date.now();
        this.setupVisibilityMonitor();
    }

    setupVisibilityMonitor() {
        const handleVisibilityChange = () => {
            this.isVisible = !document.hidden;
            if (this.isVisible) {
                this.lastVisibleTime = Date.now();
                if (DEBUG) console.log('[TimerManager] 页面回到前台');
            } else {
                if (DEBUG) console.log('[TimerManager] 页面进入后台');
            }
        };
        document.addEventListener('visibilitychange', handleVisibilityChange);
        if (this.isVisible) this.lastVisibleTime = Date.now();
    }

    // Check whether onTick should be skipped (background > 1 min)
    shouldSkipTick(): boolean {
        if (this.isVisible) return false;
        const backgroundDuration = Date.now() - this.lastVisibleTime;
        const shouldSkip = backgroundDuration > this.backgroundThreshold;
        if (shouldSkip && DEBUG) {
            console.log(`[TimerManager] 后台时间 ${Math.round(backgroundDuration / 1000)}s，跳过onTick`);
        }
        return shouldSkip;
    }

    startTimer(timerId: string, initialData: TimerData, tickCallback: (id: string) => void) {
        if (this.hasTimer(timerId)) return;

        const intervalId = setInterval(() => {
            tickCallback(timerId);
        }, UPDATE_INTERVAL);

        this.timers.set(timerId, { intervalId, data: initialData });
        this.startedIds.add(timerId);

        if (DEBUG) console.log(`Timer started: ${timerId}`);
    }

    stopTimer(timerId: string) {
        const timer = this.timers.get(timerId);
        if (timer) {
            clearInterval(timer.intervalId);
            this.timers.delete(timerId);
        }
        if (DEBUG) console.log(`Timer stopped: ${timerId}`);
    }

    updateTimerData(timerId: string, newData: TimerData) {
        const timer = this.timers.get(timerId);
        if (timer) timer.data = newData;
    }

    getTimerData(timerId: string): TimerData | null {
        const timer = this.timers.get(timerId);
        return timer ? timer.data : null;
    }

    hasTimer(timerId: string): boolean {
        return this.timers.has(timerId);
    }

    isStartedInThisSession(timerId: string): boolean {
        return this.startedIds.has(timerId);
    }

    getAllTimers(): Map<string, TimerData> {
        const result = new Map<string, TimerData>();
        this.timers.forEach((timer, id) => result.set(id, timer.data));
        return result;
    }

    clearAll() {
        this.timers.forEach((timer) => clearInterval(timer.intervalId));
        this.timers.clear();
        this.startedIds.clear();
        this.runningTicks.clear();
    }
}
