export interface UnicodeEntry {
    char: string;
    codepoint: number;
    name: string;
    category: UnicodeCategory;
    block: string;
    htmlDecimal: string;
    htmlHex: string;
    css: string;
    js: string;
    utf8Bytes: string;
}

export type UnicodeCategory =
    | 'Control'
    | 'Format'
    | 'Punctuation'
    | 'Symbol'
    | 'Letter'
    | 'Number'
    | 'Mark'
    | 'Separator'
    | 'Other';

export const CATEGORY_META: Record<UnicodeCategory, { label: string; color: string }> = {
    Letter: {
        label: 'Letter',
        color: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
    },
    Number: {
        label: 'Number',
        color: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300',
    },
    Punctuation: {
        label: 'Punctuation',
        color: 'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300',
    },
    Symbol: {
        label: 'Symbol',
        color: 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300',
    },
    Mark: { label: 'Mark', color: 'bg-pink-100 text-pink-700 dark:bg-pink-900 dark:text-pink-300' },
    Separator: {
        label: 'Separator',
        color: 'bg-gray-100 text-gray-700 dark:bg-gray-900 dark:text-gray-300',
    },
    Control: {
        label: 'Control',
        color: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300',
    },
    Format: {
        label: 'Format',
        color: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300',
    },
    Other: { label: 'Other', color: 'bg-muted text-muted-foreground' },
};

const COMMON_CHARS: { cp: number; name: string; cat: UnicodeCategory; block: string }[] = [
    { cp: 0x0000, name: 'Null', cat: 'Control', block: 'Basic Latin' },
    { cp: 0x0009, name: 'Tab', cat: 'Control', block: 'Basic Latin' },
    { cp: 0x000a, name: 'Line Feed', cat: 'Control', block: 'Basic Latin' },
    { cp: 0x000d, name: 'Carriage Return', cat: 'Control', block: 'Basic Latin' },
    { cp: 0x001b, name: 'Escape', cat: 'Control', block: 'Basic Latin' },
    { cp: 0x0020, name: 'Space', cat: 'Separator', block: 'Basic Latin' },
    { cp: 0x0021, name: 'Exclamation Mark', cat: 'Punctuation', block: 'Basic Latin' },
    { cp: 0x0022, name: 'Quotation Mark', cat: 'Punctuation', block: 'Basic Latin' },
    { cp: 0x0023, name: 'Number Sign', cat: 'Punctuation', block: 'Basic Latin' },
    { cp: 0x0024, name: 'Dollar Sign', cat: 'Symbol', block: 'Basic Latin' },
    { cp: 0x0025, name: 'Percent Sign', cat: 'Symbol', block: 'Basic Latin' },
    { cp: 0x0026, name: 'Ampersand', cat: 'Punctuation', block: 'Basic Latin' },
    { cp: 0x0027, name: 'Apostrophe', cat: 'Punctuation', block: 'Basic Latin' },
    { cp: 0x0028, name: 'Left Parenthesis', cat: 'Punctuation', block: 'Basic Latin' },
    { cp: 0x0029, name: 'Right Parenthesis', cat: 'Punctuation', block: 'Basic Latin' },
    { cp: 0x002a, name: 'Asterisk', cat: 'Punctuation', block: 'Basic Latin' },
    { cp: 0x002b, name: 'Plus Sign', cat: 'Symbol', block: 'Basic Latin' },
    { cp: 0x002c, name: 'Comma', cat: 'Punctuation', block: 'Basic Latin' },
    { cp: 0x002d, name: 'Hyphen-Minus', cat: 'Punctuation', block: 'Basic Latin' },
    { cp: 0x002e, name: 'Full Stop', cat: 'Punctuation', block: 'Basic Latin' },
    { cp: 0x002f, name: 'Solidus', cat: 'Punctuation', block: 'Basic Latin' },
    { cp: 0x003a, name: 'Colon', cat: 'Punctuation', block: 'Basic Latin' },
    { cp: 0x003b, name: 'Semicolon', cat: 'Punctuation', block: 'Basic Latin' },
    { cp: 0x003c, name: 'Less-Than Sign', cat: 'Symbol', block: 'Basic Latin' },
    { cp: 0x003d, name: 'Equals Sign', cat: 'Symbol', block: 'Basic Latin' },
    { cp: 0x003e, name: 'Greater-Than Sign', cat: 'Symbol', block: 'Basic Latin' },
    { cp: 0x003f, name: 'Question Mark', cat: 'Punctuation', block: 'Basic Latin' },
    { cp: 0x0040, name: 'Commercial At', cat: 'Symbol', block: 'Basic Latin' },
    { cp: 0x005b, name: 'Left Square Bracket', cat: 'Punctuation', block: 'Basic Latin' },
    { cp: 0x005c, name: 'Reverse Solidus', cat: 'Punctuation', block: 'Basic Latin' },
    { cp: 0x005d, name: 'Right Square Bracket', cat: 'Punctuation', block: 'Basic Latin' },
    { cp: 0x005e, name: 'Circumflex Accent', cat: 'Symbol', block: 'Basic Latin' },
    { cp: 0x005f, name: 'Low Line', cat: 'Punctuation', block: 'Basic Latin' },
    { cp: 0x0060, name: 'Grave Accent', cat: 'Symbol', block: 'Basic Latin' },
    { cp: 0x007b, name: 'Left Curly Bracket', cat: 'Punctuation', block: 'Basic Latin' },
    { cp: 0x007c, name: 'Vertical Line', cat: 'Symbol', block: 'Basic Latin' },
    { cp: 0x007d, name: 'Right Curly Bracket', cat: 'Punctuation', block: 'Basic Latin' },
    { cp: 0x007e, name: 'Tilde', cat: 'Symbol', block: 'Basic Latin' },
    { cp: 0x00a0, name: 'No-Break Space', cat: 'Separator', block: 'Latin-1 Supplement' },
    {
        cp: 0x00a1,
        name: 'Inverted Exclamation Mark',
        cat: 'Punctuation',
        block: 'Latin-1 Supplement',
    },
    { cp: 0x00a2, name: 'Cent Sign', cat: 'Symbol', block: 'Latin-1 Supplement' },
    { cp: 0x00a3, name: 'Pound Sign', cat: 'Symbol', block: 'Latin-1 Supplement' },
    { cp: 0x00a5, name: 'Yen Sign', cat: 'Symbol', block: 'Latin-1 Supplement' },
    { cp: 0x00a9, name: 'Copyright Sign', cat: 'Symbol', block: 'Latin-1 Supplement' },
    { cp: 0x00ae, name: 'Registered Sign', cat: 'Symbol', block: 'Latin-1 Supplement' },
    { cp: 0x00b0, name: 'Degree Sign', cat: 'Symbol', block: 'Latin-1 Supplement' },
    { cp: 0x00b1, name: 'Plus-Minus Sign', cat: 'Symbol', block: 'Latin-1 Supplement' },
    { cp: 0x00b6, name: 'Pilcrow Sign', cat: 'Punctuation', block: 'Latin-1 Supplement' },
    { cp: 0x00d7, name: 'Multiplication Sign', cat: 'Symbol', block: 'Latin-1 Supplement' },
    { cp: 0x00f7, name: 'Division Sign', cat: 'Symbol', block: 'Latin-1 Supplement' },
    { cp: 0x2013, name: 'En Dash', cat: 'Punctuation', block: 'General Punctuation' },
    { cp: 0x2014, name: 'Em Dash', cat: 'Punctuation', block: 'General Punctuation' },
    {
        cp: 0x2018,
        name: 'Left Single Quotation Mark',
        cat: 'Punctuation',
        block: 'General Punctuation',
    },
    {
        cp: 0x2019,
        name: 'Right Single Quotation Mark',
        cat: 'Punctuation',
        block: 'General Punctuation',
    },
    {
        cp: 0x201c,
        name: 'Left Double Quotation Mark',
        cat: 'Punctuation',
        block: 'General Punctuation',
    },
    {
        cp: 0x201d,
        name: 'Right Double Quotation Mark',
        cat: 'Punctuation',
        block: 'General Punctuation',
    },
    { cp: 0x2026, name: 'Horizontal Ellipsis', cat: 'Punctuation', block: 'General Punctuation' },
    { cp: 0x2032, name: 'Prime', cat: 'Symbol', block: 'General Punctuation' },
    { cp: 0x2033, name: 'Double Prime', cat: 'Symbol', block: 'General Punctuation' },
    { cp: 0x20ac, name: 'Euro Sign', cat: 'Symbol', block: 'Currency Symbols' },
    { cp: 0x2122, name: 'Trade Mark Sign', cat: 'Symbol', block: 'Letterlike Symbols' },
    { cp: 0x2190, name: 'Leftwards Arrow', cat: 'Symbol', block: 'Arrows' },
    { cp: 0x2191, name: 'Upwards Arrow', cat: 'Symbol', block: 'Arrows' },
    { cp: 0x2192, name: 'Rightwards Arrow', cat: 'Symbol', block: 'Arrows' },
    { cp: 0x2193, name: 'Downwards Arrow', cat: 'Symbol', block: 'Arrows' },
    { cp: 0x21d2, name: 'Rightwards Double Arrow', cat: 'Symbol', block: 'Arrows' },
    { cp: 0x221e, name: 'Infinity', cat: 'Symbol', block: 'Mathematical Operators' },
    { cp: 0x2248, name: 'Almost Equal To', cat: 'Symbol', block: 'Mathematical Operators' },
    { cp: 0x2260, name: 'Not Equal To', cat: 'Symbol', block: 'Mathematical Operators' },
    { cp: 0x2264, name: 'Less-Than or Equal To', cat: 'Symbol', block: 'Mathematical Operators' },
    {
        cp: 0x2265,
        name: 'Greater-Than or Equal To',
        cat: 'Symbol',
        block: 'Mathematical Operators',
    },
    { cp: 0x2308, name: 'Left Ceiling', cat: 'Symbol', block: 'Miscellaneous Technical' },
    { cp: 0x2309, name: 'Right Ceiling', cat: 'Symbol', block: 'Miscellaneous Technical' },
    { cp: 0x230a, name: 'Left Floor', cat: 'Symbol', block: 'Miscellaneous Technical' },
    { cp: 0x230b, name: 'Right Floor', cat: 'Symbol', block: 'Miscellaneous Technical' },
    { cp: 0x25ca, name: 'Lozenge', cat: 'Symbol', block: 'Geometric Shapes' },
    { cp: 0x2605, name: 'Black Star', cat: 'Symbol', block: 'Miscellaneous Symbols' },
    { cp: 0x2606, name: 'White Star', cat: 'Symbol', block: 'Miscellaneous Symbols' },
    { cp: 0x2610, name: 'Ballot Box', cat: 'Symbol', block: 'Miscellaneous Symbols' },
    { cp: 0x2611, name: 'Ballot Box with Check', cat: 'Symbol', block: 'Miscellaneous Symbols' },
    { cp: 0x2612, name: 'Ballot Box with X', cat: 'Symbol', block: 'Miscellaneous Symbols' },
    { cp: 0x2660, name: 'Black Spade Suit', cat: 'Symbol', block: 'Miscellaneous Symbols' },
    { cp: 0x2663, name: 'Black Club Suit', cat: 'Symbol', block: 'Miscellaneous Symbols' },
    { cp: 0x2665, name: 'Black Heart Suit', cat: 'Symbol', block: 'Miscellaneous Symbols' },
    { cp: 0x2666, name: 'Black Diamond Suit', cat: 'Symbol', block: 'Miscellaneous Symbols' },
    { cp: 0x266a, name: 'Eighth Note', cat: 'Symbol', block: 'Miscellaneous Symbols' },
    { cp: 0x266b, name: 'Beamed Eighth Notes', cat: 'Symbol', block: 'Miscellaneous Symbols' },
    { cp: 0x2702, name: 'Black Scissors', cat: 'Symbol', block: 'Dingbats' },
    { cp: 0x2708, name: 'Airplane', cat: 'Symbol', block: 'Dingbats' },
    { cp: 0x270f, name: 'Pencil', cat: 'Symbol', block: 'Dingbats' },
    { cp: 0x2714, name: 'Heavy Check Mark', cat: 'Symbol', block: 'Dingbats' },
    { cp: 0x2716, name: 'Heavy Multiplication X', cat: 'Symbol', block: 'Dingbats' },
    { cp: 0x271d, name: 'Latin Cross', cat: 'Symbol', block: 'Dingbats' },
    { cp: 0x2764, name: 'Heavy Black Heart', cat: 'Symbol', block: 'Dingbats' },
    { cp: 0x27a4, name: 'Heavy Rightwards Arrow', cat: 'Symbol', block: 'Dingbats' },
    { cp: 0x00b2, name: 'Superscript Two', cat: 'Number', block: 'Latin-1 Supplement' },
    { cp: 0x00b3, name: 'Superscript Three', cat: 'Number', block: 'Latin-1 Supplement' },
    { cp: 0x00bc, name: 'Vulgar Fraction One Quarter', cat: 'Number', block: 'Latin-1 Supplement' },
    { cp: 0x00bd, name: 'Vulgar Fraction One Half', cat: 'Number', block: 'Latin-1 Supplement' },
    {
        cp: 0x00be,
        name: 'Vulgar Fraction Three Quarters',
        cat: 'Number',
        block: 'Latin-1 Supplement',
    },
    { cp: 0x200b, name: 'Zero Width Space', cat: 'Format', block: 'General Punctuation' },
    { cp: 0x200c, name: 'Zero Width Non-Joiner', cat: 'Format', block: 'General Punctuation' },
    { cp: 0x200d, name: 'Zero Width Joiner', cat: 'Format', block: 'General Punctuation' },
    { cp: 0x200e, name: 'Left-To-Right Mark', cat: 'Format', block: 'General Punctuation' },
    { cp: 0x200f, name: 'Right-To-Left Mark', cat: 'Format', block: 'General Punctuation' },
    { cp: 0x2028, name: 'Line Separator', cat: 'Separator', block: 'General Punctuation' },
    { cp: 0x2029, name: 'Paragraph Separator', cat: 'Separator', block: 'General Punctuation' },
    { cp: 0x202a, name: 'Left-To-Right Embedding', cat: 'Format', block: 'General Punctuation' },
    { cp: 0x202b, name: 'Right-To-Left Embedding', cat: 'Format', block: 'General Punctuation' },
    { cp: 0x202c, name: 'Pop Directional Formatting', cat: 'Format', block: 'General Punctuation' },
    { cp: 0x202e, name: 'Right-To-Left Override', cat: 'Format', block: 'General Punctuation' },
    { cp: 0xfeff, name: 'Byte Order Mark', cat: 'Format', block: 'Arabic Presentation Forms-B' },
    { cp: 0xfffd, name: 'Replacement Character', cat: 'Other', block: 'Specials' },
    { cp: 0x0391, name: 'Greek Capital Letter Alpha', cat: 'Letter', block: 'Greek and Coptic' },
    { cp: 0x0392, name: 'Greek Capital Letter Beta', cat: 'Letter', block: 'Greek and Coptic' },
    { cp: 0x0393, name: 'Greek Capital Letter Gamma', cat: 'Letter', block: 'Greek and Coptic' },
    { cp: 0x03a9, name: 'Greek Capital Letter Omega', cat: 'Letter', block: 'Greek and Coptic' },
    { cp: 0x03b1, name: 'Greek Small Letter Alpha', cat: 'Letter', block: 'Greek and Coptic' },
    { cp: 0x03b2, name: 'Greek Small Letter Beta', cat: 'Letter', block: 'Greek and Coptic' },
    { cp: 0x03b3, name: 'Greek Small Letter Gamma', cat: 'Letter', block: 'Greek and Coptic' },
    { cp: 0x03c0, name: 'Greek Small Letter Pi', cat: 'Letter', block: 'Greek and Coptic' },
    { cp: 0x03c9, name: 'Greek Small Letter Omega', cat: 'Letter', block: 'Greek and Coptic' },
    { cp: 0x2200, name: 'For All', cat: 'Symbol', block: 'Mathematical Operators' },
    { cp: 0x2202, name: 'Partial Differential', cat: 'Symbol', block: 'Mathematical Operators' },
    { cp: 0x2203, name: 'There Exists', cat: 'Symbol', block: 'Mathematical Operators' },
    { cp: 0x2205, name: 'Empty Set', cat: 'Symbol', block: 'Mathematical Operators' },
    { cp: 0x2207, name: 'Nabla', cat: 'Symbol', block: 'Mathematical Operators' },
    { cp: 0x2208, name: 'Element Of', cat: 'Symbol', block: 'Mathematical Operators' },
    { cp: 0x2209, name: 'Not An Element Of', cat: 'Symbol', block: 'Mathematical Operators' },
    { cp: 0x2211, name: 'N-Ary Summation', cat: 'Symbol', block: 'Mathematical Operators' },
    { cp: 0x2212, name: 'Minus Sign', cat: 'Symbol', block: 'Mathematical Operators' },
    { cp: 0x221a, name: 'Square Root', cat: 'Symbol', block: 'Mathematical Operators' },
    { cp: 0x222b, name: 'Integral', cat: 'Symbol', block: 'Mathematical Operators' },
    { cp: 0x2282, name: 'Subset Of', cat: 'Symbol', block: 'Mathematical Operators' },
    { cp: 0x2283, name: 'Superset Of', cat: 'Symbol', block: 'Mathematical Operators' },
    { cp: 0x22a5, name: 'Up Tack', cat: 'Symbol', block: 'Mathematical Operators' },
    {
        cp: 0x27e8,
        name: 'Mathematical Left Angle Bracket',
        cat: 'Symbol',
        block: 'Miscellaneous Mathematical Symbols-A',
    },
    {
        cp: 0x27e9,
        name: 'Mathematical Right Angle Bracket',
        cat: 'Symbol',
        block: 'Miscellaneous Mathematical Symbols-A',
    },
];

function toUtf8Hex(codepoint: number): string {
    const bytes: number[] = [];
    if (codepoint <= 0x7f) {
        bytes.push(codepoint);
    } else if (codepoint <= 0x7ff) {
        bytes.push(0xc0 | (codepoint >> 6));
        bytes.push(0x80 | (codepoint & 0x3f));
    } else if (codepoint <= 0xffff) {
        bytes.push(0xe0 | (codepoint >> 12));
        bytes.push(0x80 | ((codepoint >> 6) & 0x3f));
        bytes.push(0x80 | (codepoint & 0x3f));
    } else {
        bytes.push(0xf0 | (codepoint >> 18));
        bytes.push(0x80 | ((codepoint >> 12) & 0x3f));
        bytes.push(0x80 | ((codepoint >> 6) & 0x3f));
        bytes.push(0x80 | (codepoint & 0x3f));
    }
    return bytes.map((b) => b.toString(16).toUpperCase().padStart(2, '0')).join(' ');
}

function buildEntry(data: {
    cp: number;
    name: string;
    cat: UnicodeCategory;
    block: string;
}): UnicodeEntry {
    const cp = data.cp;
    const hex = cp.toString(16).toUpperCase().padStart(4, '0');
    const jsHex = cp.toString(16).toUpperCase();
    return {
        char: cp <= 0xffff ? String.fromCodePoint(cp) : String.fromCodePoint(cp),
        codepoint: cp,
        name: data.name,
        category: data.cat,
        block: data.block,
        htmlDecimal: `&#${cp};`,
        htmlHex: `&#x${hex};`,
        css: cp <= 0xffff ? `\\${hex}` : `\\${hex}`,
        js: cp > 0xffff ? `\\u{${jsHex}}` : `\\u${jsHex.padStart(4, '0')}`,
        utf8Bytes: toUtf8Hex(cp),
    };
}

let cachedEntries: UnicodeEntry[] | null = null;

export function getAllEntries(): UnicodeEntry[] {
    if (cachedEntries) return cachedEntries;
    cachedEntries = COMMON_CHARS.map(buildEntry);
    return cachedEntries;
}

export function searchUnicode(query: string): UnicodeEntry[] {
    const q = query.trim().toLowerCase();
    if (!q) return getAllEntries();

    const entries = getAllEntries();

    const codepointMatch = q.match(/^(?:u\+|0x|&#x?|\\u\{?)([0-9a-f]+)\}?;?$/i);
    if (codepointMatch) {
        const cp = parseInt(codepointMatch[1], 16);
        const found = entries.find((e) => e.codepoint === cp);
        if (found) return [found];
        if (!isNaN(cp) && cp >= 0 && cp <= 0x10ffff) {
            return [
                buildEntry({
                    cp,
                    name: `Unicode Character U+${cp.toString(16).toUpperCase().padStart(4, '0')}`,
                    cat: 'Other',
                    block: 'Unknown',
                }),
            ];
        }
    }

    const decimalMatch = q.match(/^&#([0-9]+);?$/);
    if (decimalMatch) {
        const cp = parseInt(decimalMatch[1], 10);
        const found = entries.find((e) => e.codepoint === cp);
        if (found) return [found];
        if (!isNaN(cp) && cp >= 0 && cp <= 0x10ffff) {
            return [
                buildEntry({
                    cp,
                    name: `Unicode Character U+${cp.toString(16).toUpperCase().padStart(4, '0')}`,
                    cat: 'Other',
                    block: 'Unknown',
                }),
            ];
        }
    }

    const results: UnicodeEntry[] = [];
    for (const entry of entries) {
        if (entry.name.toLowerCase().includes(q)) {
            results.push(entry);
            continue;
        }
        if (entry.char === q) {
            results.push(entry);
            continue;
        }
        const hex = entry.codepoint.toString(16).toLowerCase();
        if (hex.includes(q) || `u+${hex}`.includes(q)) {
            results.push(entry);
            continue;
        }
        if (entry.block.toLowerCase().includes(q)) {
            results.push(entry);
            continue;
        }
    }

    if (q.length === 1 && !results.length) {
        const cp = q.codePointAt(0)!;
        if (cp >= 0x20) {
            results.push(
                buildEntry({
                    cp,
                    name: `Unicode Character U+${cp.toString(16).toUpperCase().padStart(4, '0')}`,
                    cat: 'Other',
                    block: 'Unknown',
                }),
            );
        }
    }

    return results;
}

export const ALL_CATEGORIES: (UnicodeCategory | 'all')[] = [
    'all',
    'Symbol',
    'Punctuation',
    'Letter',
    'Number',
    'Control',
    'Format',
    'Separator',
    'Mark',
    'Other',
];
