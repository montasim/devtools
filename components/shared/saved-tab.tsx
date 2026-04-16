'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
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
import { Eye, RotateCcw, Copy, Trash, Bookmark, Trash2 } from 'lucide-react';

export interface SavedItem {
    id: string;
    name: string;
    tabName: string;
    content: Record<string, unknown>;
    createdAt: number;
    updatedAt: number;
}

export interface ToolMapping {
    name: string;
    icon: React.ComponentType<{ className?: string }>;
    color: string;
}

export interface SavedTabProps {
    pageName: string;
    queryKey: string;
    toolMapping: Record<string, ToolMapping>;
    tabMapping: Record<string, string>;
    storageKeyMapping: Record<string, string>;
    extractContent?: (item: SavedItem) => string;
    onTabChange: (tab: string) => void;
}

export function SavedTab({
    pageName,
    queryKey,
    toolMapping,
    tabMapping,
    storageKeyMapping,
    extractContent,
    onTabChange,
}: SavedTabProps) {
    const queryClient = useQueryClient();
    const [showClearDialog, setShowClearDialog] = useState(false);
    const [showClearItemDialog, setShowClearItemDialog] = useState(false);
    const [itemToClear, setItemToClear] = useState<string | null>(null);
    const [viewingItem, setViewingItem] = useState<SavedItem | null>(null);

    // Fetch saved items from database
    const {
        data: savedItems = [],
        isLoading,
        error,
    } = useQuery({
        queryKey: ['saved-items', queryKey],
        queryFn: async () => {
            const response = await fetch(`/api/saved/user?pageName=${pageName}`);
            if (!response.ok) {
                if (response.status === 401) {
                    throw new Error('You must be logged in to view your saved items');
                }
                throw new Error('Failed to fetch saved items');
            }
            return response.json() as Promise<SavedItem[]>;
        },
    });

    // Handle loading and error states
    if (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to fetch saved items';
        toast.error(errorMessage);
    }

    // Delete single item mutation
    const deleteItemMutation = useMutation({
        mutationFn: async (id: string) => {
            const response = await fetch(`/api/saved/${id}`, {
                method: 'DELETE',
            });
            if (!response.ok) {
                throw new Error('Failed to delete saved item');
            }
            return response.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['saved-items', queryKey] });
            toast.success('Item deleted');
        },
        onError: () => {
            toast.error('Failed to delete item');
        },
    });

    // Clear all saved items
    const handleClearAll = async () => {
        try {
            // Delete all items one by one
            await Promise.all(
                savedItems.map((item) => fetch(`/api/saved/${item.id}`, { method: 'DELETE' })),
            );
            await queryClient.invalidateQueries({ queryKey: ['saved-items', queryKey] });
            toast.success('All saved items cleared');
            setShowClearDialog(false);
        } catch (error) {
            console.error('Failed to clear all items:', error);
            toast.error('Failed to clear all items');
        }
    };

    // Clear single item
    const handleClearItem = (id: string) => {
        deleteItemMutation.mutate(id);
        setShowClearItemDialog(false);
        setItemToClear(null);
    };

    // Copy content to clipboard
    const handleCopy = (content: string) => {
        navigator.clipboard.writeText(content);
        toast.success('Copied to clipboard');
    };

    // Restore saved item to the tool
    const restoreSavedItem = (item: SavedItem) => {
        try {
            const tab = tabMapping[item.tabName];
            if (tab) {
                const storageKey = storageKeyMapping[item.tabName];
                if (storageKey) {
                    // Extract content based on the page type
                    let contentStr: string;
                    if (extractContent) {
                        contentStr = extractContent(item);
                    } else {
                        // Default extraction for simple string content
                        const mainContent =
                            (item.content as Record<string, unknown>).leftContent ||
                            (item.content as Record<string, unknown>).rightContent ||
                            JSON.stringify(item.content);
                        contentStr =
                            typeof mainContent === 'string'
                                ? mainContent
                                : JSON.stringify(mainContent);
                    }

                    localStorage.setItem(storageKey, contentStr);
                    toast.success(`Restored "${item.name}" to ${item.tabName}`);
                    onTabChange(tab);
                }
            }
        } catch (error) {
            console.error('Failed to restore item:', error);
            toast.error('Failed to restore item');
        }
    };

    // Default content extraction
    const defaultExtractContent = (item: SavedItem): string => {
        const mainContent =
            item.content.rightContent || item.content.leftContent || JSON.stringify(item.content);
        return typeof mainContent === 'string' ? mainContent : JSON.stringify(mainContent);
    };

    const getContent = extractContent ? extractContent : defaultExtractContent;

    return (
        <>
            {isLoading ? (
                <div className="flex items-center justify-center py-12">
                    <div className="text-muted-foreground">Loading your saved items...</div>
                </div>
            ) : (
                <>
                    <Toolbar
                        leftContent={<h2 className="text-lg font-semibold">Saved</h2>}
                        actions={[
                            {
                                id: 'clear-all',
                                label: 'Clear History',
                                icon: <Trash2 className="w-4 h-4" />,
                                onClick: () => setShowClearDialog(true),
                                disabled: savedItems.length === 0,
                                variant: 'destructive',
                            },
                        ]}
                    />

                    {savedItems.length === 0 ? (
                        <EmptyState
                            icon={Bookmark}
                            title="No saved items yet"
                            description={`Save your ${pageName} content to see it here`}
                        >
                            <p className="text-sm text-muted-foreground">
                                Use the save button in any {pageName} tool to save your work.
                            </p>
                        </EmptyState>
                    ) : (
                        <div className="grid gap-4">
                            {savedItems.map((item) => {
                                const toolInfo = toolMapping[item.tabName] || {
                                    name: 'Unknown',
                                    icon: Bookmark,
                                    color: 'text-gray-500',
                                };
                                const Icon = toolInfo.icon;
                                const content = getContent(item);

                                return (
                                    <div
                                        key={item.id}
                                        className="border rounded-lg p-3 sm:p-4 hover:border-primary/50 transition-colors overflow-hidden"
                                    >
                                        <div className="flex flex-col gap-3">
                                            <div className="flex items-start justify-between gap-4">
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <Icon
                                                            className={`w-4 h-4 shrink-0 ${toolInfo.color}`}
                                                        />
                                                        <h3 className="font-semibold truncate text-sm">
                                                            {item.name}
                                                        </h3>
                                                    </div>

                                                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                                        <span>Tool: {item.tabName}</span>
                                                        <span>•</span>
                                                        <span>
                                                            Saved:{' '}
                                                            {new Date(
                                                                item.createdAt,
                                                            ).toLocaleDateString()}
                                                        </span>
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
                                                            onClick: () => handleCopy(content),
                                                            title: 'Copy to clipboard',
                                                        },
                                                        {
                                                            icon: RotateCcw,
                                                            onClick: () => restoreSavedItem(item),
                                                            title: 'Restore to tool',
                                                        },
                                                        {
                                                            icon: Trash,
                                                            onClick: () => {
                                                                setItemToClear(item.id);
                                                                setShowClearItemDialog(true);
                                                            },
                                                            title: 'Delete',
                                                            variant: 'destructive',
                                                        },
                                                    ]}
                                                />
                                            </div>

                                            <pre className="text-xs p-3 rounded-md overflow-x-auto max-h-32 overflow-y-auto">
                                                <code className="break-all">
                                                    {content.length > 200
                                                        ? `${content.substring(0, 200)}...`
                                                        : content}
                                                </code>
                                            </pre>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </>
            )}

            {/* View Item Dialog */}
            {viewingItem && (
                <Dialog open={!!viewingItem} onOpenChange={() => setViewingItem(null)}>
                    <DialogContent className="w-[90vw] max-w-[90vw] max-h-[85vh] overflow-hidden flex flex-col sm:max-w-[90vw]">
                        <DialogHeader className="border-b">
                            <DialogTitle>{viewingItem.name}</DialogTitle>
                            <DialogDescription className="flex items-center gap-2 text-xs text-muted-foreground">
                                <span>Tool: {viewingItem.tabName}</span>
                                <span>•</span>
                                <span>
                                    Saved: {new Date(viewingItem.createdAt).toLocaleString()}
                                </span>
                            </DialogDescription>
                        </DialogHeader>
                        <div className="flex-1 overflow-auto px-6 pb-6">
                            <pre className="text-sm p-4 rounded-md overflow-auto">
                                <code>{JSON.stringify(viewingItem.content, null, 2)}</code>
                            </pre>
                        </div>
                    </DialogContent>
                </Dialog>
            )}

            {/* Clear All Confirmation Dialog */}
            <ConfirmDialog
                open={showClearDialog}
                onOpenChange={setShowClearDialog}
                title="Clear All Saved Items?"
                description="Are you sure you want to delete all your saved items? This action cannot be undone."
                confirmLabel="Clear All"
                cancelLabel="Cancel"
                onConfirm={handleClearAll}
                variant="destructive"
            />

            {/* Clear Item Confirmation Dialog */}
            <ConfirmDialog
                open={showClearItemDialog}
                onOpenChange={() => {
                    setShowClearItemDialog(false);
                    setItemToClear(null);
                }}
                title="Delete Saved Item?"
                description="Are you sure you want to delete this saved item? This action cannot be undone."
                confirmLabel="Delete"
                cancelLabel="Cancel"
                onConfirm={() => itemToClear && handleClearItem(itemToClear)}
                variant="destructive"
            />
        </>
    );
}
