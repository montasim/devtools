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
import {
    Eye,
    RotateCcw,
    Copy,
    Trash,
    Clock,
    GitCompare,
    FileText,
    Minimize2,
    Sparkles,
    Hash,
    HardDrive,
    Type,
    AlignLeft,
    List,
    Heading1,
} from 'lucide-react';
import { STORAGE_KEYS } from '@/lib/constants';

// Text stats calculation
function calculateStats(content: string) {
    const fileSize = new Blob([content]).size;
    const fileSizeFormatted =
        fileSize < 1024
            ? `${fileSize} B`
            : fileSize < 1024 * 1024
              ? `${(fileSize / 1024).toFixed(1)} KB`
              : `${(fileSize / (1024 * 1024)).toFixed(1)} MB`;

    const characterCount = content.length;
    const wordCount = content.trim() ? content.trim().split(/\s+/).length : 0;
    const lineCount = content.split('\n').length;
    const sentences = content.split(/[.!?]+/).filter((s) => s.trim().length > 0);
    const sentenceCount = sentences.length;
    const paragraphs = content.split(/\n\s*\n/).filter((p) => p.trim().length > 0);
    const paragraphCount = paragraphs.length;
    const readingTimeMinutes = wordCount > 0 ? Math.ceil(wordCount / 200) : 0;

    return {
        fileSize: fileSizeFormatted,
        characterCount,
        wordCount,
        lineCount,
        sentenceCount,
        paragraphCount,
        readingTimeMinutes,
    };
}

function TextStats({ content }: { content: string }) {
    const stats = calculateStats(content);

    const statistics = [
        { icon: HardDrive, label: stats.fileSize, title: 'File size' },
        { icon: Type, label: `${stats.characterCount} chars`, title: 'Characters' },
        { icon: FileText, label: `${stats.wordCount} words`, title: 'Words' },
        { icon: AlignLeft, label: `${stats.lineCount} lines`, title: 'Lines' },
        { icon: List, label: `${stats.sentenceCount} sentences`, title: 'Sentences' },
        { icon: Heading1, label: `${stats.paragraphCount} paragraphs`, title: 'Paragraphs' },
    ];

    return (
        <div className="flex items-center gap-3 text-xs text-gray-600 dark:text-gray-400 overflow-x-auto scrollbar-hide">
            {statistics.map((stat, index) => (
                <div key={index} title={stat.title} className="flex items-center gap-1.5 shrink-0">
                    <stat.icon className="h-3.5 w-3.5 text-gray-500" />
                    <span>{stat.label}</span>
                </div>
            ))}
        </div>
    );
}

interface HistoryTabProps {
    onTabChange: (tab: string) => void;
}

export function TextHistoryTab({ onTabChange }: HistoryTabProps) {
    const [historyData, setHistoryData] = useState<Record<string, string>>({});
    const [showClearDialog, setShowClearDialog] = useState(false);
    const [showRestoreDialog, setShowRestoreDialog] = useState(false);
    const [showClearItemDialog, setShowClearItemDialog] = useState(false);
    const [itemToClear, setItemToClear] = useState<string | null>(null);
    const [viewingHistoryItem, setViewingHistoryItem] = useState<{
        key: string;
        content: string;
    } | null>(null);

    // Load history from localStorage (only text keys)
    const loadHistory = useCallback(() => {
        const allKeys = Object.values(STORAGE_KEYS);
        // Filter only text-related keys (keys with values starting with 'text-')
        const textKeys = allKeys.filter((key) => key.startsWith('text-'));

        const history: Record<string, string> = {};
        textKeys.forEach((key) => {
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
                [STORAGE_KEYS.TEXT_DIFF_LEFT_CONTENT]: 'diff',
                [STORAGE_KEYS.TEXT_DIFF_RIGHT_CONTENT]: 'diff',
                [STORAGE_KEYS.TEXT_CONVERT_INPUT_CONTENT]: 'convert',
                [STORAGE_KEYS.TEXT_FORMAT_INPUT_CONTENT]: 'format',
                [STORAGE_KEYS.TEXT_COUNT_INPUT_CONTENT]: 'count',
                [STORAGE_KEYS.TEXT_CLEAN_INPUT_CONTENT]: 'clean',
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
        const allKeys = Object.values(STORAGE_KEYS);
        // Filter only text-related keys (keys with values starting with 'text-')
        const textKeys = allKeys.filter((key) => key.startsWith('text-'));

        textKeys.forEach((key) => {
            try {
                localStorage.removeItem(key);
            } catch (error) {
                console.error(`Failed to clear history for ${key}:`, error);
            }
        });

        setHistoryData({});
        toast.success('All text history has been cleared');
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
                    [STORAGE_KEYS.TEXT_DIFF_LEFT_CONTENT]: 'diff',
                    [STORAGE_KEYS.TEXT_DIFF_RIGHT_CONTENT]: 'diff',
                    [STORAGE_KEYS.TEXT_CONVERT_INPUT_CONTENT]: 'convert',
                    [STORAGE_KEYS.TEXT_FORMAT_INPUT_CONTENT]: 'format',
                    [STORAGE_KEYS.TEXT_COUNT_INPUT_CONTENT]: 'count',
                    [STORAGE_KEYS.TEXT_CLEAN_INPUT_CONTENT]: 'clean',
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
            [STORAGE_KEYS.TEXT_DIFF_LEFT_CONTENT]: {
                name: 'Diff (Left)',
                icon: GitCompare,
                color: 'text-blue-500',
            },
            [STORAGE_KEYS.TEXT_DIFF_RIGHT_CONTENT]: {
                name: 'Diff (Right)',
                icon: GitCompare,
                color: 'text-blue-500',
            },
            [STORAGE_KEYS.TEXT_CONVERT_INPUT_CONTENT]: {
                name: 'Convert',
                icon: FileText,
                color: 'text-green-500',
            },
            [STORAGE_KEYS.TEXT_FORMAT_INPUT_CONTENT]: {
                name: 'Format',
                icon: Minimize2,
                color: 'text-purple-500',
            },
            [STORAGE_KEYS.TEXT_COUNT_INPUT_CONTENT]: {
                name: 'Count',
                icon: Hash,
                color: 'text-orange-500',
            },
            [STORAGE_KEYS.TEXT_CLEAN_INPUT_CONTENT]: {
                name: 'Clean',
                icon: Sparkles,
                color: 'text-pink-500',
            },
        };

        return toolMap[key] || { name: 'Unknown', icon: FileText, color: 'text-gray-500' };
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
                            Start using the text tools to build up your history
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
                                                <TextStats content={content} />
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
                description="Are you sure you want to clear all history? This action cannot be undone and will remove all saved text data from all tools."
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

                        <DialogDescription className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-2 items-start">
                            <div className="flex items-center gap-2 sm:gap-4">
                                {viewingHistoryItem && (
                                    <TextStats content={viewingHistoryItem.content} />
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
