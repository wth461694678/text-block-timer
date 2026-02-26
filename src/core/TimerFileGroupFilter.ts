import { ScannedTimer } from './TimerScanner';

export interface TimerFileGroup {
    id: string;
    name: string;
    whitelist: string[];
    blacklist: string[];
}

/**
 * Match a file path against a pattern.
 * - If the pattern is wrapped in /.../ (optionally with flags like /pattern/i),
 *   it is treated as a regular expression.
 * - Otherwise it is treated as a plain path prefix (folders must end with /).
 */
function matchesPattern(path: string, pattern: string): boolean {
    const regexMatch = pattern.match(/^\/(.+)\/([gimsuy]*)$/);
    if (regexMatch) {
        try {
            const re = new RegExp(regexMatch[1], regexMatch[2]);
            return re.test(path);
        } catch {
            // Invalid regex — fall back to prefix match
            return path.startsWith(pattern);
        }
    }
    // Plain text: if no explicit extension, treat as folder (append /)
    let normalizedPattern = pattern;
    if (!normalizedPattern.endsWith('/')) {
        const lastSegment = normalizedPattern.split('/').pop() ?? '';
        if (!lastSegment.includes('.')) {
            normalizedPattern = normalizedPattern + '/';
        }
    }
    return path.startsWith(normalizedPattern);
}

export class TimerFileGroupFilter {
    static filter(timers: ScannedTimer[], group: TimerFileGroup | null): ScannedTimer[] {
        if (!group) return timers;

        return timers.filter(timer => {
            const path = timer.filePath;
            // Blacklist takes priority — if matched, exclude
            if (group.blacklist.some(p => matchesPattern(path, p))) return false;
            // Empty whitelist means only blacklist applies — pass everything else
            if (group.whitelist.length === 0) return true;
            // Must match whitelist
            return group.whitelist.some(p => matchesPattern(path, p));
        });
    }
}
