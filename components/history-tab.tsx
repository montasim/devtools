'use client';

import { useState, useCallback, useEffect } from 'react';
import { toast } from 'sonner';
import { ActionButtonGroup } from '@/components/ui/action-button-group';
import { Button } from '@/components/ui/button';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { Toolbar } from '@/components/toolbar/toolbar';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Eye, RotateCcw, Copy, Trash, Clock } from 'lucide-react';
import { STORAGE_KEYS } from '@/lib/constants';
import type { HistoryTabConfig } from '@/lib/config/tools';

interface HistoryTabProps {
    config: HistoryTabConfig;
    onTabChange: (tab: string) => void;
}

export function HistoryTab({ config, onTabChange }: HistoryTabProps) {
    const [historyData, setHistoryData] = useState<Record<string, string>>({});
    const [showClearDialog, setShowClearDialog] = useState(false);
    const [showRestoreDialog, setShowRestoreDialog] = useState(false);
    const [showClearItemDialog, setShowClearItemDialog] = useState(false);
    const [itemToClear, setItemToClear] = useState<string | null>(null);
    const [viewingHistoryItem, setViewingHistoryItem] = useState<{
        key: string;
        content: string;
    } | null>(null);

    const StatsComponent = config.statsComponent;

    // Load history from localStorage
    const loadHistory = useCallback(() => {
        const allKeys = Object.values(STORAGE_KEYS);
        // Filter keys based on the provided filter function
        const filteredKeys = allKeys.filter(config.storageKeyFilter);

        const history: Record<string, string> = {};
        filteredKeys.forEach((key) => {
            try {
                const content = localStorage.getItem(key);
                if (content) {
                    history[key] = content;
                }
            } catch (error) {
                console.error(`Failed to load history for ${key}:`, error);
            }
        });

        return history;
    }, [config.storageKeyFilter]);

    // Refresh history data
    const refreshHistory = useCallback(() => {
        const history = loadHistory();
        setHistoryData(history);
    }, [loadHistory]);

    // Load history on mount
    useEffect(() => {
        refreshHistory();
    }, [refreshHistory]);

    // Clear specific history item
    const clearHistoryItem = (key: string) => {
        setItemToClear(key);
        setShowClearItemDialog(true);
    };

    const handleConfirmClearItem = () => {
        if (!itemToClear) return;

        try {
            localStorage.removeItem(itemToClear);
            refreshHistory();
            toast.success('History item cleared');
        } catch (error) {
            console.error(`Failed to clear history for ${itemToClear}:`, error);
            toast.error('Failed to clear history item');
        } finally {
            setItemToClear(null);
        }
    };

    // Restore history item to current tool
    const restoreHistoryItem = (key: string) => {
        const tab = config.tabMapping[key];
        if (tab) {
            onTabChange(tab);
        }
    };

    // Clear all history
    const clearAllHistory = () => {
        setShowClearDialog(true);
    };

    const handleConfirmClearAll = () => {
        const allKeys = Object.values(STORAGE_KEYS);
        const filteredKeys = allKeys.filter(config.storageKeyFilter);

        filteredKeys.forEach((key) => {
            try {
                localStorage.removeItem(key);
            } catch (error) {
                console.error(`Failed to clear history for ${key}:`, error);
            }
        });

        setHistoryData({});
        toast.success(`All ${config.pageName} history cleared`);
    };

    // Restore all history
    const restoreAllHistory = () => {
        if (Object.keys(historyData).length === 0) {
            toast.error('No history to restore');
            return;
        }
        setShowRestoreDialog(true);
    };

    const handleConfirmRestoreAll = () => {
        try {
            // Find the first available history item with content
            const firstHistoryKey = Object.keys(historyData).find(
                (key) => historyData[key] && historyData[key].trim() !== '',
            );

            if (firstHistoryKey) {
                const tab = config.tabMapping[firstHistoryKey];
                if (tab) {
                    onTabChange(tab);
                }
            }

            toast.success('All history has been restored');
        } catch (error) {
            console.error('Failed to restore all history:', error);
            toast.error('Failed to restore all history');
        }
    };

    const truncateContent = (content: string, maxLength = 100) => {
        if (content.length <= maxLength) return content;
        return content.substring(0, maxLength) + '...';
    };

    const toolbarActions =
        Object.keys(historyData).length > 0
            ? [
                  {
                      id: 'restore-all',
                      label: 'Restore All',
                      icon: <RotateCcw className="h-4 w-4" />,
                      onClick: restoreAllHistory,
                      variant: 'outline' as const,
                  },
                  {
                      id: 'clear-all',
                      label: 'Clear All',
                      icon: <Trash className="h-4 w-4" />,
                      onClick: clearAllHistory,
                      variant: 'outline' as const,
                  },
              ]
            : [];

    return (
        <>
            <Toolbar
                leftContent={<h2 className="text-lg font-semibold">History</h2>}
                actions={toolbarActions}
            />

            <div className="mx-auto py-4">
                {Object.keys(historyData).length === 0 ? (
                    <div className="text-center py-8 sm:py-12 border rounded-lg border-dashed px-4">
                        <Clock className="h-10 w-10 sm:h-12 sm:w-12 mx-auto mb-4 text-muted-foreground" />
                        <h3 className="text-base sm:text-lg font-semibold mb-2">No History Yet</h3>
                        <p className="text-sm text-muted-foreground mb-4">
                            Start using the {config.pageName} tools to build up your history
                        </p>
                        <Button variant="outline" onClick={() => onTabChange('diff')}>
                            Get Started
                        </Button>
                    </div>
                ) : (
                    <div className="grid gap-4">
                        {Object.entries(historyData).map(([key, content]) => {
                            const toolInfo = config.toolMapping[key] || {
                                name: 'Unknown',
                                icon: Clock,
                                color: 'text-gray-500',
                            };
                            const Icon = toolInfo.icon;

                            return (
                                <div
                                    key={key}
                                    className="border rounded-lg p-3 sm:p-4 hover:border-primary/50 transition-colors overflow-hidden"
                                >
                                    <div className="flex flex-col gap-3">
                                        <div className="flex flex-col gap-2">
                                            <div className="flex items-center gap-2 min-w-0">
                                                <h3 className="flex items-center gap-1 font-semibold truncate text-sm">
                                                    <Icon
                                                        className={`w-4 h-4 shrink-0 ${toolInfo.color}`}
                                                    />
                                                    <span className="truncate">
                                                        {toolInfo.name}
                                                    </span>
                                                </h3>
                                            </div>

                                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                                                <StatsComponent content={content} />
                                                <ActionButtonGroup
                                                    actions={[
                                                        {
                                                            icon: Eye,
                                                            onClick: () => {
                                                                setViewingHistoryItem({
                                                                    key,
                                                                    content,
                                                                });
                                                            },
                                                            title: 'View full content',
                                                        },
                                                        {
                                                            icon: RotateCcw,
                                                            onClick: () => restoreHistoryItem(key),
                                                            title: 'Restore to tool',
                                                        },
                                                        {
                                                            icon: Copy,
                                                            onClick: () => {
                                                                navigator.clipboard.writeText(
                                                                    content,
                                                                );
                                                                toast.success(
                                                                    'Copied to clipboard',
                                                                );
                                                            },
                                                            title: 'Copy to clipboard',
                                                        },
                                                        {
                                                            icon: Trash,
                                                            onClick: () => clearHistoryItem(key),
                                                            title: 'Clear history item',
                                                            className:
                                                                'text-destructive hover:text-destructive',
                                                        },
                                                    ]}
                                                />
                                            </div>
                                        </div>

                                        <pre className="text-xs p-3 rounded-md overflow-x-auto max-h-32 overflow-y-auto">
                                            <code className="break-all">
                                                {truncateContent(content, 200)}
                                            </code>
                                        </pre>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            <ConfirmDialog
                open={showClearDialog}
                onOpenChange={setShowClearDialog}
                title="Clear All History"
                description={`Are you sure you want to clear all history? This action cannot be undone and will remove all saved ${config.pageName} data from all tools.`}
                confirmLabel="Clear All"
                cancelLabel="Cancel"
                onConfirm={handleConfirmClearAll}
                variant="destructive"
            />

            <ConfirmDialog
                open={showRestoreDialog}
                onOpenChange={setShowRestoreDialog}
                title="Restore All History"
                description="This will navigate to the first available history item. You can then restore individual items from the history tab."
                confirmLabel="Restore"
                cancelLabel="Cancel"
                onConfirm={handleConfirmRestoreAll}
                variant="default"
            />

            <ConfirmDialog
                open={showClearItemDialog}
                onOpenChange={() => {
                    setShowClearItemDialog(false);
                    setItemToClear(null);
                }}
                title="Clear History Item"
                description={
                    itemToClear && config.toolMapping[itemToClear]
                        ? `Are you sure you want to clear the ${config.toolMapping[itemToClear].name} history item? This cannot be undone.`
                        : 'Are you sure you want to clear this history item? This cannot be undone.'
                }
                confirmLabel="Clear"
                cancelLabel="Cancel"
                onConfirm={handleConfirmClearItem}
                variant="destructive"
            />

            <Dialog
                open={!!viewingHistoryItem}
                onOpenChange={(open) => !open && setViewingHistoryItem(null)}
            >
                <DialogContent className="w-[90vw] max-w-[90vw] sm:max-w-[90vw] max-h-[85vh] overflow-hidden flex flex-col">
                    <DialogHeader className="border-b">
                        <DialogTitle>
                            {viewingHistoryItem && config.toolMapping[viewingHistoryItem.key] && (
                                <span>
                                    {config.toolMapping[viewingHistoryItem.key].name} - Full Content
                                </span>
                            )}
                        </DialogTitle>

                        <DialogDescription className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-2 items-start">
                            <div className="flex items-center gap-2 sm:gap-4">
                                {viewingHistoryItem && (
                                    <StatsComponent content={viewingHistoryItem.content} />
                                )}
                            </div>
                            {viewingHistoryItem && (
                                <ActionButtonGroup
                                    actions={[
                                        {
                                            icon: Copy,
                                            onClick: () => {
                                                navigator.clipboard.writeText(
                                                    viewingHistoryItem.content,
                                                );
                                                toast.success('Copied to clipboard');
                                            },
                                            title: 'Copy to clipboard',
                                        },
                                        {
                                            icon: RotateCcw,
                                            onClick: () =>
                                                restoreHistoryItem(viewingHistoryItem.key),
                                            title: 'Restore to tool',
                                        },
                                        {
                                            icon: Trash,
                                            onClick: () => clearHistoryItem(viewingHistoryItem.key),
                                            title: 'Clear history item',
                                            className: 'text-destructive hover:text-destructive',
                                        },
                                    ]}
                                />
                            )}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="flex-1 overflow-auto mt-4">
                        <pre className="text-sm p-4 rounded-md overflow-auto">
                            <code>{viewingHistoryItem?.content}</code>
                        </pre>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
}
