import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { generateOTP, hashOTP } from '@/lib/auth/otp';
import { createOTP } from '@/lib/auth/repos/otp.repo';
import { sendOTPEmail } from '@/lib/auth/email';
import { checkRateLimit } from '@/lib/rate-limit';

// Request validation schema
const sendOTPSchema = z.object({
    email: z.string().email('Invalid email format'),
});

export async function POST(request: NextRequest) {
    try {
        // Parse request body
        const body = await request.json();

        // Validate email format
        const validation = sendOTPSchema.safeParse(body);
        if (!validation.success) {
            return NextResponse.json(
                { error: validation.error.issues[0].message },
                { status: 400 },
            );
        }

        const { email } = validation.data;

        // Check rate limit (3 OTP requests per hour per email)
        const ip = request.headers.get('x-forwarded-for') || 'unknown';
        const rateLimitResult = await checkRateLimit(ip, 'otp_request');

        if (!rateLimitResult.success) {
            return NextResponse.json(
                { error: 'Too many OTP requests. Please try again later.' },
                { status: 429 },
            );
        }

        // Generate OTP
        const otp = generateOTP();
        const otpHash = hashOTP(otp);

        // Store OTP in database
        await createOTP({
            email,
            codeHash: otpHash,
            intent: 'REGISTER',
        });

        // Send OTP email
        await sendOTPEmail(email, otp, 'REGISTER');

        // Return success (don't reveal if email exists or not)
        return NextResponse.json({
            success: true,
            message: 'If email exists, OTP has been sent',
        });
    } catch (error) {
        console.error('Send OTP error:', error);
        return NextResponse.json(
            { error: 'Failed to send OTP. Please try again.' },
            { status: 500 },
        );
    }
}
