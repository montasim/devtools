'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { EmptyEditorPrompt } from '@/components/ui/empty-editor-prompt';

interface EmptyStateCardProps {
    icon?: React.ComponentType<{ className?: string }>;
    title?: string;
    description?: string;
    showActions?: boolean;
    actionLabel?: string;
    actionHref?: string;
}

export function EmptyStateCard({
    icon,
    title = 'No data available',
    description = '',
    showActions = false,
    actionLabel,
    actionHref,
}: EmptyStateCardProps) {
    return (
        <div className="mt-8 flex min-h-[300px] flex-col items-center justify-center rounded-lg border border-dashed md:min-h-[400px]">
            <EmptyEditorPrompt
                icon={icon}
                title={title}
                description={description}
                showActions={showActions}
            />
            {actionLabel && actionHref && (
                <Button asChild className="mt-[-10px]">
                    <Link href={actionHref}>{actionLabel}</Link>
                </Button>
            )}
        </div>
    );
}
