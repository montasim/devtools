'use client';

import { Globe, Loader2, LogIn, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useSharedLinks, useDeleteSharedLink } from './hooks/use-shared-links';
import { useClearAllSharedLinks } from './hooks/use-clear-all-shared-links';
import { useSharedRestore } from './hooks/use-shared-restore';
import { useClipboard } from '@/lib/hooks/use-clipboard';
import { useConfirmAction } from '@/hooks/use-confirm-action';
import { SharedLinkCard } from './components/shared-link-card';
import { EmptyStateCard } from '@/components/ui/empty-state-card';
import { useAuth } from '@/features/auth/hooks/use-auth';
import type { SharedTabConfig } from './types';
import type { PluginTabProps } from '../../types/tool';

export function createSharedTabPlugin(config: SharedTabConfig) {
    return function SharedTabPlugin({ onTabChange }: PluginTabProps) {
        const { isAuthenticated } = useAuth();
        const { data: items, isLoading } = useSharedLinks(config.pageName, config.queryKey);
        const deleteMutation = useDeleteSharedLink(config.queryKey);
        const clearAllMutation = useClearAllSharedLinks(config.queryKey, config.pageName);
        const { restoreItem } = useSharedRestore(config);
        const { copy } = useClipboard();
        const { confirm, dialog } = useConfirmAction();

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

        const handleClearAll = () => {
            if (!items) return;
            clearAllMutation.mutate(items.map((item) => item.id));
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
            <div className="flex flex-col gap-2 mt-2">
                {items.length > 0 && (
                    <div className="flex justify-end">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                                confirm(handleClearAll, {
                                    title: 'Clear All Shared Links',
                                    description:
                                        'This will permanently delete all your shared links. Anyone with the links will lose access. This action cannot be undone.',
                                    confirmLabel: 'Clear All',
                                    variant: 'destructive',
                                })
                            }
                            className="flex items-center gap-1.5 bg-destructive/10 text-destructive hover:bg-destructive/20"
                        >
                            <Trash2 className="h-4 w-4" />
                            Clear All
                        </Button>
                    </div>
                )}
                <div className="flex flex-col gap-3">
                    {items.map((item) => (
                        <SharedLinkCard
                            key={item.id}
                            item={item}
                            config={config}
                            onRestore={handleRestore}
                            onDelete={(id) => deleteMutation.mutate(id)}
                            onCopyUrl={handleCopyUrl}
                            onCopyContent={(content) => copy(content)}
                        />
                    ))}
                </div>
                {dialog}
            </div>
        );
    };
}
