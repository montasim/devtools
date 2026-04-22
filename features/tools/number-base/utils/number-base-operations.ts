export const STANDARD_BASES = [
    { id: 'bin', label: 'Binary', radix: 2, prefix: '0b', groupSize: 4 },
    { id: 'oct', label: 'Octal', radix: 8, prefix: '0o', groupSize: 3 },
    { id: 'dec', label: 'Decimal', radix: 10, prefix: '', groupSize: 3 },
    { id: 'hex', label: 'Hex', radix: 16, prefix: '0x', groupSize: 4 },
] as const;

export type BaseId = (typeof STANDARD_BASES)[number]['id'];

export interface ConversionResult {
    value: string;
    radix: number;
    prefix: string;
    groupSize: number;
    label: string;
    isValid: boolean;
}

export interface NumberBaseState {
    inputValue: string;
    inputRadix: number;
    isSigned: boolean;
    bitWidth: 8 | 16 | 32 | 64;
}

export const DEFAULT_STATE: NumberBaseState = {
    inputValue: '',
    inputRadix: 10,
    isSigned: false,
    bitWidth: 32,
};

export const BIT_WIDTHS: (8 | 16 | 32 | 64)[] = [8, 16, 32, 64];

const DIGITS = '0123456789abcdefghijklmnopqrstuvwxyz';
const ZERO = BigInt(0);
const ONE = BigInt(1);

export function isValidForRadix(value: string, radix: number): boolean {
    if (!value || value.length === 0) return false;
    const cleaned = value.replace(/^0[box]/i, '').replace(/_/g, '');
    if (cleaned.length === 0) return false;
    const validChars = DIGITS.slice(0, radix);
    return [...cleaned].every((ch) => validChars.includes(ch.toLowerCase()));
}

function stripPrefix(value: string): string {
    return value.replace(/^0[box]/i, '').replace(/_/g, '');
}

function parseBigIntRadix(str: string, radix: number): bigint {
    let result = ZERO;
    const base = BigInt(radix);
    for (const ch of str) {
        const digit = BigInt(DIGITS.indexOf(ch.toLowerCase()));
        result = result * base + digit;
    }
    return result;
}

function parseToBigInt(value: string, radix: number): bigint | null {
    const cleaned = stripPrefix(value);
    if (cleaned.length === 0) return null;
    try {
        return parseBigIntRadix(cleaned, radix);
    } catch {
        return null;
    }
}

function bigIntToBase(value: bigint, radix: number): string {
    if (value === ZERO) return '0';
    let result = '';
    const base = BigInt(radix);
    let v = value;
    while (v > ZERO) {
        result = DIGITS[Number(v % base)] + result;
        v = v / base;
    }
    return result;
}

function groupDigits(value: string, groupSize: number): string {
    if (groupSize <= 0) return value;
    const chars = [...value];
    const groups: string[] = [];
    for (let i = chars.length; i > 0; i -= groupSize) {
        const start = Math.max(0, i - groupSize);
        groups.unshift(chars.slice(start, i).join(''));
    }
    return groups.join(' ');
}

function toSignedValue(unsigned: bigint, bitWidth: number): bigint {
    const max = (ONE << BigInt(bitWidth)) - ONE;
    const masked = unsigned & max;
    const signBit = ONE << BigInt(bitWidth - 1);
    if (masked & signBit) {
        return masked - (ONE << BigInt(bitWidth));
    }
    return masked;
}

export function convertAll(state: NumberBaseState): ConversionResult[] {
    const { inputValue, inputRadix, isSigned, bitWidth } = state;

    if (!inputValue || !isValidForRadix(inputValue, inputRadix)) {
        return STANDARD_BASES.map((b) => ({
            value: '',
            radix: b.radix,
            prefix: b.prefix,
            groupSize: b.groupSize,
            label: b.label,
            isValid: false,
        }));
    }

    let parsed = parseToBigInt(inputValue, inputRadix);
    if (parsed === null) {
        return STANDARD_BASES.map((b) => ({
            value: '',
            radix: b.radix,
            prefix: b.prefix,
            groupSize: b.groupSize,
            label: b.label,
            isValid: false,
        }));
    }

    if (isSigned && parsed < ZERO) {
        parsed = (ONE << BigInt(bitWidth)) + parsed;
    }

    const maxVal = (ONE << BigInt(bitWidth)) - ONE;
    if (parsed > maxVal) {
        parsed = parsed & maxVal;
    }

    return STANDARD_BASES.map((base) => {
        let displayValue: bigint;
        if (isSigned && base.radix !== 10) {
            displayValue = parsed & ((ONE << BigInt(bitWidth)) - ONE);
        } else if (isSigned && base.radix === 10) {
            displayValue = toSignedValue(parsed, bitWidth);
        } else {
            displayValue = parsed;
        }

        const raw = bigIntToBase(displayValue < ZERO ? -displayValue : displayValue, base.radix);
        const formatted =
            base.radix === 10
                ? (displayValue < ZERO ? '-' : '') + groupDigits(raw, base.groupSize)
                : groupDigits(raw.toUpperCase(), base.groupSize);

        return {
            value: formatted,
            radix: base.radix,
            prefix: base.prefix,
            groupSize: base.groupSize,
            label: base.label,
            isValid: true,
        };
    });
}

export function convertCustomRadix(state: NumberBaseState, radix: number): ConversionResult {
    const { inputValue, inputRadix, isSigned, bitWidth } = state;

    if (radix < 2 || radix > 36) {
        return {
            value: '',
            radix,
            prefix: '',
            groupSize: 0,
            label: `Base ${radix}`,
            isValid: false,
        };
    }

    if (!inputValue || !isValidForRadix(inputValue, inputRadix)) {
        return {
            value: '',
            radix,
            prefix: '',
            groupSize: 0,
            label: `Base ${radix}`,
            isValid: false,
        };
    }

    let parsed = parseToBigInt(inputValue, inputRadix);
    if (parsed === null) {
        return {
            value: '',
            radix,
            prefix: '',
            groupSize: 0,
            label: `Base ${radix}`,
            isValid: false,
        };
    }

    if (isSigned && parsed < ZERO) {
        parsed = (ONE << BigInt(bitWidth)) + parsed;
    }

    const maxVal = (ONE << BigInt(bitWidth)) - ONE;
    if (parsed > maxVal) {
        parsed = parsed & maxVal;
    }

    let displayValue = parsed;
    if (isSigned) {
        displayValue = toSignedValue(parsed, bitWidth);
    }

    const raw = bigIntToBase(displayValue < ZERO ? -displayValue : displayValue, radix);
    const formatted =
        displayValue < ZERO
            ? '-' + groupDigits(raw.toUpperCase(), 4)
            : groupDigits(raw.toUpperCase(), 4);

    return {
        value: formatted,
        radix,
        prefix: '',
        groupSize: 4,
        label: `Base ${radix}`,
        isValid: true,
    };
}

export function getAsciiRepresentation(state: NumberBaseState): string {
    const { inputValue, inputRadix } = state;
    if (!inputValue || !isValidForRadix(inputValue, inputRadix)) return '';

    const parsed = parseToBigInt(inputValue, inputRadix);
    if (parsed === null || parsed < ZERO || parsed > BigInt(127)) return '';

    return String.fromCharCode(Number(parsed));
}

export function getBitRepresentation(state: NumberBaseState): string {
    const { inputValue, inputRadix, bitWidth } = state;
    if (!inputValue || !isValidForRadix(inputValue, inputRadix)) return '';

    let parsed = parseToBigInt(inputValue, inputRadix);
    if (parsed === null) return '';

    const maxVal = (ONE << BigInt(bitWidth)) - ONE;
    if (parsed > maxVal) parsed = parsed & maxVal;
    if (parsed < ZERO) return '';

    let bits = '';
    for (let i = BigInt(bitWidth) - ONE; i >= ZERO; i -= ONE) {
        bits += (parsed >> i) & ONE ? '1' : '0';
        if (i > ZERO && i % BigInt(4) === ZERO) bits += ' ';
    }
    return bits;
}
