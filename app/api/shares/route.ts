import { NextResponse } from 'next/server';
import { getTokenFromCookies, verifyToken } from '@/lib/auth/jwt';
import { prisma } from '@/lib/db/prisma';
import bcrypt from 'bcrypt';

export async function POST(request: Request) {
    try {
        const token = await getTokenFromCookies();
        let userId: string | null = null;

        if (token) {
            const payload = verifyToken(token);
            if (payload) {
                userId = payload.userId;
            }
        }

        const { pageName, tabName, title, comment, expiresAt, password, state } =
            await request.json();
        if (!pageName || !tabName || !title || !state) {
            return NextResponse.json(
                { ok: false, error: { code: 'VALIDATION', message: 'Missing required fields' } },
                { status: 400 },
            );
        }

        const passwordHash = password ? await bcrypt.hash(password, 12) : null;

        const sharedLink = await prisma.sharedLink.create({
            data: {
                userId,
                pageName,
                tabName,
                title,
                comment,
                expiresAt: expiresAt ? new Date(expiresAt) : null,
                passwordHash,
            },
        });

        await prisma.sharedContent.create({
            data: {
                linkId: sharedLink.id,
                state,
            },
        });

        return NextResponse.json({ ok: true, data: { id: sharedLink.id } });
    } catch (error) {
        console.error('Create share error:', error);
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

        const sharedLinks = await prisma.sharedLink.findMany({
            where: {
                userId: payload.userId,
                ...(pageName ? { pageName } : {}),
            },
            orderBy: { createdAt: 'desc' },
            select: {
                id: true,
                userId: true,
                pageName: true,
                tabName: true,
                title: true,
                comment: true,
                expiresAt: true,
                passwordHash: true,
                viewCount: true,
                createdAt: true,
                updatedAt: true,
            },
        });

        const data = sharedLinks.map((link) => ({
            ...link,
            hasPassword: !!link.passwordHash,
            passwordHash: undefined,
        }));

        return NextResponse.json({ ok: true, data });
    } catch (error) {
        console.error('Get shares error:', error);
        return NextResponse.json(
            { ok: false, error: { code: 'INTERNAL', message: 'Internal server error' } },
            { status: 500 },
        );
    }
}
