import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth/jwt';
import { getUserById } from '@/lib/auth/repos/user.repo';

export async function GET(request: NextRequest) {
    try {
        // Get token from cookie
        const token = request.cookies.get('auth-token')?.value;

        if (!token) {
            return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
        }

        // Verify token
        let payload;
        try {
            payload = verifyToken(token);
        } catch (error) {
            return NextResponse.json({ error: 'Invalid or expired token' }, { status: 401 });
        }

        // Get user from database
        const user = await getUserById(payload.userId);
        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        // Return user data (excluding password hash)
        return NextResponse.json({
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                emailVerified: user.emailVerified,
            },
        });
    } catch (error) {
        console.error('Get current user error:', error);
        return NextResponse.json({ error: 'Failed to get user information' }, { status: 500 });
    }
}
