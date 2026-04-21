'use client';

import { Bookmark, Loader2, LogIn, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useSavedItems, useDeleteSavedItem } from './hooks/use-saved-items';
import { useClearAllSavedItems } from './hooks/use-clear-all-saved-items';
import { useSavedRestore } from './hooks/use-saved-restore';
import { useClipboard } from '@/lib/hooks/use-clipboard';
import { useConfirmAction } from '@/hooks/use-confirm-action';
import { SavedItemCard } from './components/saved-item-card';
import { EmptyStateCard } from '@/components/ui/empty-state-card';
import { useAuth } from '@/features/auth/hooks/use-auth';
import type { SavedTabConfig, SavedItemData } from './types';
import type { PluginTabProps } from '../../types/tool';

export function createSavedTabPlugin(config: SavedTabConfig) {
    return function SavedTabPlugin({ onTabChange }: PluginTabProps) {
        const { isAuthenticated } = useAuth();
        const { data: items, isLoading } = useSavedItems(config.pageName, config.queryKey);
        const deleteMutation = useDeleteSavedItem(config.queryKey);
        const clearAllMutation = useClearAllSavedItems(config.queryKey, config.pageName);
        const { restoreItem } = useSavedRestore(config);
        const { copy } = useClipboard();
        const { confirm, dialog } = useConfirmAction();

        const handleRestore = (item: SavedItemData) => {
            const tabId = restoreItem(item);
            if (tabId) {
                onTabChange(tabId);
            }
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
                    description="Sign in to save and access your work from any device"
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
                    icon={Bookmark}
                    title="No saved items"
                    description="Save your work to access it later from any device"
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
                                    title: 'Clear All Saved Items',
                                    description:
                                        'This will permanently delete all your saved items. This action cannot be undone.',
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
                        <SavedItemCard
                            key={item.id}
                            item={item}
                            config={config}
                            onRestore={handleRestore}
                            onDelete={(id) => deleteMutation.mutate(id)}
                            onCopy={(content) => copy(content)}
                        />
                    ))}
                </div>
                {dialog}
            </div>
        );
    };
}
