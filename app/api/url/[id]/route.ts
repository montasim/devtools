import { NextResponse } from 'next/server';
import { getTokenFromCookies, verifyToken } from '@/lib/auth/jwt';
import { prisma } from '@/lib/db/prisma';

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const { searchParams } = new URL(request.url);
        const isStats = searchParams.get('stats') === 'true';

        const url = await prisma.shortenedUrl.findUnique({
            where: { shortCode: id },
            select: {
                id: true,
                originalUrl: true,
                clicks: true,
                createdAt: true,
                userId: true,
            },
        });

        if (!url) {
            return NextResponse.json(
                { ok: false, error: { code: 'NOT_FOUND', message: 'URL not found' } },
                { status: 404 },
            );
        }

        if (isStats) {
            return NextResponse.json({
                ok: true,
                data: {
                    originalUrl: url.originalUrl,
                    clicks: url.clicks,
                    createdAt: url.createdAt,
                },
            });
        }

        const token = await getTokenFromCookies();
        if (!token) {
            return NextResponse.json(
                { ok: false, error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } },
                { status: 401 },
            );
        }

        const payload = verifyToken(token);
        if (!payload || url.userId !== payload.userId) {
            return NextResponse.json(
                { ok: false, error: { code: 'NOT_FOUND', message: 'URL not found' } },
                { status: 404 },
            );
        }

        await prisma.shortenedUrl.delete({ where: { id: url.id } });

        return NextResponse.json({ ok: true });
    } catch (error) {
        console.error('URL operation error:', error);
        return NextResponse.json(
            { ok: false, error: { code: 'INTERNAL', message: 'Internal server error' } },
            { status: 500 },
        );
    }
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
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

        const { id } = await params;

        const url = await prisma.shortenedUrl.findUnique({ where: { id } });
        if (!url || url.userId !== payload.userId) {
            return NextResponse.json(
                { ok: false, error: { code: 'NOT_FOUND', message: 'URL not found' } },
                { status: 404 },
            );
        }

        await prisma.shortenedUrl.delete({ where: { id } });

        return NextResponse.json({ ok: true });
    } catch (error) {
        console.error('Delete URL error:', error);
        return NextResponse.json(
            { ok: false, error: { code: 'INTERNAL', message: 'Internal server error' } },
            { status: 500 },
        );
    }
}
