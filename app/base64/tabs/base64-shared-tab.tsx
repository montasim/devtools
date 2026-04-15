'use client';

import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { useQuery } from '@tanstack/react-query';
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
    viewCount: number;
    hasPassword: boolean;
}

interface SharedTabProps {
    onTabChange: (tab: string) => void;
}

export function Base64SharedTab({ onTabChange }: SharedTabProps) {
    const [viewingItem, setViewingItem] = useState<SharedItem | null>(null);

    // Fetch user's shares from database
    const {
        data: sharedItems = [],
        isLoading,
        error,
        refetch,
    } = useQuery({
        queryKey: ['user-shares', 'base64'],
        queryFn: async () => {
            const response = await fetch('/api/share/user?pageName=base64');
            if (!response.ok) {
                if (response.status === 401) {
                    throw new Error('You must be logged in to view your shares');
                }
                throw new Error('Failed to fetch shares');
            }
            return response.json() as Promise<SharedItem[]>;
        },
    });

    // Handle loading and error states
    useEffect(() => {
        if (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to fetch shares';
            toast.error(errorMessage);
        }
    }, [error]);

    // Copy URL to clipboard
    const handleCopyUrl = (url: string) => {
        navigator.clipboard.writeText(url);
        toast.success('URL copied to clipboard');
    };

    // Restore shared item to the tool
    const restoreSharedItem = (item: SharedItem) => {
        try {
            // Map the tab name to the appropriate tab
            const tabToTabMap: Record<string, string> = {
                'Media to Base64': 'media-to-base64',
                'Base64 to Media': 'base64-to-media',
            };

            const tab = tabToTabMap[item.tab];
            if (tab) {
                // Save the content to sessionStorage for the shared state to pick up
                const sharedState = {
                    tabName: tab,
                    state: item.content,
                    title: item.title,
                    comment: item.comment,
                    hasPassword: item.hasPassword,
                    viewCount: item.viewCount,
                    createdAt: new Date(item.createdAt).toISOString(),
                };

                sessionStorage.setItem('sharedState', JSON.stringify(sharedState));
                toast.success(`Restored "${item.title}" to ${item.tab}`);
                onTabChange(tab);
            }
        } catch (error) {
            console.error('Failed to restore item:', error);
            toast.error('Failed to restore item');
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

    return (
        <>
            {isLoading ? (
                <div className="flex items-center justify-center py-12">
                    <div className="text-muted-foreground">Loading your shares...</div>
                </div>
            ) : (
                <>
                    <Toolbar
                        leftContent={<h2 className="text-lg font-semibold">Shared</h2>}
                        actions={[
                            {
                                id: 'refresh',
                                label: 'Refresh',
                                icon: <RotateCcw className="w-4 h-4" />,
                                onClick: () => refetch(),
                            },
                        ]}
                    />
                    <div className="mx-auto py-4">
                        {sharedItems.length === 0 ? (
                            <EmptyState
                                icon={Share2}
                                title="No Shared Items"
                                description="Share your base64 content with others through shareable links."
                            >
                                <p className="text-sm text-muted-foreground">
                                    Use the share button in any base64 tool to create a shareable
                                    link.
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
                                                                            window.open(
                                                                                item.url,
                                                                                '_blank',
                                                                            )
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
                                                                onClick: () =>
                                                                    restoreSharedItem(item),
                                                                title: 'Restore to tool',
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
                                                            <span className="truncate">
                                                                {item.title}
                                                            </span>
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
                </>
            )}

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
        </>
    );
}
