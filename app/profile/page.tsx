'use client';

import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';

export default function ProfilePage() {
    const { user, loading, logout } = useAuth();
    const router = useRouter();

    if (loading) {
        return <div>Loading...</div>;
    }

    if (!user) {
        router.push('/login');
        return null;
    }

    return (
        <div className="min-h-screen py-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
                    <h1 className="text-3xl font-bold mb-6">Profile</h1>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                Name
                            </label>
                            <p className="mt-1 text-sm text-gray-900 dark:text-gray-100">
                                {user.name}
                            </p>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                Email
                            </label>
                            <p className="mt-1 text-sm text-gray-900 dark:text-gray-100">
                                {user.email}
                            </p>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                Email verified
                            </label>
                            <p className="mt-1 text-sm text-gray-900 dark:text-gray-100">
                                {user.emailVerified ? 'Yes' : 'No'}
                            </p>
                        </div>
                    </div>
                    <div className="mt-6">
                        <Button onClick={() => logout()}>Logout</Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
