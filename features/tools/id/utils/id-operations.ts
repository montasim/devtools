export type UuidVersion = 'v1' | 'v4' | 'v7';

export interface UuidVersionOption {
    value: UuidVersion;
    label: string;
    description: string;
}

export const UUID_VERSIONS: UuidVersionOption[] = [
    { value: 'v4', label: 'UUID v4', description: 'Random (most common)' },
    { value: 'v7', label: 'UUID v7', description: 'Time-ordered (Unix ms)' },
    { value: 'v1', label: 'UUID v1', description: 'Time-based (MAC/node)' },
];

export const UUID_QUANTITY_OPTIONS = [1, 5, 10, 25, 50] as const;
export type UuidQuantity = (typeof UUID_QUANTITY_OPTIONS)[number];

function randomHex(bytes: number): string {
    const array = new Uint8Array(bytes);
    crypto.getRandomValues(array);
    return Array.from(array)
        .map((b) => b.toString(16).padStart(2, '0'))
        .join('');
}

function formatUuid(hex: string): string {
    return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20, 32)}`;
}

export function generateUuidV4(): string {
    const hex = randomHex(16);
    const bytes = hex.split('');
    bytes[12] = '4';
    const variant = parseInt(bytes[16], 16);
    bytes[16] = ((variant & 0x3) | 0x8).toString(16);
    return formatUuid(bytes.join(''));
}

export function generateUuidV1(): string {
    const now = Date.now();
    const gregorianOffset = 12219292800000;
    const timestamp100ns = (now + gregorianOffset) * 10000;
    const timeHex = timestamp100ns.toString(16).padStart(16, '0').slice(-16);

    const clockSeq = randomHex(2);
    const clockSeqInt = parseInt(clockSeq, 16) & 0x3fff;
    const clockHex = (clockSeqInt | 0x8000).toString(16).padStart(4, '0');

    const node = randomHex(6);
    const nodeBytes = node.split('');
    nodeBytes[0] = (parseInt(nodeBytes[0], 16) | 0x1).toString(16);

    const hex = timeHex + clockHex + nodeBytes.join('');
    const bytes = hex.split('');
    bytes[12] = '1';

    return formatUuid(bytes.join(''));
}

export function generateUuidV7(): string {
    const timestamp = Date.now();
    const timeHex = timestamp.toString(16).padStart(12, '0');

    const randA = randomHex(2);
    const randAInt = parseInt(randA, 16) & 0x0fff;

    const randB = randomHex(8);
    const randBInt = parseInt(randB, 16);
    const randBMasked = (randBInt & 0x3fffffffffffffff) | 0x8000000000000000;

    const hex =
        timeHex +
        randAInt.toString(16).padStart(4, '0') +
        randBMasked.toString(16).padStart(16, '0');

    const bytes = hex.split('');
    bytes[12] = '7';

    return formatUuid(bytes.join(''));
}

export function generateUuid(version: UuidVersion): string {
    switch (version) {
        case 'v1':
            return generateUuidV1();
        case 'v4':
            return generateUuidV4();
        case 'v7':
            return generateUuidV7();
    }
}

export function generateUuids(version: UuidVersion, count: number): string[] {
    return Array.from({ length: count }, () => generateUuid(version));
}

export interface ValidationResult {
    valid: boolean;
    version: string | null;
    variant: string | null;
    format: 'uppercase' | 'lowercase' | 'mixed' | null;
}

const UUID_REGEX =
    /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-([0-9a-fA-F]{4})-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;

export function validateUuid(uuid: string): ValidationResult {
    const trimmed = uuid.trim();
    const match = trimmed.match(UUID_REGEX);

    if (!match) {
        return { valid: false, version: null, variant: null, format: null };
    }

    const versionNibble = match[1][0];
    const versionMap: Record<string, string> = {
        '1': 'v1 (time-based)',
        '2': 'v2 (DCE security)',
        '3': 'v3 (MD5 name-based)',
        '4': 'v4 (random)',
        '5': 'v5 (SHA-1 name-based)',
        '6': 'v6 (reordered time)',
        '7': 'v7 (Unix epoch time)',
        '8': 'v8 (custom)',
    };

    const variantChar = parseInt(trimmed[19], 16);
    let variant: string;
    if ((variantChar & 0x8) === 0) {
        variant = 'NCS backward compatible';
    } else if ((variantChar & 0xc) === 0x8) {
        variant = 'RFC 4122';
    } else if ((variantChar & 0xe) === 0xc) {
        variant = 'Microsoft Corporation';
    } else {
        variant = 'Reserved';
    }

    const isUpper = trimmed === trimmed.toUpperCase();
    const isLower = trimmed === trimmed.toLowerCase();
    const format = isUpper ? 'uppercase' : isLower ? 'lowercase' : 'mixed';

    return {
        valid: true,
        version: versionMap[versionNibble] ?? `Unknown (${versionNibble})`,
        variant,
        format,
    };
}

const CROCKFORD_BASE32 = '0123456789ABCDEFGHJKMNPQRSTVWXYZ';

function encodeCrockfordBase32(buffer: Uint8Array): string {
    let bits = 0;
    let value = 0;
    let result = '';

    for (const byte of buffer) {
        value = (value << 8) | byte;
        bits += 8;

        while (bits >= 5) {
            bits -= 5;
            result += CROCKFORD_BASE32[(value >>> bits) & 0x1f];
        }
    }

    if (bits > 0) {
        result += CROCKFORD_BASE32[(value << (5 - bits)) & 0x1f];
    }

    return result;
}

export function generateUlid(): string {
    const timestamp = Date.now();
    const timeBuffer = new Uint8Array(6);
    const dv = new DataView(timeBuffer.buffer);
    dv.setUint32(0, Math.floor(timestamp / 0x10000));
    dv.setUint16(4, timestamp & 0xffff);

    const randomBuffer = new Uint8Array(10);
    crypto.getRandomValues(randomBuffer);

    const combined = new Uint8Array(16);
    combined.set(timeBuffer, 0);
    combined.set(randomBuffer, 6);

    return encodeCrockfordBase32(combined);
}

export function generateUlids(count: number): string[] {
    const result: string[] = [];
    for (let i = 0; i < count; i++) {
        result.push(generateUlid());
    }
    return result;
}

export function validateUlid(ulid: string): boolean {
    const trimmed = ulid.trim().toUpperCase();
    if (trimmed.length !== 26) return false;
    return /^[0-9A-HJKMNP-TV-Z]{26}$/.test(trimmed);
}

const NANO_DEFAULT_ALPHABET = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
const NANO_DEFAULT_SIZE = 21;

export interface NanoidConfig {
    size: number;
    alphabet: string;
}

export const NANO_SIZE_OPTIONS = [8, 10, 16, 21, 32, 48] as const;
export type NanoidSize = (typeof NANO_SIZE_OPTIONS)[number];

export const NANO_ALPHABET_PRESETS: { value: string; label: string; alphabet: string }[] = [
    { value: 'default', label: 'Alphanumeric (default)', alphabet: NANO_DEFAULT_ALPHABET },
    {
        value: 'lowercase',
        label: 'Lowercase + Digits',
        alphabet: '0123456789abcdefghijklmnopqrstuvwxyz',
    },
    {
        value: 'uppercase',
        label: 'Uppercase + Digits',
        alphabet: '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ',
    },
    { value: 'numbers', label: 'Numbers Only', alphabet: '0123456789' },
    {
        value: 'nolookalikes',
        label: 'No Look-alikes',
        alphabet: '0123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz',
    },
    { value: 'hex', label: 'Hexadecimal', alphabet: '0123456789abcdef' },
];

export function generateNanoid(
    size: number = NANO_DEFAULT_SIZE,
    alphabet: string = NANO_DEFAULT_ALPHABET,
): string {
    const mask = (2 << (Math.log(alphabet.length - 1) / Math.LN2)) - 1;
    const step = Math.ceil((1.6 * mask * size) / alphabet.length);
    let id = '';
    while (id.length < size) {
        const bytes = new Uint8Array(step);
        crypto.getRandomValues(bytes);
        for (const byte of bytes) {
            const idx = byte & mask;
            if (idx < alphabet.length) {
                id += alphabet[idx];
                if (id.length >= size) break;
            }
        }
    }
    return id;
}

export function generateNanoids(size: number, alphabet: string, count: number): string[] {
    return Array.from({ length: count }, () => generateNanoid(size, alphabet));
}

export function validateNanoid(
    id: string,
    alphabet: string = NANO_DEFAULT_ALPHABET,
    size: number = NANO_DEFAULT_SIZE,
): { valid: boolean; reason?: string } {
    const trimmed = id.trim();
    if (trimmed.length === 0) return { valid: false, reason: 'Empty input' };
    if (trimmed.length !== size)
        return { valid: false, reason: `Expected length ${size}, got ${trimmed.length}` };
    for (const ch of trimmed) {
        if (!alphabet.includes(ch))
            return { valid: false, reason: `Character "${ch}" not in allowed alphabet` };
    }
    return { valid: true };
}
