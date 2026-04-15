import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { hashPassword } from '@/lib/crypto';
import { hashOTP } from '@/lib/auth/otp';
import { getValidOTP, markOTPUsed } from '@/lib/auth/repos/otp.repo';
import { getUserByEmail, updateUserPassword } from '@/lib/auth/repos/user.repo';
import { passwordSchema } from '@/lib/auth/password-policy';

const confirmResetSchema = z.object({
    email: z.string().email('Invalid email format'),
    code: z.string().regex(/^\d{6}$/, 'OTP must be 6 digits'),
    password: z.string().min(1, 'Password is required'),
});

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const validation = confirmResetSchema.safeParse(body);

        if (!validation.success) {
            return NextResponse.json(
                { error: validation.error.issues[0].message },
                { status: 400 },
            );
        }

        const { email, code, password } = validation.data;

        // Validate password strength
        const passwordValidation = passwordSchema.safeParse(password);
        if (!passwordValidation.success) {
            return NextResponse.json(
                { error: passwordValidation.error.issues[0].message },
                { status: 400 },
            );
        }

        // Verify OTP
        const otpHash = hashOTP(code);
        const validOTP = await getValidOTP(email, 'PASSWORD_RESET', otpHash);

        if (!validOTP) {
            return NextResponse.json({ error: 'Invalid or expired OTP' }, { status: 400 });
        }

        // Get user
        const user = await getUserByEmail(email);
        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        // Update password
        const passwordHash = await hashPassword(password);
        await updateUserPassword(user.id, passwordHash);

        // Mark OTP as used
        await markOTPUsed(validOTP.id);

        return NextResponse.json({
            success: true,
            message: 'Password reset successfully',
        });
    } catch (error) {
        console.error('Confirm password reset error:', error);
        return NextResponse.json(
            { error: 'Failed to reset password. Please try again.' },
            { status: 500 },
        );
    }
}
