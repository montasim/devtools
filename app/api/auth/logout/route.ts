import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
    try {
        // Create response and clear auth cookie
        const response = NextResponse.json({
            success: true,
            message: 'Logged out successfully',
        });

        response.cookies.set('auth-token', '', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 0, // Expire immediately
            path: '/',
        });

        return response;
    } catch (error) {
        console.error('Logout error:', error);
        return NextResponse.json({ error: 'Logout failed. Please try again.' }, { status: 500 });
    }
}
