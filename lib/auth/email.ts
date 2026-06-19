import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM_EMAIL = process.env.FROM_EMAIL || 'noreply@devtools.app';

export async function sendOtpEmail(
    email: string,
    otp: string,
    purpose: 'register' | 'password-reset',
) {
    const subject = purpose === 'register' ? 'Verify your email' : 'Reset your password';
    const currentYear = new Date().getFullYear();

    await resend.emails.send({
        from: FROM_EMAIL,
        to: email,
        subject,
        html: `
            <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f9fafb; padding: 32px 16px; margin: 0; min-height: 100%;">
                <div style="max-width: 440px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; border: 1px solid #f3f4f6; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03); padding: 32px; text-align: center;">
                    
                    <!-- Logo / Header -->
                    <div style="margin-bottom: 24px;">
                        <span style="font-size: 24px; font-weight: 800; color: #10b981; letter-spacing: -0.5px;">&gt; DevTools</span>
                    </div>

                    <h1 style="font-size: 20px; font-weight: 700; color: #111827; margin: 0 0 12px 0;">Verify your request</h1>
                    
                    <p style="font-size: 14px; line-height: 24px; color: #4b5563; margin: 0 0 24px 0;">
                        Use the following one-time passcode to complete your verification. This code is only valid for 10 minutes.
                    </p>

                    <!-- OTP Code Block -->
                    <div style="font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; font-size: 32px; font-weight: 700; letter-spacing: 6px; padding: 18px; background-color: #f3f4f6; border: 1px solid #e5e7eb; border-radius: 12px; color: #111827; display: inline-block; margin-bottom: 24px; min-width: 180px; padding-left: 24px;">
                        ${otp}
                    </div>

                    <p style="font-size: 13px; line-height: 20px; color: #9ca3af; margin: 0 0 16px 0;">
                        If you did not make this request, you can safely ignore this email.
                    </p>

                    <div style="border-top: 1px solid #f3f4f6; margin-top: 32px; padding-top: 16px;">
                        <p style="font-size: 12px; color: #9ca3af; margin: 0;">
                            &copy; ${currentYear} <a href="${process.env.NEXT_PUBLIC_APP_URL || '#'}" target="_blank" rel="noopener noreferrer" style="color: #9ca3af; text-decoration: underline;">DevTools</a>. All rights reserved.
                        </p>
                    </div>

                </div>
            </div>
        `,
    });
}
