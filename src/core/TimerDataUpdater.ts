import { compressId } from './utils';

export interface TimerData {
    class: 'timer-r' | 'timer-p';
    timerId: string;
    dur: number;
    ts: number;
    project?: string | null;
    newDur?: number;
    // parsed position fields (used by TimerParser)
    beforeIndex?: number;
    afterIndex?: number;
}

type TimerAction = 'init' | 'continue' | 'pause' | 'update' | 'restore' | 'forcepause' | 'setDuration';

// —— TimerDataUpdater - Pure function for timer data calculations —— //
export class TimerDataUpdater {
    static calculate(action: TimerAction, oldData: Partial<TimerData>, now = Math.floor(Date.now() / 1000)): TimerData {
        let newData: TimerData;
        switch (action) {
            case 'init':
                newData = {
                    class: 'timer-r',
                    timerId: compressId(),
                    dur: 0,
                    ts: now
                };
                break;
            case 'continue':
                newData = {
                    ...(oldData as TimerData),
                    class: 'timer-r',
                    ts: now
                };
                break;

            case 'pause': {
                const elapsed = oldData ? now - (oldData.ts ?? now) : 0;
                newData = {
                    ...(oldData as TimerData),
                    class: 'timer-p',
                    dur: (oldData.dur || 0) + elapsed,
                    ts: now
                };
                break;
            }

            case 'update': {
                if ((oldData as TimerData).class !== 'timer-r') return oldData as TimerData;
                const updateElapsed = now - (oldData.ts ?? now);
                newData = {
                    ...(oldData as TimerData),
                    dur: (oldData.dur || 0) + updateElapsed,
                    ts: now
                };
                break;
            }

            case 'restore': {
                const restoreElapsed = oldData ? now - (oldData.ts ?? now) : 0;
                newData = {
                    ...(oldData as TimerData),
                    class: 'timer-r',
                    dur: (oldData.dur || 0) + restoreElapsed,
                    ts: now
                };
                break;
            }

            case 'forcepause':
                newData = {
                    ...(oldData as TimerData),
                    class: 'timer-p'
                };
                break;

            case 'setDuration':
                // Set timer to a specific duration (in seconds)
                // oldData.newDur is passed as the target duration
                newData = {
                    ...(oldData as TimerData),
                    dur: oldData.newDur ?? 0,
                    newDur: undefined
                };
                delete newData.newDur;
                break;

            default:
                newData = oldData as TimerData;
                break;
        }
        return newData;
    }
}
