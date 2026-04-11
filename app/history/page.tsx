'use client';

import { useState, useCallback, useEffect } from 'react';
import { toast } from 'sonner';
import { ActionButtonGroup } from '@/components/ui/action-button-group';
import { Button } from '@/components/ui/button';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { JsonStats } from '@/components/json-stats';
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
    FileText,
    ArrowLeftRight,
    Sparkles,
    Hash,
    Heading1,
    Layers,
    History,
} from 'lucide-react';
import { STORAGE_KEYS } from '@/lib/constants';

interface HistoryItem {
    key: string;
    content: string;
    category: 'json' | 'text';
    toolName: string;
    icon: React.ComponentType<{ className?: string }>;
    color: string;
}

interface CategorySection {
    id: string;
    title: string;
    icon: React.ReactNode;
    category: 'all' | 'json' | 'text';
}

const categorySections: CategorySection[] = [
    {
        id: 'all',
        title: 'All History',
        icon: <Layers className="w-5 h-5" />,
        category: 'all' as const,
    },
    {
        id: 'json',
        title: 'JSON Tools',
        icon: <FileJson className="w-5 h-5" />,
        category: 'json' as const,
    },
    {
        id: 'text',
        title: 'Text Tools',
        icon: <FileText className="w-5 h-5" />,
        category: 'text' as const,
    },
];

export default function HistoryPage() {
    const [historyData, setHistoryData] = useState<HistoryItem[]>([]);
    const [activeSection, setActiveSection] = useState('all');
    const [showClearDialog, setShowClearDialog] = useState(false);
    const [showClearItemDialog, setShowClearItemDialog] = useState(false);
    const [itemToClear, setItemToClear] = useState<HistoryItem | null>(null);
    const [viewingHistoryItem, setViewingHistoryItem] = useState<HistoryItem | null>(null);

    // Load all history from localStorage
    const loadHistory = useCallback(() => {
        const allKeys = Object.values(STORAGE_KEYS);
        const history: HistoryItem[] = [];

        allKeys.forEach((key) => {
            // Skip theme and options keys
            if (key === STORAGE_KEYS.THEME || key.includes('OPTIONS') || key.includes('MODE')) {
                return;
            }

            try {
                const content = localStorage.getItem(key);
                if (content) {
                    const category = key.startsWith('json-') ? 'json' : 'text';
                    const toolInfo = getToolInfo(key);
                    history.push({
                        key,
                        content,
                        category,
                        toolName: toolInfo.name,
                        icon: toolInfo.icon,
                        color: toolInfo.color,
                    });
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

    // Scroll to section
    const scrollToSection = (sectionId: string) => {
        const element = document.getElementById(sectionId);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
            setActiveSection(sectionId);
        }
    };

    // Clear specific history item
    const clearHistoryItem = (item: HistoryItem) => {
        setItemToClear(item);
        setShowClearItemDialog(true);
    };

    const handleConfirmClearItem = () => {
        if (!itemToClear) return;

        try {
            localStorage.removeItem(itemToClear.key);
            refreshHistory();
            toast.success('History item cleared');
        } catch (error) {
            console.error(`Failed to clear history for ${itemToClear.key}:`, error);
            toast.error('Failed to clear history item');
        } finally {
            setItemToClear(null);
        }
    };

    // Restore history item to appropriate tool
    const restoreHistoryItem = (item: HistoryItem) => {
        try {
            const keyToPageMap: Record<string, { page: string; tab: string }> = {
                [STORAGE_KEYS.JSON_DIFF_LEFT_CONTENT]: { page: '/json', tab: 'diff' },
                [STORAGE_KEYS.JSON_DIFF_RIGHT_CONTENT]: { page: '/json', tab: 'diff' },
                [STORAGE_KEYS.JSON_FORMAT_LEFT_CONTENT]: { page: '/json', tab: 'format' },
                [STORAGE_KEYS.JSON_MINIFY_LEFT_CONTENT]: { page: '/json', tab: 'minify' },
                [STORAGE_KEYS.JSON_VIEWER_CONTENT]: { page: '/json', tab: 'viewer' },
                [STORAGE_KEYS.JSON_PARSER_CONTENT]: { page: '/json', tab: 'parser' },
                [STORAGE_KEYS.JSON_EXPORT_CONTENT]: { page: '/json', tab: 'export' },
                [STORAGE_KEYS.JSON_SCHEMA_JSON_CONTENT]: { page: '/json', tab: 'schema' },
                [STORAGE_KEYS.TEXT_DIFF_LEFT_CONTENT]: { page: '/text', tab: 'diff' },
                [STORAGE_KEYS.TEXT_DIFF_RIGHT_CONTENT]: { page: '/text', tab: 'diff' },
                [STORAGE_KEYS.TEXT_CONVERT_INPUT_CONTENT]: { page: '/text', tab: 'convert' },
                [STORAGE_KEYS.TEXT_FORMAT_INPUT_CONTENT]: { page: '/text', tab: 'format' },
                [STORAGE_KEYS.TEXT_COUNT_INPUT_CONTENT]: { page: '/text', tab: 'count' },
                [STORAGE_KEYS.TEXT_CLEAN_INPUT_CONTENT]: { page: '/text', tab: 'clean' },
            };

            const destination = keyToPageMap[item.key];
            if (destination) {
                window.location.href = `${destination.page}?tab=${destination.tab}`;
            } else {
                toast.error('Unable to restore: unknown tool');
            }
        } catch (error) {
            console.error('Failed to restore history item:', error);
            toast.error('Failed to restore history item');
        }
    };

    // Copy to clipboard
    const copyToClipboard = (content: string) => {
        navigator.clipboard.writeText(content);
        toast.success('Copied to clipboard');
    };

    // View full content
    const viewFullContent = (item: HistoryItem) => {
        setViewingHistoryItem(item);
    };

    // Clear all history
    const clearAllHistory = () => {
        setShowClearDialog(true);
    };

    const handleConfirmClearAll = () => {
        const allKeys = Object.values(STORAGE_KEYS);
        // Skip theme and options keys
        const keysToClear = allKeys.filter(
            (key) =>
                key !== STORAGE_KEYS.THEME && !key.includes('OPTIONS') && !key.includes('MODE'),
        );

        keysToClear.forEach((key) => {
            try {
                localStorage.removeItem(key);
            } catch (error) {
                console.error(`Failed to clear history for ${key}:`, error);
            }
        });

        setHistoryData([]);
        toast.success('All history has been cleared');
    };

    const getToolInfo = (
        key: string,
    ): {
        name: string;
        icon: React.ComponentType<{ className?: string }>;
        color: string;
    } => {
        // JSON tools
        if (key === STORAGE_KEYS.JSON_DIFF_LEFT_CONTENT) {
            return { name: 'JSON Diff (Left)', icon: GitCompare, color: 'text-blue-500' };
        }
        if (key === STORAGE_KEYS.JSON_DIFF_RIGHT_CONTENT) {
            return { name: 'JSON Diff (Right)', icon: GitCompare, color: 'text-blue-500' };
        }
        if (key === STORAGE_KEYS.JSON_FORMAT_LEFT_CONTENT) {
            return { name: 'JSON Format', icon: Code, color: 'text-green-500' };
        }
        if (key === STORAGE_KEYS.JSON_MINIFY_LEFT_CONTENT) {
            return { name: 'JSON Minify', icon: Minimize2, color: 'text-purple-500' };
        }
        if (key === STORAGE_KEYS.JSON_PARSER_CONTENT) {
            return { name: 'JSON Parser', icon: FileJson, color: 'text-pink-500' };
        }
        if (key === STORAGE_KEYS.JSON_VIEWER_CONTENT) {
            return { name: 'JSON Viewer', icon: Eye, color: 'text-orange-500' };
        }
        if (key === STORAGE_KEYS.JSON_EXPORT_CONTENT) {
            return { name: 'JSON Export', icon: FileDown, color: 'text-cyan-500' };
        }
        if (key === STORAGE_KEYS.JSON_SCHEMA_JSON_CONTENT) {
            return { name: 'JSON Schema', icon: FileJson, color: 'text-indigo-500' };
        }

        // Text tools
        if (key === STORAGE_KEYS.TEXT_DIFF_LEFT_CONTENT) {
            return { name: 'Text Diff (Left)', icon: GitCompare, color: 'text-blue-500' };
        }
        if (key === STORAGE_KEYS.TEXT_DIFF_RIGHT_CONTENT) {
            return { name: 'Text Diff (Right)', icon: GitCompare, color: 'text-blue-500' };
        }
        if (key === STORAGE_KEYS.TEXT_CONVERT_INPUT_CONTENT) {
            return { name: 'Text Convert', icon: ArrowLeftRight, color: 'text-green-500' };
        }
        if (key === STORAGE_KEYS.TEXT_FORMAT_INPUT_CONTENT) {
            return { name: 'Text Format', icon: Minimize2, color: 'text-purple-500' };
        }
        if (key === STORAGE_KEYS.TEXT_COUNT_INPUT_CONTENT) {
            return { name: 'Text Count', icon: Hash, color: 'text-orange-500' };
        }
        if (key === STORAGE_KEYS.TEXT_CLEAN_INPUT_CONTENT) {
            return { name: 'Text Clean', icon: Sparkles, color: 'text-pink-500' };
        }

        return { name: 'Unknown', icon: FileJson, color: 'text-gray-500' };
    };

    const truncateContent = (content: string, maxLength = 100) => {
        if (content.length <= maxLength) return content;
        return content.substring(0, maxLength) + '...';
    };

    // Filter history by category
    const getFilteredHistory = (category: 'all' | 'json' | 'text') => {
        if (category === 'all') return historyData;
        return historyData.filter((item) => item.category === category);
    };

    const jsonHistory = historyData.filter((item) => item.category === 'json');
    const textHistory = historyData.filter((item) => item.category === 'text');

    const toolbarActions =
        historyData.length > 0
            ? [
                  {
                      id: 'clear-all',
                      label: 'Clear All',
                      icon: <Trash className="h-4 w-4" />,
                      onClick: clearAllHistory,
                      variant: 'outline' as const,
                  },
              ]
            : [];

    const renderHistoryItem = (item: HistoryItem) => {
        const Icon = item.icon;
        return (
            <div
                key={item.key}
                className="p-5 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 hover:border-primary/50 transition-colors overflow-hidden"
            >
                <div className="flex flex-col gap-3">
                    <div className="flex items-center gap-2 min-w-0">
                        <Icon className={`w-4 h-4 shrink-0 ${item.color}`} />
                        <h3 className="font-semibold text-gray-900 dark:text-gray-100 truncate">
                            {item.toolName}
                        </h3>
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                        {item.category === 'json' ? (
                            <JsonStats content={item.content} />
                        ) : (
                            <TextStats content={item.content} />
                        )}
                        <ActionButtonGroup
                            actions={[
                                {
                                    icon: Eye,
                                    onClick: () => viewFullContent(item),
                                    title: 'View full content',
                                },
                                {
                                    icon: RotateCcw,
                                    onClick: () => restoreHistoryItem(item),
                                    title: 'Restore to tool',
                                },
                                {
                                    icon: Copy,
                                    onClick: () => copyToClipboard(item.content),
                                    title: 'Copy to clipboard',
                                },
                                {
                                    icon: Trash,
                                    onClick: () => clearHistoryItem(item),
                                    title: 'Clear history item',
                                    className: 'text-destructive hover:text-destructive',
                                },
                            ]}
                        />
                    </div>

                    <pre className="text-xs p-3 rounded-md bg-gray-50 dark:bg-gray-800 overflow-x-auto max-h-32 overflow-y-auto">
                        <code className="break-all">{truncateContent(item.content, 200)}</code>
                    </pre>
                </div>
            </div>
        );
    };

    // Text stats calculation component
    function TextStats({ content }: { content: string }) {
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

        return (
            <div className="flex items-center gap-3 text-xs text-gray-600 dark:text-gray-400 overflow-x-auto scrollbar-hide">
                <div className="flex items-center gap-1.5 shrink-0" title="File size">
                    <Hash className="h-3.5 w-3.5 text-gray-500" />
                    <span>{fileSizeFormatted}</span>
                </div>
                <div className="flex items-center gap-1.5 shrink-0" title="Characters">
                    <Hash className="h-3.5 w-3.5 text-gray-500" />
                    <span>{characterCount} chars</span>
                </div>
                <div className="flex items-center gap-1.5 shrink-0" title="Words">
                    <FileText className="h-3.5 w-3.5 text-gray-500" />
                    <span>{wordCount} words</span>
                </div>
                <div className="flex items-center gap-1.5 shrink-0" title="Lines">
                    <Heading1 className="h-3.5 w-3.5 text-gray-500" />
                    <span>{lineCount} lines</span>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-950 dark:to-gray-900">
            {/* Header */}
            <div className="mx-auto border-b border-gray-200 dark:border-gray-800 bg-white sticky top-0">
                <div className="mx-auto py-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center">
                            <History className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                                History
                            </h1>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                View your tool usage history across all pages
                            </p>
                        </div>
                        <div className="ml-auto flex items-center gap-2">
                            {toolbarActions.map((action) => (
                                <Button
                                    key={action.id}
                                    variant={action.variant}
                                    onClick={action.onClick}
                                    className="gap-2"
                                >
                                    {action.icon}
                                    {action.label}
                                </Button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="mx-auto py-8">
                <div className="flex gap-8">
                    {/* Sidebar Navigation */}
                    <aside className="w-64 flex-shrink-0">
                        <nav className="sticky top-24 space-y-1">
                            {categorySections.map((section) => {
                                const count =
                                    section.category === 'all'
                                        ? historyData.length
                                        : section.category === 'json'
                                          ? jsonHistory.length
                                          : textHistory.length;

                                return (
                                    <button
                                        key={section.id}
                                        onClick={() => {
                                            scrollToSection(section.id);
                                        }}
                                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-all duration-200 ${
                                            activeSection === section.id
                                                ? 'bg-primary/10 text-primary shadow-lg'
                                                : 'hover:bg-primary/20 hover:text-primary'
                                        }`}
                                    >
                                        <span className="flex-shrink-0">{section.icon}</span>
                                        <span className="font-medium">{section.title}</span>
                                        <span className="ml-auto text-sm opacity-70">{count}</span>
                                    </button>
                                );
                            })}
                        </nav>
                    </aside>

                    {/* Content Area */}
                    <main className="flex-1 min-w-0 space-y-16 pb-16">
                        {/* All History Section */}
                        <section id="all" className="scroll-mt-32">
                            <div className="mb-6">
                                <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4">
                                    All History
                                </h2>
                                <p className="text-lg text-gray-600 dark:text-gray-400 leading-relaxed">
                                    View all your saved content from both JSON and text tools in one
                                    place. Each item shows tool details, statistics, and quick
                                    actions for restore, copy, or delete.
                                </p>
                            </div>

                            {historyData.length === 0 ? (
                                <div className="text-center py-8 sm:py-12 border rounded-lg border-dashed">
                                    <Clock className="h-10 w-10 sm:h-12 sm:w-12 mx-auto mb-4 text-muted-foreground" />
                                    <h3 className="text-base sm:text-lg font-semibold mb-2">
                                        No History Yet
                                    </h3>
                                    <p className="text-sm text-muted-foreground mb-4">
                                        Start using the JSON or text tools to build up your history
                                    </p>
                                    <div className="flex gap-2 justify-center">
                                        <Button variant="outline" asChild>
                                            <a href="/json">JSON Tools</a>
                                        </Button>
                                        <Button variant="outline" asChild>
                                            <a href="/text">Text Tools</a>
                                        </Button>
                                    </div>
                                </div>
                            ) : (
                                <div className="grid gap-4">
                                    {historyData.map((item) => renderHistoryItem(item))}
                                </div>
                            )}
                        </section>

                        {/* JSON Tools Section */}
                        <section id="json" className="scroll-mt-32">
                            <div className="mb-6">
                                <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4">
                                    JSON Tools
                                </h2>
                                <p className="text-lg text-gray-600 dark:text-gray-400 leading-relaxed">
                                    History from all JSON-related tools including diff, format,
                                    minify, parser, viewer, export, and schema.
                                </p>
                            </div>

                            {jsonHistory.length === 0 ? (
                                <div className="text-center py-8 border rounded-lg border-dashed">
                                    <Clock className="h-8 w-8 mx-auto mb-4 text-muted-foreground" />
                                    <p className="text-sm text-muted-foreground">
                                        No JSON tool history yet
                                    </p>
                                </div>
                            ) : (
                                <div className="grid gap-4">
                                    {jsonHistory.map((item) => renderHistoryItem(item))}
                                </div>
                            )}
                        </section>

                        {/* Text Tools Section */}
                        <section id="text" className="scroll-mt-32">
                            <div className="mb-6">
                                <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4">
                                    Text Tools
                                </h2>
                                <p className="text-lg text-gray-600 dark:text-gray-400 leading-relaxed">
                                    History from all text-related tools including diff, convert,
                                    format, count, and clean operations.
                                </p>
                            </div>

                            {textHistory.length === 0 ? (
                                <div className="text-center py-8 border rounded-lg border-dashed">
                                    <Clock className="h-8 w-8 mx-auto mb-4 text-muted-foreground" />
                                    <p className="text-sm text-muted-foreground">
                                        No text tool history yet
                                    </p>
                                </div>
                            ) : (
                                <div className="grid gap-4">
                                    {textHistory.map((item) => renderHistoryItem(item))}
                                </div>
                            )}
                        </section>
                    </main>
                </div>
            </div>

            <ConfirmDialog
                open={showClearDialog}
                onOpenChange={setShowClearDialog}
                title="Clear All History"
                description="Are you sure you want to clear all history? This action cannot be undone and will remove all saved data from all JSON and text tools."
                confirmLabel="Clear All"
                cancelLabel="Cancel"
                onConfirm={handleConfirmClearAll}
                variant="destructive"
            />

            <ConfirmDialog
                open={showClearItemDialog}
                onOpenChange={setShowClearItemDialog}
                title="Clear History Item"
                description={
                    itemToClear
                        ? `Are you sure you want to clear the ${itemToClear.toolName} history item? This cannot be undone.`
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
                        <DialogTitle>{viewingHistoryItem?.toolName} - Full Content</DialogTitle>

                        <DialogDescription className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-2 items-start">
                            <div className="flex items-center gap-2 sm:gap-4">
                                {viewingHistoryItem && (
                                    <>
                                        {viewingHistoryItem.category === 'json' ? (
                                            <JsonStats content={viewingHistoryItem.content} />
                                        ) : (
                                            <TextStats content={viewingHistoryItem.content} />
                                        )}
                                    </>
                                )}
                            </div>
                            {viewingHistoryItem && (
                                <ActionButtonGroup
                                    actions={[
                                        {
                                            icon: Copy,
                                            onClick: () =>
                                                copyToClipboard(viewingHistoryItem.content),
                                            title: 'Copy to clipboard',
                                        },
                                        {
                                            icon: RotateCcw,
                                            onClick: () => restoreHistoryItem(viewingHistoryItem),
                                            title: 'Restore to tool',
                                        },
                                        {
                                            icon: Trash,
                                            onClick: () => clearHistoryItem(viewingHistoryItem),
                                            title: 'Clear history item',
                                            className: 'text-destructive hover:text-destructive',
                                        },
                                    ]}
                                />
                            )}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="flex-1 overflow-auto mt-4">
                        <pre className="text-sm p-4 rounded-md bg-gray-50 dark:bg-gray-800 overflow-auto">
                            <code>{viewingHistoryItem?.content}</code>
                        </pre>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
