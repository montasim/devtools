import { customAlphabet } from 'nanoid';

const generateShortId = customAlphabet(
    '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz',
    5,
);

/**
 * Generates a unique 5-character ID, verifying uniqueness via the provided check function.
 * Retries up to `maxAttempts` times.
 */
export async function generateUniqueShortId(
    checkExists: (id: string) => Promise<boolean>,
    maxAttempts = 10,
): Promise<string | null> {
    let attempts = 0;
    while (attempts < maxAttempts) {
        const id = generateShortId();
        const exists = await checkExists(id);
        if (!exists) {
            return id;
        }
        attempts++;
    }
    return null;
}
