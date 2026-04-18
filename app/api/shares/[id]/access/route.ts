import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import bcrypt from 'bcrypt';

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const { password } = await request.json();

        const link = await prisma.sharedLink.findUnique({
            where: { id },
            include: { content: true },
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

        if (link.passwordHash) {
            if (!password) {
                return NextResponse.json(
                    {
                        ok: false,
                        error: { code: 'PASSWORD_REQUIRED', message: 'Password required' },
                    },
                    { status: 401 },
                );
            }

            const valid = await bcrypt.compare(password, link.passwordHash);
            if (!valid) {
                return NextResponse.json(
                    {
                        ok: false,
                        error: { code: 'INVALID_PASSWORD', message: 'Incorrect password' },
                    },
                    { status: 401 },
                );
            }
        }

        await prisma.sharedLink.update({
            where: { id },
            data: { viewCount: { increment: 1 } },
        });

        return NextResponse.json({
            ok: true,
            data: {
                metadata: {
                    id: link.id,
                    pageName: link.pageName,
                    tabName: link.tabName,
                    title: link.title,
                    comment: link.comment,
                    expiresAt: link.expiresAt,
                    hasPassword: !!link.passwordHash,
                    viewCount: link.viewCount + 1,
                    createdAt: link.createdAt,
                },
                content: {
                    state: link.content?.state ?? {},
                },
            },
        });
    } catch (error) {
        console.error('Access share error:', error);
        return NextResponse.json(
            { ok: false, error: { code: 'INTERNAL', message: 'Internal server error' } },
            { status: 500 },
        );
    }
}
