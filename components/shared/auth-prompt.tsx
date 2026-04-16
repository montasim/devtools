'use client';

import { useRouter } from 'next/navigation';
import { Lock } from 'lucide-react';
import { EmptyEditorPrompt } from '@/components/ui/empty-editor-prompt';

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
        <div className="border rounded-lg border-dashed px-4 py-8 sm:py-12">
            <EmptyEditorPrompt
                icon={Lock}
                title="Authentication Required"
                description={`Please login to access ${featureName}`}
                actionLabel="Login to Access"
                onAction={handleLoginClick}
                showActions={false}
                className="border-0 p-0"
                iconOpacity="opacity-60"
                titleOpacity="opacity-80"
                descriptionOpacity="opacity-70"
                buttonOpacity="opacity-100"
            />
        </div>
    );
}
