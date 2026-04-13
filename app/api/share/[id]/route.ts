import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import type { ShareMetadata } from '@/lib/types/share';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;

        const sharedLink = await prisma.sharedLink.findUnique({
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

        if (!sharedLink) {
            return NextResponse.json(
                { error: 'NOT_FOUND', message: 'Share link not found' },
                { status: 404 },
            );
        }

        const response: ShareMetadata = {
            id: sharedLink.id,
            pageName: sharedLink.pageName,
            tabName: sharedLink.tabName,
            title: sharedLink.title,
            comment: sharedLink.comment,
            expiresAt: sharedLink.expiresAt?.toISOString() || null,
            hasPassword: !!sharedLink.passwordHash,
            viewCount: sharedLink.viewCount,
            createdAt: sharedLink.createdAt.toISOString(),
        };

        return NextResponse.json(response);
    } catch (error) {
        console.error('Error fetching share metadata:', error);
        return NextResponse.json(
            { error: 'NOT_FOUND', message: 'Failed to fetch share link' },
            { status: 500 },
        );
    }
}
