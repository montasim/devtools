import { describe, it, expect, beforeEach, vi } from 'vitest';

// Mock environment variables
const mockJWTSecret = 'test-secret-min-32-bytes-long-for-testing';

describe('JWT Utilities', () => {
    beforeEach(() => {
        // Set environment variable before importing the module
        process.env.JWT_SECRET = mockJWTSecret;
        vi.resetModules();
    });

    it('should generate valid JWT token', async () => {
        const { generateToken } = await import('../jwt');
        const payload = { userId: 'user-123', email: 'test@example.com' };
        const token = generateToken(payload);

        expect(token).toBeDefined();
        expect(typeof token).toBe('string');
    });

    it('should verify valid JWT token', async () => {
        const { generateToken, verifyToken } = await import('../jwt');
        const payload = { userId: 'user-123', email: 'test@example.com' };
        const token = generateToken(payload);

        const decoded = verifyToken(token);
        expect(decoded).toBeDefined();
        expect(decoded.userId).toBe('user-123');
        expect(decoded.email).toBe('test@example.com');
    });

    it('should throw on invalid token', async () => {
        const { verifyToken } = await import('../jwt');
        const invalidToken = 'invalid.token.here';

        expect(() => verifyToken(invalidToken)).toThrow();
    });

    it('should throw on expired token', async () => {
        const { generateToken, verifyToken } = await import('../jwt');
        const payload = { userId: 'user-123', email: 'test@example.com' };
        // Create token that expires immediately
        const token = generateToken(payload, '0s');

        // Wait a moment for token to expire
        await new Promise((resolve) => setTimeout(resolve, 100));
        expect(() => verifyToken(token)).toThrow();
    });
});
