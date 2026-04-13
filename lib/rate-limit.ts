// Simple in-memory rate limiter for development
// TODO: Use Redis/Upstash for production

const requests = new Map<string, number[]>();

const LIMITS = {
    create: { max: 10, window: 3600000 }, // 10 per hour
    access: { max: 100, window: 3600000 }, // 100 per hour
};

// Check if we're in development mode
const isDevelopment = process.env.NODE_ENV === 'development';

export function checkRateLimit(
    ip: string,
    type: 'create' | 'access',
): { allowed: boolean; remaining: number; resetAt?: number } {
    // Skip rate limiting in development mode
    if (isDevelopment) {
        return {
            allowed: true,
            remaining: Number.MAX_SAFE_INTEGER,
        };
    }

    const limit = LIMITS[type];
    const now = Date.now();
    const windowStart = now - limit.window;

    const userRequests = requests.get(ip) || [];
    const recent = userRequests.filter((t) => t > windowStart);

    if (recent.length >= limit.max) {
        const oldestRequest = recent[0];
        return {
            allowed: false,
            remaining: 0,
            resetAt: oldestRequest + limit.window,
        };
    }

    recent.push(now);
    requests.set(ip, recent);

    return {
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
