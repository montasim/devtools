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

function regionalColoredTransform(text: string): string {
    let out = '';
    for (const ch of text) {
        const code = ch.codePointAt(0)!;
        if (code >= 65 && code <= 90) {
            out += String.fromCodePoint(0x1f1e6 + (code - 65)) + '\u200B';
        } else if (code >= 97 && code <= 122) {
            out += String.fromCodePoint(0x1f1e6 + (code - 97)) + '\u200B';
        } else {
            out += ch;
        }
    }
    return out;
}

const regionalColored: StyleDef = {
    id: 'regional-colored',
    name: 'Regional Colored',
    transform: regionalColoredTransform,
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
// Additional styles (10 more)
// ---------------------------------------------------------------------------

// Squared Negative — 🅰🅱🅲 (U+1F170-1F189, A-Z)
const squaredNegMap: Record<string, string> = {};
for (let i = 0; i < 26; i++) {
    squaredNegMap[String.fromCharCode(65 + i)] = String.fromCodePoint(0x1f170 + i);
}
const squaredNegative: StyleDef = {
    id: 'squared-negative',
    name: 'Squared Negative',
    transform: (text: string) => applyMap(text, squaredNegMap),
};

// Parenthesized — ⒜⒝⒞ (U+249C-24B5, a-z)
const parenMap: Record<string, string> = {};
for (let i = 0; i < 26; i++) {
    parenMap[String.fromCharCode(97 + i)] = String.fromCodePoint(0x249c + i);
}
const parenthesized: StyleDef = {
    id: 'parenthesized',
    name: 'Parenthesized',
    transform: (text: string) => applyMap(text, parenMap),
};

// Braille — ⠓⠑⠇⠇⠕ (Grade 1)
const BRAILLE_MAP: Record<string, string> = {
    a: '\u2801',
    b: '\u2803',
    c: '\u2809',
    d: '\u2819',
    e: '\u2811',
    f: '\u280B',
    g: '\u281B',
    h: '\u2813',
    i: '\u280A',
    j: '\u281A',
    k: '\u2805',
    l: '\u2807',
    m: '\u280D',
    n: '\u281D',
    o: '\u2815',
    p: '\u280F',
    q: '\u281F',
    r: '\u2817',
    s: '\u280E',
    t: '\u281E',
    u: '\u2825',
    v: '\u2827',
    w: '\u283A',
    x: '\u282D',
    y: '\u2835',
    z: '\u283B',
    '1': '\u2801',
    '2': '\u2803',
    '3': '\u2809',
    '4': '\u2819',
    '5': '\u2811',
    '6': '\u280B',
    '7': '\u281B',
    '8': '\u2813',
    '9': '\u280A',
    '0': '\u281A',
};
const braille: StyleDef = {
    id: 'braille',
    name: 'Braille',
    transform: (text: string) => applyMap(text, BRAILLE_MAP),
};

// Runic — Elder Futhark approximation
const RUNIC_MAP: Record<string, string> = {
    a: '\u16A2',
    b: '\u16D2',
    c: '\u16B1',
    d: '\u16DE',
    e: '\u16D6',
    f: '\u16A0',
    g: '\u16B7',
    h: '\u16BA',
    i: '\u16C1',
    j: '\u16C1',
    k: '\u16B2',
    l: '\u16DA',
    m: '\u16D7',
    n: '\u16BE',
    o: '\u16A9',
    p: '\u16C8',
    q: '\u16B2',
    r: '\u16B1',
    s: '\u16CA',
    t: '\u16CF',
    u: '\u16A3',
    v: '\u16A3',
    w: '\u16B3',
    x: '\u16D2',
    y: '\u16C1',
    z: '\u16C1',
    A: '\u16A2',
    B: '\u16D2',
    C: '\u16B1',
    D: '\u16DE',
    E: '\u16D6',
    F: '\u16A0',
    G: '\u16B7',
    H: '\u16BA',
    I: '\u16C1',
    J: '\u16C1',
    K: '\u16B2',
    L: '\u16DA',
    M: '\u16D7',
    N: '\u16BE',
    O: '\u16A9',
    P: '\u16C8',
    Q: '\u16B2',
    R: '\u16B1',
    S: '\u16CA',
    T: '\u16CF',
    U: '\u16A3',
    V: '\u16A3',
    W: '\u16B3',
    X: '\u16D2',
    Y: '\u16C1',
    Z: '\u16C1',
};
const runic: StyleDef = {
    id: 'runic',
    name: 'Runic',
    transform: (text: string) => applyMap(text, RUNIC_MAP),
};

// Cyrillic lookalikes — using visually similar Cyrillic letters
const CYRILLIC_MAP: Record<string, string> = {
    a: '\u0430',
    b: '\u042C',
    c: '\u0441',
    d: '\u0501',
    e: '\u0435',
    f: '\u0192',
    g: '\u0581',
    h: '\u04BB',
    i: '\u0456',
    j: '\u0458',
    k: '\u043A',
    l: '\u043B',
    m: '\u043C',
    n: '\u043F',
    o: '\u043E',
    p: '\u0440',
    q: '\u051B',
    r: '\u0159',
    s: '\u0455',
    t: '\u0163',
    u: '\u0443',
    v: '\u0475',
    w: '\u051D',
    x: '\u0445',
    y: '\u0443',
    z: '\u0292',
    A: '\u0410',
    B: '\u0412',
    C: '\u0421',
    D: '\u0500',
    E: '\u0415',
    F: '\u0524',
    G: '\u0494',
    H: '\u041D',
    I: '\u0406',
    J: '\u0408',
    K: '\u041A',
    L: '\u041B',
    M: '\u041C',
    N: '\u0418',
    O: '\u041E',
    P: '\u0420',
    Q: '\u051A',
    R: '\u042F',
    S: '\u0405',
    T: '\u0422',
    U: '\u0443',
    V: '\u0474',
    W: '\u051C',
    X: '\u0425',
    Y: '\u0423',
    Z: '\u0409',
};
const cyrillic: StyleDef = {
    id: 'cyrillic',
    name: 'Cyrillic',
    transform: (text: string) => applyMap(text, CYRILLIC_MAP),
};

// Aesthetic/Vaporwave — fullwidth with spaces between chars
const aesthetic: StyleDef = {
    id: 'aesthetic',
    name: 'Aesthetic',
    transform: (text: string) =>
        [...text]
            .map((ch) => {
                const code = ch.codePointAt(0)!;
                if (code >= 65 && code <= 90) {
                    return String.fromCodePoint(0xff21 + (code - 65));
                }
                if (code >= 97 && code <= 122) {
                    return String.fromCodePoint(0xff41 + (code - 97));
                }
                if (code >= 48 && code <= 57) {
                    return String.fromCodePoint(0xff10 + (code - 48));
                }
                return ch;
            })
            .join(' '),
};

// Wavy — combining tilde below (U+0330)
const wavy: StyleDef = {
    id: 'wavy',
    name: 'Wavy',
    transform: (text: string) => [...text].map((ch) => (ch === '\n' ? ch : ch + '\u0330')).join(''),
};

// Dotted — combining dot above (U+0307)
const dotted: StyleDef = {
    id: 'dotted',
    name: 'Dotted',
    transform: (text: string) => [...text].map((ch) => (ch === '\n' ? ch : ch + '\u0307')).join(''),
};

// Double underline — combining double low line (U+0333)
const doubleUnderline: StyleDef = {
    id: 'double-underline',
    name: 'Double Underline',
    transform: (text: string) => [...text].map((ch) => (ch === '\n' ? ch : ch + '\u0333')).join(''),
};

// Crossed Out Bold — bold text + strikethrough
const crossedBold: StyleDef = {
    id: 'crossed-bold',
    name: 'Crossed Bold',
    transform: (text: string) =>
        applyMap(text, offsetMap(0x1d400, 0x1d41a))
            .split('')
            .map((ch) => (ch === '\n' ? ch : ch + '\u0336'))
            .join(''),
};

// ---------------------------------------------------------------------------
// More combining styles
// ---------------------------------------------------------------------------

const overline: StyleDef = {
    id: 'overline',
    name: 'Overline',
    transform: (text: string) => [...text].map((ch) => (ch === '\n' ? ch : ch + '\u0305')).join(''),
};

const enclosingCircle: StyleDef = {
    id: 'enclosing-circle',
    name: 'Enclosing Circle',
    transform: (text: string) =>
        [...text].map((ch) => (ch === '\n' || ch === ' ' ? ch : ch + '\u20DD')).join(''),
};

const enclosingSquare: StyleDef = {
    id: 'enclosing-square',
    name: 'Enclosing Square',
    transform: (text: string) =>
        [...text].map((ch) => (ch === '\n' || ch === ' ' ? ch : ch + '\u20DE')).join(''),
};

const ringAbove: StyleDef = {
    id: 'ring-above',
    name: 'Ring Above',
    transform: (text: string) => [...text].map((ch) => (ch === '\n' ? ch : ch + '\u030A')).join(''),
};

const caron: StyleDef = {
    id: 'caron',
    name: 'Caron',
    transform: (text: string) => [...text].map((ch) => (ch === '\n' ? ch : ch + '\u030C')).join(''),
};

const breve: StyleDef = {
    id: 'breve',
    name: 'Breve',
    transform: (text: string) => [...text].map((ch) => (ch === '\n' ? ch : ch + '\u0306')).join(''),
};

const longStroke: StyleDef = {
    id: 'long-stroke',
    name: 'Long Stroke',
    transform: (text: string) => [...text].map((ch) => (ch === '\n' ? ch : ch + '\u0335')).join(''),
};

const arrowAbove: StyleDef = {
    id: 'arrow-above',
    name: 'Arrow Above',
    transform: (text: string) =>
        [...text].map((ch) => (ch === '\n' || ch === ' ' ? ch : ch + '\u20D1')).join(''),
};

// ---------------------------------------------------------------------------
// Script-based styles (ancient / exotic alphabets)
// ---------------------------------------------------------------------------

const GEORGIAN_MAP: Record<string, string> = {
    a: '\u10D0',
    b: '\u10D1',
    c: '\u10EA',
    d: '\u10D3',
    e: '\u10D4',
    f: '\u10E4',
    g: '\u10D2',
    h: '\u10F0',
    i: '\u10D8',
    j: '\u10EF',
    k: '\u10D9',
    l: '\u10DA',
    m: '\u10DB',
    n: '\u10DC',
    o: '\u10DD',
    p: '\u10DE',
    q: '\u10D9',
    r: '\u10E0',
    s: '\u10E1',
    t: '\u10E2',
    u: '\u10E3',
    v: '\u10D5',
    w: '\u10E3',
    x: '\u10EE',
    y: '\u10E8',
    z: '\u10D6',
    A: '\u10D0',
    B: '\u10D1',
    C: '\u10EA',
    D: '\u10D3',
    E: '\u10D4',
    F: '\u10E4',
    G: '\u10D2',
    H: '\u10F0',
    I: '\u10D8',
    J: '\u10EF',
    K: '\u10D9',
    L: '\u10DA',
    M: '\u10DB',
    N: '\u10DC',
    O: '\u10DD',
    P: '\u10DE',
    Q: '\u10D9',
    R: '\u10E0',
    S: '\u10E1',
    T: '\u10E2',
    U: '\u10E3',
    V: '\u10D5',
    W: '\u10E3',
    X: '\u10EE',
    Y: '\u10E8',
    Z: '\u10D6',
};
const georgian: StyleDef = {
    id: 'georgian',
    name: 'Georgian',
    transform: (text: string) => applyMap(text, GEORGIAN_MAP),
};

const ARMENIAN_MAP: Record<string, string> = {
    a: '\u0561',
    b: '\u0562',
    c: '\u056E',
    d: '\u0564',
    e: '\u0565',
    f: '\u0581',
    g: '\u0563',
    h: '\u0570',
    i: '\u056B',
    j: '\u0575',
    k: '\u056F',
    l: '\u056C',
    m: '\u0574',
    n: '\u0576',
    o: '\u0578',
    p: '\u057A',
    q: '\u056F',
    r: '\u057C',
    s: '\u057D',
    t: '\u057F',
    u: '\u0578',
    v: '\u057E',
    w: '\u057E',
    x: '\u056D',
    y: '\u0568',
    z: '\u0566',
    A: '\u0531',
    B: '\u0532',
    C: '\u054E',
    D: '\u0534',
    E: '\u0535',
    F: '\u0551',
    G: '\u0533',
    H: '\u0540',
    I: '\u053B',
    J: '\u0545',
    K: '\u053F',
    L: '\u053C',
    M: '\u0544',
    N: '\u0546',
    O: '\u0548',
    P: '\u054A',
    Q: '\u053F',
    R: '\u054C',
    S: '\u054D',
    T: '\u054F',
    U: '\u0548',
    V: '\u054E',
    W: '\u054E',
    X: '\u053D',
    Y: '\u0548',
    Z: '\u0536',
};
const armenian: StyleDef = {
    id: 'armenian',
    name: 'Armenian',
    transform: (text: string) => applyMap(text, ARMENIAN_MAP),
};

const TIFINAGH_MAP: Record<string, string> = {
    a: '\u2D30',
    b: '\u2D31',
    c: '\u2D55',
    d: '\u2D33',
    e: '\u2D33',
    f: '\u2D5C',
    g: '\u2D33',
    h: '\u2D33',
    i: '\u2D49',
    j: '\u2D33',
    k: '\u2D3B',
    l: '\u2D3C',
    m: '\u2D3D',
    n: '\u2D3E',
    o: '\u2D33',
    p: '\u2D33',
    q: '\u2D3B',
    r: '\u2D44',
    s: '\u2D45',
    t: '\u2D47',
    u: '\u2D49',
    v: '\u2D33',
    w: '\u2D33',
    x: '\u2D33',
    y: '\u2D49',
    z: '\u2D33',
};
const tifinagh: StyleDef = {
    id: 'tifinagh',
    name: 'Tifinagh',
    transform: (text: string) => applyMap(text, TIFINAGH_MAP),
};

const OGHAM_MAP: Record<string, string> = {
    a: '\u1691',
    b: '\u1681',
    c: '\u1688',
    d: '\u1683',
    e: '\u1695',
    f: '\u1680',
    g: '\u1687',
    h: '\u1693',
    i: '\u1690',
    j: '\u1690',
    k: '\u1684',
    l: '\u168B',
    m: '\u168D',
    n: '\u168F',
    o: '\u1692',
    p: '\u1682',
    q: '\u1684',
    r: '\u1686',
    s: '\u1689',
    t: '\u168E',
    u: '\u1694',
    v: '\u1694',
    w: '\u168A',
    x: '\u168C',
    y: '\u1690',
    z: '\u1685',
};
const ogham: StyleDef = {
    id: 'ogham',
    name: 'Ogham',
    transform: (text: string) => '\u168C' + applyMap(text, OGHAM_MAP) + '\u168C',
};

const COPTIC_MAP: Record<string, string> = {
    a: '\u2C88',
    b: '\u2C8A',
    c: '\u2C8E',
    d: '\u2C90',
    e: '\u2C92',
    f: '\u2C94',
    g: '\u2C96',
    h: '\u2C98',
    i: '\u2C9A',
    j: '\u2C9A',
    k: '\u2C9C',
    l: '\u2C9E',
    m: '\u2CA0',
    n: '\u2CA2',
    o: '\u2CA4',
    p: '\u2CA6',
    q: '\u2C9C',
    r: '\u2CA8',
    s: '\u2CAA',
    t: '\u2CAC',
    u: '\u2CAE',
    v: '\u2CB0',
    w: '\u2CAE',
    x: '\u2CB2',
    y: '\u2CB4',
    z: '\u2CB6',
    A: '\u2C80',
    B: '\u2C82',
    C: '\u2C86',
    D: '\u2C88',
    E: '\u2C8A',
    F: '\u2C8C',
    G: '\u2C8E',
    H: '\u2C90',
    I: '\u2C92',
    J: '\u2C92',
    K: '\u2C94',
    L: '\u2C96',
    M: '\u2C98',
    N: '\u2C9A',
    O: '\u2C9C',
    P: '\u2C9E',
    Q: '\u2C94',
    R: '\u2CA0',
    S: '\u2CA2',
    T: '\u2CA4',
    U: '\u2CA6',
    V: '\u2CA8',
    W: '\u2CA6',
    X: '\u2CAA',
    Y: '\u2CAC',
    Z: '\u2CAE',
};
const coptic: StyleDef = {
    id: 'coptic',
    name: 'Coptic',
    transform: (text: string) => applyMap(text, COPTIC_MAP),
};

const GLAGOLITIC_MAP: Record<string, string> = {
    a: '\u2C30',
    b: '\u2C31',
    c: '\u2C32',
    d: '\u2C33',
    e: '\u2C34',
    f: '\u2C35',
    g: '\u2C36',
    h: '\u2C37',
    i: '\u2C38',
    j: '\u2C39',
    k: '\u2C3A',
    l: '\u2C3B',
    m: '\u2C3C',
    n: '\u2C3D',
    o: '\u2C3E',
    p: '\u2C3F',
    q: '\u2C3A',
    r: '\u2C40',
    s: '\u2C41',
    t: '\u2C42',
    u: '\u2C43',
    v: '\u2C44',
    w: '\u2C43',
    x: '\u2C45',
    y: '\u2C46',
    z: '\u2C47',
    A: '\u2C00',
    B: '\u2C01',
    C: '\u2C02',
    D: '\u2C03',
    E: '\u2C04',
    F: '\u2C05',
    G: '\u2C06',
    H: '\u2C07',
    I: '\u2C08',
    J: '\u2C09',
    K: '\u2C0A',
    L: '\u2C0B',
    M: '\u2C0C',
    N: '\u2C0D',
    O: '\u2C0E',
    P: '\u2C0F',
    Q: '\u2C0A',
    R: '\u2C10',
    S: '\u2C11',
    T: '\u2C12',
    U: '\u2C13',
    V: '\u2C14',
    W: '\u2C13',
    X: '\u2C15',
    Y: '\u2C16',
    Z: '\u2C17',
};
const glagolitic: StyleDef = {
    id: 'glagolitic',
    name: 'Glagolitic',
    transform: (text: string) => applyMap(text, GLAGOLITIC_MAP),
};

// ---------------------------------------------------------------------------
// Combined styles (base + combining)
// ---------------------------------------------------------------------------

const boldUnderline: StyleDef = {
    id: 'bold-underline',
    name: 'Bold Underline',
    transform: (text: string) =>
        applyMap(text, offsetMap(0x1d400, 0x1d41a))
            .split('')
            .map((ch) => (ch === '\n' ? ch : ch + '\u0332'))
            .join(''),
};

const boldWavy: StyleDef = {
    id: 'bold-wavy',
    name: 'Bold Wavy',
    transform: (text: string) =>
        applyMap(text, offsetMap(0x1d400, 0x1d41a))
            .split('')
            .map((ch) => (ch === '\n' ? ch : ch + '\u0330'))
            .join(''),
};

const italicStrikethrough: StyleDef = {
    id: 'italic-strikethrough',
    name: 'Italic Strikethrough',
    transform: (text: string) =>
        applyMap(text, { ...offsetMap(0x1d434, 0x1d44e), h: '\u210E' })
            .split('')
            .map((ch) => (ch === '\n' ? ch : ch + '\u0336'))
            .join(''),
};

const boldOverline: StyleDef = {
    id: 'bold-overline',
    name: 'Bold Overline',
    transform: (text: string) =>
        applyMap(text, offsetMap(0x1d400, 0x1d41a))
            .split('')
            .map((ch) => (ch === '\n' ? ch : ch + '\u0305'))
            .join(''),
};

// ---------------------------------------------------------------------------
// Transform styles (non-Unicode-char mapping)
// ---------------------------------------------------------------------------

const reverse: StyleDef = {
    id: 'reverse',
    name: 'Reverse',
    transform: (text: string) => [...text].reverse().join(''),
};

const MORSE_MAP: Record<string, string> = {
    a: '.-',
    b: '-...',
    c: '-.-.',
    d: '-..',
    e: '.',
    f: '..-.',
    g: '--.',
    h: '....',
    i: '..',
    j: '.---',
    k: '-.-',
    l: '.-..',
    m: '--',
    n: '-.',
    o: '---',
    p: '.--.',
    q: '--.-',
    r: '.-.',
    s: '...',
    t: '-',
    u: '..-',
    v: '...-',
    w: '.--',
    x: '-..-',
    y: '-.--',
    z: '--..',
    '0': '-----',
    '1': '.----',
    '2': '..---',
    '3': '...--',
    '4': '....-',
    '5': '.....',
    '6': '-....',
    '7': '--...',
    '8': '---..',
    '9': '----.',
};
const morse: StyleDef = {
    id: 'morse',
    name: 'Morse Code',
    transform: (text: string) =>
        [...text]
            .filter((ch) => ch !== '\n')
            .map((ch) => MORSE_MAP[ch.toLowerCase()] ?? ch)
            .join(' '),
};

const NATO_MAP: Record<string, string> = {
    a: 'Alpha',
    b: 'Bravo',
    c: 'Charlie',
    d: 'Delta',
    e: 'Echo',
    f: 'Foxtrot',
    g: 'Golf',
    h: 'Hotel',
    i: 'India',
    j: 'Juliet',
    k: 'Kilo',
    l: 'Lima',
    m: 'Mike',
    n: 'November',
    o: 'Oscar',
    p: 'Papa',
    q: 'Quebec',
    r: 'Romeo',
    s: 'Sierra',
    t: 'Tango',
    u: 'Uniform',
    v: 'Victor',
    w: 'Whiskey',
    x: 'X-ray',
    y: 'Yankee',
    z: 'Zulu',
    '0': 'Zero',
    '1': 'One',
    '2': 'Two',
    '3': 'Three',
    '4': 'Four',
    '5': 'Five',
    '6': 'Six',
    '7': 'Seven',
    '8': 'Eight',
    '9': 'Niner',
};
const nato: StyleDef = {
    id: 'nato',
    name: 'NATO Phonetic',
    transform: (text: string) =>
        [...text]
            .filter((ch) => ch !== '\n')
            .map((ch) => NATO_MAP[ch.toLowerCase()] ?? ch)
            .join(' '),
};

const LEET_MAP: Record<string, string> = {
    a: '4',
    b: '8',
    c: '(',
    d: '|)',
    e: '3',
    f: '|=',
    g: '6',
    h: '#',
    i: '!',
    j: ']=',
    k: '|{',
    l: '1',
    m: '/\\/',
    n: '/\\/',
    o: '0',
    p: '|>',
    q: '9',
    r: '|2',
    s: '$',
    t: '7',
    u: '|_|',
    v: '\\/',
    w: '\\/\\/',
    x: '><',
    y: '`/',
    z: '2',
    A: '4',
    B: '8',
    C: '(',
    D: '|)',
    E: '3',
    F: '|=',
    G: '6',
    H: '#',
    I: '!',
    J: ']=',
    K: '|{',
    L: '1',
    M: '/\\/',
    N: '/\\/',
    O: '0',
    P: '|>',
    Q: '9',
    R: '|2',
    S: '$',
    T: '7',
    U: '|_|',
    V: '\\/',
    W: '\\/\\/',
    X: '><',
    Y: '`/',
    Z: '2',
};
const leet: StyleDef = {
    id: 'leet',
    name: 'Leet Speak',
    transform: (text: string) => applyMap(text, LEET_MAP),
};

const spacedOut: StyleDef = {
    id: 'spaced',
    name: 'Spaced Out',
    transform: (text: string) => [...text].join(' '),
};

const clap: StyleDef = {
    id: 'clap',
    name: 'Clap',
    transform: (text: string) =>
        [...text]
            .filter((ch) => ch !== ' ' && ch !== '\n')
            .map((ch) => '\uD83D\uDC4F' + ch)
            .join(''),
};

// ---------------------------------------------------------------------------
// All-caps styles (force uppercase, then apply transform)
// ---------------------------------------------------------------------------

function upperThen(base: StyleDef): StyleDef {
    return {
        id: base.id + '-caps',
        name: base.name + ' Caps',
        transform: (text: string) => base.transform(text.toUpperCase()),
    };
}

const boldCaps = upperThen(bold);
const italicCaps = upperThen(italic);
const boldItalicCaps = upperThen(boldItalic);
const scriptCaps = upperThen(script);
const boldScriptCaps = upperThen(boldScript);
const frakturCaps = upperThen(fraktur);
const boldFrakturCaps = upperThen(boldFraktur);
const doubleStruckCaps = upperThen(doubleStruck);
const monospaceCaps = upperThen(monospace);
const sansCaps = upperThen(sansSerif);
const sansBoldCaps = upperThen(sansBold);
const sansItalicCaps = upperThen(sansItalic);
const sansBoldItalicCaps = upperThen(sansBoldItalic);
const circledCaps = upperThen(circled);
const squaredCaps = upperThen(squared);
const squaredNegCaps = upperThen(squaredNegative);
const negCircledCaps = upperThen(negativeCircled);
const fullwidthCaps = upperThen(fullwidth);
const strikethroughCaps = upperThen(strikethrough);
const underlineCaps = upperThen(underline);

const spacedCaps: StyleDef = {
    id: 'spaced-caps',
    name: 'Spaced Caps',
    transform: (text: string) => [...text.toUpperCase()].join(' '),
};

const clapCaps: StyleDef = {
    id: 'clap-caps',
    name: 'Clap Caps',
    transform: (text: string) =>
        [...text.toUpperCase()]
            .filter((ch) => ch !== ' ' && ch !== '\n')
            .map((ch) => '\uD83D\uDC4F' + ch)
            .join(''),
};

// ---------------------------------------------------------------------------
// More combining styles
// ---------------------------------------------------------------------------

const keycap: StyleDef = {
    id: 'keycap',
    name: 'Keycap',
    transform: (text: string) =>
        [...text].map((ch) => (ch === '\n' || ch === ' ' ? ch : ch + '\u20E3')).join(''),
};

const threeDots: StyleDef = {
    id: 'three-dots',
    name: 'Three Dots',
    transform: (text: string) => [...text].map((ch) => (ch === '\n' ? ch : ch + '\u20DB')).join(''),
};

const fourDots: StyleDef = {
    id: 'four-dots',
    name: 'Four Dots',
    transform: (text: string) => [...text].map((ch) => (ch === '\n' ? ch : ch + '\u20DC')).join(''),
};

const bridgeAbove: StyleDef = {
    id: 'bridge-above',
    name: 'Bridge Above',
    transform: (text: string) => [...text].map((ch) => (ch === '\n' ? ch : ch + '\u0346')).join(''),
};

const doubleBreve: StyleDef = {
    id: 'double-breve',
    name: 'Double Breve',
    transform: (text: string) => [...text].map((ch) => (ch === '\n' ? ch : ch + '\u0361')).join(''),
};

const equalsBelow: StyleDef = {
    id: 'equals-below',
    name: 'Equals Below',
    transform: (text: string) => [...text].map((ch) => (ch === '\n' ? ch : ch + '\u034B')).join(''),
};

const leftArrowBelow: StyleDef = {
    id: 'left-arrow-below',
    name: 'Left Arrow Below',
    transform: (text: string) =>
        [...text].map((ch) => (ch === '\n' || ch === ' ' ? ch : ch + '\u20EE')).join(''),
};

const rightArrowBelow: StyleDef = {
    id: 'right-arrow-below',
    name: 'Right Arrow Below',
    transform: (text: string) =>
        [...text].map((ch) => (ch === '\n' || ch === ' ' ? ch : ch + '\u20EF')).join(''),
};

// ---------------------------------------------------------------------------
// More script-based styles
// ---------------------------------------------------------------------------

const CHEROKEE_MAP: Record<string, string> = {
    a: '\u13A0',
    b: '\u13A2',
    c: '\u13A3',
    d: '\u13A4',
    e: '\u13A5',
    f: '\u13A6',
    g: '\u13A7',
    h: '\u13A8',
    i: '\u13A9',
    j: '\u13AA',
    k: '\u13AB',
    l: '\u13AC',
    m: '\u13AD',
    n: '\u13AE',
    o: '\u13AF',
    p: '\u13B0',
    q: '\u13AB',
    r: '\u13B1',
    s: '\u13B2',
    t: '\u13B3',
    u: '\u13B4',
    v: '\u13B5',
    w: '\u13B6',
    x: '\u13B7',
    y: '\u13B8',
    z: '\u13B9',
};
const cherokee: StyleDef = {
    id: 'cherokee',
    name: 'Cherokee',
    transform: (text: string) => applyMap(text, CHEROKEE_MAP),
};

const GREEK_MAP: Record<string, string> = {
    a: '\u03B1',
    b: '\u03B2',
    c: '\u03BE',
    d: '\u03B4',
    e: '\u03B5',
    f: '\u03C6',
    g: '\u03B3',
    h: '\u03B7',
    i: '\u03B9',
    j: '\u03B6',
    k: '\u03BA',
    l: '\u03BB',
    m: '\u03BC',
    n: '\u03BD',
    o: '\u03BF',
    p: '\u03C0',
    q: '\u03BA',
    r: '\u03C1',
    s: '\u03C3',
    t: '\u03C4',
    u: '\u03C5',
    v: '\u03C9',
    w: '\u03C8',
    x: '\u03C7',
    y: '\u03C5',
    z: '\u03B6',
    A: '\u0391',
    B: '\u0392',
    C: '\u039E',
    D: '\u0394',
    E: '\u0395',
    F: '\u03A6',
    G: '\u0393',
    H: '\u0397',
    I: '\u0399',
    J: '\u0396',
    K: '\u039A',
    L: '\u039B',
    M: '\u039C',
    N: '\u039D',
    O: '\u039F',
    P: '\u03A0',
    Q: '\u039A',
    R: '\u03A1',
    S: '\u03A3',
    T: '\u03A4',
    U: '\u03A5',
    V: '\u03A9',
    W: '\u03A8',
    X: '\u03A7',
    Y: '\u03A5',
    Z: '\u0396',
};
const greek: StyleDef = {
    id: 'greek',
    name: 'Greek',
    transform: (text: string) => applyMap(text, GREEK_MAP),
};

// ---------------------------------------------------------------------------
// Zalgo variants
// ---------------------------------------------------------------------------

const zalgoLight: StyleDef = {
    id: 'zalgo-light',
    name: 'Zalgo Light',
    transform: (text: string) => {
        let out = '';
        for (const ch of text) {
            if (ch === ' ' || ch === '\n') {
                out += ch;
                continue;
            }
            out += ch;
            out += COMBINING_ABOVE[Math.floor(Math.random() * COMBINING_ABOVE.length)];
        }
        return out;
    },
};

const zalgoHeavy: StyleDef = {
    id: 'zalgo-heavy',
    name: 'Zalgo Heavy',
    transform: (text: string) => {
        let out = '';
        for (const ch of text) {
            if (ch === ' ' || ch === '\n') {
                out += ch;
                continue;
            }
            out += ch;
            for (let i = 0; i < 5; i++) {
                out += COMBINING_ABOVE[Math.floor(Math.random() * COMBINING_ABOVE.length)];
            }
            for (let i = 0; i < 4; i++) {
                out += COMBINING_BELOW[Math.floor(Math.random() * COMBINING_BELOW.length)];
            }
        }
        return out;
    },
};

// ---------------------------------------------------------------------------
// More combined styles
// ---------------------------------------------------------------------------

const scriptUnderline: StyleDef = {
    id: 'script-underline',
    name: 'Script Underline',
    transform: (text: string) =>
        applyMap(text, {
            ...offsetMap(0x1d49c, 0x1d4b6),
            B: '\u212C',
            D: '\u2145',
            F: '\u2131',
            H: '\u210B',
            I: '\u2110',
            K: '\u2133',
            L: '\u2112',
        })
            .split('')
            .map((ch) => (ch === '\n' ? ch : ch + '\u0332'))
            .join(''),
};

const frakturStrikethrough: StyleDef = {
    id: 'fraktur-strikethrough',
    name: 'Fraktur Strikethrough',
    transform: (text: string) =>
        applyMap(text, {
            ...offsetMap(0x1d504, 0x1d51e),
            C: '\u212D',
            H: '\u210C',
            I: '\u2111',
            R: '\u211B',
            Z: '\u2128',
        })
            .split('')
            .map((ch) => (ch === '\n' ? ch : ch + '\u0336'))
            .join(''),
};

const sansBoldStrikethrough: StyleDef = {
    id: 'sans-bold-strikethrough',
    name: 'Sans Bold Strikethrough',
    transform: (text: string) =>
        applyMap(text, offsetMap(0x1d5d4, 0x1d5ee))
            .split('')
            .map((ch) => (ch === '\n' ? ch : ch + '\u0336'))
            .join(''),
};

const sansBoldUnderline: StyleDef = {
    id: 'sans-bold-underline',
    name: 'Sans Bold Underline',
    transform: (text: string) =>
        applyMap(text, offsetMap(0x1d5d4, 0x1d5ee))
            .split('')
            .map((ch) => (ch === '\n' ? ch : ch + '\u0332'))
            .join(''),
};

const monospaceStrikethrough: StyleDef = {
    id: 'monospace-strikethrough',
    name: 'Monospace Strikethrough',
    transform: (text: string) =>
        applyMap(text, offsetMap(0x1d670, 0x1d68a))
            .split('')
            .map((ch) => (ch === '\n' ? ch : ch + '\u0336'))
            .join(''),
};

const doubleStruckUnderline: StyleDef = {
    id: 'double-struck-underline',
    name: 'Double-struck Underline',
    transform: (text: string) =>
        applyMap(text, {
            ...offsetMap(0x1d538, 0x1d552),
            C: '\u2102',
            H: '\u210D',
            N: '\u2115',
            P: '\u2119',
            Q: '\u211A',
            R: '\u211D',
            Z: '\u2124',
        })
            .split('')
            .map((ch) => (ch === '\n' ? ch : ch + '\u0332'))
            .join(''),
};

const boldItalicUnderline: StyleDef = {
    id: 'bold-italic-underline',
    name: 'Bold Italic Underline',
    transform: (text: string) =>
        applyMap(text, offsetMap(0x1d468, 0x1d482))
            .split('')
            .map((ch) => (ch === '\n' ? ch : ch + '\u0332'))
            .join(''),
};

const sansItalicUnderline: StyleDef = {
    id: 'sans-italic-underline',
    name: 'Sans Italic Underline',
    transform: (text: string) =>
        applyMap(text, offsetMap(0x1d608, 0x1d622))
            .split('')
            .map((ch) => (ch === '\n' ? ch : ch + '\u0332'))
            .join(''),
};

const fullwidthStrikethrough: StyleDef = {
    id: 'fullwidth-strikethrough',
    name: 'Fullwidth Strikethrough',
    transform: (text: string) =>
        fullwidthCaps
            .transform(text)
            .split('')
            .map((ch) => (ch === '\n' ? ch : ch + '\u0336'))
            .join(''),
};

// ---------------------------------------------------------------------------
// Text transform styles
// ---------------------------------------------------------------------------

const binary: StyleDef = {
    id: 'binary',
    name: 'Binary',
    transform: (text: string) =>
        [...text]
            .filter((ch) => ch !== '\n')
            .map((ch) => ch.charCodeAt(0).toString(2).padStart(8, '0'))
            .join(' '),
};

const hex: StyleDef = {
    id: 'hex',
    name: 'Hexadecimal',
    transform: (text: string) =>
        [...text]
            .filter((ch) => ch !== '\n')
            .map((ch) => ch.charCodeAt(0).toString(16).toUpperCase().padStart(2, '0'))
            .join(' '),
};

const rot13: StyleDef = {
    id: 'rot13',
    name: 'ROT13',
    transform: (text: string) =>
        [...text]
            .map((ch) => {
                const code = ch.charCodeAt(0);
                if (code >= 65 && code <= 90)
                    return String.fromCharCode(((code - 65 + 13) % 26) + 65);
                if (code >= 97 && code <= 122)
                    return String.fromCharCode(((code - 97 + 13) % 26) + 97);
                return ch;
            })
            .join(''),
};

const UWU_MAP: Record<string, string> = {
    r: 'w',
    l: 'w',
    R: 'W',
    L: 'W',
};
const uwu: StyleDef = {
    id: 'uwu',
    name: 'UwU',
    transform: (text: string) =>
        applyMap(text, UWU_MAP)
            .replace(/n([aeiou])/gi, 'ny$1')
            .replace(/N([AEIOU])/g, 'NY$1')
            .replace(/!+/g, ' ^w^ '),
};

const titleCase: StyleDef = {
    id: 'title-case',
    name: 'Title Case',
    transform: (text: string) => text.replace(/\b\w/g, (ch) => ch.toUpperCase()),
};

const alternatingUpper: StyleDef = {
    id: 'alternating-upper',
    name: 'Alternating Upper',
    transform: (text: string) => {
        let upper = true;
        return [...text]
            .map((ch) => {
                if (/[a-zA-Z]/.test(ch)) {
                    const result = upper ? ch.toUpperCase() : ch.toLowerCase();
                    upper = !upper;
                    return result;
                }
                return ch;
            })
            .join('');
    },
};

// ---------------------------------------------------------------------------
// Exported style array (110 styles)
// ---------------------------------------------------------------------------

export const STYLE_DEFS: StyleDef[] = [
    // Mathematical — each style paired with its Caps variant
    bold,
    boldCaps,
    italic,
    italicCaps,
    boldItalic,
    boldItalicCaps,
    script,
    scriptCaps,
    boldScript,
    boldScriptCaps,
    fraktur,
    frakturCaps,
    boldFraktur,
    boldFrakturCaps,
    doubleStruck,
    doubleStruckCaps,
    monospace,
    monospaceCaps,
    sansSerif,
    sansCaps,
    sansBold,
    sansBoldCaps,
    sansItalic,
    sansItalicCaps,
    sansBoldItalic,
    sansBoldItalicCaps,
    // Enclosed
    circled,
    circledCaps,
    negativeCircled,
    negCircledCaps,
    squared,
    squaredCaps,
    squaredNegative,
    squaredNegCaps,
    // Width / Case
    fullwidth,
    fullwidthCaps,
    smallCaps,
    upsideDown,
    // Decorative
    strikethrough,
    strikethroughCaps,
    underline,
    underlineCaps,
    zalgo,
    zalgoLight,
    zalgoHeavy,
    // Extras
    superscript,
    subscript,
    regionalIndicator,
    regionalColored,
    wingdings,
    spongemock,
    // Additional Unicode styles
    parenthesized,
    braille,
    runic,
    cyrillic,
    aesthetic,
    wavy,
    dotted,
    doubleUnderline,
    crossedBold,
    // Combining styles
    overline,
    enclosingCircle,
    enclosingSquare,
    ringAbove,
    caron,
    breve,
    longStroke,
    arrowAbove,
    keycap,
    threeDots,
    fourDots,
    bridgeAbove,
    doubleBreve,
    equalsBelow,
    leftArrowBelow,
    rightArrowBelow,
    // Script-based styles
    georgian,
    armenian,
    tifinagh,
    ogham,
    coptic,
    glagolitic,
    cherokee,
    greek,
    // Combined styles
    boldUnderline,
    boldWavy,
    italicStrikethrough,
    boldOverline,
    scriptUnderline,
    frakturStrikethrough,
    sansBoldStrikethrough,
    sansBoldUnderline,
    monospaceStrikethrough,
    doubleStruckUnderline,
    boldItalicUnderline,
    sansItalicUnderline,
    fullwidthStrikethrough,
    // Transform styles
    reverse,
    morse,
    nato,
    leet,
    spacedOut,
    spacedCaps,
    clap,
    clapCaps,
    binary,
    hex,
    rot13,
    uwu,
    titleCase,
    alternatingUpper,
];

// ---------------------------------------------------------------------------
// Helper to transform text by style id
// ---------------------------------------------------------------------------

export function transformText(input: string, styleId: string): string {
    const style = STYLE_DEFS.find((s) => s.id === styleId);
    if (!style) return input;
    return style.transform(input);
}
