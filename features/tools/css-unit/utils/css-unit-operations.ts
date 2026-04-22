export interface CssUnit {
    id: string;
    label: string;
    shortLabel: string;
    group: 'absolute' | 'relative-font' | 'relative-viewport';
}

export const CSS_UNITS: CssUnit[] = [
    { id: 'px', label: 'Pixels', shortLabel: 'px', group: 'absolute' },
    { id: 'pt', label: 'Points', shortLabel: 'pt', group: 'absolute' },
    { id: 'cm', label: 'Centimeters', shortLabel: 'cm', group: 'absolute' },
    { id: 'mm', label: 'Millimeters', shortLabel: 'mm', group: 'absolute' },
    { id: 'in', label: 'Inches', shortLabel: 'in', group: 'absolute' },
    { id: 'rem', label: 'Root em', shortLabel: 'rem', group: 'relative-font' },
    { id: 'em', label: 'Em', shortLabel: 'em', group: 'relative-font' },
    { id: 'vw', label: 'Viewport Width', shortLabel: 'vw', group: 'relative-viewport' },
    { id: 'vh', label: 'Viewport Height', shortLabel: 'vh', group: 'relative-viewport' },
    { id: 'vmin', label: 'Viewport Min', shortLabel: 'vmin', group: 'relative-viewport' },
    { id: 'vmax', label: 'Viewport Max', shortLabel: 'vmax', group: 'relative-viewport' },
    { id: '%', label: 'Percent (root font)', shortLabel: '%', group: 'relative-font' },
];

export interface ConverterConfig {
    rootFontSize: number;
    viewportWidth: number;
    viewportHeight: number;
}

export const DEFAULT_CONFIG: ConverterConfig = {
    rootFontSize: 16,
    viewportWidth: 1920,
    viewportHeight: 1080,
};

const PX_PER_PT = 96 / 72;
const PX_PER_IN = 96;
const PX_PER_CM = PX_PER_IN / 2.54;
const PX_PER_MM = PX_PER_IN / 25.4;

export function toPx(value: number, unitId: string, config: ConverterConfig): number {
    switch (unitId) {
        case 'px':
            return value;
        case 'pt':
            return value * PX_PER_PT;
        case 'cm':
            return value * PX_PER_CM;
        case 'mm':
            return value * PX_PER_MM;
        case 'in':
            return value * PX_PER_IN;
        case 'rem':
            return value * config.rootFontSize;
        case 'em':
            return value * config.rootFontSize;
        case 'vw':
            return (value / 100) * config.viewportWidth;
        case 'vh':
            return (value / 100) * config.viewportHeight;
        case 'vmin':
            return (value / 100) * Math.min(config.viewportWidth, config.viewportHeight);
        case 'vmax':
            return (value / 100) * Math.max(config.viewportWidth, config.viewportHeight);
        case '%':
            return (value / 100) * config.rootFontSize;
        default:
            return value;
    }
}

export function fromPx(px: number, unitId: string, config: ConverterConfig): number {
    if (px === 0) return 0;
    switch (unitId) {
        case 'px':
            return px;
        case 'pt':
            return px / PX_PER_PT;
        case 'cm':
            return px / PX_PER_CM;
        case 'mm':
            return px / PX_PER_MM;
        case 'in':
            return px / PX_PER_IN;
        case 'rem':
            return px / config.rootFontSize;
        case 'em':
            return px / config.rootFontSize;
        case 'vw':
            return (px / config.viewportWidth) * 100;
        case 'vh':
            return (px / config.viewportHeight) * 100;
        case 'vmin':
            return (px / Math.min(config.viewportWidth, config.viewportHeight)) * 100;
        case 'vmax':
            return (px / Math.max(config.viewportWidth, config.viewportHeight)) * 100;
        case '%':
            return (px / config.rootFontSize) * 100;
        default:
            return px;
    }
}

export function convertToAll(
    value: number,
    fromUnitId: string,
    config: ConverterConfig,
): { unit: CssUnit; value: number; formatted: string }[] {
    const px = toPx(value, fromUnitId, config);
    return CSS_UNITS.map((unit) => {
        const converted = fromPx(px, unit.id, config);
        return {
            unit,
            value: converted,
            formatted: formatValue(converted, unit.id),
        };
    });
}

function formatValue(n: number, unitId: string): string {
    if (n === 0) return `0${unitId}`;
    const abs = Math.abs(n);
    if (abs >= 1000) return `${parseFloat(n.toFixed(2))}${unitId}`;
    if (abs >= 1) return `${parseFloat(n.toFixed(4))}${unitId}`;
    return `${parseFloat(n.toPrecision(6))}${unitId}`;
}

export const GROUP_LABELS: Record<string, string> = {
    absolute: 'Absolute',
    'relative-font': 'Font-relative',
    'relative-viewport': 'Viewport-relative',
};
