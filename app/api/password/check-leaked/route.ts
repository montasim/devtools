import { NextRequest, NextResponse } from 'next/server';
import { getCommonPasswordsSet } from '@/features/tools/password/utils/password-data';

// Rate limiting: simple in-memory counter per IP
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT = 100; // requests per minute
const WINDOW_MS = 60 * 1000;

function checkRateLimit(ip: string): boolean {
    const now = Date.now();
    const record = rateLimitMap.get(ip);

    if (!record || now > record.resetTime) {
        rateLimitMap.set(ip, { count: 1, resetTime: now + WINDOW_MS });
        return true;
    }

    if (record.count >= RATE_LIMIT) return false;

    record.count++;
    return true;
}

export async function POST(req: NextRequest) {
    try {
        // Rate limit by IP
        const ip = req.headers.get('x-forwarded-for') || 'unknown';
        if (!checkRateLimit(ip)) {
            return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 });
        }

        // Parse request
        const body = await req.json();
        const { password } = body;

        if (typeof password !== 'string') {
            return NextResponse.json({ leaked: false }, { status: 400 });
        }

        // Fast set lookup
        const commonPasswords = getCommonPasswordsSet();
        const leaked = commonPasswords.has(password);

        return NextResponse.json({ leaked }, { status: 200 });
    } catch {
        return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
    }
}
