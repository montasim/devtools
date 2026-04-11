'use client';

import { useState, useCallback, useEffect } from 'react';
import { toast } from 'sonner';
import { JsonStats } from '@/components/json-stats';
import { ActionButtonGroup } from '@/components/ui/action-button-group';
import { HistoryActionButtons } from '@/components/ui/history-action-buttons';
import { Button } from '@/components/ui/button';
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
    Clock,
    GitCompare,
    Code,
    Minimize2,
    FileJson,
    FileDown,
} from 'lucide-react';
import { STORAGE_KEYS } from '@/lib/constants';

interface HistoryTabProps {
    onTabChange: (tab: string) => void;
}

export function HistoryTab({ onTabChange }: HistoryTabProps) {
    const [historyData, setHistoryData] = useState<Record<string, string>>({});
    const [showClearDialog, setShowClearDialog] = useState(false);
    const [showRestoreDialog, setShowRestoreDialog] = useState(false);
    const [showClearItemDialog, setShowClearItemDialog] = useState(false);
    const [itemToClear, setItemToClear] = useState<string | null>(null);
    const [viewingHistoryItem, setViewingHistoryItem] = useState<{
        key: string;
        content: string;
    } | null>(null);

    // Load history from localStorage
    const loadHistory = useCallback(() => {
        const historyKeys = Object.values(STORAGE_KEYS);

        const history: Record<string, string> = {};
        historyKeys.forEach((key) => {
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
    }, []);

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
        try {
            const content = localStorage.getItem(key);
            if (!content) {
                toast.error('No content to restore');
                return;
            }

            // Map the history key to the appropriate tab
            const keyToTabMap: Record<string, string> = {
                [STORAGE_KEYS.JSON_DIFF_LEFT_CONTENT]: 'diff',
                [STORAGE_KEYS.JSON_DIFF_RIGHT_CONTENT]: 'diff',
                [STORAGE_KEYS.JSON_FORMAT_LEFT_CONTENT]: 'format',
                [STORAGE_KEYS.JSON_MINIFY_LEFT_CONTENT]: 'minify',
                [STORAGE_KEYS.JSON_VIEWER_CONTENT]: 'viewer',
                [STORAGE_KEYS.JSON_PARSER_CONTENT]: 'parser',
                [STORAGE_KEYS.JSON_EXPORT_CONTENT]: 'export',
                [STORAGE_KEYS.JSON_SCHEMA_JSON_CONTENT]: 'schema',
            };

            const tab = keyToTabMap[key];
            if (tab) {
                onTabChange(tab);
                // The content will be loaded by the respective tool's useEffect
            }
        } catch (error) {
            console.error('Failed to restore history item:', error);
            toast.error('Failed to restore history item');
        }
    };

    // Clear all history
    const clearAllHistory = () => {
        setShowClearDialog(true);
    };

    const handleConfirmClearAll = () => {
        const historyKeys = Object.values(STORAGE_KEYS);

        historyKeys.forEach((key) => {
            try {
                localStorage.removeItem(key);
            } catch (error) {
                console.error(`Failed to clear history for ${key}:`, error);
            }
        });

        setHistoryData({});
        toast.success('All history has been cleared');
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
                    [STORAGE_KEYS.JSON_DIFF_LEFT_CONTENT]: 'diff',
                    [STORAGE_KEYS.JSON_DIFF_RIGHT_CONTENT]: 'diff',
                    [STORAGE_KEYS.JSON_FORMAT_LEFT_CONTENT]: 'format',
                    [STORAGE_KEYS.JSON_MINIFY_LEFT_CONTENT]: 'minify',
                    [STORAGE_KEYS.JSON_VIEWER_CONTENT]: 'viewer',
                    [STORAGE_KEYS.JSON_PARSER_CONTENT]: 'parser',
                    [STORAGE_KEYS.JSON_EXPORT_CONTENT]: 'export',
                    [STORAGE_KEYS.JSON_SCHEMA_JSON_CONTENT]: 'schema',
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
        }
    };

    const getToolInfo = (key: string) => {
        const toolMap: Record<
            string,
            { name: string; icon: React.ComponentType<{ className?: string }>; color: string }
        > = {
            [STORAGE_KEYS.JSON_DIFF_LEFT_CONTENT]: {
                name: 'Diff (Left)',
                icon: GitCompare,
                color: 'text-blue-500',
            },
            [STORAGE_KEYS.JSON_DIFF_RIGHT_CONTENT]: {
                name: 'Diff (Right)',
                icon: GitCompare,
                color: 'text-blue-500',
            },
            [STORAGE_KEYS.JSON_FORMAT_LEFT_CONTENT]: {
                name: 'Format',
                icon: Code,
                color: 'text-green-500',
            },
            [STORAGE_KEYS.JSON_MINIFY_LEFT_CONTENT]: {
                name: 'Minify',
                icon: Minimize2,
                color: 'text-purple-500',
            },
            [STORAGE_KEYS.JSON_VIEWER_CONTENT]: {
                name: 'Viewer',
                icon: Eye,
                color: 'text-orange-500',
            },
            [STORAGE_KEYS.JSON_PARSER_CONTENT]: {
                name: 'Parser',
                icon: FileJson,
                color: 'text-pink-500',
            },
            [STORAGE_KEYS.JSON_EXPORT_CONTENT]: {
                name: 'Export',
                icon: FileDown,
                color: 'text-cyan-500',
            },
            [STORAGE_KEYS.JSON_SCHEMA_JSON_CONTENT]: {
                name: 'Schema',
                icon: FileJson,
                color: 'text-indigo-500',
            },
        };

        return toolMap[key] || { name: 'Unknown', icon: FileJson, color: 'text-gray-500' };
    };

    const truncateContent = (content: string, maxLength = 100) => {
        if (content.length <= maxLength) return content;
        return content.substring(0, maxLength) + '...';
    };

    return (
        <div className="mx-auto py-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                <div>
                    <h2 className="text-2xl font-bold mb-2">History</h2>
                    <p className="text-muted-foreground">
                        View and restore your recent JSON operations
                    </p>
                </div>
                {Object.keys(historyData).length > 0 && (
                    <HistoryActionButtons
                        onRestoreAll={restoreAllHistory}
                        onClearAll={clearAllHistory}
                    />
                )}
            </div>

            {Object.keys(historyData).length === 0 ? (
                <div className="text-center py-8 sm:py-12 border rounded-lg border-dashed px-4">
                    <Clock className="h-10 w-10 sm:h-12 sm:w-12 mx-auto mb-4 text-muted-foreground" />
                    <h3 className="text-base sm:text-lg font-semibold mb-2">No History Yet</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                        Start using the JSON tools to build up your history
                    </p>
                    <Button variant="outline" onClick={() => onTabChange('diff')}>
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
                                className="border rounded-lg p-3 sm:p-4 hover:border-primary/50 transition-colors"
                            >
                                <div className="flex flex-col sm:flex-row sm:items-start gap-3">
                                    <div className="flex-1 min-w-0">
                                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-2">
                                            <div className="flex items-center gap-4 min-w-0">
                                                <h3 className="flex items-center gap-1 font-semibold truncate">
                                                    <Icon className="w-5 h-5" />
                                                    {toolInfo.name}
                                                </h3>

                                                <JsonStats content={content} />
                                            </div>

                                            <ActionButtonGroup
                                                actions={[
                                                    {
                                                        icon: Eye,
                                                        onClick: () => {
                                                            setViewingHistoryItem({ key, content });
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
                                                            navigator.clipboard.writeText(content);
                                                            toast.success('Copied to clipboard');
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

                                        <pre className="text-xs sm:text-sm p-3 rounded-md overflow-x-auto max-h-32 overflow-y-auto">
                                            <code>{truncateContent(content, 200)}</code>
                                        </pre>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            <ConfirmDialog
                open={showClearDialog}
                onOpenChange={setShowClearDialog}
                title="Clear All History"
                description="Are you sure you want to clear all history? This action cannot be undone and will remove all saved JSON data from all tools."
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
                onOpenChange={setShowClearItemDialog}
                title="Clear History Item"
                description={
                    itemToClear
                        ? `Are you sure you want to clear the ${getToolInfo(itemToClear).name} history item? This cannot be undone.`
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
                <DialogContent className="w-[90vw] max-w-[90vw] max-h-[85vh] overflow-hidden flex flex-col sm:max-w-[90vw]">
                    <DialogHeader className="border-b">
                        <DialogTitle>
                            {viewingHistoryItem && getToolInfo(viewingHistoryItem.key).name} - Full
                            Content
                        </DialogTitle>

                        <DialogDescription className="flex items-center justify-between gap-4 mb-2">
                            <div className="flex items-center gap-4">
                                {viewingHistoryItem && (
                                    <JsonStats content={viewingHistoryItem.content} />
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
        </div>
    );
}
