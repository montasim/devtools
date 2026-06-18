import { NextRequest, NextResponse } from 'next/server';
import { getCommonPasswordsSet } from '@/features/tools/password/utils/password-data';
import { rateLimit } from '@/lib/rate-limit';

export async function POST(req: NextRequest) {
    try {
        // Rate limit by IP
        const ip = req.headers.get('x-forwarded-for') || 'unknown';
        const rl = rateLimit(`${ip}:password-check`, { limit: 100, windowMs: 60000 });
        if (!rl.success) {
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
