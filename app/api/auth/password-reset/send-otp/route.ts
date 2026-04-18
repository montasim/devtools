import { NextResponse } from 'next/server';
import { generateOtp, hashOtp, getOtpExpiry } from '@/lib/auth/otp';
import { sendOtpEmail } from '@/lib/auth/email';
import { createOtp, invalidateOtps } from '@/lib/auth/repos/otp.repo';
import { findUserByEmail } from '@/lib/auth/repos/user.repo';
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

        const user = await findUserByEmail(email);
        if (!user) {
            return NextResponse.json({ ok: true });
        }

        await invalidateOtps(email, 'PASSWORD_RESET');

        const otp = generateOtp();
        const codeHash = hashOtp(otp);
        const expiresAt = getOtpExpiry();

        await createOtp({ email, codeHash, intent: 'PASSWORD_RESET', expiresAt, userId: user.id });
        await sendOtpEmail(email, otp, 'password-reset');

        return NextResponse.json({ ok: true });
    } catch (error) {
        console.error('Password reset send OTP error:', error);
        return NextResponse.json(
            { ok: false, error: { code: 'INTERNAL', message: 'Internal server error' } },
            { status: 500 },
        );
    }
}
