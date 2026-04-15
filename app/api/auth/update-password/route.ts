import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth/jwt';
import { getUserByEmail, updateUserPassword } from '@/lib/auth/repos/user.repo';
import { verifyPassword } from '@/lib/crypto';
import { hashPassword } from '@/lib/crypto';
import { validatePassword } from '@/lib/auth/password-policy';

export async function POST(request: NextRequest) {
    try {
        const user = await getAuthUser(request);
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { currentPassword, newPassword } = body;

        // Validate inputs
        if (!currentPassword || !newPassword) {
            return NextResponse.json(
                { error: 'Current password and new password are required' },
                { status: 400 },
            );
        }

        // Validate new password
        const passwordValidation = validatePassword(newPassword);
        if (!passwordValidation.valid) {
            return NextResponse.json({ error: passwordValidation.error }, { status: 400 });
        }

        // Get user with password hash
        const userWithPassword = await getUserByEmail(user.email);
        if (!userWithPassword || !userWithPassword.passwordHash) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        // Verify current password
        const isPasswordValid = await verifyPassword(
            currentPassword,
            userWithPassword.passwordHash,
        );
        if (!isPasswordValid) {
            return NextResponse.json({ error: 'Current password is incorrect' }, { status: 400 });
        }

        // Hash new password
        const newPasswordHash = await hashPassword(newPassword);

        // Update password
        await updateUserPassword(user.id, newPasswordHash);

        return NextResponse.json({
            success: true,
            message: 'Password updated successfully',
        });
    } catch (error) {
        console.error('Error updating password:', error);
        return NextResponse.json({ error: 'Failed to update password' }, { status: 500 });
    }
}
