import commonPasswordsJson from '../data/common-passwords.json';

let passwordSet: Set<string> | null = null;

export function getCommonPasswordsSet(): Set<string> {
    if (!passwordSet) {
        passwordSet = new Set(commonPasswordsJson as unknown as string[]);
    }
    return passwordSet;
}

// Pre-warm on module import
getCommonPasswordsSet();
