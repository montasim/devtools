import { describe, it, expect } from 'vitest';
import { validatePassword, passwordSchema } from '../password-policy';

describe('validatePassword', () => {
    it('should reject passwords less than 8 characters', () => {
        const result = validatePassword('Short1!');
        expect(result.valid).toBe(false);
        expect(result.errors).toContain('Must be at least 8 characters');
    });

    it('should reject passwords without uppercase', () => {
        const result = validatePassword('lowercase1!');
        expect(result.valid).toBe(false);
        expect(result.errors).toContain('Must contain uppercase letter');
    });

    it('should reject passwords without lowercase', () => {
        const result = validatePassword('UPPERCASE1!');
        expect(result.valid).toBe(false);
        expect(result.errors).toContain('Must contain lowercase letter');
    });

    it('should reject passwords without numbers', () => {
        const result = validatePassword('NoNumbers!');
        expect(result.valid).toBe(false);
        expect(result.errors).toContain('Must contain number');
    });

    it('should reject passwords without special characters', () => {
        const result = validatePassword('NoSpecial123');
        expect(result.valid).toBe(false);
        expect(result.errors).toContain('Must contain special character');
    });

    it('should accept valid passwords', () => {
        const result = validatePassword('ValidPass123!');
        expect(result.valid).toBe(true);
        expect(result.errors).toHaveLength(0);
    });
});

describe('passwordSchema', () => {
    it('should validate correct passwords', () => {
        const result = passwordSchema.safeParse('ValidPass123!');
        expect(result.success).toBe(true);
    });

    it('should reject invalid passwords', () => {
        const result = passwordSchema.safeParse('short');
        expect(result.success).toBe(false);
        if (!result.success) {
            expect(result.error.issues[0].message).toContain('at least 8 characters');
        }
    });
});
