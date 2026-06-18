import { NextRequest, NextResponse } from 'next/server';
import { loadDomains, getDomainFromEmail, checkDomain } from '@/features/tools/temp-email/utils/email-checker';

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
        const { email, domain } = body;

        let targetDomain = '';
        if (typeof domain === 'string' && domain.trim()) {
            targetDomain = domain.trim();
        } else if (typeof email === 'string' && email.trim()) {
            targetDomain = getDomainFromEmail(email);
        }

        if (!targetDomain) {
            return NextResponse.json({ error: 'Email or domain is required' }, { status: 400 });
        }

        // Load temporary domains list
        const domains = await loadDomains();

        // Perform disposable domain check
        const result = checkDomain(targetDomain, domains);

        return NextResponse.json({
            disposable: result.isDisposable,
        }, { status: 200 });
    } catch {
        return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
    }
}
