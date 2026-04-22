export interface CharsetOption {
    id: string;
    label: string;
    chars: string;
    defaultEnabled: boolean;
}

export const CHARSETS: CharsetOption[] = [
    {
        id: 'uppercase',
        label: 'Uppercase (A-Z)',
        chars: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
        defaultEnabled: true,
    },
    {
        id: 'lowercase',
        label: 'Lowercase (a-z)',
        chars: 'abcdefghijklmnopqrstuvwxyz',
        defaultEnabled: true,
    },
    { id: 'numbers', label: 'Numbers (0-9)', chars: '0123456789', defaultEnabled: true },
    {
        id: 'symbols',
        label: 'Symbols (!@#$...)',
        chars: '!@#$%^&*()_+-=[]{}|;:,.<>?/~`',
        defaultEnabled: false,
    },
];

export interface PasswordConfig {
    length: number;
    charsets: Record<string, boolean>;
}

export const DEFAULT_CONFIG: PasswordConfig = {
    length: 16,
    charsets: Object.fromEntries(CHARSETS.map((c) => [c.id, c.defaultEnabled])),
};

export function generatePassword(config: PasswordConfig): string {
    const activeCharsets = CHARSETS.filter((c) => config.charsets[c.id]);
    if (activeCharsets.length === 0) return '';

    const pool = activeCharsets.map((c) => c.chars);
    const allChars = pool.join('');

    const array = new Uint32Array(config.length);
    crypto.getRandomValues(array);

    const chars: string[] = [];
    for (let i = 0; i < config.length; i++) {
        if (i < pool.length) {
            chars.push(pool[i][array[i] % pool[i].length]);
        } else {
            chars.push(allChars[array[i] % allChars.length]);
        }
    }

    for (let i = chars.length - 1; i > 0; i--) {
        const j = array[i % array.length] % (i + 1);
        [chars[i], chars[j]] = [chars[j], chars[i]];
    }

    return chars.join('');
}

export function generatePasswords(config: PasswordConfig, count: number): string[] {
    return Array.from({ length: count }, () => generatePassword(config));
}

export interface StrengthResult {
    score: number;
    label: string;
    color: string;
}

const STRENGTH_LEVELS: { min: number; label: string; color: string }[] = [
    { min: 0, label: 'Very Weak', color: 'bg-red-500' },
    { min: 1, label: 'Weak', color: 'bg-orange-500' },
    { min: 2, label: 'Fair', color: 'bg-yellow-500' },
    { min: 3, label: 'Strong', color: 'bg-lime-500' },
    { min: 4, label: 'Very Strong', color: 'bg-green-500' },
];

export function evaluateStrength(password: string): StrengthResult {
    if (!password) return { score: 0, label: 'None', color: 'bg-muted' };

    let score = 0;
    const len = password.length;

    if (len >= 8) score++;
    if (len >= 12) score++;
    if (len >= 16) score++;
    if (len >= 24) score++;

    if (/[a-z]/.test(password)) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^a-zA-Z0-9]/.test(password)) score++;

    const uniqueChars = new Set(password).size;
    if (uniqueChars >= len * 0.7) score++;

    const normalized = Math.min(4, Math.floor((score / 9) * 5));
    const level = STRENGTH_LEVELS[normalized];

    return { score: normalized, label: level.label, color: level.color };
}

export function calculateEntropy(password: string): number {
    if (!password) return 0;
    let poolSize = 0;
    if (/[a-z]/.test(password)) poolSize += 26;
    if (/[A-Z]/.test(password)) poolSize += 26;
    if (/[0-9]/.test(password)) poolSize += 10;
    if (/[^a-zA-Z0-9]/.test(password)) poolSize += 32;
    if (poolSize === 0) return 0;
    return Math.round(password.length * Math.log2(poolSize));
}
