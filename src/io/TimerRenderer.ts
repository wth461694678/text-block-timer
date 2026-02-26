import { TimerData } from '../core/TimerDataUpdater';
import { TimeFormatter } from './TimeFormatter';
import { TimerSettings } from '../ui/TimerSettingTab';

// —— Utility: Format time and render span —— //
export class TimerRenderer {
    static render(timerData: TimerData, settings: TimerSettings | null = null): string {
        const totalSeconds = timerData.dur;

        const timeFormat = settings?.timeDisplayFormat ?? 'full';
        const formatted = TimeFormatter.formatTime(totalSeconds, timeFormat as 'full' | 'smart');

        let timericon: string;
        if (settings) {
            const runningIcon = settings.runningIcon !== undefined ? settings.runningIcon : '⏳';
            const pausedIcon = settings.pausedIcon !== undefined ? settings.pausedIcon : '💐';
            timericon = timerData.class === 'timer-r' ? runningIcon : pausedIcon;
        } else {
            timericon = timerData.class === 'timer-r' ? '⏳' : '💐';
        }

        const projectAttr = timerData.project ? ` data-project="${timerData.project}"` : '';
        return `<span class="${timerData.class}" id="${timerData.timerId}" data-dur="${timerData.dur}" data-ts="${timerData.ts}"${projectAttr}>【${timericon}${formatted} 】</span>`;
    }
}
