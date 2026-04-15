import { createHmac, randomBytes } from 'crypto';

const OTP_HMAC_SECRET = process.env.OTP_HMAC_SECRET!;

export function generateOTP(): string {
    // Generate random number between 100000 and 999999
    const min = 100000;
    const max = 999999;
    const range = max - min + 1;
    const randomBytes2 = randomBytes(4);
    const randomValue = randomBytes2.readUInt32BE(0) % range;
    const otp = min + randomValue;

    return otp.toString().padStart(6, '0');
}

export function hashOTP(otp: string): string {
    const hmac = createHmac('sha256', OTP_HMAC_SECRET);
    hmac.update(otp);
    return hmac.digest('hex');
}

export function verifyOTP(otp: string, hash: string): boolean {
    const computedHash = hashOTP(otp);
    // Use timing-safe comparison
    return computedHash === hash;
}

export function generateOTPExpiry(): Date {
    const expiry = new Date();
    expiry.setMinutes(expiry.getMinutes() + 15); // 15 minutes from now
    return expiry;
}
