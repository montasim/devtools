'use client';

import { ContentItemCard } from '@/features/tools/core/components/content-item-card';
import type { HistoryItem, HistoryTabConfig } from '../types';

interface HistoryItemCardProps {
    item: HistoryItem;
    config: HistoryTabConfig;
    onRestore: (item: HistoryItem) => void;
    onDelete: (key: string) => void;
    onCopy: (content: string) => void;
}

export function HistoryItemCard({
    item,
    config,
    onRestore,
    onDelete,
    onCopy,
}: HistoryItemCardProps) {
    const toolInfo = config.toolMapping[item.tabName];

    return (
        <ContentItemCard
            title={toolInfo?.name ?? item.tabName}
            content={item.content}
            toolInfo={toolInfo}
            statsComponent={config.statsComponent}
            onCopy={onCopy}
            onRestore={() => onRestore(item)}
            onDelete={() => onDelete(item.key)}
            deleteLabel="Delete Item"
            deleteDescription="This action cannot be undone. Are you sure you want to delete this history item?"
            restoreLabel="Restore Item"
            restoreDescription="This will replace your current editor content with this history item. Continue?"
            viewDialogDescription="Full content of this history entry"
        />
    );
}
