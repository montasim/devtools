import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthUser } from '@/lib/auth/jwt';
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

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> },
) {
    try {
        console.log('🐛 [API /api/share/:id] DELETE request received');

        // Get authenticated user
        const user = await getAuthUser(request);
        if (!user) {
            console.log('🐛 [API] Unauthorized: No user found');
            return NextResponse.json(
                { error: 'UNAUTHORIZED', message: 'You must be logged in to delete shares' },
                { status: 401 },
            );
        }
        console.log('🐛 [API] User authenticated:', { userId: user.id, email: user.email });

        const { id } = await params;

        console.log('🐛 [API] Deleting share:', { shareId: id, userId: user.id });

        // Find the share and verify ownership
        const share = await prisma.sharedLink.findUnique({
            where: { id },
        });

        if (!share) {
            console.log('🐛 [API] Share not found:', { shareId: id });
            return NextResponse.json(
                { error: 'NOT_FOUND', message: 'Share not found' },
                { status: 404 },
            );
        }

        if (share.userId !== user.id) {
            console.log('🐛 [API] Unauthorized: User does not own this share', {
                shareUserId: share.userId,
                requestUserId: user.id,
            });
            return NextResponse.json(
                { error: 'FORBIDDEN', message: 'You can only delete your own shares' },
                { status: 403 },
            );
        }

        // Delete the share (cascade will delete related content)
        await prisma.sharedLink.delete({
            where: { id },
        });

        console.log('🐛 [API] Share deleted successfully:', { shareId: id });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('🐛 [API] Error deleting share:', {
            error,
            message: error instanceof Error ? error.message : 'Unknown error',
            stack: error instanceof Error ? error.stack : undefined,
        });
        return NextResponse.json(
            { error: 'INTERNAL_ERROR', message: 'Failed to delete share' },
            { status: 500 },
        );
    }
}
