import WORD_LIST from './wordlist.json';

export interface PassphraseConfig {
    wordCount: number;
    separator: string;
    caseMode: 'lower' | 'upper' | 'capitalize';
}

export const DEFAULT_PASSPHRASE_CONFIG: PassphraseConfig = {
    wordCount: 4,
    separator: '-',
    caseMode: 'lower',
};

function pickWords(count: number): string[] {
    const array = new Uint32Array(count);
    crypto.getRandomValues(array);
    const words: string[] = [];
    for (let i = 0; i < count; i++) {
        words.push(WORD_LIST[array[i] % WORD_LIST.length]);
    }
    return words;
}

function applyCase(word: string, mode: PassphraseConfig['caseMode']): string {
    switch (mode) {
        case 'upper':
            return word.toUpperCase();
        case 'capitalize':
            return word.charAt(0).toUpperCase() + word.slice(1);
        default:
            return word;
    }
}

export function generatePassphrase(config: PassphraseConfig): string {
    const words = pickWords(config.wordCount || 4);
    const sep = config.separator || '-';
    return words.map((w) => applyCase(w, config.caseMode)).join(sep);
}

export function generatePassphrases(config: PassphraseConfig, count: number): string[] {
    return Array.from({ length: count }, () => generatePassphrase(config));
}

export interface PassphraseStrengthResult {
    score: number;
    label: string;
    color: string;
    entropy: number;
    wordCount: number;
}

const STRENGTH_LEVELS: { min: number; label: string; color: string }[] = [
    { min: 0, label: 'Very Weak', color: 'bg-destructive' },
    { min: 1, label: 'Weak', color: 'bg-destructive/80' },
    { min: 2, label: 'Fair', color: 'bg-warning' },
    { min: 3, label: 'Strong', color: 'bg-primary/80' },
    { min: 4, label: 'Very Strong', color: 'bg-primary' },
];

export function evaluatePassphraseStrength(passphrase: string): PassphraseStrengthResult {
    if (!passphrase)
        return { score: 0, label: 'None', color: 'bg-muted', entropy: 0, wordCount: 0 };

    const wordCount = passphrase.split(/[-._ ]/).length;
    const entropy = Math.round(wordCount * Math.log2(WORD_LIST.length));

    let score = 0;
    if (wordCount >= 3) score++;
    if (wordCount >= 4) score++;
    if (wordCount >= 5) score++;
    if (wordCount >= 6) score++;
    if (entropy >= 50) score++;
    if (entropy >= 70) score++;
    if (entropy >= 90) score++;

    const normalized = Math.min(4, Math.floor((score / 7) * 5));
    const level = STRENGTH_LEVELS[normalized];

    return { score: normalized, label: level.label, color: level.color, entropy, wordCount };
}
