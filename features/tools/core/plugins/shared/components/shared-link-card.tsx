'use client';

import { useState } from 'react';
import { Copy, ExternalLink, Globe } from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from '@/components/ui/dialog';
import { ContentItemCard } from '@/features/tools/core/components/content-item-card';
import { useSharedContent } from '../hooks/use-shared-content';
import type { SharedLinkItemData, SharedTabConfig } from '../types';

interface SharedLinkCardProps {
    item: SharedLinkItemData;
    config: SharedTabConfig;
    onRestore: (id: string) => void;
    onDelete: (id: string) => void;
    onCopyUrl: (id: string) => void;
    onCopyContent: (content: string) => void;
}

function isExpired(expiresAt: string | null): boolean {
    if (!expiresAt) return false;
    return new Date(expiresAt) < new Date();
}

function buildShareUrl(pageName: string, id: string): string {
    if (typeof window === 'undefined') return '';
    return `${window.location.origin}/share/${pageName}/${id}`;
}

function extractStateText(state: Record<string, unknown> | null): string {
    if (!state) return '';
    const text = state.text ?? state.leftContent ?? state.inputContent ?? state.content;
    if (typeof text === 'string') return text;
    return JSON.stringify(state, null, 2);
}

export function SharedLinkCard({
    item,
    config,
    onRestore,
    onDelete,
    onCopyUrl,
    onCopyContent,
}: SharedLinkCardProps) {
    const toolInfo = config.toolMapping[item.tabName];
    const expired = isExpired(item.expiresAt);
    const url = buildShareUrl(config.pageName, item.id);
    const displayTitle = expired ? `${item.title} (Expired)` : item.title;

    const [viewOpen, setViewOpen] = useState(false);
    const { fetchContent, loading } = useSharedContent();
    const [stateText, setStateText] = useState('');

    const handleOpen = async () => {
        setViewOpen(true);
        const result = await fetchContent(item.id);
        setStateText(extractStateText(result?.state ?? null));
    };

    return (
        <>
            <ContentItemCard
                title={displayTitle}
                content={item.comment || item.title}
                toolInfo={toolInfo}
                className={expired ? 'opacity-60' : ''}
                onCopy={() => onCopyContent(item.comment || item.title)}
                onRestore={() => onRestore(item.id)}
                onDelete={() => onDelete(item.id)}
                deleteLabel="Delete Link"
                deleteDescription="This action cannot be undone. Anyone with the link will lose access."
                restoreLabel="Restore Item"
                restoreDescription="This will replace your current editor content with this shared item. Continue?"
                viewDialogDescription="Details of this shared link"
                onViewClick={handleOpen}
                header={
                    <div className="flex items-center gap-2 border-b pb-3 mb-3 min-w-0">
                        <Globe className="w-4 h-4 shrink-0 text-muted-foreground" />
                        <code className="text-xs truncate">{url || '...'}</code>
                        <Copy
                            className="w-4 h-4 shrink-0 cursor-pointer text-muted-foreground hover:text-foreground"
                            onClick={() => onCopyUrl(item.id)}
                        />
                        {url && (
                            <ExternalLink
                                className="w-4 h-4 shrink-0 cursor-pointer text-muted-foreground hover:text-foreground"
                                onClick={() => window.open(url, '_blank')}
                            />
                        )}
                    </div>
                }
                subtitle={
                    <>
                        <span>Tab: {item.tabName}</span>
                        <span>•</span>
                        <span>Created: {new Date(item.createdAt).toLocaleDateString()}</span>
                        <span>•</span>
                        <span>Views: {item.viewCount}</span>
                        {item.expiresAt && !expired && (
                            <>
                                <span>•</span>
                                <span>
                                    Expires: {new Date(item.expiresAt).toLocaleDateString()}
                                </span>
                            </>
                        )}
                        {item.hasPassword && (
                            <>
                                <span>•</span>
                                <span>Protected</span>
                            </>
                        )}
                    </>
                }
                footer={
                    item.comment ? (
                        <p className="text-xs text-muted-foreground italic mt-2">{item.comment}</p>
                    ) : undefined
                }
            />

            <Dialog open={viewOpen} onOpenChange={setViewOpen}>
                <DialogContent className="max-h-[85vh] overflow-hidden w-[90vw] max-w-[90vw] sm:max-w-4xl">
                    <DialogHeader className="border-b">
                        <DialogTitle className="flex items-center gap-2">
                            {toolInfo && (
                                <toolInfo.icon className={`w-4 h-4 shrink-0 ${toolInfo.color}`} />
                            )}
                            {displayTitle}
                        </DialogTitle>
                        <DialogDescription className="flex flex-wrap items-center gap-2 text-xs">
                            <span>Tab: {item.tabName}</span>
                            <span>•</span>
                            <span>Created: {new Date(item.createdAt).toLocaleDateString()}</span>
                            <span>•</span>
                            <span>Views: {item.viewCount}</span>
                            {item.hasPassword && (
                                <>
                                    <span>•</span>
                                    <span>Protected</span>
                                </>
                            )}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="flex-1 overflow-auto">
                        {loading ? (
                            <div className="p-4 text-sm text-muted-foreground">
                                Loading content...
                            </div>
                        ) : stateText ? (
                            <pre className="text-sm p-4 rounded-md overflow-auto">
                                <code>{stateText}</code>
                            </pre>
                        ) : (
                            <div className="p-4 text-sm text-muted-foreground">
                                No content available
                            </div>
                        )}
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
}
