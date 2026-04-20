import { NextResponse } from 'next/server';
import { getTokenFromCookies, verifyToken } from '@/lib/auth/jwt';
import { prisma } from '@/lib/db/prisma';

export async function GET() {
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

        const urls = await prisma.shortenedUrl.findMany({
            where: { userId: payload.userId },
            orderBy: { createdAt: 'desc' },
            select: {
                id: true,
                shortCode: true,
                originalUrl: true,
                clicks: true,
                createdAt: true,
            },
        });

        const data = urls.map((url) => ({
            ...url,
            shortUrl: `${process.env.NEXT_PUBLIC_APP_URL || ''}/s/${url.shortCode}`,
        }));

        return NextResponse.json({ ok: true, data });
    } catch (error) {
        console.error('List URLs error:', error);
        return NextResponse.json(
            { ok: false, error: { code: 'INTERNAL', message: 'Internal server error' } },
            { status: 500 },
        );
    }
}
