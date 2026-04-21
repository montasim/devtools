import { NextResponse } from 'next/server';
import { getTokenFromCookies, verifyToken } from '@/lib/auth/jwt';
import { findUserById, verifyPassword, updateUserPassword } from '@/lib/auth/repos/user.repo';

export async function POST(request: Request) {
    try {
        const token = await getTokenFromCookies();
        if (!token) {
            return NextResponse.json(
                { ok: false, error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } },
                { status: 401 },
            );
        }

        const payload = verifyToken(token);
        if (!payload) {
            return NextResponse.json(
                { ok: false, error: { code: 'INVALID_TOKEN', message: 'Invalid token' } },
                { status: 401 },
            );
        }

        const { currentPassword, newPassword } = await request.json();
        if (!currentPassword || !newPassword) {
            return NextResponse.json(
                { ok: false, error: { code: 'VALIDATION', message: 'Both passwords required' } },
                { status: 400 },
            );
        }

        const user = await findUserById(payload.userId);
        if (!user) {
            return NextResponse.json(
                { ok: false, error: { code: 'USER_NOT_FOUND', message: 'User not found' } },
                { status: 404 },
            );
        }

        const valid = await verifyPassword(currentPassword, user.passwordHash);
        if (!valid) {
            return NextResponse.json(
                {
                    ok: false,
                    error: { code: 'INVALID_PASSWORD', message: 'Current password is incorrect' },
                },
                { status: 400 },
            );
        }

        await updateUserPassword(user.id, newPassword);

        return NextResponse.json({ ok: true });
    } catch (error) {
        console.error('Update password error:', error);
        return NextResponse.json(
            { ok: false, error: { code: 'INTERNAL', message: 'Internal server error' } },
            { status: 500 },
        );
    }
}
