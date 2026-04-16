import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthUser } from '@/lib/auth/jwt';

export async function POST(request: NextRequest) {
    try {
        console.log('🐛 [API /api/saved/create] Request received');

        // Get authenticated user (optional)
        const user = await getAuthUser(request);
        if (user) {
            console.log('🐛 [API] User authenticated:', { userId: user.id, email: user.email });
        } else {
            console.log('🐛 [API] No user authenticated - creating anonymous save');
        }

        const body = await request.json();
        const { pageName, tabName, name, content } = body;

        console.log('🐛 [API] Request body parsed:', {
            pageName,
            tabName,
            name,
            contentKeys: Object.keys(content || {}),
            contentSize: JSON.stringify(content).length,
        });

        // Validate required fields
        if (!pageName || !tabName || !name || !content) {
            console.log('🐛 [API] Missing required fields:', {
                hasPageName: !!pageName,
                hasTabName: !!tabName,
                hasName: !!name,
                hasContent: !!content,
            });
            return NextResponse.json(
                { error: 'INVALID_INPUT', message: 'Missing required fields' },
                { status: 400 },
            );
        }

        // Validate content size (same limits as sharing)
        const MAX_STATE_SIZE = 5 * 1024 * 1024; // 5MB
        const contentSize = JSON.stringify(content).length;
        if (contentSize > MAX_STATE_SIZE) {
            console.log('🐛 [API] Content too large:', {
                size: contentSize,
                limit: MAX_STATE_SIZE,
            });
            return NextResponse.json(
                { error: 'CONTENT_TOO_LARGE', message: 'Content exceeds size limit' },
                { status: 400 },
            );
        }

        // Create saved item
        console.log('🐛 [API] Creating saved item in database...');

        // Build data object - conditionally include user relation only if authenticated
        const createData: Record<string, unknown> = {
            pageName,
            tabName,
            name: name.trim().slice(0, 200), // Limit name length
            content,
        };

        // Only include user relation if authenticated
        if (user) {
            createData.user = {
                connect: {
                    id: user.id,
                },
            };
        }

        const savedItem = await prisma.savedItem.create({
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            data: createData as any, // Type assertion needed for conditional user relation
        });

        console.log('🐛 [API] Saved item created:', { id: savedItem.id });

        const response = {
            id: savedItem.id,
            name: savedItem.name,
            createdAt: savedItem.createdAt.toISOString(),
        };

        console.log('🐛 [API] Sending response:', response);

        return NextResponse.json(response, { status: 201 });
    } catch (error) {
        console.error('🐛 [API] Error creating saved item:', {
            error,
            message: error instanceof Error ? error.message : 'Unknown error',
            stack: error instanceof Error ? error.stack : undefined,
        });
        return NextResponse.json(
            { error: 'INTERNAL_ERROR', message: 'Failed to create saved item' },
            { status: 500 },
        );
    }
}
