import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { hashPassword } from '@/lib/crypto';
import { hashOTP } from '@/lib/auth/otp';
import { getValidOTP, markOTPUsed } from '@/lib/auth/repos/otp.repo';
import { createUser, getUserByEmail } from '@/lib/auth/repos/user.repo';
import { passwordSchema } from '@/lib/auth/password-policy';

// Request validation schema
const verifyOTPSchema = z.object({
    email: z.string().email('Invalid email format'),
    code: z.string().regex(/^\d{6}$/, 'OTP must be 6 digits'),
    name: z.string().min(1, 'Name is required').max(100, 'Name too long'),
    password: z.string().min(1, 'Password is required'),
});

export async function POST(request: NextRequest) {
    try {
        // Parse request body
        const body = await request.json();

        // Validate request format
        const validation = verifyOTPSchema.safeParse(body);
        if (!validation.success) {
            return NextResponse.json(
                { error: validation.error.issues[0].message },
                { status: 400 },
            );
        }

        const { email, code, name, password } = validation.data;

        // Validate password strength
        const passwordValidation = passwordSchema.safeParse(password);
        if (!passwordValidation.success) {
            return NextResponse.json(
                { error: passwordValidation.error.issues[0].message },
                { status: 400 },
            );
        }

        // Check if user already exists
        const existingUser = await getUserByEmail(email);
        if (existingUser) {
            return NextResponse.json({ error: 'User already exists' }, { status: 400 });
        }

        // Verify OTP
        const otpHash = hashOTP(code);
        const validOTP = await getValidOTP(email, 'REGISTER', otpHash);

        if (!validOTP) {
            return NextResponse.json({ error: 'Invalid or expired OTP' }, { status: 400 });
        }

        // Hash password
        const passwordHash = await hashPassword(password);

        // Create user
        await createUser({
            email,
            passwordHash,
            name,
        });

        // Mark OTP as used
        await markOTPUsed(validOTP.id);

        return NextResponse.json({
            success: true,
            message: 'Account created successfully',
        });
    } catch (error) {
        console.error('Verify OTP error:', error);
        return NextResponse.json(
            { error: 'Failed to create account. Please try again.' },
            { status: 500 },
        );
    }
}
