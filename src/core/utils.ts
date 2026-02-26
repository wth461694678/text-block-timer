import { BASE62_CHARS } from './constants';

/**
 * Compress a timestamp into a Base62 string ID.
 */
export function compressId(timestamp?: number): string {
    if (!timestamp) timestamp = Date.now();
    let num = timestamp;
    if (num === 0) return 't0';

    let result = '';
    while (num > 0) {
        result = BASE62_CHARS[num % 62] + result;
        num = Math.floor(num / 62);
    }
    return result;
}
