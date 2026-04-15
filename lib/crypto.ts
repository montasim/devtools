import bcrypt from 'bcrypt';
import { timingSafeEqual as cryptoTimingSafeEqual } from 'crypto';

const SALT_ROUNDS = 10;

export async function hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, SALT_ROUNDS);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
}

export function validatePassword(password: string): boolean {
    return password.length >= 4 && password.length <= 100;
}

export function timingSafeEqual(a: string, b: string): boolean {
    // Create buffers from strings
    const aBuffer = Buffer.from(a);
    const bBuffer = Buffer.from(b);

    // If lengths differ, they're not equal
    if (aBuffer.length !== bBuffer.length) {
        return false;
    }

    // Use crypto.timingSafeEqual for constant-time comparison
    return cryptoTimingSafeEqual(aBuffer, bBuffer);
}
