import { NextResponse } from 'next/server';
import { getTokenFromCookies, verifyToken } from '@/lib/auth/jwt';
import { prisma } from '@/lib/db/prisma';

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;

        const link = await prisma.sharedLink.findUnique({
            where: { id },
            select: {
                id: true,
                pageName: true,
                tabName: true,
                title: true,
                comment: true,
                expiresAt: true,
                passwordHash: true,
                viewCount: true,
                createdAt: true,
            },
        });

        if (!link) {
            return NextResponse.json(
                { ok: false, error: { code: 'NOT_FOUND', message: 'Share not found' } },
                { status: 404 },
            );
        }

        if (link.expiresAt && new Date(link.expiresAt) < new Date()) {
            return NextResponse.json(
                { ok: false, error: { code: 'EXPIRED', message: 'Share link has expired' } },
                { status: 410 },
            );
        }

        return NextResponse.json({
            ok: true,
            data: {
                id: link.id,
                pageName: link.pageName,
                tabName: link.tabName,
                title: link.title,
                comment: link.comment,
                expiresAt: link.expiresAt,
                hasPassword: !!link.passwordHash,
                viewCount: link.viewCount,
                createdAt: link.createdAt,
            },
        });
    } catch (error) {
        console.error('Get share error:', error);
        return NextResponse.json(
            { ok: false, error: { code: 'INTERNAL', message: 'Internal server error' } },
            { status: 500 },
        );
    }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
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

        const link = await prisma.sharedLink.findUnique({ where: { id } });
        if (!link || link.userId !== payload.userId) {
            return NextResponse.json(
                { ok: false, error: { code: 'NOT_FOUND', message: 'Share not found' } },
                { status: 404 },
            );
        }

        await prisma.sharedLink.delete({ where: { id } });

        return NextResponse.json({ ok: true });
    } catch (error) {
        console.error('Delete share error:', error);
        return NextResponse.json(
            { ok: false, error: { code: 'INTERNAL', message: 'Internal server error' } },
            { status: 500 },
        );
    }
}
