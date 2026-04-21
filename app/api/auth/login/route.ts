import { NextResponse } from 'next/server';
import { findUserByEmail, verifyPassword } from '@/lib/auth/repos/user.repo';
import { signToken, setAuthCookie } from '@/lib/auth/jwt';
import { rateLimit } from '@/lib/rate-limit';

export async function POST(request: Request) {
    const limiter = rateLimit(request.headers.get('x-forwarded-for') ?? 'unknown', {
        limit: 5,
        windowMs: 60_000,
    });
    if (!limiter.success) {
        return NextResponse.json(
            { ok: false, error: { code: 'RATE_LIMITED', message: 'Too many attempts' } },
            { status: 429 },
        );
    }

    try {
        const { email, password } = await request.json();
        if (!email || !password) {
            return NextResponse.json(
                {
                    ok: false,
                    error: { code: 'VALIDATION', message: 'Email and password required' },
                },
                { status: 400 },
            );
        }

        const user = await findUserByEmail(email);
        if (!user) {
            return NextResponse.json(
                {
                    ok: false,
                    error: { code: 'INVALID_CREDENTIALS', message: 'Invalid email or password' },
                },
                { status: 401 },
            );
        }

        const valid = await verifyPassword(password, user.passwordHash);
        if (!valid) {
            return NextResponse.json(
                {
                    ok: false,
                    error: { code: 'INVALID_CREDENTIALS', message: 'Invalid email or password' },
                },
                { status: 401 },
            );
        }

        const token = signToken({ userId: user.id, email: user.email });
        await setAuthCookie(token);

        return NextResponse.json({
            ok: true,
            data: {
                id: user.id,
                email: user.email,
                name: user.name,
                emailVerified: user.emailVerified,
            },
        });
    } catch (error) {
        console.error('Login error:', error);
        return NextResponse.json(
            { ok: false, error: { code: 'INTERNAL', message: 'Internal server error' } },
            { status: 500 },
        );
    }
}
