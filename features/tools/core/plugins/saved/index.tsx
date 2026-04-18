'use client';

import { Bookmark, Loader2, LogIn } from 'lucide-react';
import { useSavedItems, useDeleteSavedItem } from './hooks/use-saved-items';
import { useSavedRestore } from './hooks/use-saved-restore';
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
        const { restoreItem } = useSavedRestore(config);

        const handleRestore = (item: SavedItemData) => {
            const tabId = restoreItem(item);
            if (tabId) {
                onTabChange(tabId);
            }
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
            <div className="flex flex-col gap-3">
                {items.map((item) => (
                    <SavedItemCard
                        key={item.id}
                        item={item}
                        config={config}
                        onRestore={handleRestore}
                        onDelete={(id) => deleteMutation.mutate(id)}
                    />
                ))}
            </div>
        );
    };
}
