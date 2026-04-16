import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthUser } from '@/lib/auth/jwt';

export async function GET(request: NextRequest) {
    try {
        // Get authenticated user
        const user = await getAuthUser(request);
        if (!user) {
            return NextResponse.json(
                {
                    error: 'UNAUTHORIZED',
                    message: 'You must be logged in to view your saved items',
                },
                { status: 401 },
            );
        }

        const { searchParams } = new URL(request.url);
        const pageName = searchParams.get('pageName');

        // Find saved items for this user
        const whereClause: Record<string, unknown> = {
            userId: user.id,
        };

        if (pageName) {
            whereClause.pageName = pageName;
        }

        const savedItems = await prisma.savedItem.findMany({
            where: whereClause,
            orderBy: {
                createdAt: 'desc',
            },
        });

        // Format response
        const response = savedItems.map((item) => ({
            id: item.id,
            pageName: item.pageName,
            tabName: item.tabName,
            name: item.name,
            content: item.content as Record<string, unknown>,
            createdAt: item.createdAt.getTime(),
            updatedAt: item.updatedAt.getTime(),
        }));

        return NextResponse.json(response);
    } catch (error) {
        console.error('Error fetching saved items:', error);
        return NextResponse.json(
            { error: 'INTERNAL_ERROR', message: 'Failed to fetch saved items' },
            { status: 500 },
        );
    }
}
