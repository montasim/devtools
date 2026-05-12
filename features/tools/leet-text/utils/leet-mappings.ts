export interface LeetLevel {
    id: string;
    name: string;
    description: string;
    category: string;
    encodeMap: Record<string, string>;
}

export const LEET_LEVELS: LeetLevel[] = [
    {
        id: 'basic',
        name: 'Basic',
        description: 'Simple number substitutions',
        category: 'Standard',
        encodeMap: {
            a: '4',
            e: '3',
            i: '1',
            o: '0',
            s: '5',
            t: '7',
        },
    },
    {
        id: 'light-1337',
        name: 'Light 1337',
        description: 'Classic light leet speak',
        category: 'Standard',
        encodeMap: {
            a: '4',
            b: '8',
            e: '3',
            g: '9',
            i: '1',
            l: '1',
            o: '0',
            s: '5',
            t: '7',
        },
    },
    {
        id: 'classic-1337',
        name: 'Classic 1337',
        description: 'The original gamer/hacker leet',
        category: 'Standard',
        encodeMap: {
            a: '4',
            b: '8',
            c: '(',
            e: '3',
            g: '9',
            i: '1',
            l: '|',
            o: '0',
            s: '5',
            t: '7',
            z: '2',
        },
    },
    {
        id: 'standard',
        name: 'Standard',
        description: '@, $, ! style substitutions',
        category: 'Standard',
        encodeMap: {
            a: '@',
            b: '8',
            e: '3',
            g: '9',
            i: '!',
            l: '1',
            o: '0',
            s: '$',
            t: '7',
        },
    },
    {
        id: 'advanced',
        name: 'Advanced',
        description: 'Multi-character ASCII art substitutions',
        category: 'ASCII Art',
        encodeMap: {
            a: '4',
            b: '|3',
            c: '(',
            d: '|)',
            e: '3',
            f: 'ph',
            g: '9',
            h: '|-|',
            i: '!',
            j: '_|',
            k: '|{',
            l: '|_',
            m: '|\\/|',
            n: '|\\|',
            o: '()',
            p: '|>',
            q: '0,',
            r: '|2',
            s: '$',
            t: '7',
            u: '|_|',
            v: '\\/',
            w: '\\/\\/',
            x: '><',
            y: '`/',
            z: '2',
        },
    },
    {
        id: 'hardcore',
        name: 'Hardcore',
        description: 'Maximum ASCII art obfuscation',
        category: 'ASCII Art',
        encodeMap: {
            a: '4',
            b: '|3',
            c: '<',
            d: '|)',
            e: '3',
            f: '|=',
            g: '6',
            h: '|-|',
            i: '|',
            j: '_]',
            k: '|{',
            l: '|_',
            m: '|\\/|',
            n: '|\\|',
            o: '()',
            p: '|>',
            q: '9,',
            r: '|2',
            s: '$',
            t: '+',
            u: '|_|',
            v: '\\/',
            w: '\\/\\/',
            x: '}{',
            y: '`/',
            z: '~/_',
        },
    },
    {
        id: 'cyber',
        name: 'Cyber',
        description: 'Cyberpunk-styled substitutions',
        category: 'Themed',
        encodeMap: {
            a: '4',
            c: '<',
            e: '3',
            g: '9',
            h: '}-{',
            i: '1',
            l: '|_',
            o: '()',
            s: '5',
            t: '7',
            u: '|_|',
            x: '><',
        },
    },
    {
        id: 'hacker',
        name: 'Hacker',
        description: 'Classic BBS-era hacker style',
        category: 'Themed',
        encodeMap: {
            a: '4',
            e: '3',
            i: '1',
            o: '0',
            s: 'z',
            t: '+',
            x: '><',
            z: '2',
        },
    },
    {
        id: 'binary-leetspeak',
        name: 'Binary Leet',
        description: 'Number-heavy style with mixed symbols',
        category: 'Standard',
        encodeMap: {
            a: '4',
            b: '8',
            c: '(',
            d: '|)',
            e: '3',
            f: '|=',
            g: '6',
            h: '#',
            i: '1',
            j: ']',
            k: '|{',
            l: '|_',
            m: '|\\/|',
            n: '/\\/|',
            o: '0',
            p: '|o',
            q: '9',
            r: '|2',
            s: '5',
            t: '7',
            u: '|_|',
            v: '\\/',
            w: '\\/\\/',
            x: '><',
            y: '`/',
            z: '2',
        },
    },
];

/** Upside-down Unicode character map */
const UPSIDE_DOWN_MAP: Record<string, string> = {
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
    A: '\u0250',
    B: 'q',
    C: '\u0254',
    D: 'p',
    E: '\u018E',
    F: '\u025F',
    G: '\u0253',
    H: '\u0265',
    I: '\u0131',
    J: '\u027E',
    K: '\u029E',
    L: 'l',
    M: '\u026F',
    N: 'u',
    O: 'o',
    P: 'd',
    Q: 'b',
    R: '\u0279',
    S: 's',
    T: '\u0287',
    U: 'n',
    V: '\u028C',
    W: '\u028D',
    X: 'x',
    Y: '\u028E',
    Z: 'z',
    '1': '\u0196',
    '2': '\u1105',
    '3': '\u0190',
    '4': '\u3123',
    '5': '\u03DB',
    '6': '9',
    '7': 'L',
    '8': '8',
    '9': '6',
    '0': '0',
    '.': '\u02D9',
    ',': "'",
    "'": ',',
    '"': ',,',
    '`': ',',
    '?': '\u00BF',
    '!': '\u00A1',
    '(': ')',
    ')': '(',
    '[': ']',
    ']': '[',
    '{': '}',
    '}': '{',
    '<': '>',
    '>': '<',
    '&': '\u214B',
};

/** Encode text using a specific leet level */
export function leetEncode(text: string, level: LeetLevel): string {
    return text
        .split('')
        .map((char) => {
            const lower = char.toLowerCase();
            if (level.encodeMap[lower]) {
                return level.encodeMap[lower];
            }
            return char;
        })
        .join('');
}

/** Encode text upside down using Unicode characters */
export function upsideDownEncode(text: string): string {
    return text
        .split('')
        .map((char) => UPSIDE_DOWN_MAP[char] || char)
        .reverse()
        .join('');
}

/** Encode using all levels and return results */
export function encodeAll(text: string): { level: LeetLevel; text: string }[] {
    const results = LEET_LEVELS.map((level) => ({
        level,
        text: leetEncode(text, level),
    }));

    results.push({
        level: {
            id: 'upsidedown',
            name: 'Upside Down',
            description: 'Unicode flip + reverse',
            category: 'Themed',
            encodeMap: {},
        },
        text: upsideDownEncode(text),
    });

    return results;
}

/** Build reverse map for a leet level (sorted longest-first for greedy matching) */
function buildReverseMap(level: LeetLevel): { pattern: string; char: string }[] {
    const entries: { pattern: string; char: string }[] = [];
    for (const [char, leet] of Object.entries(level.encodeMap)) {
        entries.push({ pattern: leet, char });
    }
    entries.sort((a, b) => b.pattern.length - a.pattern.length);
    return entries;
}

/** Decode leet text back to plain text using a specific level */
export function leetDecode(text: string, level: LeetLevel): string {
    const reverseMap = buildReverseMap(level);
    let result = '';
    let i = 0;

    while (i < text.length) {
        let matched = false;
        for (const { pattern, char } of reverseMap) {
            if (text.slice(i, i + pattern.length) === pattern) {
                result += char;
                i += pattern.length;
                matched = true;
                break;
            }
        }
        if (!matched) {
            result += text[i];
            i++;
        }
    }

    return result;
}

/** Auto-detect and decode leet text by trying all levels */
export function autoDecode(text: string): {
    decoded: string;
    levelId: string;
    levelName: string;
    confidence: number;
} {
    let best = {
        decoded: text,
        levelId: 'none',
        levelName: 'Unknown',
        confidence: 0,
    };

    for (const level of LEET_LEVELS) {
        const decoded = leetDecode(text, level);
        if (decoded === text) continue;

        const originalLetters = (text.match(/[a-zA-Z]/g) || []).length;
        const decodedLetters = (decoded.match(/[a-zA-Z]/g) || []).length;
        const confidence =
            originalLetters === 0
                ? decodedLetters / Math.max(text.length, 1)
                : decodedLetters / originalLetters;

        if (confidence > best.confidence) {
            best = { decoded, levelId: level.id, levelName: level.name, confidence };
        }
    }

    // Try upside-down decode (reverse the mapping)
    const reversed = text
        .split('')
        .reverse()
        .map((char) => {
            for (const [plain, flipped] of Object.entries(UPSIDE_DOWN_MAP)) {
                if (flipped === char) return plain;
            }
            return char;
        })
        .join('');

    if (reversed !== text) {
        const letters = (reversed.match(/[a-zA-Z]/g) || []).length;
        const confidence = letters / Math.max(reversed.length, 1);
        if (confidence > best.confidence) {
            best = {
                decoded: reversed,
                levelId: 'upsidedown',
                levelName: 'Upside Down',
                confidence,
            };
        }
    }

    return best;
}

/** Get all unique categories from leet levels */
export function getCategories(): string[] {
    const cats = new Set<string>();
    for (const level of LEET_LEVELS) {
        cats.add(level.category);
    }
    cats.add('Themed'); // for upside down
    return Array.from(cats);
}

/** All levels including the virtual upside-down level for UI display */
export const ALL_LEVELS: (LeetLevel & { isUpsideDown?: boolean })[] = [
    ...LEET_LEVELS,
    {
        id: 'upsidedown',
        name: 'Upside Down',
        description: 'Unicode flip + reverse',
        category: 'Themed',
        encodeMap: {},
        isUpsideDown: true,
    },
];
