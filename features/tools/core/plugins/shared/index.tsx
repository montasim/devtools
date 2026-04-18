'use client';

import { Globe, Loader2, LogIn } from 'lucide-react';
import { useSharedLinks, useDeleteSharedLink } from './hooks/use-shared-links';
import { useSharedRestore } from './hooks/use-shared-restore';
import { SharedLinkCard } from './components/shared-link-card';
import { useClipboard } from '@/lib/hooks/use-clipboard';
import { EmptyStateCard } from '@/components/ui/empty-state-card';
import { useAuth } from '@/features/auth/hooks/use-auth';
import type { SharedTabConfig } from './types';
import type { PluginTabProps } from '../../types/tool';

export function createSharedTabPlugin(config: SharedTabConfig) {
    return function SharedTabPlugin({ onTabChange }: PluginTabProps) {
        const { isAuthenticated } = useAuth();
        const { data: items, isLoading } = useSharedLinks(config.pageName, config.queryKey);
        const deleteMutation = useDeleteSharedLink(config.queryKey);
        const { restoreItem } = useSharedRestore(config);
        const { copy } = useClipboard();

        const handleRestore = async (shareId: string) => {
            const tabId = await restoreItem(shareId);
            if (tabId) {
                onTabChange(tabId);
            }
        };

        const handleCopyUrl = (id: string) => {
            const baseUrl = window.location.origin;
            copy(`${baseUrl}/share/${config.pageName}/${id}`);
        };

        if (!isAuthenticated) {
            return (
                <EmptyStateCard
                    icon={LogIn}
                    title="Login required"
                    description="Sign in to view your shared links"
                    actionLabel="Login"
                    actionHref="/login"
                />
            );
        }

        if (isLoading) {
            return (
                <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
            );
        }

        if (!items || items.length === 0) {
            return (
                <EmptyStateCard
                    icon={Globe}
                    title="No shared links"
                    description="Share your work with others to see links here"
                />
            );
        }

        return (
            <div className="flex flex-col gap-3">
                {items.map((item) => (
                    <SharedLinkCard
                        key={item.id}
                        item={item}
                        config={config}
                        onRestore={handleRestore}
                        onDelete={(id) => deleteMutation.mutate(id)}
                        onCopyUrl={handleCopyUrl}
                    />
                ))}
            </div>
        );
    };
}
