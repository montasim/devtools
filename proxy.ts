import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const PROTECTED_PATHS = ['/profile', '/settings'];

export function proxy(request: NextRequest) {
    const token = request.cookies.get('auth-token');
    const { pathname } = request.nextUrl;

    for (const path of PROTECTED_PATHS) {
        if (pathname.startsWith(path) && !token) {
            const loginUrl = new URL('/login', request.url);
            loginUrl.searchParams.set('callbackUrl', pathname);
            return NextResponse.redirect(loginUrl);
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/profile/:path*', '/settings/:path*'],
};
