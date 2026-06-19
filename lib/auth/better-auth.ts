import { betterAuth } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { emailOTP } from 'better-auth/plugins';
import { prisma } from '@/lib/db/prisma';
import { sendOtpEmail } from './email';

export const auth = betterAuth({
    database: prismaAdapter(prisma, {
        provider: 'postgresql',
    }),
    secret: process.env.BETTER_AUTH_SECRET || process.env.JWT_SECRET || 'dev-secret-change-me',
    baseURL: process.env.BETTER_AUTH_URL || process.env.BASE_URL || 'http://localhost:3000',
    rateLimit: {
        enabled: true,
        window: 60, // 1 minute window
        max: 100, // 100 requests per window
        customRules: {
            '/email-otp/send-verification-otp': {
                window: 60,
                max: 5, // Only 5 OTP requests per minute
            },
            '/sign-in/email-otp': {
                window: 60,
                max: 5, // Only 5 OTP verifications per minute
            },
        },
    },
    plugins: [
        emailOTP({
            async sendVerificationOTP({ email, otp, type }) {
                // type is: 'sign-in' | 'email-verification' | 'forget-password'
                const purpose = type === 'forget-password' ? 'password-reset' : 'register';
                await sendOtpEmail(email, otp, purpose);
            },
        }),
    ],
});
