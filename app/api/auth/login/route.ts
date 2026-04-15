import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import bcrypt from 'bcrypt';
import { getUserByEmail } from '@/lib/auth/repos/user.repo';
import { generateToken } from '@/lib/auth/jwt';
import { checkRateLimit } from '@/lib/rate-limit';
import { authConfig } from '@/lib/config/auth';

// Request validation schema
const loginSchema = z.object({
    email: z.string().email('Invalid email format'),
    password: z.string().min(1, 'Password is required'),
});

export async function POST(request: NextRequest) {
    try {
        // Parse request body
        const body = await request.json();

        // Validate request format
        const validation = loginSchema.safeParse(body);
        if (!validation.success) {
            return NextResponse.json(
                { error: validation.error.issues[0].message },
                { status: 400 },
            );
        }

        const { email, password } = validation.data;

        // Check rate limit (5 login attempts per 15 minutes per IP)
        const ip = request.headers.get('x-forwarded-for') || 'unknown';
        const rateLimitResult = await checkRateLimit(ip, 'login_attempt');

        if (!rateLimitResult.success) {
            return NextResponse.json(
                { error: 'Too many login attempts. Please try again later.' },
                { status: 429 },
            );
        }

        // Get user by email
        const user = await getUserByEmail(email);
        if (!user) {
            // Use generic error message to prevent user enumeration
            return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
        }

        // Verify password using bcrypt compare
        const isValid = await bcrypt.compare(password, user.passwordHash);
        if (!isValid) {
            return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
        }

        // Generate JWT token
        const token = generateToken({
            userId: user.id,
            email: user.email,
        });

        // Set HTTP-only cookie
        const response = NextResponse.json({
            success: true,
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
            },
        });

        response.cookies.set('auth-token', token, {
            httpOnly: true,
            secure: authConfig.secureCookies,
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60, // 7 days
            path: '/',
            domain: authConfig.cookieDomain,
        });

        return response;
    } catch (error) {
        console.error('Login error:', error);
        return NextResponse.json({ error: 'Login failed. Please try again.' }, { status: 500 });
    }
}
