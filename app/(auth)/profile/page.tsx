'use client';

import { useRouter } from 'next/navigation';
import { useAuth } from '@/features/auth/hooks/use-auth';
import { EditableField } from '@/features/profile/components/editable-field';
import { PasswordSection } from '@/features/profile/components/password-section';
import { LogoutSection } from '@/features/profile/components/logout-section';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

export default function ProfilePage() {
    const { isLoading, isAuthenticated, user, updateName, updatePassword, logout } = useAuth();
    const router = useRouter();

    if (!isLoading && !isAuthenticated) {
        router.push('/login');
    }

    async function handleUpdateName(name: string) {
        const success = await updateName(name);
        if (success) {
            toast.success('Name updated successfully');
        } else {
            toast.error('Failed to update name');
            throw new Error('Failed');
        }
    }

    async function handleUpdatePassword(currentPassword: string, newPassword: string) {
        if (newPassword !== newPassword) {
            toast.error('Passwords do not match');
            throw new Error('Mismatch');
        }
        const success = await updatePassword(currentPassword, newPassword);
        if (success) {
            toast.success('Password updated successfully');
        } else {
            toast.error('Failed to update password');
            throw new Error('Failed');
        }
    }

    async function handleLogout() {
        try {
            await logout();
            toast.success('Logged out successfully');
            router.push('/');
        } catch {
            toast.error('Failed to logout');
        }
    }

    if (isLoading) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
        );
    }

    if (!isAuthenticated || !user) {
        return null;
    }

    return (
        <div className="min-h-screen py-12">
            <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8">
                <div className="rounded-lg border bg-background p-6 shadow-sm">
                    <h1 className="mb-6 text-2xl font-bold">Profile</h1>

                    <div className="space-y-6">
                        <EditableField label="Name" value={user.name} onSave={handleUpdateName} />

                        <div>
                            <label className="mb-2 block text-sm font-medium">Email</label>
                            <p className="text-sm">{user.email}</p>
                        </div>

                        <div>
                            <label className="mb-2 block text-sm font-medium">Email verified</label>
                            <p className="text-sm">{user.emailVerified ? 'Yes' : 'No'}</p>
                        </div>

                        <PasswordSection onSave={handleUpdatePassword} />
                    </div>

                    <LogoutSection onLogout={handleLogout} />
                </div>
            </div>
        </div>
    );
}
