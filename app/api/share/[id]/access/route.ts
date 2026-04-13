import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyPassword } from '@/lib/crypto';
import { checkRateLimit, getClientIp } from '@/lib/rate-limit';
import type { ShareAccessResponse } from '@/lib/types/share';

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const body = await request.json();
        const { password } = body;

        // Rate limiting
        const ip = getClientIp(request);
        const rateLimit = checkRateLimit(ip, 'access');
        if (!rateLimit.allowed) {
            return NextResponse.json(
                {
                    error: 'RATE_LIMITED',
                    message: 'Too many requests. Try again later.',
                    retryAfter: rateLimit.resetAt
                        ? Math.ceil((rateLimit.resetAt - Date.now()) / 1000)
                        : undefined,
                },
                { status: 429 },
            );
        }

        // Fetch shared link with content
        const sharedLink = await prisma.sharedLink.findUnique({
            where: { id },
            include: {
                content: true,
            },
        });

        if (!sharedLink) {
            return NextResponse.json(
                { error: 'NOT_FOUND', message: 'Share link not found' },
                { status: 404 },
            );
        }

        // Check expiration
        if (sharedLink.expiresAt && new Date() > sharedLink.expiresAt) {
            return NextResponse.json(
                { error: 'LINK_EXPIRED', message: 'This share link has expired' },
                { status: 410 },
            );
        }

        // Check password
        if (sharedLink.passwordHash) {
            if (!password) {
                return NextResponse.json(
                    { error: 'PASSWORD_REQUIRED', message: 'A password is required' },
                    { status: 400 },
                );
            }

            const isValid = await verifyPassword(password, sharedLink.passwordHash);
            if (!isValid) {
                return NextResponse.json(
                    { error: 'INVALID_PASSWORD', message: 'Incorrect password' },
                    { status: 401 },
                );
            }
        }

        // Increment view count
        await prisma.sharedLink.update({
            where: { id },
            data: { viewCount: { increment: 1 } },
        });

        // Construct response
        const response: ShareAccessResponse = {
            state: sharedLink.content?.state || {},
            linkId: sharedLink.id,
            pageName: sharedLink.pageName,
            tabName: sharedLink.tabName,
            title: sharedLink.title,
            comment: sharedLink.comment,
            expiresAt: sharedLink.expiresAt?.toISOString() || null,
            hasPassword: !!sharedLink.passwordHash,
            viewCount: sharedLink.viewCount + 1,
        };

        return NextResponse.json(response);
    } catch (error) {
        console.error('Error accessing share:', error);
        return NextResponse.json(
            { error: 'INVALID_STATE', message: 'Failed to access shared content' },
            { status: 500 },
        );
    }
}
