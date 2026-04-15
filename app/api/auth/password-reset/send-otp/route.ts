import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { generateOTP, hashOTP } from '@/lib/auth/otp';
import { createOTP } from '@/lib/auth/repos/otp.repo';
import { sendOTPEmail } from '@/lib/auth/email';
import { checkRateLimit } from '@/lib/rate-limit';

const sendResetOTPSchema = z.object({
    email: z.string().email('Invalid email format'),
});

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const validation = sendResetOTPSchema.safeParse(body);

        if (!validation.success) {
            return NextResponse.json(
                { error: validation.error.issues[0].message },
                { status: 400 },
            );
        }

        const { email } = validation.data;

        // Check rate limit
        const ip = request.headers.get('x-forwarded-for') || 'unknown';
        const rateLimitResult = await checkRateLimit(ip, 'password_reset');

        if (!rateLimitResult.success) {
            return NextResponse.json(
                { error: 'Too many reset attempts. Please try again later.' },
                { status: 429 },
            );
        }

        // Generate OTP
        const otp = generateOTP();
        const otpHash = hashOTP(otp);

        // Store OTP (even if user doesn't exist - prevents enumeration)
        await createOTP({
            email,
            codeHash: otpHash,
            intent: 'PASSWORD_RESET',
        });

        // Send OTP email
        await sendOTPEmail(email, otp, 'PASSWORD_RESET');

        // Always return success (don't reveal if email exists)
        return NextResponse.json({
            success: true,
            message: 'If email exists, password reset OTP has been sent',
        });
    } catch (error) {
        console.error('Send reset OTP error:', error);
        return NextResponse.json(
            { error: 'Failed to send reset OTP. Please try again.' },
            { status: 500 },
        );
    }
}
