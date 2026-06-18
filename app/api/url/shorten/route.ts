import { NextResponse } from 'next/server';
import { getTokenFromCookies, verifyToken } from '@/lib/auth/jwt';
import { prisma } from '@/lib/db/prisma';
import { generateUniqueShortId } from '@/lib/utils/short-id';

export async function POST(request: Request) {
    try {
        const { originalUrl } = await request.json();
        if (!originalUrl) {
            return NextResponse.json(
                { ok: false, error: { code: 'VALIDATION', message: 'URL is required' } },
                { status: 400 },
            );
        }

        try {
            new URL(originalUrl);
        } catch {
            return NextResponse.json(
                { ok: false, error: { code: 'VALIDATION', message: 'Invalid URL format' } },
                { status: 400 },
            );
        }

        let userId: string | null = null;
        const token = await getTokenFromCookies();
        if (token) {
            const payload = verifyToken(token);
            if (payload) userId = payload.userId;
        }

        // Generate a unique 5-character short code
        const shortCode = await generateUniqueShortId(async (val) => {
            const existing = await prisma.shortenedUrl.findUnique({
                where: { shortCode: val },
                select: { id: true },
            });
            return !!existing;
        });

        if (!shortCode) {
            return NextResponse.json(
                {
                    ok: false,
                    error: {
                        code: 'INTERNAL',
                        message: 'Failed to generate a unique short code',
                    },
                },
                { status: 500 },
            );
        }

        const url = await prisma.shortenedUrl.create({
            data: { shortCode, originalUrl, userId },
        });

        return NextResponse.json({
            ok: true,
            data: {
                id: url.id,
                shortCode: url.shortCode,
                shortUrl: `${process.env.NEXT_PUBLIC_APP_URL || ''}/s/${url.shortCode}`,
                originalUrl: url.originalUrl,
                createdAt: url.createdAt,
            },
        });
    } catch (error) {
        console.error('Shorten URL error:', error);
        return NextResponse.json(
            { ok: false, error: { code: 'INTERNAL', message: 'Internal server error' } },
            { status: 500 },
        );
    }
}
