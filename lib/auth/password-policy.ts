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
    errors: string[];
} {
    const errors: string[] = [];

    if (password.length < 8) errors.push('Must be at least 8 characters');
    if (!/[A-Z]/.test(password)) errors.push('Must contain uppercase letter');
    if (!/[a-z]/.test(password)) errors.push('Must contain lowercase letter');
    if (!/[0-9]/.test(password)) errors.push('Must contain number');
    if (!/[!@#$%^&*]/.test(password)) errors.push('Must contain special character');

    return {
        valid: errors.length === 0,
        errors,
    };
}
