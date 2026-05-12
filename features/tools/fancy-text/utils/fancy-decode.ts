import { STYLE_DEFS } from './unicode-mappings';

// ---------------------------------------------------------------------------
// Decode fancy text back to plain text
// ---------------------------------------------------------------------------

/** Decode result */
export interface DecodeResult {
    decoded: string;
    styleId: string;
    styleName: string;
    confidence: number;
}

// ---------------------------------------------------------------------------
// Combining mark stripping
// ---------------------------------------------------------------------------

const COMBINING_RANGES: Array<[number, number]> = [
    [0x0300, 0x036f], // Combining Diacritical Marks
    [0x1ab0, 0x1aff], // Combining Diacritical Marks Extended
    [0x20d0, 0x20ff], // Combining Diacritical Marks for Symbols
    [0xfe20, 0xfe2f], // Combining Half Marks
    [0x20e3, 0x20e3], // Combining Enclosing Keycap
    [0x20dd, 0x20dd], // Combining Enclosing Circle
    [0x20de, 0x20de], // Combining Enclosing Square
    [0x20d1, 0x20d1], // Combining Right Arrow Above
    [0x20ee, 0x20ee], // Combining Left Arrow Below
    [0x20ef, 0x20ef], // Combining Right Arrow Below
    [0x20db, 0x20dc], // Combining Three/Four Dots Above
];

function isCombiningMark(cp: number): boolean {
    return COMBINING_RANGES.some(([start, end]) => cp >= start && cp <= end);
}

function stripCombining(text: string): string {
    let out = '';
    for (const ch of text) {
        if (!isCombiningMark(ch.codePointAt(0)!)) {
            out += ch;
        }
    }
    return out;
}

// ---------------------------------------------------------------------------
// Build reverse maps from source char maps
// ---------------------------------------------------------------------------

/**
 * Extract a forward char map from a style by encoding a known alphabet
 * and using Array.from (handles surrogate pairs correctly).
 */
function extractForwardMap(styleId: string): Map<string, string> | null {
    const style = STYLE_DEFS.find((s) => s.id === styleId);
    if (!style) return null;

    const lower = 'abcdefghijklmnopqrstuvwxyz';
    const upper = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const digits = '0123456789';

    const forward = new Map<string, string>();

    for (const src of [lower, upper, digits]) {
        const encoded = style.transform(src);
        const srcChars = Array.from(src);
        const encChars = Array.from(encoded);

        if (srcChars.length !== encChars.length) return null; // not 1:1

        for (let i = 0; i < srcChars.length; i++) {
            if (srcChars[i] !== encChars[i]) {
                forward.set(srcChars[i], encChars[i]);
            }
        }
    }

    if (forward.size === 0) return null;
    return forward;
}

/** Reverse a forward map: fancy char -> original char */
function reverseForwardMap(forward: Map<string, string>): Map<string, string> {
    const rev = new Map<string, string>();
    for (const [src, dst] of forward) {
        if (!rev.has(dst)) {
            rev.set(dst, src);
        }
    }
    return rev;
}

// ---------------------------------------------------------------------------
// Pre-built reverse maps
// ---------------------------------------------------------------------------

const reverseMaps = new Map<string, Map<string, string>>();

function getReverseMap(styleId: string): Map<string, string> | null {
    if (!reverseMaps.has(styleId)) {
        const forward = extractForwardMap(styleId);
        if (!forward) {
            reverseMaps.set(styleId, new Map());
        } else {
            reverseMaps.set(styleId, reverseForwardMap(forward));
        }
    }
    const map = reverseMaps.get(styleId)!;
    return map.size > 0 ? map : null;
}

// ---------------------------------------------------------------------------
// Styles that use combining marks (decoded by stripping)
// ---------------------------------------------------------------------------

const COMBINING_STYLES = new Set([
    'strikethrough',
    'strikethrough-caps',
    'underline',
    'underline-caps',
    'zalgo',
    'zalgo-light',
    'zalgo-heavy',
    'overline',
    'enclosing-circle',
    'enclosing-square',
    'ring-above',
    'caron',
    'breve',
    'long-stroke',
    'arrow-above',
    'keycap',
    'three-dots',
    'four-dots',
    'bridge-above',
    'double-breve',
    'equals-below',
    'left-arrow-below',
    'right-arrow-below',
    'wavy',
    'dotted',
    'double-underline',
    'crossed-bold',
    'bold-underline',
    'bold-wavy',
    'italic-strikethrough',
    'bold-overline',
    'script-underline',
    'fraktur-strikethrough',
    'sans-bold-strikethrough',
    'sans-bold-underline',
    'monospace-strikethrough',
    'double-struck-underline',
    'bold-italic-underline',
    'sans-italic-underline',
    'fullwidth-strikethrough',
]);

// ---------------------------------------------------------------------------
// Special decoders for non-map-based styles
// ---------------------------------------------------------------------------

const SKIP_STYLES = new Set([
    'morse',
    'nato',
    'clap',
    'clap-caps',
    'binary',
    'hex',
    'uwu',
    'spaced-out',
    'spaced-caps',
    'spongemock',
    'leet',
    'regional-indicator',
    'aesthetic',
    'alternating-upper',
    'title-case',
]);

function decodeWithMap(text: string, map: Map<string, string>): string {
    let out = '';
    for (const ch of text) {
        out += map.get(ch) ?? ch;
    }
    return out;
}

function reverseString(text: string): string {
    return Array.from(text).reverse().join('');
}

function rot13Decode(text: string): string {
    return text.replace(/[a-zA-Z]/g, (ch) => {
        const base = ch <= 'Z' ? 65 : 97;
        return String.fromCharCode(((ch.charCodeAt(0) - base + 13) % 26) + base);
    });
}

// ---------------------------------------------------------------------------
// Upside-down reverse map (punctuation + letters)
// ---------------------------------------------------------------------------

const UPSIDE_DOWN_REVERSE: Record<string, string> = {
    '\u0250': 'a',
    q: 'b', // upside-down b -> b, but we need reverse of encoding
    '\u0254': 'c',
    p: 'd',
    '\u01DD': 'e',
    '\u025F': 'f',
    '\u0253': 'g',
    '\u0265': 'h',
    '\u0131': 'i',
    '\u027E': 'j',
    '\u029E': 'k',
    '\u026F': 'm',
    u: 'n',
    d: 'p',
    b: 'q',
    '\u0279': 'r',
    '\u0287': 't',
    '\u028C': 'v',
    '\u028D': 'w',
    '\u028E': 'y',
    '\u2200': 'A',
    '\u15FA': 'B',
    '\u0186': 'C',
    '\u15E1': 'D',
    '\u018E': 'E',
    '\u2132': 'F',
    '\u2141': 'G',
    '\u017F': 'J',
    '\u22CA': 'K',
    '\u2142': 'L',
    '\u0500': 'P',
    '\u038C': 'Q',
    '\u1D1A': 'R',
    '\u22A5': 'T',
    '\u2229': 'U',
    '\u039B': 'V',
    '\u2144': 'Y',
    '\u00BF': '?',
    '\u00A1': '!',
    '\u02D9': '.',
    '\u061B': ';',
    '\u214B': '&',
    '\u201E': '"',
    '\u203E': '_',
};

function decodeUpsideDown(text: string): string {
    const chars = Array.from(text);
    chars.reverse();
    let out = '';
    for (const ch of chars) {
        out += UPSIDE_DOWN_REVERSE[ch] ?? ch;
    }
    return out;
}

// ---------------------------------------------------------------------------
// Score decoded text by how "normal" it looks
// ---------------------------------------------------------------------------

function scoreDecoded(decoded: string, original: string): number {
    if (decoded === original) return 0;
    const nonSpace = decoded.replace(/\s/g, '');
    if (nonSpace.length === 0) return 0;
    const asciiLetters = (decoded.match(/[a-zA-Z]/g) || []).length;
    return asciiLetters / nonSpace.length;
}

// ---------------------------------------------------------------------------
// Auto-detect and decode
// ---------------------------------------------------------------------------

export function autoDecodeFancy(text: string): DecodeResult {
    let best: DecodeResult = {
        decoded: text,
        styleId: 'none',
        styleName: 'Unknown',
        confidence: 0,
    };

    // 1. Try combining mark stripping
    const stripped = stripCombining(text);
    if (stripped !== text && stripped.length < text.length) {
        const ratio = stripped.length / text.length;
        if (ratio < 0.8) {
            const confidence = 1 - ratio;
            best = {
                decoded: stripped,
                styleId: 'combining-strip',
                styleName: 'Decorative (marks stripped)',
                confidence,
            };
        }
    }

    // 2. Try each style's reverse map
    for (const style of STYLE_DEFS) {
        if (COMBINING_STYLES.has(style.id)) continue;
        if (SKIP_STYLES.has(style.id)) continue;

        const revMap = getReverseMap(style.id);
        if (!revMap) continue;

        const decoded = decodeWithMap(text, revMap);
        if (decoded === text) continue;

        const confidence = scoreDecoded(decoded, text);
        if (confidence > best.confidence) {
            best = { decoded, styleId: style.id, styleName: style.name, confidence };
        }
    }

    // 3. Try upside-down (reverse + char map)
    const upsideDecoded = decodeUpsideDown(text);
    if (upsideDecoded !== text) {
        const confidence = scoreDecoded(upsideDecoded, text);
        if (confidence > best.confidence) {
            best = {
                decoded: upsideDecoded,
                styleId: 'upside-down',
                styleName: 'Upside Down',
                confidence,
            };
        }
    }

    // 4. Try simple reverse
    const reversed = reverseString(text);
    if (reversed !== text) {
        const confidence = scoreDecoded(reversed, text);
        if (confidence > best.confidence) {
            best = { decoded: reversed, styleId: 'reverse', styleName: 'Reverse', confidence };
        }
    }

    // 5. Try ROT13
    const rot13 = rot13Decode(text);
    if (rot13 !== text) {
        const confidence = scoreDecoded(rot13, text);
        if (confidence > best.confidence) {
            best = { decoded: rot13, styleId: 'rot13', styleName: 'ROT13', confidence };
        }
    }

    return best;
}
