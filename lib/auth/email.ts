import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM_EMAIL = process.env.FROM_EMAIL || 'noreply@devtools.app';

export async function sendOtpEmail(
    email: string,
    otp: string,
    purpose: 'register' | 'password-reset',
) {
    const subject = purpose === 'register' ? 'Verify your email' : 'Reset your password';
    const purposeText = purpose === 'register' ? 'email verification' : 'password reset';

    await resend.emails.send({
        from: FROM_EMAIL,
        to: email,
        subject,
        html: `
            <div style="font-family: sans-serif; max-width: 400px; margin: 0 auto;">
                <h2>${subject}</h2>
                <p>Your ${purposeText} code is:</p>
                <div style="font-size: 32px; font-weight: bold; letter-spacing: 4px; padding: 16px; background: #f5f5f5; border-radius: 8px; text-align: center;">
                    ${otp}
                </div>
                <p style="color: #666; margin-top: 16px;">This code expires in 10 minutes.</p>
            </div>
        `,
    });
}
