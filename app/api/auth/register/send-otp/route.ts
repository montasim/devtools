import { NextResponse } from 'next/server';
import { generateOtp, hashOtp, getOtpExpiry } from '@/lib/auth/otp';
import { sendOtpEmail } from '@/lib/auth/email';
import { createOtp, invalidateOtps } from '@/lib/auth/repos/otp.repo';
import { rateLimit } from '@/lib/rate-limit';

export async function POST(request: Request) {
    const limiter = rateLimit(request.headers.get('x-forwarded-for') ?? 'unknown', {
        limit: 3,
        windowMs: 60_000,
    });
    if (!limiter.success) {
        return NextResponse.json(
            { ok: false, error: { code: 'RATE_LIMITED', message: 'Too many attempts' } },
            { status: 429 },
        );
    }

    try {
        const { email } = await request.json();
        if (!email) {
            return NextResponse.json(
                { ok: false, error: { code: 'VALIDATION', message: 'Email required' } },
                { status: 400 },
            );
        }

        await invalidateOtps(email, 'REGISTER');

        const otp = generateOtp();
        const codeHash = hashOtp(otp);
        const expiresAt = getOtpExpiry();

        await createOtp({ email, codeHash, intent: 'REGISTER', expiresAt });
        await sendOtpEmail(email, otp, 'register');

        return NextResponse.json({ ok: true });
    } catch (error) {
        console.error('Send OTP error:', error);
        return NextResponse.json(
            { ok: false, error: { code: 'INTERNAL', message: 'Failed to send verification code' } },
            { status: 500 },
        );
    }
}
