import jwt from 'jsonwebtoken';

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
    return jwt.sign(payload, JWT_SECRET, { expiresIn });
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
