export type AsciiCategory = 'control' | 'printable' | 'extended';

export const CATEGORY_META: Record<AsciiCategory, { label: string; color: string }> = {
    control: {
        label: 'Control',
        color: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300',
    },
    printable: {
        label: 'Printable',
        color: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300',
    },
    extended: {
        label: 'Extended',
        color: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
    },
};

export const ALL_CATEGORIES: (AsciiCategory | 'all')[] = [
    'all',
    'control',
    'printable',
    'extended',
];

export interface AsciiEntry {
    decimal: number;
    hex: string;
    binary: string;
    char: string;
    name: string;
    category: AsciiCategory;
    description: string;
    escapeSequence: string;
    htmlEntity: string;
}

const CONTROL_NAMES: Record<number, { name: string; description: string; escape: string }> = {
    0: { name: 'NUL', description: 'Null', escape: '\\0' },
    1: { name: 'SOH', description: 'Start of Heading', escape: '' },
    2: { name: 'STX', description: 'Start of Text', escape: '' },
    3: { name: 'ETX', description: 'End of Text', escape: '' },
    4: { name: 'EOT', description: 'End of Transmission', escape: '' },
    5: { name: 'ENQ', description: 'Enquiry', escape: '' },
    6: { name: 'ACK', description: 'Acknowledge', escape: '' },
    7: { name: 'BEL', description: 'Bell', escape: '\\a' },
    8: { name: 'BS', description: 'Backspace', escape: '\\b' },
    9: { name: 'HT', description: 'Horizontal Tab', escape: '\\t' },
    10: { name: 'LF', description: 'Line Feed', escape: '\\n' },
    11: { name: 'VT', description: 'Vertical Tab', escape: '\\v' },
    12: { name: 'FF', description: 'Form Feed', escape: '\\f' },
    13: { name: 'CR', description: 'Carriage Return', escape: '\\r' },
    14: { name: 'SO', description: 'Shift Out', escape: '' },
    15: { name: 'SI', description: 'Shift In', escape: '' },
    16: { name: 'DLE', description: 'Data Link Escape', escape: '' },
    17: { name: 'DC1', description: 'Device Control 1 (XON)', escape: '' },
    18: { name: 'DC2', description: 'Device Control 2', escape: '' },
    19: { name: 'DC3', description: 'Device Control 3 (XOFF)', escape: '' },
    20: { name: 'DC4', description: 'Device Control 4', escape: '' },
    21: { name: 'NAK', description: 'Negative Acknowledge', escape: '' },
    22: { name: 'SYN', description: 'Synchronous Idle', escape: '' },
    23: { name: 'ETB', description: 'End of Trans. Block', escape: '' },
    24: { name: 'CAN', description: 'Cancel', escape: '' },
    25: { name: 'EM', description: 'End of Medium', escape: '' },
    26: { name: 'SUB', description: 'Substitute', escape: '' },
    27: { name: 'ESC', description: 'Escape', escape: '\\e' },
    28: { name: 'FS', description: 'File Separator', escape: '' },
    29: { name: 'GS', description: 'Group Separator', escape: '' },
    30: { name: 'RS', description: 'Record Separator', escape: '' },
    31: { name: 'US', description: 'Unit Separator', escape: '' },
    127: { name: 'DEL', description: 'Delete', escape: '' },
};

function getPrintableName(code: number): string {
    const printableNames: Record<number, string> = {
        32: 'Space',
        33: 'Exclamation mark',
        34: 'Double quote',
        35: 'Number sign',
        36: 'Dollar sign',
        37: 'Percent',
        38: 'Ampersand',
        39: 'Single quote',
        40: 'Left parenthesis',
        41: 'Right parenthesis',
        42: 'Asterisk',
        43: 'Plus',
        44: 'Comma',
        45: 'Hyphen-minus',
        46: 'Period',
        47: 'Slash',
        58: 'Colon',
        59: 'Semicolon',
        60: 'Less-than',
        61: 'Equals',
        62: 'Greater-than',
        63: 'Question mark',
        64: 'At sign',
        91: 'Left bracket',
        92: 'Backslash',
        93: 'Right bracket',
        94: 'Caret',
        95: 'Underscore',
        96: 'Grave accent',
        123: 'Left brace',
        124: 'Vertical bar',
        125: 'Right brace',
        126: 'Tilde',
    };
    if (printableNames[code]) return printableNames[code];
    if (code >= 48 && code <= 57) return `Digit ${String.fromCharCode(code)}`;
    if (code >= 65 && code <= 90) return `Uppercase ${String.fromCharCode(code)}`;
    if (code >= 97 && code <= 122) return `Lowercase ${String.fromCharCode(code)}`;
    return String.fromCharCode(code);
}

let cachedEntries: AsciiEntry[] | null = null;

export function getAllEntries(): AsciiEntry[] {
    if (cachedEntries) return cachedEntries;

    const entries: AsciiEntry[] = [];

    for (let i = 0; i <= 255; i++) {
        const hex = i.toString(16).toUpperCase().padStart(2, '0');
        const binary = i.toString(2).padStart(8, '0');
        const category: AsciiCategory =
            i <= 31 || i === 127 ? 'control' : i <= 126 ? 'printable' : 'extended';

        let name: string;
        let description: string;
        let escapeSequence: string;
        let displayChar: string;

        if (category === 'control') {
            const ctrl = CONTROL_NAMES[i];
            name = ctrl.name;
            description = ctrl.description;
            escapeSequence = ctrl.escape;
            displayChar = '';
        } else if (category === 'extended') {
            name = `Extended ${hex}`;
            description = `Extended ASCII ${hex}`;
            escapeSequence = '';
            displayChar = String.fromCharCode(i);
        } else {
            name = getPrintableName(i);
            description = name;
            escapeSequence = '';
            displayChar = String.fromCharCode(i);
        }

        const htmlEntity =
            i < 32 || i === 127
                ? ''
                : i === 34
                  ? '&quot;'
                  : i === 38
                    ? '&amp;'
                    : i === 60
                      ? '&lt;'
                      : i === 62
                        ? '&gt;'
                        : `&#${i};`;

        entries.push({
            decimal: i,
            hex,
            binary,
            char: displayChar,
            name,
            category,
            description,
            escapeSequence,
            htmlEntity,
        });
    }

    cachedEntries = entries;
    return cachedEntries;
}

export function searchAscii(query: string): AsciiEntry[] {
    const q = query.trim().toLowerCase();
    if (!q) return getAllEntries();

    const entries = getAllEntries();

    const decMatch = q.match(/^(\d{1,3})$/);
    if (decMatch) {
        const dec = parseInt(decMatch[1], 10);
        if (dec >= 0 && dec <= 255) {
            return entries.filter((e) => e.decimal === dec);
        }
    }

    const hexMatch = q.match(/^(?:0x|\\x)([0-9a-f]{1,2})$/i);
    if (hexMatch) {
        const dec = parseInt(hexMatch[1], 16);
        if (dec >= 0 && dec <= 255) {
            return entries.filter((e) => e.decimal === dec);
        }
    }

    return entries.filter((entry) => {
        if (entry.name.toLowerCase().includes(q)) return true;
        if (entry.description.toLowerCase().includes(q)) return true;
        if (entry.char === q) return true;
        if (entry.decimal.toString() === q) return true;
        if (entry.hex.toLowerCase() === q) return true;
        if (entry.binary === q) return true;
        if (entry.category.includes(q)) return true;
        return false;
    });
}
