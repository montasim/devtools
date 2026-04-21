import { NextResponse } from 'next/server';
import { getTokenFromCookies, verifyToken } from '@/lib/auth/jwt';
import { prisma } from '@/lib/db/prisma';

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

        const { ids } = await request.json();
        if (!Array.isArray(ids) || ids.length === 0) {
            return NextResponse.json(
                { ok: false, error: { code: 'VALIDATION', message: 'IDs required' } },
                { status: 400 },
            );
        }

        await prisma.shortenedUrl.deleteMany({
            where: { id: { in: ids }, userId: payload.userId },
        });

        return NextResponse.json({ ok: true });
    } catch (error) {
        console.error('Clear all URLs error:', error);
        return NextResponse.json(
            { ok: false, error: { code: 'INTERNAL', message: 'Internal server error' } },
            { status: 500 },
        );
    }
}
