'use client';

import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';

export default function SettingsPage() {
    const { user, loading } = useAuth();
    const router = useRouter();

    if (loading) {
        return <div>Loading...</div>;
    }

    if (!user) {
        router.push('/login');
        return null;
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
            <div className="mx-auto px-4 sm:px-6 lg:px-8">
                <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
                    <h1 className="text-2xl font-bold mb-6">Settings</h1>
                    <p className="text-gray-600 dark:text-gray-400">Settings page coming soon...</p>
                </div>
            </div>
        </div>
    );
}
