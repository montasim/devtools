export const authConfig = {
    isDevelopment: process.env.NODE_ENV === 'development',
    isProduction: process.env.NODE_ENV === 'production',
    cookieDomain: process.env.NODE_ENV === 'production' ? '.yourdomain.com' : undefined,
    secureCookies: process.env.NODE_ENV === 'production',
    // Log OTPs in development instead of sending emails
    logOtpsInDev: process.env.NODE_ENV === 'development',

    // JWT Configuration
    jwtSecret: process.env.JWT_SECRET!,
    tokenExpiry: '7d',

    // OTP Configuration
    otpSecret: process.env.OTP_HMAC_SECRET!,
    otpExpiryMinutes: 15,

    // Email Configuration
    resendApiKey: process.env.RESEND_API_KEY!,
    fromEmail: process.env.FROM_EMAIL || 'noreply@yourdomain.com',
    baseUrl: process.env.BASE_URL || 'http://localhost:3000',
};
