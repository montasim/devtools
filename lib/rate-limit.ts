const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

export interface RateLimitResult {
    success: boolean;
    remaining: number;
    resetAt: number;
}

export function rateLimit(
    key: string,
    options: { limit: number; windowMs: number } = { limit: 10, windowMs: 60_000 },
): RateLimitResult {
    const now = Date.now();
    const entry = rateLimitMap.get(key);

    if (!entry || now > entry.resetTime) {
        const resetTime = now + options.windowMs;
        rateLimitMap.set(key, { count: 1, resetTime });
        return { success: true, remaining: options.limit - 1, resetAt: resetTime };
    }

    if (entry.count >= options.limit) {
        return { success: false, remaining: 0, resetAt: entry.resetTime };
    }

    entry.count++;
    return { success: true, remaining: options.limit - entry.count, resetAt: entry.resetTime };
}

setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of rateLimitMap) {
        if (now > entry.resetTime) {
            rateLimitMap.delete(key);
        }
    }
}, 60_000);
