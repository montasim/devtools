// ---------------------------------------------------------------------------
// Unicode mapping tables for 27 fancy-text styles
// Pure functions — no React, no side effects.
// ---------------------------------------------------------------------------

/** Definition of a single fancy-text style. */
export interface StyleDef {
    id: string;
    name: string;
    transform: (text: string) => string;
}

// ---------------------------------------------------------------------------
// Helper utilities
// ---------------------------------------------------------------------------

/**
 * Build a character map for A-Z and a-z using Unicode offset starting points.
 */
function offsetMap(upperStart: number, lowerStart: number): Record<string, string> {
    const map: Record<string, string> = {};
    for (let i = 0; i < 26; i++) {
        map[String.fromCharCode(0x41 + i)] = String.fromCodePoint(upperStart + i);
        map[String.fromCharCode(0x61 + i)] = String.fromCodePoint(lowerStart + i);
    }
    return map;
}

/**
 * Apply a character map to text, passing through any unmapped characters.
 */
function applyMap(text: string, map: Record<string, string>): string {
    let out = '';
    for (const ch of text) {
        out += map[ch] ?? ch;
    }
    return out;
}

/**
 * Convenience factory: create a StyleDef from an offset map with optional
 * patches for specific characters.
 */
function makeOffsetStyle(
    id: string,
    name: string,
    map: Record<string, string>,
    patches?: Record<string, string>,
): StyleDef {
    const merged = patches ? { ...map, ...patches } : map;
    return {
        id,
        name,
        transform: (text: string) => applyMap(text, merged),
    };
}

// ---------------------------------------------------------------------------
// Mathematical styles (13)
// ---------------------------------------------------------------------------

const bold = makeOffsetStyle('bold', 'Bold', offsetMap(0x1d400, 0x1d41a));

const italic = makeOffsetStyle('italic', 'Italic', offsetMap(0x1d434, 0x1d44e), { h: '\u210E' });

const boldItalic = makeOffsetStyle('bold-italic', 'Bold Italic', offsetMap(0x1d468, 0x1d482));

const script = makeOffsetStyle('script', 'Script', offsetMap(0x1d49c, 0x1d4b6), {
    B: '\u212C',
    D: '\u2145',
    F: '\u2131',
    H: '\u210B',
    I: '\u2110',
    K: '\u2133',
    L: '\u2112',
});

const boldScript = makeOffsetStyle('bold-script', 'Bold Script', offsetMap(0x1d4d0, 0x1d4ea));

const fraktur = makeOffsetStyle('fraktur', 'Fraktur', offsetMap(0x1d504, 0x1d51e), {
    C: '\u212D',
    H: '\u210C',
    I: '\u2111',
    R: '\u211B',
    Z: '\u2128',
});

const boldFraktur = makeOffsetStyle('bold-fraktur', 'Bold Fraktur', offsetMap(0x1d56c, 0x1d586));

const doubleStruck = makeOffsetStyle(
    'double-struck',
    'Double-struck',
    offsetMap(0x1d538, 0x1d552),
    {
        C: '\u2102',
        H: '\u210D',
        N: '\u2115',
        P: '\u2119',
        Q: '\u211A',
        R: '\u211D',
        Z: '\u2124',
    },
);

const monospace = makeOffsetStyle('monospace', 'Monospace', offsetMap(0x1d670, 0x1d68a));

const sansSerif = makeOffsetStyle('sans-serif', 'Sans-serif', offsetMap(0x1d5a0, 0x1d5ba));

const sansBold = makeOffsetStyle('sans-bold', 'Sans Bold', offsetMap(0x1d5d4, 0x1d5ee));

const sansItalic = makeOffsetStyle('sans-italic', 'Sans Italic', offsetMap(0x1d608, 0x1d622));

const sansBoldItalic = makeOffsetStyle(
    'sans-bold-italic',
    'Sans Bold Italic',
    offsetMap(0x1d63c, 0x1d656),
);

// ---------------------------------------------------------------------------
// Enclosed styles (3)
// ---------------------------------------------------------------------------

function circledTransform(text: string): string {
    let out = '';
    for (const ch of text) {
        const code = ch.codePointAt(0)!;
        if (code >= 65 && code <= 90) {
            // Uppercase A-Z -> U+24B6 + i
            out += String.fromCodePoint(0x24b6 + (code - 65));
        } else if (code >= 97 && code <= 122) {
            // Lowercase a-z -> U+24D0 + i
            out += String.fromCodePoint(0x24d0 + (code - 97));
        } else if (code >= 48 && code <= 57) {
            // Digits 1-9 -> U+2460 + (i-1), 0 -> U+24EA
            if (code === 48) {
                out += String.fromCodePoint(0x24ea);
            } else {
                out += String.fromCodePoint(0x2460 + (code - 49));
            }
        } else {
            out += ch;
        }
    }
    return out;
}

const circled: StyleDef = {
    id: 'circled',
    name: 'Circled',
    transform: circledTransform,
};

function negativeCircledTransform(text: string): string {
    let out = '';
    for (const ch of text) {
        const code = ch.codePointAt(0)!;
        if (code >= 65 && code <= 90) {
            out += String.fromCodePoint(0x1f150 + (code - 65));
        } else {
            out += ch;
        }
    }
    return out;
}

const negativeCircled: StyleDef = {
    id: 'negative-circled',
    name: 'Negative Circled',
    transform: negativeCircledTransform,
};

function squaredTransform(text: string): string {
    let out = '';
    for (const ch of text) {
        const code = ch.codePointAt(0)!;
        if (code >= 65 && code <= 90) {
            out += String.fromCodePoint(0x1f130 + (code - 65));
        } else {
            out += ch;
        }
    }
    return out;
}

const squared: StyleDef = {
    id: 'squared',
    name: 'Squared',
    transform: squaredTransform,
};

// ---------------------------------------------------------------------------
// Width / Case styles (3)
// ---------------------------------------------------------------------------

function fullwidthTransform(text: string): string {
    let out = '';
    for (const ch of text) {
        const code = ch.codePointAt(0)!;
        if (code >= 65 && code <= 90) {
            out += String.fromCodePoint(0xff21 + (code - 65));
        } else if (code >= 97 && code <= 122) {
            out += String.fromCodePoint(0xff41 + (code - 97));
        } else if (code >= 48 && code <= 57) {
            out += String.fromCodePoint(0xff10 + (code - 48));
        } else {
            out += ch;
        }
    }
    return out;
}

const fullwidth: StyleDef = {
    id: 'fullwidth',
    name: 'Fullwidth',
    transform: fullwidthTransform,
};

const SMALL_CAPS_MAP: Record<string, string> = {
    a: '\u1D00',
    b: '\u0299',
    c: '\u1D04',
    d: '\u1D05',
    e: '\u1D07',
    f: '\uA799',
    g: '\u0262',
    h: '\u029C',
    i: '\u026A',
    j: '\u1D0A',
    k: '\u1D0B',
    l: '\u029F',
    m: '\u1D0D',
    n: '\u0274',
    o: '\u1D0F',
    p: '\u1D18',
    q: '\u01EB',
    r: '\u0280',
    s: '\uA731',
    t: '\u1D1B',
    u: '\u1D1C',
    v: '\u1D20',
    w: '\u1D21',
    x: '\u02E3',
    y: '\u024F',
    z: '\u1D22',
};

const smallCaps: StyleDef = {
    id: 'small-caps',
    name: 'Small Caps',
    transform: (text: string) => applyMap(text, SMALL_CAPS_MAP),
};

const UPSIDE_DOWN_MAP: Record<string, string> = {
    // Lowercase
    a: '\u0250',
    b: 'q',
    c: '\u0254',
    d: 'p',
    e: '\u01DD',
    f: '\u025F',
    g: '\u0253',
    h: '\u0265',
    i: '\u0131',
    j: '\u027E',
    k: '\u029E',
    l: 'l',
    m: '\u026F',
    n: 'u',
    o: 'o',
    p: 'd',
    q: 'b',
    r: '\u0279',
    s: 's',
    t: '\u0287',
    u: 'n',
    v: '\u028C',
    w: '\u028D',
    x: 'x',
    y: '\u028E',
    z: 'z',
    // Uppercase
    A: '\u2200',
    B: '\u15FA',
    C: '\u0186',
    D: '\u15E1',
    E: '\u018E',
    F: '\u2132',
    G: '\u2141',
    H: 'H',
    I: 'I',
    J: '\u017F',
    K: '\u22CA',
    L: '\u2142',
    M: 'W',
    N: 'N',
    O: 'O',
    P: '\u0500',
    Q: '\u038C',
    R: '\u1D1A',
    S: 'S',
    T: '\u22A5',
    U: '\u2229',
    V: '\u039B',
    W: 'M',
    X: 'X',
    Y: '\u2144',
    Z: 'Z',
    // Punctuation / misc
    '?': '\u00BF',
    '!': '\u00A1',
    "'": ',',
    ',': "'",
    '.': '\u02D9',
    ';': '\u061B',
    '(': ')',
    ')': '(',
    '[': ']',
    ']': '[',
    '{': '}',
    '}': '{',
    '<': '>',
    '>': '<',
    '&': '\u214B',
    '"': '\u201E',
    '\u201C': '\u201D',
    '\u201D': '\u201C',
    _: '\u203E',
};

const upsideDown: StyleDef = {
    id: 'upside-down',
    name: 'Upside Down',
    transform: (text: string) => {
        // Reverse the string first, then map each character
        const chars = Array.from(text);
        chars.reverse();
        let out = '';
        for (const ch of chars) {
            out += UPSIDE_DOWN_MAP[ch] ?? ch;
        }
        return out;
    },
};

// ---------------------------------------------------------------------------
// Decorative styles (3)
// ---------------------------------------------------------------------------

const strikethrough: StyleDef = {
    id: 'strikethrough',
    name: 'Strikethrough',
    transform: (text: string) => {
        let out = '';
        for (const ch of text) {
            if (ch === '\n') {
                out += ch;
            } else {
                out += ch + '\u0336';
            }
        }
        return out;
    },
};

const underline: StyleDef = {
    id: 'underline',
    name: 'Underline',
    transform: (text: string) => {
        let out = '';
        for (const ch of text) {
            if (ch === '\n') {
                out += ch;
            } else {
                out += ch + '\u0332';
            }
        }
        return out;
    },
};

const COMBINING_ABOVE = Array.from({ length: 0x0312 - 0x0300 + 1 }, (_, i) =>
    String.fromCodePoint(0x0300 + i),
);

const COMBINING_BELOW = Array.from({ length: 0x032a - 0x0316 + 1 }, (_, i) =>
    String.fromCodePoint(0x0316 + i),
);

const zalgo: StyleDef = {
    id: 'zalgo',
    name: 'Zalgo',
    transform: (text: string) => {
        let out = '';
        for (const ch of text) {
            if (ch === ' ' || ch === '\n') {
                out += ch;
                continue;
            }
            out += ch;
            // 1-4 combining marks above
            const aboveCount = 1 + Math.floor(Math.random() * 4);
            for (let i = 0; i < aboveCount; i++) {
                out += COMBINING_ABOVE[Math.floor(Math.random() * COMBINING_ABOVE.length)];
            }
            // 0-2 combining marks below
            const belowCount = Math.floor(Math.random() * 3);
            for (let i = 0; i < belowCount; i++) {
                out += COMBINING_BELOW[Math.floor(Math.random() * COMBINING_BELOW.length)];
            }
        }
        return out;
    },
};

// ---------------------------------------------------------------------------
// Extras (5)
// ---------------------------------------------------------------------------

const SUPERSCRIPT_MAP: Record<string, string> = {
    a: '\u1D43',
    b: '\u1D47',
    c: '\u1D9C',
    d: '\u1D48',
    e: '\u1D49',
    f: '\u1DA0',
    g: '\u1D4D',
    h: '\u02B0',
    i: '\u2071',
    j: '\u02B2',
    k: '\u1D4F',
    l: '\u02E1',
    m: '\u1D50',
    n: '\u207F',
    o: '\u1D52',
    p: '\u1D56',
    q: '\u02A0',
    r: '\u02B3',
    s: '\u02E2',
    t: '\u1D57',
    u: '\u1D58',
    v: '\u1D5B',
    w: '\u02B7',
    x: '\u02E3',
    y: '\u02B8',
    z: '\u1DBB',
    A: '\u1D2C',
    B: '\u1D2E',
    C: '\u1D9C',
    D: '\u1D30',
    E: '\u1D31',
    F: '\u1DA0',
    G: '\u1D33',
    H: '\u1D34',
    I: '\u1D35',
    J: '\u1D36',
    K: '\u1D37',
    L: '\u1D38',
    M: '\u1D39',
    N: '\u1D3A',
    O: '\u1D3C',
    P: '\u1D3E',
    Q: '\u02A0',
    R: '\u1D3F',
    S: '\u02E2',
    T: '\u1D40',
    U: '\u1D41',
    V: '\u2C7D',
    W: '\u1D42',
    X: '\u02E3',
    Y: '\u02B8',
    Z: '\u1DBB',
    '0': '\u2070',
    '1': '\u00B9',
    '2': '\u00B2',
    '3': '\u00B3',
    '4': '\u2074',
    '5': '\u2075',
    '6': '\u2076',
    '7': '\u2077',
    '8': '\u2078',
    '9': '\u2079',
};

const superscript: StyleDef = {
    id: 'superscript',
    name: 'Superscript',
    transform: (text: string) => applyMap(text, SUPERSCRIPT_MAP),
};

const SUBSCRIPT_MAP: Record<string, string> = {
    a: '\u2090',
    e: '\u2091',
    h: '\u2095',
    i: '\u1D62',
    j: '\u2C7C',
    k: '\u2096',
    l: '\u2097',
    m: '\u2098',
    n: '\u2099',
    o: '\u2092',
    p: '\u209A',
    r: '\u1D63',
    s: '\u209B',
    t: '\u209C',
    u: '\u1D64',
    v: '\u1D65',
    x: '\u2093',
    '0': '\u2080',
    '1': '\u2081',
    '2': '\u2082',
    '3': '\u2083',
    '4': '\u2084',
    '5': '\u2085',
    '6': '\u2086',
    '7': '\u2087',
    '8': '\u2088',
    '9': '\u2089',
};

const subscript: StyleDef = {
    id: 'subscript',
    name: 'Subscript',
    transform: (text: string) => applyMap(text, SUBSCRIPT_MAP),
};

function regionalIndicatorTransform(text: string): string {
    let out = '';
    for (const ch of text) {
        const code = ch.codePointAt(0)!;
        if (code >= 65 && code <= 90) {
            out += String.fromCodePoint(0x1f1e6 + (code - 65));
        } else if (code >= 97 && code <= 122) {
            out += String.fromCodePoint(0x1f1e6 + (code - 97));
        } else {
            out += ch;
        }
    }
    return out;
}

const regionalIndicator: StyleDef = {
    id: 'regional-indicator',
    name: 'Regional Indicator',
    transform: regionalIndicatorTransform,
};

const WINGDINGS_MAP: Record<string, string> = {
    a: '\u2702',
    b: '\u2709',
    c: '\u270D',
    d: '\u2712',
    e: '\u2713',
    f: '\u2714',
    g: '\u2715',
    h: '\u2716',
    i: '\u2717',
    j: '\u2718',
    k: '\u2719',
    l: '\u271A',
    m: '\u271B',
    n: '\u271C',
    o: '\u2756',
    p: '\u275B',
    q: '\u275C',
    r: '\u275D',
    s: '\u275E',
    t: '\u2761',
    u: '\u2762',
    v: '\u2763',
    w: '\u2764',
    x: '\u2765',
    y: '\u2766',
    z: '\u2767',
    A: '\u2702',
    B: '\u2709',
    C: '\u270D',
    D: '\u2712',
    E: '\u2713',
    F: '\u2714',
    G: '\u2715',
    H: '\u2716',
    I: '\u2717',
    J: '\u2718',
    K: '\u2719',
    L: '\u271A',
    M: '\u271B',
    N: '\u271C',
    O: '\u2756',
    P: '\u275B',
    Q: '\u275C',
    R: '\u275D',
    S: '\u275E',
    T: '\u2761',
    U: '\u2762',
    V: '\u2763',
    W: '\u2764',
    X: '\u2765',
    Y: '\u2766',
    Z: '\u2767',
};

const wingdings: StyleDef = {
    id: 'wingdings',
    name: 'Wingdings',
    transform: (text: string) => applyMap(text, WINGDINGS_MAP),
};

const spongemock: StyleDef = {
    id: 'spongemock',
    name: 'Spongemock',
    transform: (text: string) => {
        let letterIndex = 0;
        let out = '';
        for (const ch of text) {
            if (/[a-zA-Z]/.test(ch)) {
                out += letterIndex % 2 === 0 ? ch.toLowerCase() : ch.toUpperCase();
                letterIndex++;
            } else {
                out += ch;
            }
        }
        return out;
    },
};

// ---------------------------------------------------------------------------
// Exported style array (27 styles, in required order)
// ---------------------------------------------------------------------------

export const STYLE_DEFS: StyleDef[] = [
    // Mathematical (13)
    bold,
    italic,
    boldItalic,
    script,
    boldScript,
    fraktur,
    boldFraktur,
    doubleStruck,
    monospace,
    sansSerif,
    sansBold,
    sansItalic,
    sansBoldItalic,
    // Enclosed (3)
    circled,
    negativeCircled,
    squared,
    // Width / Case (3)
    fullwidth,
    smallCaps,
    upsideDown,
    // Decorative (3)
    strikethrough,
    underline,
    zalgo,
    // Extras (5)
    superscript,
    subscript,
    regionalIndicator,
    wingdings,
    spongemock,
];

// ---------------------------------------------------------------------------
// Helper to transform text by style id
// ---------------------------------------------------------------------------

export function transformText(input: string, styleId: string): string {
    const style = STYLE_DEFS.find((s) => s.id === styleId);
    if (!style) return input;
    return style.transform(input);
}
