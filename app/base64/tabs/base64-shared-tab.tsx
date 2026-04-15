'use client';

import { useState, useCallback, useEffect } from 'react';
import { toast } from 'sonner';
import { ActionButtonGroup } from '@/components/ui/action-button-group';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { Toolbar } from '@/components/toolbar/toolbar';
import { EmptyState } from '@/components/ui/empty-state';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    Eye,
    RotateCcw,
    Copy,
    Trash,
    Share2,
    FileText,
    Image as ImageIcon,
    ExternalLink,
} from 'lucide-react';
import { Base64Stats } from '@/components/base64';

const SHARED_ITEMS_KEY = 'base64-shared-items';

export interface SharedItem {
    id: string;
    shareId: string;
    url: string;
    title: string;
    comment?: string;
    tab: string;
    content: string;
    createdAt: number;
    expiresAt?: number;
}

interface SharedTabProps {
    onTabChange: (tab: string) => void;
}

export function Base64SharedTab({ onTabChange }: SharedTabProps) {
    const [sharedItems, setSharedItems] = useState<SharedItem[]>([]);
    const [showClearDialog, setShowClearDialog] = useState(false);
    const [showClearItemDialog, setShowClearItemDialog] = useState(false);
    const [itemToClear, setItemToClear] = useState<string | null>(null);
    const [viewingItem, setViewingItem] = useState<SharedItem | null>(null);

    // Load shared items from localStorage on mount
    useEffect(() => {
        try {
            const saved = localStorage.getItem(SHARED_ITEMS_KEY);
            if (saved) {
                const items = JSON.parse(saved) as SharedItem[];
                setTimeout(() => setSharedItems(items), 0);
            }
        } catch (error) {
            console.error('Failed to load shared items:', error);
        }
    }, []);

    // Save items to localStorage
    const saveSharedItems = useCallback((items: SharedItem[]) => {
        localStorage.setItem(SHARED_ITEMS_KEY, JSON.stringify(items));
        setSharedItems(items);
    }, []);

    // Clear all shared items
    const handleClearAll = () => {
        saveSharedItems([]);
        toast.success('All shared items cleared');
    };

    // Clear single item
    const handleClearItem = (id: string) => {
        const updated = sharedItems.filter((item) => item.id !== id);
        saveSharedItems(updated);
        toast.success('Shared item deleted');
    };

    // Copy URL to clipboard
    const handleCopyUrl = (url: string) => {
        navigator.clipboard.writeText(url);
        toast.success('URL copied to clipboard');
    };

    // Restore shared item to the tool
    const restoreSharedItem = (item: SharedItem) => {
        try {
            // Map the tab name to the appropriate tab and storage key
            const tabToStorageMap: Record<string, string> = {
                'Media to Base64': 'base64-media-input-content',
                'Base64 to Media': 'base64-to-media-input',
            };

            const storageKey = tabToStorageMap[item.tab];
            if (storageKey) {
                localStorage.setItem(storageKey, item.content);
                onTabChange(item.tab);
                toast.success(`Restored to ${item.tab}`);
            }
        } catch (error) {
            console.error('Failed to restore shared item:', error);
            toast.error('Failed to restore shared item');
        }
    };

    // Sort items by creation date (newest first)
    const sortedItems = [...sharedItems].sort((a, b) => b.createdAt - a.createdAt);

    const getToolInfo = (tab: string) => {
        const toolMap: Record<
            string,
            { name: string; icon: React.ComponentType<{ className?: string }>; color: string }
        > = {
            'Media to Base64': {
                name: 'Media to Base64',
                icon: FileText,
                color: 'text-blue-500',
            },
            'Base64 to Media': {
                name: 'Base64 to Media',
                icon: ImageIcon,
                color: 'text-green-500',
            },
        };

        return toolMap[tab] || { name: 'Unknown', icon: Share2, color: 'text-gray-500' };
    };

    const truncateContent = (content: string, maxLength = 100) => {
        if (content.length <= maxLength) return content;
        return content.substring(0, maxLength) + '...';
    };

    const isExpired = useCallback((item: SharedItem) => {
        if (!item.expiresAt) return false;
        return Date.now() > item.expiresAt;
    }, []);

    const toolbarActions =
        Object.keys(sharedItems).length > 0
            ? [
                  {
                      id: 'clear-all',
                      label: 'Clear All',
                      icon: <Trash className="h-4 w-4" />,
                      onClick: handleClearAll,
                      variant: 'outline' as const,
                  },
              ]
            : [];

    return (
        <>
            <Toolbar
                leftContent={<h2 className="text-lg font-semibold">Shared</h2>}
                actions={toolbarActions}
            />
            <div className="mx-auto py-4">
                {sharedItems.length === 0 ? (
                    <EmptyState
                        icon={Share2}
                        title="No Shared Items"
                        description="Share your base64 content with others through shareable links."
                    >
                        <p className="text-sm text-muted-foreground">
                            Use the share button in any base64 tool to create a shareable link.
                        </p>
                    </EmptyState>
                ) : (
                    <div className="grid gap-4">
                        {sortedItems.map((item) => {
                            const toolInfo = getToolInfo(item.tab);
                            const Icon = toolInfo.icon;
                            const expired = isExpired(item);

                            return (
                                <div
                                    key={item.id}
                                    className={`border rounded-lg p-3 sm:p-4 hover:border-primary/50 transition-colors overflow-hidden ${
                                        expired ? 'opacity-60' : ''
                                    }`}
                                >
                                    <div className="flex flex-col gap-3">
                                        {/* Shareable URL Section */}
                                        <div className="flex items-center justify-between gap-2 border-b pb-3">
                                            <div className="flex items-center gap-2">
                                                <Share2 className="w-4 h-4 text-muted-foreground" />
                                                <div className="flex items-center gap-2">
                                                    <div className="flex items-center gap-4">
                                                        <code className="text-xs flex-1 truncate">
                                                            {item.url}
                                                        </code>
                                                        <div className="flex items-center gap-2">
                                                            <Copy
                                                                className="w-4 h-4 text-muted-foreground"
                                                                onClick={() =>
                                                                    handleCopyUrl(item.url)
                                                                }
                                                            />
                                                            <ExternalLink
                                                                className="w-4 h-4 text-muted-foreground"
                                                                onClick={() =>
                                                                    window.open(item.url, '_blank')
                                                                }
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            <ActionButtonGroup
                                                actions={[
                                                    {
                                                        icon: Eye,
                                                        onClick: () => setViewingItem(item),
                                                        title: 'View full content',
                                                    },
                                                    {
                                                        icon: RotateCcw,
                                                        onClick: () => restoreSharedItem(item),
                                                        title: 'Restore to tool',
                                                    },
                                                    {
                                                        icon: Trash,
                                                        onClick: () => {
                                                            setItemToClear(item.id);
                                                            setShowClearItemDialog(true);
                                                        },
                                                        title: 'Delete shared item',
                                                        className:
                                                            'text-destructive hover:text-destructive',
                                                    },
                                                ]}
                                            />
                                        </div>

                                        <div className="flex flex-col gap-2">
                                            <div className="flex items-center gap-2 min-w-0">
                                                <h3 className="flex items-center gap-1 font-semibold truncate text-sm">
                                                    <Icon
                                                        className={`w-4 h-4 shrink-0 ${toolInfo.color}`}
                                                    />
                                                    <span className="truncate">{item.title}</span>
                                                    {expired && (
                                                        <span className="text-xs text-muted-foreground">
                                                            (Expired)
                                                        </span>
                                                    )}
                                                </h3>
                                            </div>

                                            <Base64Stats content={item.content} />
                                        </div>

                                        <pre className="text-xs p-3 rounded-md overflow-x-auto max-h-32 overflow-y-auto">
                                            <code className="break-all">
                                                {truncateContent(item.content, 200)}
                                            </code>
                                        </pre>

                                        {item.comment && (
                                            <p className="text-xs text-muted-foreground italic">
                                                {item.comment}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* View Item Dialog */}
            {viewingItem && (
                <Dialog open={!!viewingItem} onOpenChange={() => setViewingItem(null)}>
                    <DialogContent className="w-[90vw] max-w-[90vw] max-h-[85vh] overflow-hidden flex flex-col sm:max-w-[90vw]">
                        <DialogHeader className="border-b">
                            <DialogTitle>{viewingItem.title}</DialogTitle>
                            <DialogDescription className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-2 items-start">
                                <div className="flex items-center gap-2 sm:gap-4">
                                    {viewingItem && <Base64Stats content={viewingItem.content} />}
                                </div>
                                {viewingItem && (
                                    <ActionButtonGroup
                                        actions={[
                                            {
                                                icon: Copy,
                                                onClick: () => handleCopyUrl(viewingItem.url),
                                                title: 'Copy URL',
                                            },
                                            {
                                                icon: ExternalLink,
                                                onClick: () =>
                                                    window.open(viewingItem.url, '_blank'),
                                                title: 'Open shared URL',
                                            },
                                            {
                                                icon: RotateCcw,
                                                onClick: () => {
                                                    restoreSharedItem(viewingItem);
                                                    setViewingItem(null);
                                                },
                                                title: 'Restore to tool',
                                            },
                                            {
                                                icon: Trash,
                                                onClick: () => {
                                                    setItemToClear(viewingItem.id);
                                                    setShowClearItemDialog(true);
                                                    setViewingItem(null);
                                                },
                                                title: 'Delete shared item',
                                                className:
                                                    'text-destructive hover:text-destructive',
                                            },
                                        ]}
                                    />
                                )}
                            </DialogDescription>
                        </DialogHeader>
                        <div className="flex-1 overflow-auto mt-4">
                            <pre className="text-sm p-4 rounded-md overflow-auto">
                                <code>{viewingItem?.content}</code>
                            </pre>
                        </div>
                    </DialogContent>
                </Dialog>
            )}

            {/* Clear All Dialog */}
            <ConfirmDialog
                open={showClearDialog}
                onOpenChange={setShowClearDialog}
                title="Clear All Shared Items"
                description={`Are you sure you want to clear all shared items? This will remove all ${sharedItems.length} shared items from your list but will not affect the actual shared links.`}
                confirmLabel="Clear All"
                cancelLabel="Cancel"
                onConfirm={handleClearAll}
                variant="destructive"
            />

            {/* Clear Single Item Dialog */}
            <ConfirmDialog
                open={showClearItemDialog}
                onOpenChange={setShowClearItemDialog}
                title="Delete Shared Item"
                description="Are you sure you want to delete this shared item? This will only remove it from your list and will not affect the actual shared link."
                confirmLabel="Delete"
                cancelLabel="Cancel"
                onConfirm={() => {
                    if (itemToClear) {
                        handleClearItem(itemToClear);
                        setShowClearItemDialog(false);
                        setItemToClear(null);
                    }
                }}
                variant="destructive"
            />
        </>
    );
}
