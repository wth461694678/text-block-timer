import { TimerData } from '../core/TimerDataUpdater';
import { compressId } from '../core/utils';

// —— Utility: Parse existing span data —— //
export class TimerParser {
    static parse(lineText: string, version: 'v1' | 'v2' | 'auto' = 'auto', targetTimerId: string | null = null): TimerData | null {
        const tpl = document.createElement('template');
        tpl.innerHTML = lineText.trim();

        // Check old format first (skip if version === 'v2')
        if (version === 'v1' || version === 'auto') {
            const oldSelector = targetTimerId ? `.timer-btn[timerId="${targetTimerId}"]` : '.timer-btn';
            const oldTimer = tpl.content.querySelector(oldSelector);
            if (oldTimer) {
                const parsed = this.parseOldFormat(lineText, oldTimer as HTMLElement);
                if (parsed) return parsed;
            }
        }

        // Check new format (skip if version === 'v1')
        if (version === 'v2' || version === 'auto') {
            const newSelector = targetTimerId
                ? `.timer-r[id="${targetTimerId}"], .timer-p[id="${targetTimerId}"]`
                : '.timer-r, .timer-p';
            const newTimer = tpl.content.querySelector(newSelector);
            if (newTimer) {
                const parsed = this.parseNewFormat(lineText, newTimer as HTMLElement);
                if (parsed) return parsed;
            }
        }

        return null;
    }

    static parseOldFormat(lineText: string, timerEl: HTMLElement): TimerData | null {
        const oldId = timerEl.getAttribute('timerId') || timerEl.getAttribute('data-timerId');
        const status = timerEl.getAttribute('Status') || timerEl.getAttribute('data-Status');
        const dur = parseInt(timerEl.getAttribute('AccumulatedTime') || timerEl.getAttribute('data-AccumulatedTime') || '0', 10);
        const ts = parseInt(timerEl.getAttribute('currentStartTimeStamp') || timerEl.getAttribute('data-currentStartTimeStamp') || '0', 10);

        const newId = oldId ? compressId(parseInt(oldId)) : compressId();

        const regex = new RegExp(`<span[^>]*timerId="${oldId}"[^>]*>.*?</span>`);
        const match = lineText.match(regex);
        if (!match) return null;

        return {
            class: status === 'Running' ? 'timer-r' : 'timer-p',
            timerId: newId,
            dur,
            ts,
            project: null,
            beforeIndex: match.index!,
            afterIndex: match.index! + match[0].length
        };
    }

    static parseNewFormat(lineText: string, timerEl: HTMLElement): TimerData | null {
        const timerId = timerEl.id;
        const className = timerEl.className as 'timer-r' | 'timer-p';
        const dur = parseInt((timerEl as HTMLElement).dataset.dur ?? '0', 10);
        const ts = parseInt((timerEl as HTMLElement).dataset.ts ?? '0', 10);
        const project = (timerEl as HTMLElement).dataset.project ?? null;

        const regex = new RegExp(`<span[^>]*id="${timerId}"[^>]*>.*?</span>`);
        const match = lineText.match(regex);
        if (!match) return null;

        return {
            class: className,
            timerId,
            dur,
            ts,
            project,
            beforeIndex: match.index!,
            afterIndex: match.index! + match[0].length
        };
    }
}
