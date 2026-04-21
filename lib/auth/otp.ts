import crypto from 'crypto';

const OTP_HMAC_SECRET = process.env.OTP_HMAC_SECRET || 'dev-otp-secret-change-me';
const OTP_LENGTH = 6;
const OTP_EXPIRY_MINUTES = 10;

export function generateOtp(): string {
    const digits = '0123456789';
    let otp = '';
    const bytes = crypto.randomBytes(OTP_LENGTH);
    for (let i = 0; i < OTP_LENGTH; i++) {
        otp += digits[bytes[i] % digits.length];
    }
    return otp;
}

export function hashOtp(otp: string): string {
    return crypto.createHmac('sha256', OTP_HMAC_SECRET).update(otp).digest('hex');
}

export function verifyOtp(otp: string, hash: string): boolean {
    const computedHash = hashOtp(otp);
    return crypto.timingSafeEqual(Buffer.from(computedHash, 'hex'), Buffer.from(hash, 'hex'));
}

export function getOtpExpiry(): Date {
    return new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);
}
