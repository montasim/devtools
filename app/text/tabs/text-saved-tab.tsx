'use client';

import { useState, useCallback, useEffect } from 'react';
import { toast } from 'sonner';
import { JsonStats } from '@/components/layout/json-stats';
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
    Bookmark,
    Trash2,
    GitCompare,
    Sparkles,
    ArrowLeftRight,
} from 'lucide-react';

const SAVED_ITEMS_KEY = 'text-saved-items';

export interface SavedItem {
    id: string;
    name: string;
    tool: string;
    content: string;
    createdAt: number;
}

interface TextSavedTabProps {
    onTabChange: (tab: string) => void;
}

export function TextSavedTab({ onTabChange }: TextSavedTabProps) {
    const [savedItems, setSavedItems] = useState<SavedItem[]>([]);
    const [showClearDialog, setShowClearDialog] = useState(false);
    const [showClearItemDialog, setShowClearItemDialog] = useState(false);
    const [itemToClear, setItemToClear] = useState<string | null>(null);
    const [viewingItem, setViewingItem] = useState<SavedItem | null>(null);

    // Load saved items from localStorage on mount
    useEffect(() => {
        try {
            const saved = localStorage.getItem(SAVED_ITEMS_KEY);
            if (saved) {
                const items = JSON.parse(saved) as SavedItem[];
                setTimeout(() => setSavedItems(items), 0);
            }
        } catch (error) {
            console.error('Failed to load saved items:', error);
        }
    }, []);

    // Save items to localStorage
    const saveSavedItems = useCallback((items: SavedItem[]) => {
        localStorage.setItem(SAVED_ITEMS_KEY, JSON.stringify(items));
        setSavedItems(items);
    }, []);

    // Clear all saved items
    const handleClearAll = () => {
        saveSavedItems([]);
        toast.success('All saved items cleared');
    };

    // Clear single item
    const handleClearItem = (id: string) => {
        const updated = savedItems.filter((item) => item.id !== id);
        saveSavedItems(updated);
        toast.success('Item deleted');
    };

    // Copy content to clipboard
    const handleCopy = (content: string) => {
        navigator.clipboard.writeText(content);
        toast.success('Copied to clipboard');
    };

    // Restore saved item to the tool
    const restoreSavedItem = (item: SavedItem) => {
        try {
            // Map the tool name to the appropriate tab
            const toolToTabMap: Record<string, string> = {
                'Text Diff': 'diff',
                'Text Convert': 'convert',
                'Text Clean': 'clean',
            };

            const tab = toolToTabMap[item.tool];
            if (tab) {
                // Save the content to the appropriate storage key
                const storageKeyMap: Record<string, string> = {
                    'Text Diff': 'text-diff-left-content',
                    'Text Convert': 'text-convert-left-content',
                    'Text Clean': 'text-clean-input-content',
                };

                const storageKey = storageKeyMap[item.tool];
                if (storageKey) {
                    localStorage.setItem(storageKey, item.content);
                    onTabChange(tab);
                    toast.success(`Restored to ${item.tool}`);
                }
            }
        } catch (error) {
            console.error('Failed to restore saved item:', error);
            toast.error('Failed to restore saved item');
        }
    };

    // Sort items by creation date (newest first)
    const sortedItems = [...savedItems].sort((a, b) => b.createdAt - a.createdAt);

    const getToolInfo = (tool: string) => {
        const toolMap: Record<
            string,
            { name: string; icon: React.ComponentType<{ className?: string }>; color: string }
        > = {
            'Text Diff': {
                name: 'Text Diff',
                icon: GitCompare,
                color: 'text-blue-500',
            },
            'Text Convert': {
                name: 'Text Convert',
                icon: ArrowLeftRight,
                color: 'text-green-500',
            },
            'Text Clean': {
                name: 'Text Clean',
                icon: Sparkles,
                color: 'text-purple-500',
            },
        };

        return toolMap[tool] || { name: 'Unknown', icon: Bookmark, color: 'text-gray-500' };
    };

    const truncateContent = (content: string, maxLength = 100) => {
        if (content.length <= maxLength) return content;
        return content.substring(0, maxLength) + '...';
    };

    const toolbarActions =
        Object.keys(savedItems).length > 0
            ? [
                  {
                      id: 'clear-all',
                      label: 'Clear All',
                      icon: <Trash2 className="h-4 w-4" />,
                      onClick: handleClearAll,
                      variant: 'outline' as const,
                  },
              ]
            : [];

    return (
        <>
            <Toolbar
                leftContent={<h2 className="text-lg font-semibold">Saved</h2>}
                actions={toolbarActions}
            />
            <div className="mx-auto py-4">
                {savedItems.length === 0 ? (
                    <EmptyState
                        icon={Bookmark}
                        title="No Saved Items"
                        description="Save your text content to access it quickly later."
                    >
                        <p className="text-sm text-muted-foreground">
                            Use the save button in any text tool to store your work.
                        </p>
                    </EmptyState>
                ) : (
                    <div className="grid gap-4">
                        {sortedItems.map((item) => {
                            const toolInfo = getToolInfo(item.tool);
                            const Icon = toolInfo.icon;

                            return (
                                <div
                                    key={item.id}
                                    className="border rounded-lg p-3 sm:p-4 hover:border-primary/50 transition-colors overflow-hidden"
                                >
                                    <div className="flex flex-col gap-3">
                                        <div className="flex flex-col gap-2">
                                            <div className="flex items-center gap-2 min-w-0">
                                                <h3 className="flex items-center gap-1 font-semibold truncate text-sm">
                                                    <Icon
                                                        className={`w-4 h-4 shrink-0 ${toolInfo.color}`}
                                                    />
                                                    <span className="truncate">{item.name}</span>
                                                </h3>
                                            </div>

                                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                                                <JsonStats content={item.content} />
                                                <ActionButtonGroup
                                                    actions={[
                                                        {
                                                            icon: Eye,
                                                            onClick: () => setViewingItem(item),
                                                            title: 'View full content',
                                                        },
                                                        {
                                                            icon: RotateCcw,
                                                            onClick: () => restoreSavedItem(item),
                                                            title: 'Restore to tool',
                                                        },
                                                        {
                                                            icon: Copy,
                                                            onClick: () => handleCopy(item.content),
                                                            title: 'Copy to clipboard',
                                                        },
                                                        {
                                                            icon: Trash,
                                                            onClick: () => {
                                                                setItemToClear(item.id);
                                                                setShowClearItemDialog(true);
                                                            },
                                                            title: 'Clear saved item',
                                                            className:
                                                                'text-destructive hover:text-destructive',
                                                        },
                                                    ]}
                                                />
                                            </div>
                                        </div>

                                        <pre className="text-xs p-3 rounded-md overflow-x-auto max-h-32 overflow-y-auto">
                                            <code className="break-all">
                                                {truncateContent(item.content, 200)}
                                            </code>
                                        </pre>
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
                            <DialogTitle>{viewingItem.name}</DialogTitle>
                            <DialogDescription className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-2 items-start">
                                <div className="flex items-center gap-2 sm:gap-4">
                                    {viewingItem && <JsonStats content={viewingItem.content} />}
                                </div>
                                {viewingItem && (
                                    <ActionButtonGroup
                                        actions={[
                                            {
                                                icon: Copy,
                                                onClick: () => handleCopy(viewingItem.content),
                                                title: 'Copy to clipboard',
                                            },
                                            {
                                                icon: RotateCcw,
                                                onClick: () => {
                                                    restoreSavedItem(viewingItem);
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
                                                title: 'Clear saved item',
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
                title="Clear All Saved Items"
                description={`Are you sure you want to clear all saved items? This will remove all ${savedItems.length} saved items and cannot be undone.`}
                confirmLabel="Clear All"
                cancelLabel="Cancel"
                onConfirm={handleClearAll}
                variant="destructive"
            />

            {/* Clear Single Item Dialog */}
            <ConfirmDialog
                open={showClearItemDialog}
                onOpenChange={setShowClearItemDialog}
                title="Delete Saved Item"
                description="Are you sure you want to delete this saved item? This action cannot be undone."
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
