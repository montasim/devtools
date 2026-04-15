import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth/jwt';
import { updateUser } from '@/lib/auth/repos/user.repo';
import { validateName } from '@/lib/auth/password-policy';

export async function POST(request: NextRequest) {
    try {
        const user = await getAuthUser(request);
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { name } = body;

        // Validate name
        if (!name || typeof name !== 'string') {
            return NextResponse.json({ error: 'Name is required' }, { status: 400 });
        }

        const nameValidation = validateName(name);
        if (!nameValidation.valid) {
            return NextResponse.json({ error: nameValidation.error }, { status: 400 });
        }

        // Update user name
        const updatedUser = await updateUser(user.id, { name });

        return NextResponse.json({
            success: true,
            user: {
                id: updatedUser.id,
                email: updatedUser.email,
                name: updatedUser.name,
                emailVerified: updatedUser.emailVerified,
            },
        });
    } catch (error) {
        console.error('Error updating name:', error);
        return NextResponse.json({ error: 'Failed to update name' }, { status: 500 });
    }
}
