import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth/jwt';

export function proxy(request: NextRequest) {
    // Protected routes
    const protectedPaths = ['/profile', '/settings'];
    const isProtectedRoute = protectedPaths.some((path) =>
        request.nextUrl.pathname.startsWith(path),
    );

    if (isProtectedRoute) {
        const token = request.cookies.get('auth-token')?.value;

        if (!token) {
            const loginUrl = new URL('/login', request.url);
            loginUrl.searchParams.set('redirect', request.nextUrl.pathname);
            return NextResponse.redirect(loginUrl);
        }

        try {
            verifyToken(token);
            return NextResponse.next();
        } catch (error) {
            const loginUrl = new URL('/login', request.url);
            loginUrl.searchParams.set('error', 'invalid_token');
            return NextResponse.redirect(loginUrl);
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/profile/:path*', '/settings/:path*'],
};
