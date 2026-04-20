'use client';

import { ContentItemCard } from '@/features/tools/core/components/content-item-card';
import type { SavedItemData, SavedTabConfig } from '../types';

interface SavedItemCardProps {
    item: SavedItemData;
    config: SavedTabConfig;
    onRestore: (item: SavedItemData) => void;
    onDelete: (id: string) => void;
    onCopy: (content: string) => void;
}

function getContentString(item: SavedItemData): string {
    const data = item.content;
    if (typeof data === 'string') return data;
    if (data && typeof data === 'object') {
        if (typeof data.text === 'string') return data.text;
        if (typeof data.content === 'string') return data.content;
        const values = Object.values(data);
        if (values.length === 1 && typeof values[0] === 'string') return values[0];
    }
    return JSON.stringify(data, null, 2);
}

export function SavedItemCard({ item, config, onRestore, onDelete, onCopy }: SavedItemCardProps) {
    const toolInfo = config.toolMapping[item.tabName];
    const content = getContentString(item);

    return (
        <ContentItemCard
            title={item.name}
            content={content}
            toolInfo={toolInfo}
            subtitle={
                <>
                    <span>Tool: {item.tabName}</span>
                    <span>•</span>
                    <span>Saved: {new Date(item.createdAt).toLocaleDateString()}</span>
                </>
            }
            onCopy={onCopy}
            onRestore={() => onRestore(item)}
            onDelete={() => onDelete(item.id)}
            deleteLabel="Delete Item"
            deleteDescription="This action cannot be undone. Are you sure you want to delete this saved item?"
            restoreLabel="Restore Item"
            restoreDescription="This will replace your current editor content with this saved item. Continue?"
            viewDialogDescription="Full content of this saved entry"
        />
    );
}
