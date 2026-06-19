import { auth } from './better-auth';
import { headers } from 'next/headers';

export interface JwtPayload {
    userId: string;
    email: string;
}

export function signToken(payload: JwtPayload): string {
    return '';
}

export async function verifyToken(token: string): Promise<JwtPayload | null> {
    try {
        const session = await auth.api.getSession({
            headers: await headers(),
        });
        if (!session) return null;
        return {
            userId: session.user.id,
            email: session.user.email,
        };
    } catch (error) {
        console.error('verifyToken error:', error);
        return null;
    }
}

export async function getTokenFromCookies(): Promise<string | undefined> {
    try {
        const session = await auth.api.getSession({
            headers: await headers(),
        });
        return session ? 'better-auth-session' : undefined;
    } catch {
        return undefined;
    }
}

export async function setAuthCookie(token: string) {}
export async function clearAuthCookie() {}
