'use client';

import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { useQuery } from '@tanstack/react-query';
import { ActionButtonGroup } from '@/components/ui/action-button-group';
import { Toolbar } from '@/components/toolbar/toolbar';
import { EmptyState } from '@/components/ui/empty-state';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
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
    ExternalLink,
    Code,
    Minimize2,
    FileJson,
    FileDown,
    Bookmark,
} from 'lucide-react';

interface SharedItem {
    id: string;
    shareId: string;
    url: string;
    title: string;
    comment?: string;
    tab: string;
    content: Record<string, unknown>;
    createdAt: number;
    expiresAt?: number;
    viewCount: number;
    hasPassword: boolean;
}

interface SharedTabProps {
    onTabChange: (tab: string) => void;
}

export function JsonShareTab({ onTabChange }: SharedTabProps) {
    const [viewingItem, setViewingItem] = useState<SharedItem | null>(null);
    const [deleteCandidate, setDeleteCandidate] = useState<SharedItem | null>(null);

    // Fetch user's shares from database
    const {
        data: sharedItems = [],
        isLoading,
        error,
        refetch,
    } = useQuery({
        queryKey: ['user-shares', 'json'],
        queryFn: async () => {
            const response = await fetch('/api/share/user?pageName=json');
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

    // Get tool icon based on tab name
    const getToolIcon = useCallback((tab: string) => {
        const toolMap: Record<
            string,
            { name: string; icon: React.ComponentType<{ className?: string }>; color: string }
        > = {
            'JSON Diff': { name: 'Diff', icon: Share2, color: 'text-blue-500' },
            'JSON Format': { name: 'Format', icon: Code, color: 'text-green-500' },
            'JSON Minify': { name: 'Minify', icon: Minimize2, color: 'text-purple-500' },
            'JSON Viewer': { name: 'Viewer', icon: Eye, color: 'text-orange-500' },
            'JSON Parser': { name: 'Parser', icon: FileJson, color: 'text-pink-500' },
            'JSON Export': { name: 'Export', icon: FileDown, color: 'text-indigo-500' },
            'JSON Schema': { name: 'Schema', icon: Bookmark, color: 'text-teal-500' },
        };

        return toolMap[tab] || { name: 'Unknown', icon: Share2, color: 'text-gray-500' };
    }, []);

    // Copy URL to clipboard
    const handleCopyUrl = useCallback((url: string) => {
        navigator.clipboard.writeText(url);
        toast.success('Share URL copied to clipboard');
    }, []);

    // Copy content to clipboard
    const handleCopyContent = useCallback((item: SharedItem) => {
        try {
            const contentStr = JSON.stringify(item.content, null, 2);
            navigator.clipboard.writeText(contentStr);
            toast.success('Content copied to clipboard');
        } catch (error) {
            console.error('Failed to copy content:', error);
            toast.error('Failed to copy content');
        }
    }, []);

    // Restore shared item to the tool
    const restoreSharedItem = useCallback(
        (item: SharedItem) => {
            try {
                // Map the tab name to the appropriate tab
                const tabToTabMap: Record<string, string> = {
                    'JSON Diff': 'diff',
                    'JSON Format': 'format',
                    'JSON Minify': 'minify',
                    'JSON Viewer': 'viewer',
                    'JSON Parser': 'parser',
                    'JSON Export': 'export',
                    'JSON Schema': 'schema',
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
        },
        [onTabChange],
    );

    // Delete share
    const handleDeleteShare = useCallback(async () => {
        if (!deleteCandidate) return;

        try {
            const response = await fetch(`/api/share/${deleteCandidate.id}`, {
                method: 'DELETE',
            });

            if (!response.ok) {
                throw new Error('Failed to delete share');
            }

            toast.success(`"${deleteCandidate.title}" deleted successfully`);
            setDeleteCandidate(null);
            refetch(); // Refresh the list
        } catch (error) {
            console.error('Failed to delete share:', error);
            toast.error('Failed to delete share');
        }
    }, [deleteCandidate, refetch]);

    // Sort items by creation date (newest first)
    const sortedItems = [...sharedItems].sort((a, b) => b.createdAt - a.createdAt);

    // Truncate content for preview
    const truncateContent = useCallback((content: Record<string, unknown>, maxLength = 100) => {
        const contentStr = JSON.stringify(content);
        if (contentStr.length <= maxLength) return contentStr;
        return contentStr.substring(0, maxLength) + '...';
    }, []);

    // Check if item is expired
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
                                description="Share your JSON content with others through shareable links."
                            >
                                <p className="text-sm text-muted-foreground">
                                    Use the share button in any JSON tool to create a shareable
                                    link.
                                </p>
                            </EmptyState>
                        ) : (
                            <div className="grid gap-4">
                                {sortedItems.map((item) => {
                                    const toolInfo = getToolIcon(item.tab);
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
                                                                icon: Copy,
                                                                onClick: () =>
                                                                    handleCopyContent(item),
                                                                title: 'Copy content',
                                                            },
                                                            {
                                                                icon: RotateCcw,
                                                                onClick: () =>
                                                                    restoreSharedItem(item),
                                                                title: 'Restore to tool',
                                                            },
                                                            {
                                                                icon: Trash,
                                                                onClick: () =>
                                                                    setDeleteCandidate(item),
                                                                title: 'Delete share',
                                                                variant: 'destructive',
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

                                                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                                        <span>Tab: {item.tab}</span>
                                                        <span>•</span>
                                                        <span>
                                                            Created:{' '}
                                                            {new Date(
                                                                item.createdAt,
                                                            ).toLocaleDateString()}
                                                        </span>
                                                        <span>•</span>
                                                        <span>Views: {item.viewCount}</span>
                                                        {item.expiresAt && (
                                                            <>
                                                                <span>•</span>
                                                                <span>
                                                                    Expires:{' '}
                                                                    {new Date(
                                                                        item.expiresAt,
                                                                    ).toLocaleDateString()}
                                                                </span>
                                                            </>
                                                        )}
                                                        {item.hasPassword && (
                                                            <>
                                                                <span>•</span>
                                                                <span>🔒 Protected</span>
                                                            </>
                                                        )}
                                                    </div>
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
                                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                        <span>Tab: {viewingItem.tab}</span>
                                        <span>•</span>
                                        <span>
                                            Created:{' '}
                                            {new Date(viewingItem.createdAt).toLocaleDateString()}
                                        </span>
                                        <span>•</span>
                                        <span>Views: {viewingItem.viewCount}</span>
                                        {viewingItem.expiresAt && (
                                            <>
                                                <span>•</span>
                                                <span>
                                                    Expires:{' '}
                                                    {new Date(
                                                        viewingItem.expiresAt,
                                                    ).toLocaleDateString()}
                                                </span>
                                            </>
                                        )}
                                        {viewingItem.hasPassword && (
                                            <>
                                                <span>•</span>
                                                <span>🔒 Protected</span>
                                            </>
                                        )}
                                    </div>
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
                                                icon: Copy,
                                                onClick: () => handleCopyContent(viewingItem),
                                                title: 'Copy content',
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
                        {viewingItem.comment && (
                            <div className="px-6 pt-4">
                                <p className="text-sm text-muted-foreground italic">
                                    {viewingItem.comment}
                                </p>
                            </div>
                        )}
                        <div className="flex-1 overflow-auto px-6 pb-6">
                            <pre className="text-sm p-4 rounded-md overflow-auto">
                                <code>{JSON.stringify(viewingItem?.content, null, 2)}</code>
                            </pre>
                        </div>
                    </DialogContent>
                </Dialog>
            )}

            {/* Delete Confirmation Dialog */}
            <ConfirmDialog
                open={!!deleteCandidate}
                onOpenChange={() => setDeleteCandidate(null)}
                title="Delete Share?"
                description={`Are you sure you want to delete "${deleteCandidate?.title}"? This action cannot be undone.`}
                confirmLabel="Delete"
                cancelLabel="Cancel"
                onConfirm={handleDeleteShare}
                variant="destructive"
            />
        </>
    );
}
