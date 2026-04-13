const MAX_STATE_SIZE = 5 * 1024 * 1024; // 5MB total
const MAX_FIELD_SIZE = 1 * 1024 * 1024; // 1MB per field

export function validateState(state: any): { valid: boolean; error?: string } {
    // Check total size
    const stateSize = JSON.stringify(state).length;
    if (stateSize > MAX_STATE_SIZE) {
        return { valid: false, error: 'STATE_TOO_LARGE' };
    }

    // Check individual string fields
    function checkFields(obj: any, path = '') {
        for (const [key, value] of Object.entries(obj)) {
            const fieldPath = path ? `${path}.${key}` : key;

            if (typeof value === 'string') {
                if (value.length > MAX_FIELD_SIZE) {
                    return {
                        valid: false,
                        error: `Field ${fieldPath} exceeds size limit`,
                    };
                }
            } else if (typeof value === 'object' && value !== null) {
                const result = checkFields(value, fieldPath);
                if (!result.valid) return result;
            }
        }
        return { valid: true };
    }

    return checkFields(state);
}

export function sanitizeTitle(title: string): string {
    return title.trim().slice(0, 200);
}

export function sanitizeComment(comment: string): string {
    return comment.trim().slice(0, 1000);
}

export function validateExpiration(expiration: string): boolean {
    const valid = ['1h', '1d', '7d', '30d'];
    return valid.includes(expiration);
}

export function calculateExpiration(expiration: string): Date | null {
    if (!expiration) return null;

    const now = new Date();
    const milliseconds = {
        '1h': 60 * 60 * 1000,
        '1d': 24 * 60 * 60 * 1000,
        '7d': 7 * 24 * 60 * 60 * 1000,
        '30d': 30 * 24 * 60 * 60 * 1000,
    }[expiration];

    if (!milliseconds) return null;
    return new Date(now.getTime() + milliseconds);
}
