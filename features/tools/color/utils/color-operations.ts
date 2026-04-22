export interface RGB {
    r: number;
    g: number;
    b: number;
}

export interface HSL {
    h: number;
    s: number;
    l: number;
}

export interface OKLCH {
    l: number;
    c: number;
    h: number;
}

export interface ColorState {
    hex: string;
    rgb: RGB;
    hsl: HSL;
    oklch: OKLCH;
    alpha: number;
}

export const DEFAULT_COLOR: ColorState = {
    hex: '#6366f1',
    rgb: { r: 99, g: 102, b: 241 },
    hsl: { h: 239, s: 84, l: 67 },
    oklch: { l: 0.551, c: 0.195, h: 278 },
    alpha: 1,
};

function clamp(val: number, min: number, max: number): number {
    return Math.min(Math.max(val, min), max);
}

export function hexToRgb(hex: string): RGB {
    const cleaned = hex.replace('#', '');
    const num = parseInt(cleaned, 16);
    return {
        r: (num >> 16) & 255,
        g: (num >> 8) & 255,
        b: num & 255,
    };
}

export function rgbToHex(rgb: RGB): string {
    const r = clamp(Math.round(rgb.r), 0, 255);
    const g = clamp(Math.round(rgb.g), 0, 255);
    const b = clamp(Math.round(rgb.b), 0, 255);
    return `#${((1 << 24) | (r << 16) | (g << 8) | b).toString(16).slice(1)}`;
}

export function rgbToHsl(rgb: RGB): HSL {
    const r = rgb.r / 255;
    const g = rgb.g / 255;
    const b = rgb.b / 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const l = (max + min) / 2;

    if (max === min) return { h: 0, s: 0, l: Math.round(l * 100) };

    const d = max - min;
    const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

    let h = 0;
    switch (max) {
        case r:
            h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
            break;
        case g:
            h = ((b - r) / d + 2) / 6;
            break;
        case b:
            h = ((r - g) / d + 4) / 6;
            break;
    }

    return {
        h: Math.round(h * 360),
        s: Math.round(s * 100),
        l: Math.round(l * 100),
    };
}

export function hslToRgb(hsl: HSL): RGB {
    const s = hsl.s / 100;
    const l = hsl.l / 100;
    const h = hsl.h / 360;

    if (s === 0) {
        const val = Math.round(l * 255);
        return { r: val, g: val, b: val };
    }

    const hue2rgb = (p: number, q: number, t: number) => {
        let tt = t;
        if (tt < 0) tt += 1;
        if (tt > 1) tt -= 1;
        if (tt < 1 / 6) return p + (q - p) * 6 * tt;
        if (tt < 1 / 2) return q;
        if (tt < 2 / 3) return p + (q - p) * (2 / 3 - tt) * 6;
        return p;
    };

    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;

    return {
        r: Math.round(hue2rgb(p, q, h + 1 / 3) * 255),
        g: Math.round(hue2rgb(p, q, h) * 255),
        b: Math.round(hue2rgb(p, q, h - 1 / 3) * 255),
    };
}

function srgbToLinear(c: number): number {
    const abs = Math.abs(c);
    if (abs <= 0.04045) return c / 12.92;
    return Math.sign(c) * Math.pow((abs + 0.055) / 1.055, 2.4);
}

function linearToSrgb(c: number): number {
    const abs = Math.abs(c);
    if (abs <= 0.0031308) return 12.92 * c;
    return Math.sign(c) * (1.055 * Math.pow(abs, 1 / 2.4) - 0.055);
}

export function rgbToOklch(rgb: RGB): OKLCH {
    const lr = srgbToLinear(rgb.r / 255);
    const lg = srgbToLinear(rgb.g / 255);
    const lb = srgbToLinear(rgb.b / 255);

    const l_ = 0.4122214708 * lr + 0.5363325363 * lg + 0.0514459929 * lb;
    const m_ = 0.2119034982 * lr + 0.6806995451 * lg + 0.1073969566 * lb;
    const s_ = 0.0883024619 * lr + 0.2817188376 * lg + 0.6299787005 * lb;

    const l_3 = Math.cbrt(l_);
    const m_3 = Math.cbrt(m_);
    const s_3 = Math.cbrt(s_);

    const L = 0.2104542553 * l_3 + 0.793617785 * m_3 - 0.0040720468 * s_3;
    const a = 1.9779984951 * l_3 - 2.428592205 * m_3 + 0.4505937099 * s_3;
    const b = 0.0259040371 * l_3 + 0.7827717662 * m_3 - 0.808675766 * s_3;

    const C = Math.sqrt(a * a + b * b);
    let H = Math.atan2(b, a) * (180 / Math.PI);
    if (H < 0) H += 360;

    return {
        l: Math.round(L * 1000) / 1000,
        c: Math.round(C * 1000) / 1000,
        h: Math.round(H * 10) / 10,
    };
}

export function oklchToRgb(oklch: OKLCH): RGB {
    const L = oklch.l;
    const C = oklch.c;
    const H = oklch.h;

    const a = C * Math.cos((H * Math.PI) / 180);
    const b = C * Math.sin((H * Math.PI) / 180);

    const l_3 = L + 0.3963377774 * a + 0.2158037573 * b;
    const m_3 = L - 0.1055613458 * a - 0.0638541728 * b;
    const s_3 = L - 0.0894841775 * a - 1.291485548 * b;

    const l_ = l_3 * l_3 * l_3;
    const m_ = m_3 * m_3 * m_3;
    const s_ = s_3 * s_3 * s_3;

    const r = +4.0767416621 * l_ - 3.3077115913 * m_ + 0.2309699292 * s_;
    const g = -1.2684380046 * l_ + 2.6097574011 * m_ - 0.3413193965 * s_;
    const bl = -0.0041960863 * l_ - 0.7034186147 * m_ + 1.707614701 * s_;

    return {
        r: clamp(Math.round(linearToSrgb(r) * 255), 0, 255),
        g: clamp(Math.round(linearToSrgb(g) * 255), 0, 255),
        b: clamp(Math.round(linearToSrgb(bl) * 255), 0, 255),
    };
}

export function colorFromHex(hex: string): ColorState {
    const rgb = hexToRgb(hex);
    const hsl = rgbToHsl(rgb);
    const oklch = rgbToOklch(rgb);
    return { hex, rgb, hsl, oklch, alpha: 1 };
}

export function colorFromRgb(rgb: RGB, alpha = 1): ColorState {
    const hex = rgbToHex(rgb);
    const hsl = rgbToHsl(rgb);
    const oklch = rgbToOklch(rgb);
    return { hex, rgb, hsl, oklch, alpha };
}

export function colorFromHsl(hsl: HSL, alpha = 1): ColorState {
    const rgb = hslToRgb(hsl);
    const hex = rgbToHex(rgb);
    const oklch = rgbToOklch(rgb);
    return { hex, rgb, hsl, oklch, alpha };
}

export function colorFromOklch(oklch: OKLCH, alpha = 1): ColorState {
    const rgb = oklchToRgb(oklch);
    const hex = rgbToHex(rgb);
    const hsl = rgbToHsl(rgb);
    return { hex, rgb, hsl, oklch, alpha };
}

export function isValidHex(hex: string): boolean {
    return /^#[0-9a-fA-F]{6}$/.test(hex);
}

export function generatePalette(baseHsl: HSL, count = 10): ColorState[] {
    const colors: ColorState[] = [];
    for (let i = 0; i < count; i++) {
        const lightness = Math.round(95 - (i * 90) / (count - 1));
        const hsl = { h: baseHsl.h, s: baseHsl.s, l: lightness };
        const rgb = hslToRgb(hsl);
        const hex = rgbToHex(rgb);
        const oklch = rgbToOklch(rgb);
        colors.push({ hex, rgb, hsl, oklch, alpha: 1 });
    }
    return colors;
}

export function generateAnalogousPalette(baseHsl: HSL): ColorState[] {
    return [-30, -15, 0, 15, 30].map((offset) => {
        const hsl = { h: (baseHsl.h + offset + 360) % 360, s: baseHsl.s, l: baseHsl.l };
        const rgb = hslToRgb(hsl);
        const hex = rgbToHex(rgb);
        const oklch = rgbToOklch(rgb);
        return { hex, rgb, hsl, oklch, alpha: 1 };
    });
}

export function generateComplementaryPalette(baseHsl: HSL): ColorState[] {
    return [0, 180].map((offset) => {
        const hsl = { h: (baseHsl.h + offset) % 360, s: baseHsl.s, l: baseHsl.l };
        const rgb = hslToRgb(hsl);
        const hex = rgbToHex(rgb);
        const oklch = rgbToOklch(rgb);
        return { hex, rgb, hsl, oklch, alpha: 1 };
    });
}

export function generateTriadicPalette(baseHsl: HSL): ColorState[] {
    return [0, 120, 240].map((offset) => {
        const hsl = { h: (baseHsl.h + offset) % 360, s: baseHsl.s, l: baseHsl.l };
        const rgb = hslToRgb(hsl);
        const hex = rgbToHex(rgb);
        const oklch = rgbToOklch(rgb);
        return { hex, rgb, hsl, oklch, alpha: 1 };
    });
}

export function generateSplitComplementaryPalette(baseHsl: HSL): ColorState[] {
    return [0, 150, 210].map((offset) => {
        const hsl = { h: (baseHsl.h + offset) % 360, s: baseHsl.s, l: baseHsl.l };
        const rgb = hslToRgb(hsl);
        const hex = rgbToHex(rgb);
        const oklch = rgbToOklch(rgb);
        return { hex, rgb, hsl, oklch, alpha: 1 };
    });
}

export function generateTetradicPalette(baseHsl: HSL): ColorState[] {
    return [0, 90, 180, 270].map((offset) => {
        const hsl = { h: (baseHsl.h + offset) % 360, s: baseHsl.s, l: baseHsl.l };
        const rgb = hslToRgb(hsl);
        const hex = rgbToHex(rgb);
        const oklch = rgbToOklch(rgb);
        return { hex, rgb, hsl, oklch, alpha: 1 };
    });
}

export type PaletteMode =
    | 'shades'
    | 'analogous'
    | 'complementary'
    | 'triadic'
    | 'split-complementary'
    | 'tetradic';

export function generatePaletteByMode(baseHsl: HSL, mode: PaletteMode): ColorState[] {
    switch (mode) {
        case 'shades':
            return generatePalette(baseHsl);
        case 'analogous':
            return generateAnalogousPalette(baseHsl);
        case 'complementary':
            return generateComplementaryPalette(baseHsl);
        case 'triadic':
            return generateTriadicPalette(baseHsl);
        case 'split-complementary':
            return generateSplitComplementaryPalette(baseHsl);
        case 'tetradic':
            return generateTetradicPalette(baseHsl);
    }
}

export function formatRgb(color: ColorState): string {
    if (color.alpha < 1) {
        return `rgba(${color.rgb.r}, ${color.rgb.g}, ${color.rgb.b}, ${color.alpha})`;
    }
    return `rgb(${color.rgb.r}, ${color.rgb.g}, ${color.rgb.b})`;
}

export function formatHsl(color: ColorState): string {
    if (color.alpha < 1) {
        return `hsla(${color.hsl.h}, ${color.hsl.s}%, ${color.hsl.l}%, ${color.alpha})`;
    }
    return `hsl(${color.hsl.h}, ${color.hsl.s}%, ${color.hsl.l}%)`;
}

export function formatOklch(color: ColorState): string {
    if (color.alpha < 1) {
        return `oklch(${color.oklch.l} ${color.oklch.c} ${color.oklch.h} / ${color.alpha})`;
    }
    return `oklch(${color.oklch.l} ${color.oklch.c} ${color.oklch.h})`;
}

export function formatHex(color: ColorState): string {
    if (color.alpha < 1) {
        const a = Math.round(color.alpha * 255);
        const alphaHex = a.toString(16).padStart(2, '0');
        return `${color.hex}${alphaHex}`;
    }
    return color.hex;
}
