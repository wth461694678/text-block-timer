// —— Utility: Format time according to selected format —— //
export class TimeFormatter {
    // Format options:
    // 'smart' - Hide "00:" when hours=0, show full time when hours>0
    // 'full'  - Always show with HH:MM:SS format
    static formatTime(totalSeconds: number, format: 'full' | 'smart' = 'full'): string {
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;

        const formattedHours = String(hours).padStart(2, '0');
        const formattedMinutes = String(minutes).padStart(2, '0');
        const formattedSeconds = String(seconds).padStart(2, '0');

        switch (format) {
            case 'full':
                return `${formattedHours}:${formattedMinutes}:${formattedSeconds}`;
            case 'smart':
                if (hours === 0) {
                    return `${formattedMinutes}:${formattedSeconds}`;
                } else {
                    return `${formattedHours}:${formattedMinutes}:${formattedSeconds}`;
                }
            default:
                return `${formattedHours}:${formattedMinutes}:${formattedSeconds}`;
        }
    }
}
