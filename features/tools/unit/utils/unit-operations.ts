export interface DataUnit {
    id: string;
    label: string;
    shortLabel: string;
    bytes: number;
}

export const BINARY_UNITS: DataUnit[] = [
    { id: 'b', label: 'Bytes', shortLabel: 'B', bytes: 1 },
    { id: 'kib', label: 'Kibibytes', shortLabel: 'KiB', bytes: 1024 },
    { id: 'mib', label: 'Mebibytes', shortLabel: 'MiB', bytes: 1024 ** 2 },
    { id: 'gib', label: 'Gibibytes', shortLabel: 'GiB', bytes: 1024 ** 3 },
    { id: 'tib', label: 'Tebibytes', shortLabel: 'TiB', bytes: 1024 ** 4 },
    { id: 'pib', label: 'Pebibytes', shortLabel: 'PiB', bytes: 1024 ** 5 },
    { id: 'eib', label: 'Exbibytes', shortLabel: 'EiB', bytes: 1024 ** 6 },
];

export const DECIMAL_UNITS: DataUnit[] = [
    { id: 'b', label: 'Bytes', shortLabel: 'B', bytes: 1 },
    { id: 'kb', label: 'Kilobytes', shortLabel: 'KB', bytes: 1000 },
    { id: 'mb', label: 'Megabytes', shortLabel: 'MB', bytes: 1000 ** 2 },
    { id: 'gb', label: 'Gigabytes', shortLabel: 'GB', bytes: 1000 ** 3 },
    { id: 'tb', label: 'Terabytes', shortLabel: 'TB', bytes: 1000 ** 4 },
    { id: 'pb', label: 'Petabytes', shortLabel: 'PB', bytes: 1000 ** 5 },
    { id: 'eb', label: 'Exabytes', shortLabel: 'EB', bytes: 1000 ** 6 },
];

export type UnitSystem = 'binary' | 'decimal';

export function convertDataSize(
    value: number,
    fromId: string,
    toId: string,
    system: UnitSystem,
): number {
    const units = system === 'binary' ? BINARY_UNITS : DECIMAL_UNITS;
    const from = units.find((u) => u.id === fromId);
    const to = units.find((u) => u.id === toId);
    if (!from || !to || from.bytes === 0) return 0;
    return (value * from.bytes) / to.bytes;
}

export function convertToAllDataSizes(
    value: number,
    fromId: string,
    system: UnitSystem,
): { unit: DataUnit; value: number; formatted: string }[] {
    const units = system === 'binary' ? BINARY_UNITS : DECIMAL_UNITS;
    return units.map((unit) => {
        const converted = convertDataSize(value, fromId, unit.id, system);
        return {
            unit,
            value: converted,
            formatted: formatNumber(converted),
        };
    });
}

export function formatNumber(n: number): string {
    if (n === 0) return '0';
    const abs = Math.abs(n);
    if (Number.isInteger(n) && abs < 1e15) {
        return n.toLocaleString('en-US');
    }
    if (abs >= 1e6) {
        return n.toExponential(4);
    }
    if (abs >= 1) {
        return parseFloat(n.toPrecision(10)).toLocaleString('en-US', {
            maximumFractionDigits: 6,
        });
    }
    return parseFloat(n.toPrecision(10)).toString();
}

export interface TimeUnit {
    id: string;
    label: string;
    shortLabel: string;
    seconds: number;
}

export const TIME_UNITS: TimeUnit[] = [
    { id: 'ns', label: 'Nanoseconds', shortLabel: 'ns', seconds: 1e-9 },
    { id: 'us', label: 'Microseconds', shortLabel: 'μs', seconds: 1e-6 },
    { id: 'ms', label: 'Milliseconds', shortLabel: 'ms', seconds: 1e-3 },
    { id: 's', label: 'Seconds', shortLabel: 's', seconds: 1 },
    { id: 'min', label: 'Minutes', shortLabel: 'min', seconds: 60 },
    { id: 'h', label: 'Hours', shortLabel: 'h', seconds: 3600 },
    { id: 'd', label: 'Days', shortLabel: 'd', seconds: 86400 },
    { id: 'wk', label: 'Weeks', shortLabel: 'wk', seconds: 604800 },
    { id: 'mo', label: 'Months (30d)', shortLabel: 'mo', seconds: 2592000 },
    { id: 'yr', label: 'Years (365d)', shortLabel: 'yr', seconds: 31536000 },
];

export function convertTimeDuration(value: number, fromId: string, toId: string): number {
    const from = TIME_UNITS.find((u) => u.id === fromId);
    const to = TIME_UNITS.find((u) => u.id === toId);
    if (!from || !to || from.seconds === 0) return 0;
    return (value * from.seconds) / to.seconds;
}

export function convertToAllTimeDurations(
    value: number,
    fromId: string,
): { unit: TimeUnit; value: number; formatted: string }[] {
    return TIME_UNITS.map((unit) => {
        const converted = convertTimeDuration(value, fromId, unit.id);
        return {
            unit,
            value: converted,
            formatted: formatNumber(converted),
        };
    });
}

export interface TzInfo {
    id: string;
    label: string;
    offset: string;
}

function formatOffset(date: Date, tz: string): string {
    try {
        const formatter = new Intl.DateTimeFormat('en-US', {
            timeZone: tz,
            timeZoneName: 'shortOffset',
        });
        const parts = formatter.formatToParts(date);
        const tzPart = parts.find((p) => p.type === 'timeZoneName');
        return tzPart?.value ?? tz;
    } catch {
        return tz;
    }
}

export const POPULAR_TIMEZONES: TzInfo[] = [
    { id: 'UTC', label: 'UTC', offset: 'UTC' },
    { id: 'America/New_York', label: 'New York', offset: 'EST/EDT' },
    { id: 'America/Chicago', label: 'Chicago', offset: 'CST/CDT' },
    { id: 'America/Denver', label: 'Denver', offset: 'MST/MDT' },
    { id: 'America/Los_Angeles', label: 'Los Angeles', offset: 'PST/PDT' },
    { id: 'America/Sao_Paulo', label: 'São Paulo', offset: 'BRT' },
    { id: 'Europe/London', label: 'London', offset: 'GMT/BST' },
    { id: 'Europe/Paris', label: 'Paris', offset: 'CET/CEST' },
    { id: 'Europe/Berlin', label: 'Berlin', offset: 'CET/CEST' },
    { id: 'Europe/Moscow', label: 'Moscow', offset: 'MSK' },
    { id: 'Asia/Dubai', label: 'Dubai', offset: 'GST' },
    { id: 'Asia/Kolkata', label: 'Kolkata', offset: 'IST' },
    { id: 'Asia/Shanghai', label: 'Shanghai', offset: 'CST' },
    { id: 'Asia/Tokyo', label: 'Tokyo', offset: 'JST' },
    { id: 'Asia/Seoul', label: 'Seoul', offset: 'KST' },
    { id: 'Australia/Sydney', label: 'Sydney', offset: 'AEST/AEDT' },
    { id: 'Pacific/Auckland', label: 'Auckland', offset: 'NZST/NZDT' },
];

export function formatTimeInZone(date: Date, tz: string): string {
    try {
        return new Intl.DateTimeFormat('en-US', {
            timeZone: tz,
            year: 'numeric',
            month: 'short',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: true,
        }).format(date);
    } catch {
        return date.toLocaleString();
    }
}

export function formatTimeISO(date: Date, tz: string): string {
    try {
        const opts: Intl.DateTimeFormatOptions = {
            timeZone: tz,
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false,
        };
        const parts = new Intl.DateTimeFormat('en-CA', opts).formatToParts(date);
        const get = (type: string) => parts.find((p) => p.type === type)?.value ?? '00';
        return `${get('year')}-${get('month')}-${get('day')}T${get('hour')}:${get('minute')}:${get('second')}`;
    } catch {
        return date.toISOString();
    }
}

export function getTimezoneOffsetLabel(tz: string, refDate: Date): string {
    return formatOffset(refDate, tz);
}

export function getAllTimezones(): TzInfo[] {
    try {
        const supported = Intl.supportedValuesOf('timeZone');
        return supported.map((tz) => ({
            id: tz,
            label: tz.replace(/_/g, ' ').replace(/\//g, ' / '),
            offset: formatOffset(new Date(), tz),
        }));
    } catch {
        return POPULAR_TIMEZONES;
    }
}
