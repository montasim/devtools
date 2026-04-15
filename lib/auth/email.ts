import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM_EMAIL = process.env.FROM_EMAIL || 'noreply@yourdomain.com';

interface EmailTemplate {
    subject: string;
    html: string;
}

function getOTPEmailTemplate(otp: string, intent: 'REGISTER' | 'PASSWORD_RESET'): EmailTemplate {
    if (intent === 'REGISTER') {
        return {
            subject: 'Verify your email for Devtools',
            html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .code { font-size: 32px; font-weight: bold; color: #4F46E5; letter-spacing: 4px; }
            .footer { margin-top: 30px; font-size: 12px; color: #666; }
          </style>
        </head>
        <body>
          <div class="container">
            <h2>Verify Your Email</h2>
            <p>Your verification code is:</p>
            <p class="code">${otp}</p>
            <p>This code expires in 15 minutes.</p>
            <p>If you didn't request this, please ignore this email.</p>
            <div class="footer">
              <p>Devtools Authentication System</p>
            </div>
          </div>
        </body>
        </html>
      `,
        };
    } else {
        return {
            subject: 'Reset your password for Devtools',
            html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .code { font-size: 32px; font-weight: bold; color: #4F46E5; letter-spacing: 4px; }
            .footer { margin-top: 30px; font-size: 12px; color: #666; }
          </style>
        </head>
        <body>
          <div class="container">
            <h2>Reset Your Password</h2>
            <p>Your password reset code is:</p>
            <p class="code">${otp}</p>
            <p>This code expires in 15 minutes.</p>
            <p>If you didn't request this, please ignore this email.</p>
            <div class="footer">
              <p>Devtools Authentication System</p>
            </div>
          </div>
        </body>
        </html>
      `,
        };
    }
}

export async function sendOTPEmail(
    email: string,
    otp: string,
    intent: 'REGISTER' | 'PASSWORD_RESET',
): Promise<void> {
    const template = getOTPEmailTemplate(otp, intent);

    try {
        await resend.emails.send({
            from: FROM_EMAIL,
            to: email,
            subject: template.subject,
            html: template.html,
        });

        // Log OTP in development for testing
        if (process.env.NODE_ENV === 'development') {
            console.log(`[DEV MODE] OTP for ${email}: ${otp}`);
        }
    } catch (error) {
        console.error('Failed to send OTP email:', error);
        // Don't throw - return generic success to prevent email enumeration
        // In production, you might want to alert monitoring
    }
}
