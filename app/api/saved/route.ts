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

        const { pageName, tabName, name, content } = await request.json();
        if (!pageName || !tabName || !name || !content) {
            return NextResponse.json(
                { ok: false, error: { code: 'VALIDATION', message: 'Missing required fields' } },
                { status: 400 },
            );
        }

        const savedItem = await prisma.savedItem.create({
            data: {
                userId: payload.userId,
                pageName,
                tabName,
                name,
                content,
            },
        });

        return NextResponse.json({ ok: true, data: savedItem });
    } catch (error) {
        console.error('Create saved item error:', error);
        return NextResponse.json(
            { ok: false, error: { code: 'INTERNAL', message: 'Internal server error' } },
            { status: 500 },
        );
    }
}

export async function GET(request: Request) {
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

        const { searchParams } = new URL(request.url);
        const pageName = searchParams.get('pageName');

        const savedItems = await prisma.savedItem.findMany({
            where: {
                userId: payload.userId,
                ...(pageName ? { pageName } : {}),
            },
            orderBy: { createdAt: 'desc' },
        });

        return NextResponse.json({ ok: true, data: savedItems });
    } catch (error) {
        console.error('Get saved items error:', error);
        return NextResponse.json(
            { ok: false, error: { code: 'INTERNAL', message: 'Internal server error' } },
            { status: 500 },
        );
    }
}
