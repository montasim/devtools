import { describe, it, expect, beforeEach, vi } from 'vitest';

const mockOTPSecret = 'test-otp-secret-min-32-bytes-long';

describe('OTP Utilities', () => {
    beforeEach(() => {
        vi.resetModules();
        process.env.OTP_HMAC_SECRET = mockOTPSecret;
    });

    it('should generate 6-digit numeric OTP', async () => {
        const { generateOTP } = await import('../otp');
        const otp = generateOTP();

        expect(otp).toBeDefined();
        expect(otp).toHaveLength(6);
        expect(/^\d{6}$/.test(otp)).toBe(true);
    });

    it('should generate OTPs in valid range', async () => {
        const { generateOTP } = await import('../otp');
        const otp = generateOTP();
        const otpNumber = parseInt(otp, 10);

        expect(otpNumber).toBeGreaterThanOrEqual(100000);
        expect(otpNumber).toBeLessThanOrEqual(999999);
    });

    it('should hash OTP consistently', async () => {
        const { hashOTP } = await import('../otp');
        const otp = '123456';
        const hash1 = hashOTP(otp);
        const hash2 = hashOTP(otp);

        expect(hash1).toBe(hash2);
    });

    it('should generate different hashes for different OTPs', async () => {
        const { hashOTP } = await import('../otp');
        const hash1 = hashOTP('123456');
        const hash2 = hashOTP('654321');

        expect(hash1).not.toBe(hash2);
    });

    it('should verify correct OTP', async () => {
        const { hashOTP, verifyOTP } = await import('../otp');
        const otp = '123456';
        const hash = hashOTP(otp);

        const result = verifyOTP(otp, hash);
        expect(result).toBe(true);
    });

    it('should reject incorrect OTP', async () => {
        const { hashOTP, verifyOTP } = await import('../otp');
        const hash = hashOTP('123456');

        const result = verifyOTP('654321', hash);
        expect(result).toBe(false);
    });

    it('should reject OTP with different hash', async () => {
        const { hashOTP, verifyOTP } = await import('../otp');
        const otp = '123456';
        const wrongHash = hashOTP('654321');

        const result = verifyOTP(otp, wrongHash);
        expect(result).toBe(false);
    });
});
