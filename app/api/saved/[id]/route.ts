import { NextResponse } from 'next/server';
import { getTokenFromCookies, verifyToken } from '@/lib/auth/jwt';
import { prisma } from '@/lib/db/prisma';

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

        const item = await prisma.savedItem.findUnique({ where: { id } });
        if (!item || item.userId !== payload.userId) {
            return NextResponse.json(
                { ok: false, error: { code: 'NOT_FOUND', message: 'Item not found' } },
                { status: 404 },
            );
        }

        await prisma.savedItem.delete({ where: { id } });

        return NextResponse.json({ ok: true });
    } catch (error) {
        console.error('Delete saved item error:', error);
        return NextResponse.json(
            { ok: false, error: { code: 'INTERNAL', message: 'Internal server error' } },
            { status: 500 },
        );
    }
}
