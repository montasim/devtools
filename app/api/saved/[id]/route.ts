import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthUser } from '@/lib/auth/jwt';

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> },
) {
    try {
        console.log('🐛 [API /api/saved/:id] DELETE request received');

        // Get authenticated user
        const user = await getAuthUser(request);
        if (!user) {
            console.log('🐛 [API] Unauthorized: No user found');
            return NextResponse.json(
                { error: 'UNAUTHORIZED', message: 'You must be logged in to delete saved items' },
                { status: 401 },
            );
        }
        console.log('🐛 [API] User authenticated:', { userId: user.id, email: user.email });

        const { id } = await params;

        console.log('🐛 [API] Deleting saved item:', { savedItemId: id, userId: user.id });

        // Find the saved item and verify ownership
        const savedItem = await prisma.savedItem.findUnique({
            where: { id },
        });

        if (!savedItem) {
            console.log('🐛 [API] Saved item not found:', { savedItemId: id });
            return NextResponse.json(
                { error: 'NOT_FOUND', message: 'Saved item not found' },
                { status: 404 },
            );
        }

        if (savedItem.userId !== user.id) {
            console.log('🐛 [API] Unauthorized: User does not own this saved item', {
                savedItemUserId: savedItem.userId,
                requestUserId: user.id,
            });
            return NextResponse.json(
                { error: 'FORBIDDEN', message: 'You can only delete your own saved items' },
                { status: 403 },
            );
        }

        // Delete the saved item
        await prisma.savedItem.delete({
            where: { id },
        });

        console.log('🐛 [API] Saved item deleted successfully:', { savedItemId: id });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('🐛 [API] Error deleting saved item:', {
            error,
            message: error instanceof Error ? error.message : 'Unknown error',
            stack: error instanceof Error ? error.stack : undefined,
        });
        return NextResponse.json(
            { error: 'INTERNAL_ERROR', message: 'Failed to delete saved item' },
            { status: 500 },
        );
    }
}
