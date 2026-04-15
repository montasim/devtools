'use client';

import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { FormField } from '@/components/auth/form-field';
import { useLogoutConfirmDialog } from '@/components/auth/logout-confirm-dialog';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

export default function ProfilePage() {
    const { user, loading, logout, refreshUser } = useAuth();
    const router = useRouter();
    const { LogoutButton } = useLogoutConfirmDialog({
        onConfirm: async () => {
            try {
                await logout();
                toast.success('Logged out successfully');
                router.push('/');
            } catch (error) {
                toast.error(error instanceof Error ? error.message : 'Failed to logout');
            }
        },
    });

    const [nameLoading, setNameLoading] = useState(false);
    const [passwordLoading, setPasswordLoading] = useState(false);
    const [isEditingName, setIsEditingName] = useState(false);
    const [isChangingPassword, setIsChangingPassword] = useState(false);

    const [name, setName] = useState(user?.name || '');
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-lg">Loading...</div>
            </div>
        );
    }

    if (!user) {
        router.push('/login');
        return null;
    }

    async function handleUpdateName(e: React.FormEvent) {
        e.preventDefault();
        setNameLoading(true);

        try {
            const res = await fetch('/api/auth/update-name', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || 'Failed to update name');
            }

            toast.success('Name updated successfully');
            await refreshUser();
            setIsEditingName(false);
        } catch (error) {
            toast.error(error instanceof Error ? error.message : 'Failed to update name');
        } finally {
            setNameLoading(false);
        }
    }

    async function handleUpdatePassword(e: React.FormEvent) {
        e.preventDefault();

        if (newPassword !== confirmPassword) {
            toast.error('Passwords do not match');
            return;
        }

        setPasswordLoading(true);

        try {
            const res = await fetch('/api/auth/update-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    currentPassword,
                    newPassword,
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || 'Failed to update password');
            }

            toast.success('Password updated successfully');
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
            setIsChangingPassword(false);
        } catch (error) {
            toast.error(error instanceof Error ? error.message : 'Failed to update password');
        } finally {
            setPasswordLoading(false);
        }
    }

    return (
        <div className="min-h-screen py-12">
            <div className="mx-auto px-4 sm:px-6 lg:px-8">
                <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
                    <h1 className="text-2xl font-bold mb-6">Profile</h1>

                    <div className="space-y-6">
                        {/* Name Section */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Name
                            </label>
                            {!isEditingName ? (
                                <div className="flex items-center gap-3">
                                    <p className="text-sm text-gray-900 dark:text-gray-100">
                                        {user.name}
                                    </p>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => {
                                            setIsEditingName(true);
                                            setName(user.name);
                                        }}
                                    >
                                        Edit
                                    </Button>
                                </div>
                            ) : (
                                <form onSubmit={handleUpdateName} className="space-y-3">
                                    <Input
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        placeholder="Your name"
                                        className="max-w-md"
                                    />
                                    <div className="flex gap-2">
                                        <Button type="submit" disabled={nameLoading} size="sm">
                                            {nameLoading ? 'Saving...' : 'Save'}
                                        </Button>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={() => {
                                                setIsEditingName(false);
                                                setName(user.name);
                                            }}
                                            size="sm"
                                        >
                                            Cancel
                                        </Button>
                                    </div>
                                </form>
                            )}
                        </div>

                        {/* Email Section */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Email
                            </label>
                            <p className="text-sm text-gray-900 dark:text-gray-100">{user.email}</p>
                        </div>

                        {/* Email Verified Section */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Email verified
                            </label>
                            <p className="text-sm text-gray-900 dark:text-gray-100">
                                {user.emailVerified ? 'Yes' : 'No'}
                            </p>
                        </div>

                        {/* Password Section */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Password
                            </label>
                            {!isChangingPassword ? (
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setIsChangingPassword(true)}
                                >
                                    Change password
                                </Button>
                            ) : (
                                <form
                                    onSubmit={handleUpdatePassword}
                                    className="space-y-4 max-w-md"
                                >
                                    <FormField
                                        id="current-password"
                                        label="Current password"
                                        type="password"
                                        value={currentPassword}
                                        onChange={setCurrentPassword}
                                        placeholder="••••••••"
                                        required
                                    />
                                    <FormField
                                        id="new-password"
                                        label="New password"
                                        type="password"
                                        value={newPassword}
                                        onChange={setNewPassword}
                                        placeholder="••••••••"
                                        required
                                    />
                                    <FormField
                                        id="confirm-password"
                                        label="Confirm new password"
                                        type="password"
                                        value={confirmPassword}
                                        onChange={setConfirmPassword}
                                        placeholder="••••••••"
                                        required
                                    />
                                    <div className="flex gap-2">
                                        <Button type="submit" disabled={passwordLoading} size="sm">
                                            {passwordLoading ? 'Updating...' : 'Update password'}
                                        </Button>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={() => {
                                                setIsChangingPassword(false);
                                                setCurrentPassword('');
                                                setNewPassword('');
                                                setConfirmPassword('');
                                            }}
                                            size="sm"
                                        >
                                            Cancel
                                        </Button>
                                    </div>
                                </form>
                            )}
                        </div>
                    </div>

                    <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
                        <LogoutButton variant="destructive">Logout</LogoutButton>
                    </div>
                </div>
            </div>
        </div>
    );
}
