'use client';

import { useState, useCallback, useEffect } from 'react';
import { toast } from 'sonner';
import { JsonStats } from '@/components/layout/json-stats';
import { ActionButtonGroup } from '@/components/ui/action-button-group';
import { Button } from '@/components/ui/button';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { Toolbar } from '@/components/toolbar';
import { EmptyState } from '@/components/ui/empty-state';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Eye, Copy, Trash, Bookmark, Trash2 } from 'lucide-react';
import { Input } from '@/components/ui/input';

const SAVED_ITEMS_KEY = 'json-saved-items';

interface SavedItem {
    id: string;
    name: string;
    content: string;
    createdAt: number;
}

export function JsonSavedTab() {
    const [savedItems, setSavedItems] = useState<SavedItem[]>([]);
    const [showClearDialog, setShowClearDialog] = useState(false);
    const [showClearItemDialog, setShowClearItemDialog] = useState(false);
    const [itemToClear, setItemToClear] = useState<string | null>(null);
    const [viewingItem, setViewingItem] = useState<SavedItem | null>(null);
    const [searchQuery, setSearchQuery] = useState('');

    // Load saved items from localStorage on mount
    useEffect(() => {
        try {
            const saved = localStorage.getItem(SAVED_ITEMS_KEY);
            if (saved) {
                const items = JSON.parse(saved) as SavedItem[];
                // Use setTimeout to defer state update and avoid cascading renders
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

    // Filter items based on search
    const filteredItems = savedItems.filter(
        (item) =>
            item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.content.toLowerCase().includes(searchQuery.toLowerCase()),
    );

    // Sort items by creation date (newest first)
    const sortedItems = [...filteredItems].sort((a, b) => b.createdAt - a.createdAt);

    return (
        <>
            <Toolbar
                leftContent={<h2 className="text-lg font-semibold">Saved JSON</h2>}
                actions={
                    savedItems.length > 0
                        ? [
                              {
                                  id: 'clear-all',
                                  icon: <Trash2 className="h-4 w-4" />,
                                  label: 'Clear All',
                                  onClick: () => setShowClearDialog(true),
                                  variant: 'outline' as const,
                              },
                          ]
                        : []
                }
            />

            <div className="mx-auto py-4">
                {searchQuery || savedItems.length > 0 ? (
                    <div className="mb-4">
                        <Input
                            type="text"
                            placeholder="Search saved items..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="max-w-md"
                        />
                    </div>
                ) : null}

                {savedItems.length === 0 ? (
                    <EmptyState
                        icon={Bookmark}
                        title="No Saved Items"
                        description="Save your JSON content to access it quickly later."
                    >
                        <p className="text-sm text-muted-foreground">
                            Use the save button in any JSON tool to store your work.
                        </p>
                    </EmptyState>
                ) : (
                    <div className="space-y-3">
                        {sortedItems.map((item) => (
                            <div
                                key={item.id}
                                className="border rounded-lg p-4 hover:bg-muted/50 transition-colors"
                            >
                                <div className="flex items-start justify-between gap-4">
                                    <div className="flex-1 min-w-0">
                                        <h3 className="font-semibold mb-1 truncate">{item.name}</h3>
                                        <p className="text-sm text-muted-foreground mb-2">
                                            {new Date(item.createdAt).toLocaleString()}
                                        </p>
                                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                            <span>
                                                {item.content.length}{' '}
                                                {item.content.length === 1
                                                    ? 'character'
                                                    : 'characters'}
                                            </span>
                                            <span>•</span>
                                            <span>{item.content.split('\n').length} lines</span>
                                        </div>
                                    </div>
                                    <ActionButtonGroup
                                        actions={[
                                            {
                                                icon: Eye,
                                                onClick: () => setViewingItem(item),
                                                title: 'View',
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
                                                title: 'Delete',
                                                className:
                                                    'text-destructive hover:text-destructive',
                                            },
                                        ]}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                <div className="mt-8 text-center text-sm text-muted-foreground">
                    {savedItems.length > 0 && (
                        <>
                            {savedItems.length} {savedItems.length === 1 ? 'item' : 'items'} saved •{' '}
                            {savedItems.reduce((sum, item) => sum + item.content.length, 0)} total{' '}
                            characters
                        </>
                    )}
                </div>
            </div>

            {/* View Item Dialog */}
            {viewingItem && (
                <Dialog open={!!viewingItem} onOpenChange={() => setViewingItem(null)}>
                    <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle>{viewingItem.name}</DialogTitle>
                            <DialogDescription>
                                Saved on {new Date(viewingItem.createdAt).toLocaleString()}
                            </DialogDescription>
                        </DialogHeader>
                        <JsonStats content={viewingItem.content} />
                        <pre className="mt-4 p-4 bg-muted rounded-lg overflow-x-auto text-sm">
                            {viewingItem.content}
                        </pre>
                        <div className="flex justify-end gap-2 mt-4">
                            <Button variant="outline" onClick={() => setViewingItem(null)}>
                                Close
                            </Button>
                            <Button onClick={() => handleCopy(viewingItem.content)}>Copy</Button>
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
