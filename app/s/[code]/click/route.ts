import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';

export async function GET(_request: Request, { params }: { params: Promise<{ code: string }> }) {
    try {
        const { code } = await params;
        const url = await prisma.shortenedUrl.findUnique({
            where: { shortCode: code },
        });

        if (!url) {
            return NextResponse.json(
                { ok: false, error: { code: 'NOT_FOUND', message: 'URL not found' } },
                { status: 404 },
            );
        }

        await prisma.shortenedUrl.update({
            where: { id: url.id },
            data: { clicks: { increment: 1 } },
        });

        return NextResponse.json({ ok: true });
    } catch (error) {
        console.error('Click tracking error:', error);
        return NextResponse.json(
            { ok: false, error: { code: 'INTERNAL', message: 'Internal server error' } },
            { status: 500 },
        );
    }
}
