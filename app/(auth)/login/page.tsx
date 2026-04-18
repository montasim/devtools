'use client';

import { LoginForm } from '@/features/auth/components/login-form';
import { useRedirectIfAuthenticated } from '@/features/auth/hooks/use-redirect-if-authenticated';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

export default function LoginPage() {
    const { isLoading } = useRedirectIfAuthenticated();
    const router = useRouter();

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-12">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
        );
    }

    return (
        <div className="mx-auto max-w-sm px-4 py-8 sm:py-12">
            <h1 className="mb-6 text-center text-2xl font-bold">Log In</h1>
            <LoginForm
                onSuccess={() => router.push('/')}
                onSwitchToSignup={() => router.push('/signup')}
            />
        </div>
    );
}
