'use client';

import { useState, useCallback, useEffect, useMemo } from 'react';
import { toast } from 'sonner';
import { ActionButtonGroup } from '@/components/ui/action-button-group';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { Toolbar } from '@/components/toolbar/toolbar';
import { Button } from '@/components/ui/button';
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
    Clock,
    FileText,
    Image as ImageIcon,
    HardDrive,
} from 'lucide-react';
import { Base64Stats } from '@/components/base64-pane';
import { STORAGE_KEYS } from '@/lib/constants';

interface HistoryTabProps {
    onTabChange: (tab: string) => void;
}

export function Base64HistoryTab({ onTabChange }: HistoryTabProps) {
    const [historyData, setHistoryData] = useState<Record<string, string>>({});
    const [showClearDialog, setShowClearDialog] = useState(false);
    const [showRestoreDialog, setShowRestoreDialog] = useState(false);
    const [showClearItemDialog, setShowClearItemDialog] = useState(false);
    const [itemToClear, setItemToClear] = useState<string | null>(null);
    const [viewingHistoryItem, setViewingHistoryItem] = useState<{
        key: string;
        content: string;
    } | null>(null);

    // Define Base64 history items
    const historyItemConfig = useMemo(
        (): string[] => [
            STORAGE_KEYS.BASE64_MEDIA_TO_BASE64_INPUT,
            STORAGE_KEYS.BASE64_MEDIA_TO_BASE64_OUTPUT,
            STORAGE_KEYS.BASE64_TO_MEDIA_INPUT,
        ],
        [],
    );

    const getToolInfo = (key: string) => {
        const toolMap: Record<
            string,
            { name: string; icon: React.ComponentType<{ className?: string }>; color: string }
        > = {
            [STORAGE_KEYS.BASE64_MEDIA_TO_BASE64_INPUT]: {
                name: 'Media to Base64 (Input)',
                icon: FileText,
                color: 'text-blue-500',
            },
            [STORAGE_KEYS.BASE64_MEDIA_TO_BASE64_OUTPUT]: {
                name: 'Media to Base64 (Output)',
                icon: HardDrive,
                color: 'text-green-500',
            },
            [STORAGE_KEYS.BASE64_TO_MEDIA_INPUT]: {
                name: 'Base64 to Media (Input)',
                icon: ImageIcon,
                color: 'text-purple-500',
            },
        };

        return toolMap[key] || { name: 'Unknown', icon: HardDrive, color: 'text-gray-500' };
    };

    // Load history from localStorage
    const loadHistory = useCallback(() => {
        const history: Record<string, string> = {};

        historyItemConfig.forEach((key) => {
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
    }, [historyItemConfig]);

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
        // Navigate to the appropriate tab based on the key
        if (
            key === STORAGE_KEYS.BASE64_MEDIA_TO_BASE64_INPUT ||
            key === STORAGE_KEYS.BASE64_MEDIA_TO_BASE64_OUTPUT
        ) {
            onTabChange('media-to-base64');
        } else if (key === STORAGE_KEYS.BASE64_TO_MEDIA_INPUT) {
            onTabChange('base64-to-media');
        }
        toast.success('Data restored from history');
    };

    // Clear all history
    const clearAllHistory = () => {
        setShowClearDialog(true);
    };

    const handleConfirmClearAll = () => {
        try {
            historyItemConfig.forEach((key) => {
                localStorage.removeItem(key);
            });
            refreshHistory();
            toast.success('All Base64 history cleared');
        } catch (error) {
            console.error('Failed to clear history:', error);
            toast.error('Failed to clear history');
        } finally {
            setShowClearDialog(false);
        }
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
                // Map the history key to the appropriate tab
                const keyToTabMap: Record<string, string> = {
                    [STORAGE_KEYS.BASE64_MEDIA_TO_BASE64_INPUT]: 'media-to-base64',
                    [STORAGE_KEYS.BASE64_MEDIA_TO_BASE64_OUTPUT]: 'media-to-base64',
                    [STORAGE_KEYS.BASE64_TO_MEDIA_INPUT]: 'base64-to-media',
                };

                const tab = keyToTabMap[firstHistoryKey];
                if (tab) {
                    onTabChange(tab);
                }
            }

            toast.success('All history has been restored');
        } catch (error) {
            console.error('Failed to restore all history:', error);
            toast.error('Failed to restore all history');
        } finally {
            setShowRestoreDialog(false);
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
                            Start using the Base64 tools to build up your history
                        </p>
                        <Button variant="outline" onClick={() => onTabChange('media-to-base64')}>
                            Get Started
                        </Button>
                    </div>
                ) : (
                    <div className="grid gap-4">
                        {Object.entries(historyData).map(([key, content]) => {
                            const toolInfo = getToolInfo(key);
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
                                                    <Icon className={`w-4 h-4 shrink-0`} />
                                                    <span className="truncate">
                                                        {toolInfo.name}
                                                    </span>
                                                </h3>
                                            </div>

                                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                                                <Base64Stats content={content} />
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

            {/* View History Item Dialog */}
            <Dialog
                open={!!viewingHistoryItem}
                onOpenChange={(open) => !open && setViewingHistoryItem(null)}
            >
                <DialogContent className="w-[90vw] max-w-[90vw] sm:max-w-[90vw] max-h-[85vh] overflow-hidden flex flex-col">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Eye className="w-5 h-5" />
                            {viewingHistoryItem && getToolInfo(viewingHistoryItem.key).name}
                        </DialogTitle>
                        <DialogDescription>Full content from history</DialogDescription>
                    </DialogHeader>
                    <div className="flex-1 overflow-auto mt-4">
                        <pre className="text-xs p-4 rounded-md overflow-auto max-h-[60vh] whitespace-pre-wrap break-words">
                            {viewingHistoryItem?.content}
                        </pre>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Clear All Confirmation Dialog */}
            <ConfirmDialog
                open={showClearDialog}
                onOpenChange={setShowClearDialog}
                title="Clear All History"
                description="Are you sure you want to clear all Base64 history? This action cannot be undone and will remove all saved data from all Base64 tools."
                confirmLabel="Clear All"
                cancelLabel="Cancel"
                onConfirm={handleConfirmClearAll}
                variant="destructive"
            />

            {/* Restore All Confirmation Dialog */}
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

            {/* Clear Item Confirmation Dialog */}
            <ConfirmDialog
                open={showClearItemDialog}
                onOpenChange={setShowClearItemDialog}
                title="Clear History Item"
                description={
                    itemToClear
                        ? `Are you sure you want to delete the history item for "${
                              getToolInfo(itemToClear).name
                          }"? This action cannot be undone.`
                        : 'Are you sure you want to delete this history item? This action cannot be undone.'
                }
                confirmLabel="Clear"
                cancelLabel="Cancel"
                onConfirm={handleConfirmClearItem}
            />
        </>
    );
}
