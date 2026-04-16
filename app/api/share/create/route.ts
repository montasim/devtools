import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { hashPassword } from '@/lib/crypto';
import {
    validateState,
    sanitizeTitle,
    sanitizeComment,
    calculateExpiration,
} from '@/lib/validation';
import { checkRateLimit, getClientIp } from '@/lib/rate-limit';
import { getAuthUser } from '@/lib/auth/jwt';
import type { CreateShareResponse } from '@/lib/types/share';

export async function POST(request: NextRequest) {
    try {
        console.log('🐛 [API /api/share/create] Request received');

        // Get authenticated user (optional)
        const user = await getAuthUser(request);
        if (user) {
            console.log('🐛 [API] User authenticated:', { userId: user.id, email: user.email });
        } else {
            console.log('🐛 [API] No user authenticated - creating anonymous share');
        }

        // Rate limiting
        const ip = getClientIp(request);
        const rateLimit = checkRateLimit(ip, 'create');
        if (!rateLimit.allowed) {
            console.log('🐛 [API] Rate limited:', { ip, resetAt: rateLimit.resetAt });
            return NextResponse.json(
                {
                    error: 'RATE_LIMITED',
                    message: 'Too many share links created. Try again later.',
                    retryAfter: rateLimit.resetAt
                        ? Math.ceil((rateLimit.resetAt - Date.now()) / 1000)
                        : undefined,
                },
                { status: 429 },
            );
        }

        const body = await request.json();
        const { pageName, tabName, title, comment, state, expiration, password } = body;

        console.log('🐛 [API] Request body parsed:', {
            pageName,
            tabName,
            title,
            hasComment: !!comment,
            hasPassword: !!password,
            expiration,
            stateKeys: Object.keys(state || {}),
            stateSize: JSON.stringify(state).length,
        });

        // Validate required fields
        if (!pageName || !tabName || !title || !state) {
            console.log('🐛 [API] Missing required fields:', {
                hasPageName: !!pageName,
                hasTabName: !!tabName,
                hasTitle: !!title,
                hasState: !!state,
            });
            return NextResponse.json(
                { error: 'INVALID_STATE', message: 'Missing required fields' },
                { status: 400 },
            );
        }

        // Validate state size
        const validation = validateState(state);
        if (!validation.valid) {
            console.log('🐛 [API] State validation failed:', {
                valid: validation.valid,
                error: validation.error,
            });
            return NextResponse.json(
                { error: validation.error || 'INVALID_STATE', message: 'State validation failed' },
                { status: 400 },
            );
        }
        console.log('🐛 [API] State validation passed');

        // Hash password if provided
        let passwordHash: string | null = null;
        if (password) {
            console.log('🐛 [API] Hashing password');
            passwordHash = await hashPassword(password);
        }

        // Calculate expiration
        const expiresAt = calculateExpiration(expiration);
        console.log('🐛 [API] Expiration calculated:', {
            expiration,
            expiresAt: expiresAt?.toISOString(),
        });

        // Create shared link
        console.log('🐛 [API] Creating shared link in database...');

        // Build data object - conditionally include user relation only if authenticated
        const createData: Record<string, unknown> = {
            pageName,
            tabName,
            title: sanitizeTitle(title),
            comment: comment ? sanitizeComment(comment) : null,
            expiresAt,
            passwordHash,
            content: {
                create: {
                    state,
                },
            },
        };

        // Only include user relation if authenticated
        if (user) {
            createData.user = {
                connect: {
                    id: user.id,
                },
            };
        }

        const sharedLink = await prisma.sharedLink.create({
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            data: createData as any, // Type assertion needed for conditional user relation
            include: {
                content: true,
            },
        });
        console.log('🐛 [API] Shared link created:', {
            id: sharedLink.id,
            contentId: sharedLink.content?.id,
        });

        // Construct response
        const baseUrl = process.env.NEXT_PUBLIC_APP_URL || request.nextUrl.origin;
        // Share pages use /share/{type}/{id} format, others use /{pageName}/{id}
        const shortUrl =
            pageName === 'share'
                ? `/${pageName}/${tabName}/${sharedLink.id}`
                : `/${pageName}/${sharedLink.id}`;
        const fullUrl = `${baseUrl}${shortUrl}`;

        const response: CreateShareResponse = {
            id: sharedLink.id,
            shortUrl,
            fullUrl,
            expiresAt: sharedLink.expiresAt?.toISOString() || null,
            hasPassword: !!passwordHash,
        };

        console.log('🐛 [API] Sending response:', {
            id: response.id,
            shortUrl: response.shortUrl,
            fullUrl: response.fullUrl,
        });

        return NextResponse.json(response, { status: 201 });
    } catch (error) {
        console.error('🐛 [API] Error creating share:', {
            error,
            message: error instanceof Error ? error.message : 'Unknown error',
            stack: error instanceof Error ? error.stack : undefined,
        });
        return NextResponse.json(
            { error: 'INVALID_STATE', message: 'Failed to create share link' },
            { status: 500 },
        );
    }
}
