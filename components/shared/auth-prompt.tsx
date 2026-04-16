'use client';

import { useRouter } from 'next/navigation';
import { Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';

interface AuthPromptProps {
    featureName: string;
    currentPath: string;
}

export function AuthPrompt({ featureName, currentPath }: AuthPromptProps) {
    const router = useRouter();
    const redirectUrl = `/login?redirect=${encodeURIComponent(currentPath)}`;

    const handleLoginClick = () => {
        router.push(redirectUrl);
    };

    return (
        <EmptyState icon={Lock} title="Authentication Required">
            <p className="text-sm text-muted-foreground mb-4">
                Please login to access {featureName}
            </p>
            <Button onClick={handleLoginClick}>Login to Access</Button>
        </EmptyState>
    );
}
