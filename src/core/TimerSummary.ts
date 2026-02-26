import { TimerManager } from './TimerManager';
import { ScannedTimer } from './TimerScanner';
import { TimeFormatter } from '../io/TimeFormatter';

export interface SummaryResult {
    totalSec: number;
    runningCount: number;
    runningSec: number;
    pausedSec: number;
}

export class TimerSummary {
    static calculate(timers: ScannedTimer[], manager: TimerManager): SummaryResult {
        let totalSec = 0;
        let runningCount = 0;

        let runningSec = 0;
        let pausedSec = 0;

        for (const timer of timers) {
            // Use in-memory real-time value for running timers
            const memData = manager.getTimerData(timer.timerId);
            const dur = memData ? memData.dur : timer.dur;
            totalSec += dur;
            if (timer.state === 'timer-r') {
                runningCount++;
                runningSec += dur;
            } else {
                pausedSec += dur;
            }
        }

        return { totalSec, runningCount, runningSec, pausedSec };
    }

    static format(summary: SummaryResult): string {
        const totalStr = TimeFormatter.formatTime(summary.totalSec, 'full');
        const runningStr = TimeFormatter.formatTime(summary.runningSec, 'full');
        const pausedStr = TimeFormatter.formatTime(summary.pausedSec, 'full');
        return `Total: ${totalStr}  ·  ▶ ${runningStr}  ·  ⏸ ${pausedStr}`;
    }
}
