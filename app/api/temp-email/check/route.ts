import { NextRequest, NextResponse } from 'next/server';
import { loadDomains, getDomainFromEmail, checkDomain } from '@/features/tools/temp-email/utils/email-checker';
import { rateLimit } from '@/lib/rate-limit';

export async function POST(req: NextRequest) {
    try {
        // Rate limit by IP
        const ip = req.headers.get('x-forwarded-for') || 'unknown';
        const rl = rateLimit(`${ip}:temp-email-check`, { limit: 100, windowMs: 60000 });
        if (!rl.success) {
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
