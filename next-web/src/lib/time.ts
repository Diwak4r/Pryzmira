const UNITS: [Intl.RelativeTimeFormatUnit, number][] = [
    ['year', 60 * 60 * 24 * 365],
    ['month', 60 * 60 * 24 * 30],
    ['week', 60 * 60 * 24 * 7],
    ['day', 60 * 60 * 24],
    ['hour', 60 * 60],
    ['minute', 60],
];

const rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });

export function timeAgo(isoDate: string): string {
    const seconds = Math.round((Date.parse(isoDate) - Date.now()) / 1000);
    const abs = Math.abs(seconds);

    if (abs < 60) return 'just now';

    for (const [unit, secondsInUnit] of UNITS) {
        if (abs >= secondsInUnit) {
            const value = Math.round(seconds / secondsInUnit);
            return rtf.format(value, unit);
        }
    }

    return rtf.format(Math.round(seconds / 60), 'minute');
}

export function hoursSince(isoDate: string): number {
    return (Date.now() - Date.parse(isoDate)) / (1000 * 60 * 60);
}

export function isFresh(isoDate: string, thresholdHours = 6): boolean {
    return hoursSince(isoDate) <= thresholdHours;
}
