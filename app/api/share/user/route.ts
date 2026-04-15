import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthUser } from '@/lib/auth/jwt';

export async function GET(request: NextRequest) {
    try {
        console.log('🐛 [API /api/share/user] Request received');

        // Get authenticated user
        const user = await getAuthUser(request);
        if (!user) {
            console.log('🐛 [API] Unauthorized: No user found');
            return NextResponse.json(
                { error: 'UNAUTHORIZED', message: 'You must be logged in to view your shares' },
                { status: 401 },
            );
        }
        console.log('🐛 [API] User authenticated:', { userId: user.id, email: user.email });

        // Get URL parameters
        const { searchParams } = new URL(request.url);
        const pageName = searchParams.get('pageName');

        console.log('🐛 [API] Fetching shares for user:', {
            userId: user.id,
            pageName,
        });

        // Build where clause
        const where: { userId: string; pageName?: string } = {
            userId: user.id,
        };

        if (pageName) {
            where.pageName = pageName;
        }

        // Get user's shares
        const shares = await prisma.sharedLink.findMany({
            where,
            include: {
                content: true,
            },
            orderBy: {
                createdAt: 'desc',
            },
        });

        console.log('🐛 [API] Found shares:', {
            count: shares.length,
            pageName,
        });

        // Format response
        const formattedShares = shares.map((share) => ({
            id: share.id,
            shareId: share.id,
            url: `${process.env.NEXT_PUBLIC_APP_URL || request.nextUrl.origin}/${share.pageName}/${share.id}`,
            title: share.title,
            comment: share.comment,
            tab: share.tabName,
            content: share.content?.state || {},
            createdAt: share.createdAt.getTime(),
            expiresAt: share.expiresAt?.getTime() || null,
            viewCount: share.viewCount,
            hasPassword: !!share.passwordHash,
        }));

        return NextResponse.json(formattedShares);
    } catch (error) {
        console.error('🐛 [API] Error fetching user shares:', {
            error,
            message: error instanceof Error ? error.message : 'Unknown error',
            stack: error instanceof Error ? error.stack : undefined,
        });
        return NextResponse.json(
            { error: 'INTERNAL_ERROR', message: 'Failed to fetch shares' },
            { status: 500 },
        );
    }
}
