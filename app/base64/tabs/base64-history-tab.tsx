'use client';

import { useState, useCallback, useEffect, useMemo } from 'react';
import { toast } from 'sonner';
import { ActionButtonGroup } from '@/components/ui/action-button-group';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { Toolbar } from '@/components/toolbar/toolbar';
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
import { STORAGE_KEYS } from '@/lib/constants';

interface HistoryTabProps {
    onTabChange: (tab: string) => void;
}

interface HistoryItem {
    key: string;
    label: string;
    description: string;
    icon: React.ComponentType<{ className?: string }>;
    content: string;
}

export function Base64HistoryTab({ onTabChange }: HistoryTabProps) {
    const [historyData, setHistoryData] = useState<HistoryItem[]>([]);
    const [showClearDialog, setShowClearDialog] = useState(false);
    const [showClearItemDialog, setShowClearItemDialog] = useState(false);
    const [itemToClear, setItemToClear] = useState<string | null>(null);
    const [viewingHistoryItem, setViewingHistoryItem] = useState<{
        key: string;
        label: string;
        content: string;
    } | null>(null);

    // Define Base64 history items
    const historyItemConfig = useMemo(
        (): HistoryItem['key'][] => [
            STORAGE_KEYS.BASE64_MEDIA_TO_BASE64_INPUT,
            STORAGE_KEYS.BASE64_MEDIA_TO_BASE64_OUTPUT,
            STORAGE_KEYS.BASE64_TO_MEDIA_INPUT,
        ],
        [],
    );

    const getItemConfig = (key: string): Omit<HistoryItem, 'content'> => {
        switch (key) {
            case STORAGE_KEYS.BASE64_MEDIA_TO_BASE64_INPUT:
                return {
                    key,
                    label: 'Media to Base64 - Input',
                    description: 'Original file/media data for encoding',
                    icon: FileText,
                };
            case STORAGE_KEYS.BASE64_MEDIA_TO_BASE64_OUTPUT:
                return {
                    key,
                    label: 'Media to Base64 - Output',
                    description: 'Base64 encoded result',
                    icon: HardDrive,
                };
            case STORAGE_KEYS.BASE64_TO_MEDIA_INPUT:
                return {
                    key,
                    label: 'Base64 to Media - Input',
                    description: 'Base64 text for decoding',
                    icon: ImageIcon,
                };
            default:
                return {
                    key,
                    label: key,
                    description: 'Stored data',
                    icon: HardDrive,
                };
        }
    };

    // Load history from localStorage
    const loadHistory = useCallback(() => {
        const history: HistoryItem[] = [];

        historyItemConfig.forEach((key) => {
            try {
                const content = localStorage.getItem(key);
                if (content) {
                    const config = getItemConfig(key);
                    history.push({
                        ...config,
                        content,
                    });
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

    // Restore all history items
    const restoreAllHistory = () => {
        if (historyData.length === 0) {
            toast.error('No history to restore');
            return;
        }

        // Find the first available history item and navigate to its tab
        const mediaToBase64Input = historyData.find(
            (item) => item.key === STORAGE_KEYS.BASE64_MEDIA_TO_BASE64_INPUT,
        );
        const base64ToMediaInput = historyData.find(
            (item) => item.key === STORAGE_KEYS.BASE64_TO_MEDIA_INPUT,
        );

        // Navigate to the tab with the most relevant data
        if (base64ToMediaInput) {
            onTabChange('base64-to-media');
        } else if (mediaToBase64Input) {
            onTabChange('media-to-base64');
        }

        toast.success(
            `Restored ${historyData.length} history item${historyData.length > 1 ? 's' : ''}`,
        );
    };

    // View history item
    const viewHistoryItem = (key: string, content: string) => {
        const config = getItemConfig(key);
        setViewingHistoryItem({
            key,
            label: config.label,
            content,
        });
    };

    // Copy history item content
    const copyHistoryItem = (content: string) => {
        navigator.clipboard.writeText(content);
        toast.success('Copied to clipboard');
    };

    // Clear all history
    const handleClearAll = () => {
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

    return (
        <>
            <Toolbar
                leftContent={<h2 className="text-lg font-semibold">History</h2>}
                actions={[
                    {
                        id: 'restore-all',
                        label: 'Restore All',
                        onClick: restoreAllHistory,
                        variant: 'outline',
                        disabled: historyData.length === 0,
                    },
                    {
                        id: 'clear-all',
                        label: 'Clear All',
                        onClick: handleClearAll,
                        variant: 'outline',
                        disabled: historyData.length === 0,
                    },
                ]}
            />

            <div className="mx-auto py-4">
                {/* History Items */}
                {historyData.length === 0 ? (
                    <div className="text-center py-12">
                        <Clock className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                            No history yet
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                            Start converting files to Base64 to see your history here
                        </p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {historyData.map((item) => {
                            const Icon = item.icon;
                            return (
                                <div
                                    key={item.key}
                                    className="border border-input rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                                >
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="flex items-start gap-3 flex-1 min-w-0">
                                            <div className="shrink-0">
                                                <div className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                                                    <Icon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                                                </div>
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-1">
                                                    {item.label}
                                                </h3>
                                                <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                                                    {item.description}
                                                </p>
                                                <p className="text-xs font-mono text-gray-500 dark:text-gray-500 truncate">
                                                    {item.content.slice(0, 100)}
                                                    {item.content.length > 100 ? '...' : ''}
                                                </p>
                                                <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                                                    {item.content.length.toLocaleString()}{' '}
                                                    characters
                                                </p>
                                            </div>
                                        </div>

                                        <ActionButtonGroup
                                            actions={[
                                                {
                                                    icon: Eye,
                                                    onClick: () =>
                                                        viewHistoryItem(item.key, item.content),
                                                    title: 'View full content',
                                                },
                                                {
                                                    icon: Copy,
                                                    onClick: () => copyHistoryItem(item.content),
                                                    title: 'Copy to clipboard',
                                                },
                                                {
                                                    icon: RotateCcw,
                                                    onClick: () => restoreHistoryItem(item.key),
                                                    title: 'Restore to tool',
                                                },
                                                {
                                                    icon: Trash,
                                                    onClick: () => clearHistoryItem(item.key),
                                                    title: 'Delete from history',
                                                    variant: 'destructive',
                                                },
                                            ]}
                                        />
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
                <DialogContent className="w-[90vw] max-w-[90vw] max-h-[85vh] overflow-hidden flex flex-col sm:max-w-[90vw]">
                    <DialogHeader className="border-b">
                        <DialogTitle>
                            {/*{viewingHistoryItem && getToolInfo(viewingHistoryItem.key).name} - Fulls*/}
                            Content
                        </DialogTitle>

                        <DialogDescription className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-2 items-start">
                            <div className="flex items-center gap-2 sm:gap-4">
                                {/*{viewingHistoryItem && (
                                    // <JsonStats content={viewingHistoryItem.content} />
                                )}*/}
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
            {/* Clear All Confirmation Dialog */}
            <ConfirmDialog
                open={showClearDialog}
                onOpenChange={setShowClearDialog}
                title="Clear All History"
                description="Are you sure you want to clear all Base64 history? This action cannot be undone."
                onConfirm={handleConfirmClearAll}
            />

            {/* Clear Item Confirmation Dialog */}
            <ConfirmDialog
                open={showClearItemDialog}
                onOpenChange={setShowClearItemDialog}
                title="Clear History Item"
                description="Are you sure you want to delete this history item? This action cannot be undone."
                onConfirm={handleConfirmClearItem}
            />
        </>
    );
}
