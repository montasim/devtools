import { NextResponse } from 'next/server';
import { findValidOtp, markOtpUsed } from '@/lib/auth/repos/otp.repo';
import { findUserByEmail, updateUserPassword } from '@/lib/auth/repos/user.repo';
import { verifyOtp } from '@/lib/auth/otp';
import { signToken, setAuthCookie } from '@/lib/auth/jwt';

export async function POST(request: Request) {
    try {
        const { email, password, otp } = await request.json();
        if (!email || !password || !otp) {
            return NextResponse.json(
                { ok: false, error: { code: 'VALIDATION', message: 'All fields required' } },
                { status: 400 },
            );
        }

        const validOtp = await findValidOtp(email, 'PASSWORD_RESET', otp, verifyOtp);
        if (!validOtp) {
            return NextResponse.json(
                { ok: false, error: { code: 'INVALID_OTP', message: 'Invalid or expired code' } },
                { status: 400 },
            );
        }

        await markOtpUsed(validOtp.id);

        const user = await findUserByEmail(email);
        if (!user) {
            return NextResponse.json(
                { ok: false, error: { code: 'USER_NOT_FOUND', message: 'User not found' } },
                { status: 404 },
            );
        }

        await updateUserPassword(user.id, password);

        const token = signToken({ userId: user.id, email: user.email });
        await setAuthCookie(token);

        return NextResponse.json({ ok: true });
    } catch (error) {
        console.error('Password reset confirm error:', error);
        return NextResponse.json(
            { ok: false, error: { code: 'INTERNAL', message: 'Internal server error' } },
            { status: 500 },
        );
    }
}
