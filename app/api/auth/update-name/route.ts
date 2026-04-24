import { NextResponse } from 'next/server';
import { getTokenFromCookies, verifyToken } from '@/lib/auth/jwt';
import { updateUserName } from '@/lib/auth/repos/user.repo';

export async function POST(request: Request) {
    try {
        const token = await getTokenFromCookies();
        if (!token) {
            return NextResponse.json(
                { ok: false, error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } },
                { status: 401 },
            );
        }

        const payload = verifyToken(token);
        if (!payload) {
            return NextResponse.json(
                { ok: false, error: { code: 'INVALID_TOKEN', message: 'Invalid token' } },
                { status: 401 },
            );
        }

        const { name } = await request.json();
        if (!name) {
            return NextResponse.json(
                { ok: false, error: { code: 'VALIDATION', message: 'Name required' } },
                { status: 400 },
            );
        }

        const user = await updateUserName(payload.userId, name);

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
        console.error('Update name error:', error);
        return NextResponse.json(
            { ok: false, error: { code: 'INTERNAL', message: 'Internal server error' } },
            { status: 500 },
        );
    }
}
