// Simple in-memory rate limiter for development
// TODO: Use Redis/Upstash for production

const requests = new Map<string, number[]>();

const LIMITS = {
    create: { max: 10, window: 3600000 }, // 10 per hour
    access: { max: 100, window: 3600000 }, // 100 per hour
};

const AUTH_LIMITS = {
    otp_request: { max: 3, window: 3600000 }, // 3 per hour
    login_attempt: { max: 5, window: 900000 }, // 5 per 15 min
    password_reset: { max: 3, window: 3600000 }, // 3 per hour
};

// Merge auth limits with existing limits
const ALL_LIMITS = {
    ...LIMITS,
    ...AUTH_LIMITS,
};

// Check if we're in development mode
const isDevelopment = process.env.NODE_ENV === 'development';

export function checkRateLimit(
    ip: string,
    type: 'create' | 'access' | 'otp_request' | 'login_attempt' | 'password_reset',
): { success: boolean; allowed: boolean; remaining: number; resetAt?: number } {
    // Skip rate limiting in development mode
    if (isDevelopment) {
        return {
            success: true,
            allowed: true,
            remaining: Number.MAX_SAFE_INTEGER,
        };
    }

    const limit = ALL_LIMITS[type];
    const now = Date.now();
    const windowStart = now - limit.window;

    const userRequests = requests.get(ip) || [];
    const recent = userRequests.filter((t) => t > windowStart);

    if (recent.length >= limit.max) {
        const oldestRequest = recent[0];
        return {
            success: false,
            allowed: false,
            remaining: 0,
            resetAt: oldestRequest + limit.window,
        };
    }

    recent.push(now);
    requests.set(ip, recent);

    return {
        success: true,
        allowed: true,
        remaining: limit.max - recent.length,
    };
}

export function getClientIp(request: Request): string {
    // Check various headers for IP
    const forwarded = request.headers.get('x-forwarded-for');
    if (forwarded) {
        return forwarded.split(',')[0].trim();
    }

    const realIp = request.headers.get('x-real-ip');
    if (realIp) {
        return realIp;
    }

    return 'unknown';
}
