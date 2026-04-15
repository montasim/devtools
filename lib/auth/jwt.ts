import jwt from 'jsonwebtoken';
import { NextRequest } from 'next/server';
import { cookies } from 'next/headers';
import { getUserById } from '@/lib/auth/repos/user.repo';

const JWT_SECRET = process.env.JWT_SECRET || 'default-secret-change-in-production';
const TOKEN_EXPIRY = '7d';

export interface JWTPayload {
    userId: string;
    email: string;
    iat?: number;
    exp?: number;
}

export function generateToken(
    payload: Omit<JWTPayload, 'iat' | 'exp'>,
    expiresIn: string = TOKEN_EXPIRY,
): string {
    return jwt.sign(payload, JWT_SECRET, { expiresIn } as jwt.SignOptions);
}

export function verifyToken(token: string): JWTPayload {
    try {
        const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload;
        return decoded;
    } catch (error) {
        if (error instanceof jwt.TokenExpiredError) {
            throw new Error('Token expired');
        } else if (error instanceof jwt.JsonWebTokenError) {
            throw new Error('Invalid token');
        }
        throw error;
    }
}

export async function getAuthUser(request?: NextRequest) {
    try {
        let token: string | undefined;

        if (request) {
            // Try to get token from Authorization header
            const authHeader = request.headers.get('authorization');
            if (authHeader && authHeader.startsWith('Bearer ')) {
                token = authHeader.substring(7);
            }
        }

        // If no token in header, try cookies
        if (!token) {
            const cookieStore = await cookies();
            token = cookieStore.get('auth-token')?.value;
        }

        if (!token) {
            return null;
        }

        const payload = verifyToken(token);
        const user = await getUserById(payload.userId);

        return user;
    } catch (error) {
        console.error('Error getting auth user:', error);
        return null;
    }
}
