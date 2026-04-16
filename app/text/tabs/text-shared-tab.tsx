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
import { Eye, RotateCcw, Copy, Trash, Share2, FileText, ExternalLink } from 'lucide-react';

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

export function TextSharedTab({ onTabChange }: SharedTabProps) {
    const [viewingItem, setViewingItem] = useState<SharedItem | null>(null);
    const [deleteCandidate, setDeleteCandidate] = useState<SharedItem | null>(null);

    // Fetch user's shares from database
    const {
        data: sharedItems = [],
        isLoading,
        error,
        refetch,
    } = useQuery({
        queryKey: ['user-shares', 'text'],
        queryFn: async () => {
            const response = await fetch('/api/share/user?pageName=text');
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

    // Copy share URL to clipboard
    const handleCopyUrl = useCallback((url: string) => {
        navigator.clipboard.writeText(url);
        toast.success('Share URL copied to clipboard');
    }, []);

    // Open shared URL in new tab
    const handleOpenUrl = useCallback((url: string) => {
        window.open(url, '_blank');
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

    // Restore shared item to the tool
    const restoreSharedItem = useCallback(
        (item: SharedItem) => {
            try {
                // Map the tab name to the appropriate tab
                const tabToTabMap: Record<string, string> = {
                    'Text Diff': 'diff',
                    'Text Convert': 'convert',
                    'Text Clean': 'clean',
                };

                const tab = tabToTabMap[item.tab];
                if (tab) {
                    // Save the content to sessionStorage for the shared state to pick up
                    const sharedState = {
                        tabName: tab.toLowerCase(),
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

    return (
        <div className="py-6">
            {isLoading ? (
                <div className="flex items-center justify-center py-12">
                    <div className="text-muted-foreground">Loading your shares...</div>
                </div>
            ) : (
                <>
                    <Toolbar
                        actions={[
                            {
                                id: 'refresh',
                                label: 'Refresh',
                                icon: <RotateCcw className="w-4 h-4" />,
                                onClick: () => refetch(),
                            },
                        ]}
                    />

                    {sharedItems.length === 0 ? (
                        <EmptyState
                            icon={Share2}
                            title="No shared items yet"
                            description="Share your text content to see it here"
                        />
                    ) : (
                        <div className="space-y-4">
                            {sharedItems.map((item) => (
                                <div
                                    key={item.id}
                                    className="border rounded-lg p-4 hover:bg-muted/50 transition-colors"
                                >
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-2">
                                                <FileText className="w-4 h-4 shrink-0" />
                                                <h3 className="font-semibold truncate">
                                                    {item.title}
                                                </h3>
                                            </div>

                                            {item.comment && (
                                                <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                                                    {item.comment}
                                                </p>
                                            )}

                                            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground">
                                                <span>Tab: {item.tab}</span>
                                                <span>
                                                    Created:{' '}
                                                    {new Date(item.createdAt).toLocaleDateString()}
                                                </span>
                                                {item.expiresAt && (
                                                    <span>
                                                        Expires:{' '}
                                                        {new Date(
                                                            item.expiresAt,
                                                        ).toLocaleDateString()}
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        <ActionButtonGroup
                                            actions={[
                                                {
                                                    title: 'View',
                                                    icon: Eye,
                                                    onClick: () => setViewingItem(item),
                                                },
                                                {
                                                    title: 'Copy content',
                                                    icon: Copy,
                                                    onClick: () => handleCopyContent(item),
                                                },
                                                {
                                                    title: 'Restore',
                                                    icon: RotateCcw,
                                                    onClick: () => restoreSharedItem(item),
                                                },
                                                {
                                                    title: 'Copy URL',
                                                    icon: ExternalLink,
                                                    onClick: () => handleCopyUrl(item.url),
                                                },
                                                {
                                                    title: 'Open URL',
                                                    icon: ExternalLink,
                                                    onClick: () => handleOpenUrl(item.url),
                                                },
                                                {
                                                    title: 'Delete',
                                                    icon: Trash,
                                                    onClick: () => setDeleteCandidate(item),
                                                    variant: 'destructive',
                                                },
                                            ]}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </>
            )}

            {viewingItem && (
                <Dialog open={!!viewingItem} onOpenChange={() => setViewingItem(null)}>
                    <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle>{viewingItem.title}</DialogTitle>
                            {viewingItem.comment && (
                                <DialogDescription>{viewingItem.comment}</DialogDescription>
                            )}
                        </DialogHeader>
                        <div className="mt-4">
                            <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm whitespace-pre-wrap">
                                {JSON.stringify(viewingItem.content, null, 2)}
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
        </div>
    );
}
