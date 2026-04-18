'use client';

import { Badge } from '@/components/ui/badge';
import { Lock, Eye, Clock } from 'lucide-react';
import type { SharedLinkItemData, SharedTabConfig } from '../types';

interface SharedLinkCardProps {
    item: SharedLinkItemData;
    config: SharedTabConfig;
    onRestore: (id: string) => void;
    onDelete: (id: string) => void;
    onCopyUrl: (id: string) => void;
}

export function SharedLinkCard({
    item,
    config,
    onRestore,
    onDelete,
    onCopyUrl,
}: SharedLinkCardProps) {
    const toolInfo = config.toolMapping[item.tabName];
    const isExpired = item.expiresAt ? new Date(item.expiresAt) < new Date() : false;

    return (
        <div className="flex items-center justify-between rounded-lg border p-4">
            <div className="flex items-center gap-3">
                {toolInfo && (
                    <div className={`rounded-md p-2 ${toolInfo.color}`}>
                        <toolInfo.icon className="h-4 w-4" />
                    </div>
                )}
                <div>
                    <div className="flex items-center gap-2">
                        <p className="font-medium">{item.title}</p>
                        {item.hasPassword && <Lock className="h-3.5 w-3.5 text-muted-foreground" />}
                        {isExpired && (
                            <Badge variant="secondary" className="text-xs">
                                Expired
                            </Badge>
                        )}
                    </div>
                    <div className="flex items-center gap-3 text-sm text-muted-foreground">
                        <span>{new Date(item.createdAt).toLocaleDateString()}</span>
                        <span className="flex items-center gap-1">
                            <Eye className="h-3 w-3" />
                            {item.viewCount}
                        </span>
                        {item.expiresAt && !isExpired && (
                            <span className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {new Date(item.expiresAt).toLocaleDateString()}
                            </span>
                        )}
                    </div>
                </div>
            </div>
            <div className="flex items-center gap-2">
                <button
                    onClick={() => onCopyUrl(item.id)}
                    className="rounded-md px-3 py-1.5 text-sm font-medium text-primary hover:bg-accent"
                >
                    Copy URL
                </button>
                <button
                    onClick={() => onRestore(item.id)}
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
