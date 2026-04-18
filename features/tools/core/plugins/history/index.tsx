'use client';

import { Clock, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { EmptyStateCard } from '@/components/ui/empty-state-card';
import { useHistoryItems } from './hooks/use-history-items';
import { HistoryItemCard } from './components/history-item-card';
import { useClipboard } from '@/lib/hooks/use-clipboard';
import type { HistoryTabConfig, HistoryItem } from './types';
import type { PluginTabProps } from '../../types/tool';

export function createHistoryTabPlugin(config: HistoryTabConfig) {
    return function HistoryTabPlugin({ onTabChange }: PluginTabProps) {
        const { items, deleteItem, clearAll } = useHistoryItems(config);
        const { copy } = useClipboard();

        const handleRestore = (item: HistoryItem) => {
            const tabId = config.tabMapping[item.tabName];
            if (tabId) {
                try {
                    localStorage.setItem(item.key, JSON.stringify(item.content));
                    onTabChange(tabId);
                } catch (error) {
                    console.error('Failed to restore item:', error);
                }
            }
        };

        return (
            <div className="flex flex-col gap-2 mt-2">
                {items.length > 0 && (
                    <div className="flex justify-end">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={clearAll}
                            className="flex items-center gap-1.5 bg-destructive/10 text-destructive hover:bg-destructive/20"
                        >
                            <Trash2 className="h-4 w-4" />
                            Clear All
                        </Button>
                    </div>
                )}
                {items.length === 0 ? (
                    <EmptyStateCard
                        icon={Clock}
                        title="No history"
                        description="Your editing history will appear here as you use the tools"
                    />
                ) : (
                    <div className="flex flex-col gap-3">
                        {items.map((item) => (
                            <HistoryItemCard
                                key={item.key}
                                item={item}
                                config={config}
                                onRestore={handleRestore}
                                onDelete={deleteItem}
                                onCopy={(content) => copy(content)}
                            />
                        ))}
                    </div>
                )}
            </div>
        );
    };
}
