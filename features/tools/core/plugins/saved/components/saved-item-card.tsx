'use client';

import { Badge } from '@/components/ui/badge';
import type { SavedItemData, SavedTabConfig } from '../types';

interface SavedItemCardProps {
    item: SavedItemData;
    config: SavedTabConfig;
    onRestore: (item: SavedItemData) => void;
    onDelete: (id: string) => void;
}

export function SavedItemCard({ item, config, onRestore, onDelete }: SavedItemCardProps) {
    const toolInfo = config.toolMapping[item.tabName];

    return (
        <div className="flex items-center justify-between rounded-lg border p-4">
            <div className="flex items-center gap-3">
                {toolInfo && (
                    <div className={`rounded-md p-2 ${toolInfo.color}`}>
                        <toolInfo.icon className="h-4 w-4" />
                    </div>
                )}
                <div>
                    <p className="font-medium">{item.name}</p>
                    <p className="text-sm text-muted-foreground">
                        {new Date(item.createdAt).toLocaleDateString()}
                    </p>
                </div>
            </div>
            <div className="flex items-center gap-2">
                <button
                    onClick={() => onRestore(item)}
                    className="rounded-md px-3 py-1.5 text-sm font-medium text-primary hover:bg-accent"
                >
                    Restore
                </button>
                <button
                    onClick={() => onDelete(item.id)}
                    className="rounded-md px-3 py-1.5 text-sm font-medium text-destructive hover:bg-destructive/10"
                >
                    Delete
                </button>
            </div>
        </div>
    );
}
