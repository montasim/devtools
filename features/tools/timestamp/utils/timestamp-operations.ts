export interface ParsedTimestamp {
    unix: number;
    unixMs: number;
    iso: string;
    utcString: string;
    relative: string;
    year: number;
    month: number;
    day: number;
    hour: number;
    minute: number;
    second: number;
    dayOfWeek: string;
    timezone: string;
    isValid: boolean;
    error?: string;
}

const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const EMPTY: ParsedTimestamp = {
    unix: 0,
    unixMs: 0,
    iso: '',
    utcString: '',
    relative: '',
    year: 0,
    month: 0,
    day: 0,
    hour: 0,
    minute: 0,
    second: 0,
    dayOfWeek: '',
    timezone: 'UTC',
    isValid: false,
};

export function formatRelative(diffSeconds: number): string {
    const abs = Math.abs(diffSeconds);
    let value: number;
    let unit: string;

    if (abs < 60) {
        value = abs;
        unit = value === 1 ? 'second' : 'seconds';
    } else if (abs < 3600) {
        value = Math.floor(abs / 60);
        unit = value === 1 ? 'minute' : 'minutes';
    } else if (abs < 86400) {
        value = Math.floor(abs / 3600);
        unit = value === 1 ? 'hour' : 'hours';
    } else if (abs < 604800) {
        value = Math.floor(abs / 86400);
        unit = value === 1 ? 'day' : 'days';
    } else if (abs < 2592000) {
        value = Math.floor(abs / 604800);
        unit = value === 1 ? 'week' : 'weeks';
    } else if (abs < 31536000) {
        value = Math.floor(abs / 2592000);
        unit = value === 1 ? 'month' : 'months';
    } else {
        value = Math.floor(abs / 31536000);
        unit = value === 1 ? 'year' : 'years';
    }

    return diffSeconds < 0 ? `${value} ${unit} ago` : `in ${value} ${unit}`;
}

export function relativeTime(unixSeconds: number, nowSeconds: number): string {
    const diff = unixSeconds - nowSeconds;
    return formatRelative(diff);
}

export function parseInput(input: string): ParsedTimestamp {
    if (!input.trim()) {
        return { ...EMPTY, error: 'Enter a timestamp or date string' };
    }

    let date: Date | null = null;

    const trimmed = input.trim();
    const asNumber = Number(trimmed);

    if (!isNaN(asNumber) && trimmed !== '') {
        const abs = Math.abs(asNumber);
        if (abs < 1e12) {
            date = new Date(asNumber * 1000);
        } else {
            date = new Date(asNumber);
        }
    }

    if (!date || isNaN(date.getTime())) {
        const parsed = new Date(trimmed);
        if (!isNaN(parsed.getTime())) {
            date = parsed;
        }
    }

    if (!date || isNaN(date.getTime())) {
        return { ...EMPTY, error: 'Could not parse timestamp' };
    }

    const unixMs = date.getTime();
    const unix = Math.floor(unixMs / 1000);
    const nowSeconds = Math.floor(Date.now() / 1000);

    return {
        unix,
        unixMs,
        iso: date.toISOString(),
        utcString: date.toUTCString(),
        relative: relativeTime(unix, nowSeconds),
        year: date.getUTCFullYear(),
        month: date.getUTCMonth() + 1,
        day: date.getUTCDate(),
        hour: date.getUTCHours(),
        minute: date.getUTCMinutes(),
        second: date.getUTCSeconds(),
        dayOfWeek: DAY_NAMES[date.getUTCDay()],
        timezone: 'UTC',
        isValid: true,
    };
}
