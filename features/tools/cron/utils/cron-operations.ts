export interface CronField {
    label: string;
    key: string;
    min: number;
    max: number;
}

export const CRON_FIELDS: CronField[] = [
    { label: 'Minute', key: 'minute', min: 0, max: 59 },
    { label: 'Hour', key: 'hour', min: 0, max: 23 },
    { label: 'Day of Month', key: 'dayOfMonth', min: 1, max: 31 },
    { label: 'Month', key: 'month', min: 1, max: 12 },
    { label: 'Day of Week', key: 'dayOfWeek', min: 0, max: 6 },
];

export const MONTH_NAMES = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
];

export const DAY_NAMES = [
    'Sunday',
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
];

export const DAY_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export interface PresetCron {
    label: string;
    expression: string;
    description: string;
}

export const PRESETS: PresetCron[] = [
    { label: 'Every minute', expression: '* * * * *', description: 'Every minute' },
    { label: 'Every 5 minutes', expression: '*/5 * * * *', description: 'Every 5 minutes' },
    { label: 'Every 10 minutes', expression: '*/10 * * * *', description: 'Every 10 minutes' },
    { label: 'Every 15 minutes', expression: '*/15 * * * *', description: 'Every 15 minutes' },
    { label: 'Every 30 minutes', expression: '*/30 * * * *', description: 'Every 30 minutes' },
    { label: 'Every hour', expression: '0 * * * *', description: 'Every hour' },
    { label: 'Every 2 hours', expression: '0 */2 * * *', description: 'Every 2 hours' },
    { label: 'Every 6 hours', expression: '0 */6 * * *', description: 'Every 6 hours' },
    { label: 'Every 12 hours', expression: '0 */12 * * *', description: 'Every 12 hours' },
    { label: 'Daily at midnight', expression: '0 0 * * *', description: 'At 12:00 AM' },
    { label: 'Daily at noon', expression: '0 12 * * *', description: 'At 12:00 PM' },
    { label: 'Twice daily', expression: '0 0,12 * * *', description: 'At 12:00 AM and 12:00 PM' },
    {
        label: 'Weekdays at 9 AM',
        expression: '0 9 * * 1-5',
        description: 'At 9:00 AM, Monday through Friday',
    },
    {
        label: 'Weekends at noon',
        expression: '0 12 * * 0,6',
        description: 'At 12:00 PM, only on Saturday and Sunday',
    },
    {
        label: 'Weekly on Monday',
        expression: '0 0 * * 1',
        description: 'At 12:00 AM, only on Monday',
    },
    {
        label: 'Monthly on 1st',
        expression: '0 0 1 * *',
        description: 'At 12:00 AM, on day 1 of the month',
    },
    {
        label: 'Yearly on Jan 1st',
        expression: '0 0 1 1 *',
        description: 'At 12:00 AM, on January 1',
    },
    {
        label: 'Every quarter',
        expression: '0 0 1 1,4,7,10 *',
        description: 'At 12:00 AM, on day 1 in January, April, July, and October',
    },
];

export type FieldMode = 'every' | 'specific' | 'range' | 'step' | 'custom';

export interface CronFieldConfig {
    mode: FieldMode;
    values: number[];
    rangeStart: number;
    rangeEnd: number;
    stepValue: number;
    stepFrom: number;
    customValue: string;
}

export type CronConfig = Record<string, CronFieldConfig>;

export function getDefaultFieldConfig(field: CronField): CronFieldConfig {
    return {
        mode: 'every',
        values: [],
        rangeStart: field.min,
        rangeEnd: field.max,
        stepValue: 1,
        stepFrom: field.min,
        customValue: '*',
    };
}

export function getDefaultConfig(): CronConfig {
    return Object.fromEntries(CRON_FIELDS.map((f) => [f.key, getDefaultFieldConfig(f)]));
}

export function fieldConfigToExpression(config: CronFieldConfig): string {
    switch (config.mode) {
        case 'every':
            return '*';
        case 'specific':
            if (config.values.length === 0) return '*';
            return [...config.values].sort((a, b) => a - b).join(',');
        case 'range':
            return `${config.rangeStart}-${config.rangeEnd}`;
        case 'step':
            return `${config.stepFrom}/${config.stepValue}`;
        case 'custom':
            return config.customValue.trim() || '*';
        default:
            return '*';
    }
}

export function configToExpression(config: CronConfig): string {
    return CRON_FIELDS.map((f) =>
        fieldConfigToExpression(config[f.key] ?? getDefaultFieldConfig(f)),
    ).join(' ');
}

export function parseExpression(expr: string): CronConfig {
    const parts = expr.trim().split(/\s+/);
    if (parts.length !== 5) return getDefaultConfig();

    const config: CronConfig = {};

    CRON_FIELDS.forEach((field, i) => {
        const part = parts[i];
        const defaultCfg = getDefaultFieldConfig(field);

        if (part === '*') {
            config[field.key] = { ...defaultCfg, mode: 'every' };
        } else if (part.includes('/')) {
            const [startPart, stepPart] = part.split('/');
            const stepFrom = startPart === '*' ? field.min : parseInt(startPart, 10);
            config[field.key] = {
                ...defaultCfg,
                mode: 'step',
                stepFrom: isNaN(stepFrom) ? field.min : stepFrom,
                stepValue: parseInt(stepPart, 10) || 1,
            };
        } else if (part.includes('-')) {
            const [start, end] = part.split('-').map((s) => parseInt(s, 10));
            config[field.key] = {
                ...defaultCfg,
                mode: 'range',
                rangeStart: isNaN(start) ? field.min : start,
                rangeEnd: isNaN(end) ? field.max : end,
            };
        } else if (part.includes(',')) {
            const values = part
                .split(',')
                .map((s) => parseInt(s, 10))
                .filter((n) => !isNaN(n));
            config[field.key] = { ...defaultCfg, mode: 'specific', values };
        } else {
            const val = parseInt(part, 10);
            if (!isNaN(val)) {
                config[field.key] = { ...defaultCfg, mode: 'specific', values: [val] };
            } else {
                config[field.key] = { ...defaultCfg, mode: 'custom', customValue: part };
            }
        }
    });

    return config;
}

export function describeField(config: CronFieldConfig, field: CronField): string {
    switch (config.mode) {
        case 'every':
            return field.key === 'dayOfWeek'
                ? ''
                : field.key === 'month'
                  ? ''
                  : field.key === 'dayOfMonth'
                    ? ''
                    : `every ${field.label.toLowerCase()}`;
        case 'specific': {
            if (field.key === 'month') {
                return config.values.map((v) => MONTH_NAMES[v - 1] || v).join(', ');
            }
            if (field.key === 'dayOfWeek') {
                return config.values.map((v) => DAY_NAMES[v] || v).join(', ');
            }
            if (config.values.length === 1) {
                return `${field.label.toLowerCase()} ${config.values[0]}`;
            }
            return `${field.label.toLowerCase()}s ${[...config.values].sort((a, b) => a - b).join(', ')}`;
        }
        case 'range':
            return `${field.label.toLowerCase()}s ${config.rangeStart} through ${config.rangeEnd}`;
        case 'step':
            return field.key === 'dayOfWeek'
                ? `every ${config.stepValue} days starting from ${DAY_NAMES[config.stepFrom] || config.stepFrom}`
                : `every ${config.stepValue} ${field.label.toLowerCase()}s starting at ${config.stepFrom}`;
        case 'custom':
            return config.customValue;
    }
}

export function describeExpression(config: CronConfig): string {
    const parts: string[] = [];
    const minuteCfg = config.minute;
    const hourCfg = config.hour;
    const domCfg = config.dayOfMonth;
    const monthCfg = config.month;
    const dowCfg = config.dayOfWeek;

    if (
        minuteCfg.mode === 'every' &&
        hourCfg.mode === 'every' &&
        domCfg.mode === 'every' &&
        monthCfg.mode === 'every' &&
        dowCfg.mode === 'every'
    ) {
        return 'Every minute';
    }

    const atParts: string[] = [];
    const onParts: string[] = [];

    if (minuteCfg.mode === 'every' && hourCfg.mode === 'every') {
        parts.push('Every minute');
    } else if (
        minuteCfg.mode === 'specific' &&
        minuteCfg.values.length === 1 &&
        hourCfg.mode === 'specific' &&
        hourCfg.values.length === 1
    ) {
        const h = hourCfg.values[0];
        const m = minuteCfg.values[0].toString().padStart(2, '0');
        const h12 = h === 0 ? 12 : h > 12 ? h - 12 : h;
        const ampm = h < 12 ? 'AM' : 'PM';
        atParts.push(`At ${h12}:${m} ${ampm}`);
    } else if (minuteCfg.mode === 'step' && hourCfg.mode === 'every') {
        parts.push(`Every ${minuteCfg.stepValue} minutes`);
    } else if (minuteCfg.mode === 'every' && hourCfg.mode === 'step') {
        parts.push(`Every ${hourCfg.stepValue} hours`);
    } else if (minuteCfg.mode === 'step' && hourCfg.mode === 'step') {
        parts.push(`Every ${hourCfg.stepValue} hours and ${minuteCfg.stepValue} minutes`);
    } else {
        const minDesc = describeField(minuteCfg, CRON_FIELDS[0]);
        const hourDesc = describeField(hourCfg, CRON_FIELDS[1]);
        if (minDesc) atParts.push(minDesc);
        if (hourDesc) atParts.push(hourDesc);
    }

    if (domCfg.mode !== 'every') {
        onParts.push(
            `on day${domCfg.mode === 'specific' && domCfg.values.length === 1 ? '' : 's'} ${describeField(domCfg, CRON_FIELDS[2])}`,
        );
    }

    if (monthCfg.mode !== 'every') {
        onParts.push(`in ${describeField(monthCfg, CRON_FIELDS[3])}`);
    }

    if (dowCfg.mode !== 'every') {
        onParts.push(`on ${describeField(dowCfg, CRON_FIELDS[4])}`);
    }

    const result = [...atParts, ...onParts].join(', ');
    return result ? result.charAt(0).toUpperCase() + result.slice(1) : 'Every minute';
}

function getNextOccurrence(
    minute: number[],
    hour: number[],
    dayOfMonth: number[],
    month: number[],
    dayOfWeek: number[],
    after: Date,
): Date | null {
    const d = new Date(after.getTime());
    d.setSeconds(0, 0);
    d.setMinutes(d.getMinutes() + 1);

    for (let attempt = 0; attempt < 366 * 24 * 60; attempt++) {
        if (d.getFullYear() - after.getFullYear() > 4) return null;

        if (!month.includes(d.getMonth() + 1)) {
            d.setMonth(d.getMonth() + 1, 1);
            d.setHours(0, 0, 0, 0);
            continue;
        }

        const currentDow = d.getDay();
        const currentDom = d.getDate();
        const domMatch = dayOfMonth.includes(currentDom);
        const dowMatch = dayOfWeek.includes(currentDow);

        const isDomWildcard = dayOfMonth.length === 31;
        const isDowWildcard = dayOfWeek.length === 7;

        const dayOk =
            (isDomWildcard && isDowWildcard) ||
            (isDomWildcard && dowMatch) ||
            (isDowWildcard && domMatch) ||
            (domMatch && dowMatch) ||
            (!isDomWildcard && !isDowWildcard && (domMatch || dowMatch));

        if (!dayOk) {
            d.setDate(d.getDate() + 1);
            d.setHours(0, 0, 0, 0);
            continue;
        }

        if (!hour.includes(d.getHours())) {
            d.setHours(d.getHours() + 1, 0, 0, 0);
            continue;
        }

        if (!minute.includes(d.getMinutes())) {
            d.setMinutes(d.getMinutes() + 1, 0, 0);
            continue;
        }

        return d;
    }

    return null;
}

function expandField(part: string, min: number, max: number): number[] {
    if (part === '*') return Array.from({ length: max - min + 1 }, (_, i) => min + i);

    const values = new Set<number>();

    for (const token of part.split(',')) {
        if (token.includes('/')) {
            const [rangePart, stepPart] = token.split('/');
            const step = parseInt(stepPart, 10);
            let start = min;
            let end = max;

            if (rangePart !== '*') {
                if (rangePart.includes('-')) {
                    const [s, e] = rangePart.split('-').map(Number);
                    start = s;
                    end = e;
                } else {
                    start = parseInt(rangePart, 10);
                }
            }

            for (let i = start; i <= end; i += step) {
                values.add(i);
            }
        } else if (token.includes('-')) {
            const [s, e] = token.split('-').map(Number);
            for (let i = s; i <= e; i++) values.add(i);
        } else {
            const v = parseInt(token, 10);
            if (!isNaN(v)) values.add(v);
        }
    }

    return Array.from(values).sort((a, b) => a - b);
}

export function getNextRuns(expression: string, count: number = 5): Date[] {
    const parts = expression.trim().split(/\s+/);
    if (parts.length !== 5) return [];

    const minutes = expandField(parts[0], 0, 59);
    const hours = expandField(parts[1], 0, 23);
    const doms = expandField(parts[2], 1, 31);
    const months = expandField(parts[3], 1, 12);
    const dows = expandField(parts[4], 0, 6);

    if (
        minutes.length === 0 ||
        hours.length === 0 ||
        doms.length === 0 ||
        months.length === 0 ||
        dows.length === 0
    ) {
        return [];
    }

    const results: Date[] = [];
    let after = new Date();

    for (let i = 0; i < count; i++) {
        const next = getNextOccurrence(minutes, hours, doms, months, dows, after);
        if (!next) break;
        results.push(next);
        after = new Date(next.getTime());
    }

    return results;
}

export function isValidCronExpression(expr: string): { valid: boolean; error?: string } {
    const parts = expr.trim().split(/\s+/);
    if (parts.length !== 5) {
        return { valid: false, error: 'Expression must have exactly 5 fields' };
    }

    const ranges = [
        { min: 0, max: 59, name: 'Minute' },
        { min: 0, max: 23, name: 'Hour' },
        { min: 1, max: 31, name: 'Day of month' },
        { min: 1, max: 12, name: 'Month' },
        { min: 0, max: 6, name: 'Day of week' },
    ];

    for (let i = 0; i < 5; i++) {
        const part = parts[i];
        const { min, max, name } = ranges[i];

        for (const token of part.split(',')) {
            let baseToken = token;
            let step: number | null = null;

            if (token.includes('/')) {
                const [rangePart, stepPart] = token.split('/');
                baseToken = rangePart;
                step = parseInt(stepPart, 10);
                if (isNaN(step) || step < 1) {
                    return { valid: false, error: `${name}: invalid step value` };
                }
            }

            if (baseToken !== '*') {
                let start: number;
                let end: number;

                if (baseToken.includes('-')) {
                    const [s, e] = baseToken.split('-').map(Number);
                    if (isNaN(s) || isNaN(e)) {
                        return { valid: false, error: `${name}: invalid range` };
                    }
                    start = s;
                    end = e;
                } else {
                    start = end = parseInt(baseToken, 10);
                    if (isNaN(start)) {
                        return { valid: false, error: `${name}: invalid value "${baseToken}"` };
                    }
                }

                if (start < min || end > max || start > end) {
                    return { valid: false, error: `${name}: value out of range (${min}-${max})` };
                }
            }
        }
    }

    return { valid: true };
}
