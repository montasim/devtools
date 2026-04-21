import { NextResponse } from 'next/server';
import { findUserByEmail, createUser, verifyUserEmail } from '@/lib/auth/repos/user.repo';
import { findValidOtp, markOtpUsed } from '@/lib/auth/repos/otp.repo';
import { verifyOtp } from '@/lib/auth/otp';
import { signToken, setAuthCookie } from '@/lib/auth/jwt';

export async function POST(request: Request) {
    try {
        const { email, password, name, otp } = await request.json();
        if (!email || !password || !name || !otp) {
            return NextResponse.json(
                { ok: false, error: { code: 'VALIDATION', message: 'All fields required' } },
                { status: 400 },
            );
        }

        const validOtp = await findValidOtp(email, 'REGISTER', otp, verifyOtp);
        if (!validOtp) {
            return NextResponse.json(
                {
                    ok: false,
                    error: { code: 'INVALID_OTP', message: 'Invalid or expired verification code' },
                },
                { status: 400 },
            );
        }

        await markOtpUsed(validOtp.id);

        const existingUser = await findUserByEmail(email);
        let user;
        if (existingUser) {
            await verifyUserEmail(existingUser.id);
            user = existingUser;
        } else {
            user = await createUser(email, password, name);
            await verifyUserEmail(user.id);
        }

        const token = signToken({ userId: user.id, email: user.email });
        await setAuthCookie(token);

        return NextResponse.json({
            ok: true,
            data: {
                id: user.id,
                email: user.email,
                name: user.name,
                emailVerified: user.emailVerified,
            },
        });
    } catch (error) {
        console.error('Verify OTP error:', error);
        return NextResponse.json(
            { ok: false, error: { code: 'INTERNAL', message: 'Internal server error' } },
            { status: 500 },
        );
    }
}
