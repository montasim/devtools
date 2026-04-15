import { z } from 'zod';

export const passwordSchema = z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
    .regex(/[!@#$%^&*]/, 'Password must contain at least one special character');

export function validatePassword(password: string): {
    valid: boolean;
    error?: string;
} {
    const errors: string[] = [];

    if (password.length < 8) errors.push('Must be at least 8 characters');
    if (!/[A-Z]/.test(password)) errors.push('Must contain uppercase letter');
    if (!/[a-z]/.test(password)) errors.push('Must contain lowercase letter');
    if (!/[0-9]/.test(password)) errors.push('Must contain number');
    if (!/[!@#$%^&*]/.test(password)) errors.push('Must contain special character');

    return {
        valid: errors.length === 0,
        error: errors.length > 0 ? errors.join(', ') : undefined,
    };
}

export function validateName(name: string): {
    valid: boolean;
    error?: string;
} {
    if (!name || name.trim().length === 0) {
        return { valid: false, error: 'Name is required' };
    }

    if (name.length < 2) {
        return { valid: false, error: 'Name must be at least 2 characters' };
    }

    if (name.length > 100) {
        return { valid: false, error: 'Name must be less than 100 characters' };
    }

    return { valid: true };
}
