'use client';

import { SignupForm } from '@/features/auth/components/signup-form';
import { useRedirectIfAuthenticated } from '@/features/auth/hooks/use-redirect-if-authenticated';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

export default function SignupPage() {
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
            <h1 className="mb-6 text-center text-2xl font-bold">Sign Up</h1>
            <SignupForm
                onSuccess={() => router.push('/')}
                onSwitchToLogin={() => router.push('/login')}
            />
        </div>
    );
}
