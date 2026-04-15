import { describe, it, expect } from 'vitest';
import { timingSafeEqual } from '../crypto';

describe('timingSafeEqual', () => {
    it('should return true for matching strings', () => {
        const result = timingSafeEqual('password123', 'password123');
        expect(result).toBe(true);
    });

    it('should return false for non-matching strings', () => {
        const result = timingSafeEqual('password123', 'password124');
        expect(result).toBe(false);
    });

    it('should handle different length strings', () => {
        const result = timingSafeEqual('short', 'muchlongerstring');
        expect(result).toBe(false);
    });
});
