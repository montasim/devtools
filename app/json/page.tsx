'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { Toolbar } from '@/components/toolbar';
import { EditorPane, type EditorPaneRef } from '@/components/editor-pane';
import { FormatPane, FormatShareDialog } from '@/components/format-pane';
import { MinifyPane, MinifyShareDialog } from '@/components/minify-pane';
import { ViewerPane, ViewerShareDialog } from '@/components/viewer-pane';
import { ParserPane, ParserShareDialog } from '@/components/parser-pane';
import { ExportPane, ExportShareDialog } from '@/components/export-pane';
import { SchemaPane, SchemaShareDialog } from '@/components/schema-pane';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    Settings,
    GitCompare,
    Code,
    Minimize2,
    FileJson,
    Share2,
    Trash2,
    Eye,
    FileDown,
    History,
    Clock,
    Trash,
    RotateCcw,
    Copy,
} from 'lucide-react';

export default function Home() {
    const [ignoreKeyOrder, setIgnoreKeyOrder] = useState(true);
    const [prettyPrint, setPrettyPrint] = useState(true);
    const [ignoreWhitespace, setIgnoreWhitespace] = useState(false);
    const [semanticTypeDiff, setSemanticTypeDiff] = useState(false);
    const [canCompare, setCanCompare] = useState(false);
    const [isComputing, setIsComputing] = useState(false);
    const [activeTab, setActiveTab] = useState('diff');
    const [formatIndentation, setFormatIndentation] = useState(2);
    const [formatSortKeys, setFormatSortKeys] = useState(false);
    const [formatRemoveTrailingCommas, setFormatRemoveTrailingCommas] = useState(false);
    const [formatEscapeUnicode, setFormatEscapeUnicode] = useState(false);
    const [shareDialogOpen, setShareDialogOpen] = useState(false);
    const [formatContent, setFormatContent] = useState('');
    const [minifySortKeys, setMinifySortKeys] = useState(false);
    const [minifyRemoveWhitespace, setMinifyRemoveWhitespace] = useState(true);
    const [minifyShareDialogOpen, setMinifyShareDialogOpen] = useState(false);
    const [minifyContent, setMinifyContent] = useState('');
    const [viewerShowTypes, setViewerShowTypes] = useState(false);
    const [viewerShowPaths, setViewerShowPaths] = useState(false);
    const [viewerSortKeys, setViewerSortKeys] = useState(false);
    const [viewerShareDialogOpen, setViewerShareDialogOpen] = useState(false);
    const [viewerContent, setViewerContent] = useState('');
    const [parserShowTypes, setParserShowTypes] = useState(true);
    const [parserShowPaths, setParserShowPaths] = useState(true);
    const [parserShowStatistics, setParserShowStatistics] = useState(true);
    const [parserShareDialogOpen, setParserShareDialogOpen] = useState(false);
    const [parserContent, setParserContent] = useState('');
    const [exportFormat] = useState<'csv' | 'xml' | 'yaml' | 'toml' | 'json'>('csv');
    const [exportShareDialogOpen, setExportShareDialogOpen] = useState(false);
    const [exportContent, setExportContent] = useState('');
    const [schemaMode, setSchemaMode] = useState<'generate' | 'validate'>('generate');
    const [schemaShareDialogOpen, setSchemaShareDialogOpen] = useState(false);
    const [schemaContent, setSchemaContent] = useState('');

    // History state
    const [historyData, setHistoryData] = useState<Record<string, string>>({});
    const [viewingHistoryItem, setViewingHistoryItem] = useState<{
        key: string;
        content: string;
    } | null>(null);

    const editorPaneRef = useRef<EditorPaneRef>(null);

    const handleCompare = useCallback(() => {
        // Diff result handling - reserved for future use
    }, []);

    const handleError = (error: Error) => {
        console.error('Diff error:', error);
    };

    const handleValidationChange = useCallback((isValid: boolean) => {
        setCanCompare(isValid);
        // Update computing state from ref
        setIsComputing(editorPaneRef.current?.isComputing ?? false);
    }, []);

    // Load format content from localStorage on mount and keep in sync
    useEffect(() => {
        const loadFormatContent = () => {
            try {
                const content = localStorage.getItem('json-format-left-content') || '';
                setFormatContent(content);
            } catch (error) {
                console.error('Failed to load format content:', error);
            }
        };

        loadFormatContent();

        // Listen for storage changes
        const handleStorageChange = () => {
            loadFormatContent();
        };

        window.addEventListener('storage', handleStorageChange);
        return () => window.removeEventListener('storage', handleStorageChange);
    }, []);

    // Load minify content from localStorage on mount and keep in sync
    useEffect(() => {
        const loadMinifyContent = () => {
            try {
                const content = localStorage.getItem('json-minify-left-content') || '';
                setMinifyContent(content);
            } catch (error) {
                console.error('Failed to load minify content:', error);
            }
        };

        loadMinifyContent();

        // Listen for storage changes
        const handleStorageChange = () => {
            loadMinifyContent();
        };

        window.addEventListener('storage', handleStorageChange);
        return () => window.removeEventListener('storage', handleStorageChange);
    }, []);

    // Load viewer content from localStorage on mount and keep in sync
    useEffect(() => {
        const loadViewerContent = () => {
            try {
                const content = localStorage.getItem('json-viewer-content') || '';
                setViewerContent(content);
            } catch (error) {
                console.error('Failed to load viewer content:', error);
            }
        };

        loadViewerContent();

        // Listen for storage changes
        const handleStorageChange = () => {
            loadViewerContent();
        };

        window.addEventListener('storage', handleStorageChange);
        return () => window.removeEventListener('storage', handleStorageChange);
    }, []);

    // Load parser content from localStorage on mount and keep in sync
    useEffect(() => {
        const loadParserContent = () => {
            try {
                const content = localStorage.getItem('json-parser-content') || '';
                setParserContent(content);
            } catch (error) {
                console.error('Failed to load parser content:', error);
            }
        };

        loadParserContent();

        // Listen for storage changes
        const handleStorageChange = () => {
            loadParserContent();
        };

        window.addEventListener('storage', handleStorageChange);
        return () => window.removeEventListener('storage', handleStorageChange);
    }, []);

    // Load export content from localStorage on mount and keep in sync
    useEffect(() => {
        const loadExportContent = () => {
            try {
                const content = localStorage.getItem('json-export-content') || '';
                setExportContent(content);
            } catch (error) {
                console.error('Failed to load export content:', error);
            }
        };

        loadExportContent();

        // Listen for storage changes
        const handleStorageChange = () => {
            loadExportContent();
        };

        window.addEventListener('storage', handleStorageChange);
        return () => window.removeEventListener('storage', handleStorageChange);
    }, []);

    // Load schema content from localStorage on mount and keep in sync
    useEffect(() => {
        const loadSchemaContent = () => {
            try {
                const content = localStorage.getItem('json-schema-json-content') || '';
                setSchemaContent(content);
            } catch (error) {
                console.error('Failed to load schema content:', error);
            }
        };

        loadSchemaContent();

        const handleStorageChange = () => {
            loadSchemaContent();
        };

        window.addEventListener('storage', handleStorageChange);
        return () => window.removeEventListener('storage', handleStorageChange);
    }, []);

    const handleClear = () => {
        // Reload page to clear all content
        window.location.reload();
    };

    const handleCompareClick = async () => {
        if (editorPaneRef.current) {
            setIsComputing(true);
            await editorPaneRef.current.triggerCompare();
            setIsComputing(false);
        }
    };

    const handleFormatShare = () => {
        // Get the formatted content from localStorage
        const formattedContent = localStorage.getItem('json-format-left-content');
        if (!formattedContent) {
            alert('No content to share. Please enter some JSON first.');
            return;
        }

        // Open the share dialog
        setShareDialogOpen(true);
    };

    const handleMinifyShare = () => {
        // Get the minified content from localStorage
        const minifiedContent = localStorage.getItem('json-minify-left-content');
        if (!minifiedContent) {
            alert('No content to share. Please enter some JSON first.');
            return;
        }

        // Open the share dialog
        setMinifyShareDialogOpen(true);
    };

    const handleViewerShare = () => {
        // Get the viewer content from localStorage
        const viewerContentData = localStorage.getItem('json-viewer-content');
        if (!viewerContentData) {
            alert('No content to share. Please enter some JSON first.');
            return;
        }

        // Open the share dialog
        setViewerShareDialogOpen(true);
    };

    const handleParserShare = () => {
        // Get the parser content from localStorage
        const parserContentData = localStorage.getItem('json-parser-content');
        if (!parserContentData) {
            alert('No content to share. Please enter some JSON first.');
            return;
        }

        // Open the share dialog
        setParserShareDialogOpen(true);
    };

    const handleExportShare = () => {
        // Get the export content from localStorage
        const exportContentData = localStorage.getItem('json-export-content');
        if (!exportContentData) {
            alert('No content to share. Please enter some JSON first.');
            return;
        }

        // Open the share dialog
        setExportShareDialogOpen(true);
    };

    const handleSchemaShare = () => {
        // Get the schema content from localStorage
        const schemaContentData = localStorage.getItem('json-schema-json-content');
        if (!schemaContentData) {
            alert('No content to share. Please enter some JSON first.');
            return;
        }

        // Open the share dialog
        setSchemaShareDialogOpen(true);
    };

    // Load history from localStorage
    const loadHistory = useCallback(() => {
        const historyKeys = [
            'json-diff-left-content',
            'json-diff-right-content',
            'json-format-left-content',
            'json-minify-left-content',
            'json-viewer-content',
            'json-parser-content',
            'json-export-content',
            'json-schema-json-content',
        ];

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

    // Handle tab changes with history loading
    const handleTabChange = useCallback(
        (tab: string) => {
            setActiveTab(tab);
            if (tab === 'history') {
                refreshHistory();
            }
        },
        [refreshHistory],
    );

    // Clear specific history item
    const clearHistoryItem = (key: string) => {
        try {
            localStorage.removeItem(key);
            refreshHistory();
        } catch (error) {
            console.error(`Failed to clear history for ${key}:`, error);
            alert('Failed to clear history item');
        }
    };

    // Restore history item to current tool
    const restoreHistoryItem = (key: string) => {
        try {
            const content = localStorage.getItem(key);
            if (!content) {
                alert('No content to restore');
                return;
            }

            // Map the history key to the appropriate tab and storage key
            const keyToTabMap: Record<string, string> = {
                'json-diff-left-content': 'diff',
                'json-diff-right-content': 'diff',
                'json-format-left-content': 'format',
                'json-minify-left-content': 'minify',
                'json-viewer-content': 'viewer',
                'json-parser-content': 'parser',
                'json-export-content': 'export',
                'json-schema-json-content': 'schema',
            };

            const tab = keyToTabMap[key];
            if (tab) {
                handleTabChange(tab);
                // The content will be loaded by the respective tool's useEffect
            }
        } catch (error) {
            console.error('Failed to restore history item:', error);
            alert('Failed to restore history item');
        }
    };

    // Clear all history
    const clearAllHistory = () => {
        if (!confirm('Are you sure you want to clear all history? This cannot be undone.')) {
            return;
        }

        const historyKeys = [
            'json-diff-left-content',
            'json-diff-right-content',
            'json-format-left-content',
            'json-minify-left-content',
            'json-viewer-content',
            'json-parser-content',
            'json-export-content',
            'json-schema-json-content',
        ];

        historyKeys.forEach((key) => {
            try {
                localStorage.removeItem(key);
            } catch (error) {
                console.error(`Failed to clear history for ${key}:`, error);
            }
        });

        setHistoryData({});
        alert('All history has been cleared');
    };

    // Get tool info from key
    const getToolInfo = (key: string) => {
        const toolMap: Record<
            string,
            { name: string; icon: React.ComponentType<{ className?: string }>; color: string }
        > = {
            'json-diff-left-content': {
                name: 'Diff (Left)',
                icon: GitCompare,
                color: 'text-blue-500',
            },
            'json-diff-right-content': {
                name: 'Diff (Right)',
                icon: GitCompare,
                color: 'text-blue-500',
            },
            'json-format-left-content': { name: 'Format', icon: Code, color: 'text-green-500' },
            'json-minify-left-content': {
                name: 'Minify',
                icon: Minimize2,
                color: 'text-purple-500',
            },
            'json-viewer-content': { name: 'Viewer', icon: Eye, color: 'text-orange-500' },
            'json-parser-content': { name: 'Parser', icon: FileJson, color: 'text-pink-500' },
            'json-export-content': { name: 'Export', icon: FileDown, color: 'text-cyan-500' },
            'json-schema-json-content': {
                name: 'Schema',
                icon: FileJson,
                color: 'text-indigo-500',
            },
        };

        return toolMap[key] || { name: 'Unknown', icon: FileJson, color: 'text-gray-500' };
    };

    // Truncate content for preview
    const truncateContent = (content: string, maxLength = 100) => {
        if (content.length <= maxLength) return content;
        return content.substring(0, maxLength) + '...';
    };

    return (
        <div className="min-h-screen">
            <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
                <div className="border-b">
                    <div className="mx-auto py-4">
                        <TabsList
                            variant="line"
                            className="h-auto p-0 bg-transparent border-0 w-full justify-between"
                        >
                            <div className="flex gap-2">
                                {[
                                    { value: 'diff', label: 'Diff', icon: GitCompare },
                                    { value: 'format', label: 'Format', icon: Code },
                                    { value: 'minify', label: 'Minify', icon: Minimize2 },
                                    { value: 'viewer', label: 'Viewer', icon: Eye },
                                    { value: 'parser', label: 'Parser', icon: FileJson },
                                    { value: 'export', label: 'Export', icon: FileDown },
                                    { value: 'schema', label: 'Schema', icon: FileJson },
                                    { value: 'share', label: 'Share', icon: Share2 },
                                ].map(({ value, label, icon: Icon }) => (
                                    <TabsTrigger
                                        key={value}
                                        value={value}
                                        className="gap-2 data-[icon=true]:pr-4"
                                    >
                                        <Icon data-icon="true" className="w-4 h-4" />
                                        {label}
                                    </TabsTrigger>
                                ))}
                            </div>
                            <div className="flex gap-2">
                                {[
                                    { value: 'options', label: 'Options', icon: Settings },
                                    { value: 'history', label: 'History', icon: History },
                                ].map(({ value, label, icon: Icon }) => (
                                    <TabsTrigger
                                        key={value}
                                        value={value}
                                        className="gap-2 data-[icon=true]:pr-4"
                                    >
                                        <Icon data-icon="true" className="w-4 h-4" />
                                        {label}
                                    </TabsTrigger>
                                ))}
                            </div>
                        </TabsList>
                    </div>
                </div>

                <TabsContent value="options" className="mt-0">
                    <div className="container mx-auto px-4 py-8">
                        <div className="max-w-2xl">
                            <h2 className="text-2xl font-bold mb-4">Options</h2>
                            <p className="text-muted-foreground mb-6">
                                Configure default settings for JSON operations across all tools.
                            </p>
                            <div className="space-y-4">
                                <div className="p-4 border rounded-lg">
                                    <h3 className="font-semibold mb-2">Diff Options</h3>
                                    <p className="text-sm text-muted-foreground">
                                        Configure how JSON differences are computed and displayed.
                                    </p>
                                </div>
                                <div className="p-4 border rounded-lg">
                                    <h3 className="font-semibold mb-2">Format Options</h3>
                                    <p className="text-sm text-muted-foreground">
                                        Set indentation preferences and formatting rules.
                                    </p>
                                </div>
                                <div className="p-4 border rounded-lg">
                                    <h3 className="font-semibold mb-2">Minify Options</h3>
                                    <p className="text-sm text-muted-foreground">
                                        Configure JSON compression and minification settings.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </TabsContent>

                <TabsContent value="history" className="mt-0">
                    <div className="mx-auto py-4">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                            <div>
                                <h2 className="text-2xl font-bold mb-2">History</h2>
                                <p className="text-muted-foreground">
                                    View and restore your recent JSON operations
                                </p>
                            </div>
                            {Object.keys(historyData).length > 0 && (
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={clearAllHistory}
                                    className="gap-2 sm:self-start"
                                >
                                    <Trash className="h-4 w-4" />
                                    <span className="hidden sm:inline">Clear All History</span>
                                    <span className="sm:hidden">Clear All</span>
                                </Button>
                            )}
                        </div>

                        {Object.keys(historyData).length === 0 ? (
                            <div className="text-center py-8 sm:py-12 border rounded-lg border-dashed px-4">
                                <Clock className="h-10 w-10 sm:h-12 sm:w-12 mx-auto mb-4 text-muted-foreground" />
                                <h3 className="text-base sm:text-lg font-semibold mb-2">
                                    No History Yet
                                </h3>
                                <p className="text-sm text-muted-foreground mb-4">
                                    Start using the JSON tools to build up your history
                                </p>
                                <Button variant="outline" onClick={() => handleTabChange('diff')}>
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
                                                        <div className="flex items-center gap-2 min-w-0">
                                                            <h3 className="flex items-center gap-1 font-semibold truncate">
                                                                <Icon
                                                                    className={`h-5 w-5 ${toolInfo.color}`}
                                                                />
                                                                {toolInfo.name}
                                                            </h3>
                                                            <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded shrink-0">
                                                                {content.length} chars
                                                            </span>
                                                        </div>

                                                        <div className="flex gap-2 shrink-0">
                                                            {[
                                                                {
                                                                    icon: Eye,
                                                                    onClick: () =>
                                                                        setViewingHistoryItem({
                                                                            key,
                                                                            content,
                                                                        }),
                                                                    title: 'View full content',
                                                                    className: '',
                                                                },
                                                                {
                                                                    icon: RotateCcw,
                                                                    onClick: () =>
                                                                        restoreHistoryItem(key),
                                                                    title: 'Restore to tool',
                                                                    className: '',
                                                                },
                                                                {
                                                                    icon: Copy,
                                                                    onClick: () => {
                                                                        navigator.clipboard.writeText(
                                                                            content,
                                                                        );
                                                                    },
                                                                    title: 'Copy to clipboard',
                                                                    className: '',
                                                                },
                                                                {
                                                                    icon: Trash,
                                                                    onClick: () =>
                                                                        clearHistoryItem(key),
                                                                    title: 'Clear history item',
                                                                    className:
                                                                        'text-destructive hover:text-destructive',
                                                                },
                                                            ].map(
                                                                ({
                                                                    icon: Icon,
                                                                    onClick,
                                                                    title,
                                                                    className,
                                                                }) => (
                                                                    <Button
                                                                        key={title}
                                                                        variant="outline"
                                                                        size="sm"
                                                                        onClick={onClick}
                                                                        className={`gap-2 ${className}`}
                                                                        title={title}
                                                                    >
                                                                        <Icon className="h-4 w-4" />
                                                                    </Button>
                                                                ),
                                                            )}
                                                        </div>
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
                    </div>
                </TabsContent>

                <TabsContent value="diff" className="mt-0">
                    <div>
                        <Toolbar
                            toggles={[
                                {
                                    id: 'ignoreKeyOrder',
                                    label: 'Ignore Key Order',
                                    checked: ignoreKeyOrder,
                                    onChange: setIgnoreKeyOrder,
                                },
                                {
                                    id: 'prettyPrint',
                                    label: 'Pretty Print',
                                    checked: prettyPrint,
                                    onChange: setPrettyPrint,
                                },
                                {
                                    id: 'ignoreWhitespace',
                                    label: 'Ignore Whitespace',
                                    checked: ignoreWhitespace,
                                    onChange: setIgnoreWhitespace,
                                },
                                {
                                    id: 'semanticTypeDiff',
                                    label: 'Semantic Type Diff',
                                    checked: semanticTypeDiff,
                                    onChange: setSemanticTypeDiff,
                                },
                            ]}
                            actions={[
                                {
                                    id: 'clear',
                                    label: 'Clear All',
                                    onClick: handleClear,
                                    variant: 'outline',
                                },
                                {
                                    id: 'compare',
                                    label: isComputing ? 'Computing...' : 'Compare',
                                    onClick: handleCompareClick,
                                    variant: 'default',
                                    disabled: !canCompare || isComputing,
                                },
                            ]}
                        />

                        <div className="mx-auto">
                            <EditorPane
                                ref={editorPaneRef}
                                ignoreKeyOrder={ignoreKeyOrder}
                                prettyPrint={prettyPrint}
                                ignoreWhitespace={ignoreWhitespace}
                                semanticTypeDiff={semanticTypeDiff}
                                onCompare={handleCompare}
                                onError={handleError}
                                onValidationChange={handleValidationChange}
                            />
                        </div>
                    </div>
                </TabsContent>

                <TabsContent value="format" className="mt-0">
                    <div>
                        <Toolbar
                            toggles={[
                                {
                                    id: 'indentation',
                                    label: 'Indentation',
                                    checked: formatIndentation === 4,
                                    onChange: () =>
                                        setFormatIndentation(formatIndentation === 2 ? 4 : 2),
                                },
                                {
                                    id: 'sortKeys',
                                    label: 'Sort Keys',
                                    checked: formatSortKeys,
                                    onChange: setFormatSortKeys,
                                },
                                {
                                    id: 'removeTrailingCommas',
                                    label: 'Remove Trailing Commas',
                                    checked: formatRemoveTrailingCommas,
                                    onChange: setFormatRemoveTrailingCommas,
                                },
                                {
                                    id: 'escapeUnicode',
                                    label: 'Escape Unicode',
                                    checked: formatEscapeUnicode,
                                    onChange: setFormatEscapeUnicode,
                                },
                            ]}
                            actions={[
                                {
                                    id: 'clear',
                                    label: 'Clear All',
                                    onClick: handleClear,
                                    variant: 'outline',
                                    icon: <Trash2 className="h-4 w-4" />,
                                },
                                {
                                    id: 'share',
                                    label: 'Share',
                                    onClick: handleFormatShare,
                                    variant: 'outline',
                                    icon: <Share2 className="h-4 w-4" />,
                                },
                            ]}
                        />

                        <FormatPane
                            className="mx-auto"
                            indentation={formatIndentation}
                            sortKeys={formatSortKeys}
                            removeTrailingCommas={formatRemoveTrailingCommas}
                            escapeUnicode={formatEscapeUnicode}
                            onError={handleError}
                            onValidationChange={() => {}}
                            onIndentationChange={setFormatIndentation}
                        />
                    </div>
                </TabsContent>

                <FormatShareDialog
                    content={formatContent}
                    open={shareDialogOpen}
                    onOpenChange={setShareDialogOpen}
                />

                <MinifyShareDialog
                    content={minifyContent}
                    open={minifyShareDialogOpen}
                    onOpenChange={setMinifyShareDialogOpen}
                />

                <ViewerShareDialog
                    content={viewerContent}
                    open={viewerShareDialogOpen}
                    onOpenChange={setViewerShareDialogOpen}
                />

                <ParserShareDialog
                    content={parserContent}
                    open={parserShareDialogOpen}
                    onOpenChange={setParserShareDialogOpen}
                />

                <ExportShareDialog
                    content={exportContent}
                    format={exportFormat}
                    open={exportShareDialogOpen}
                    onOpenChange={setExportShareDialogOpen}
                />

                <SchemaShareDialog
                    content={schemaContent}
                    mode={schemaMode}
                    open={schemaShareDialogOpen}
                    onOpenChange={setSchemaShareDialogOpen}
                />

                <Dialog
                    open={!!viewingHistoryItem}
                    onOpenChange={(open) => !open && setViewingHistoryItem(null)}
                >
                    <DialogContent className="max-w-[95vw] max-h-[85vh] overflow-hidden flex flex-col">
                        <DialogHeader>
                            <DialogTitle>
                                {viewingHistoryItem && getToolInfo(viewingHistoryItem.key).name} -
                                Full Content
                            </DialogTitle>
                            <DialogDescription>
                                {viewingHistoryItem &&
                                    `${viewingHistoryItem.content.length} characters`}
                            </DialogDescription>
                        </DialogHeader>
                        <div className="flex-1 overflow-auto mt-4">
                            <pre className="text-sm bg-muted p-4 rounded-md overflow-auto">
                                <code>{viewingHistoryItem?.content}</code>
                            </pre>
                        </div>
                    </DialogContent>
                </Dialog>

                <TabsContent value="minify" className="mt-0">
                    <div>
                        <Toolbar
                            toggles={[
                                {
                                    id: 'sortKeys',
                                    label: 'Sort Keys',
                                    checked: minifySortKeys,
                                    onChange: setMinifySortKeys,
                                },
                                {
                                    id: 'removeWhitespace',
                                    label: 'Remove Whitespace',
                                    checked: minifyRemoveWhitespace,
                                    onChange: setMinifyRemoveWhitespace,
                                },
                            ]}
                            actions={[
                                {
                                    id: 'clear',
                                    label: 'Clear All',
                                    onClick: handleClear,
                                    variant: 'outline',
                                    icon: <Trash2 className="h-4 w-4" />,
                                },
                                {
                                    id: 'share',
                                    label: 'Share',
                                    onClick: handleMinifyShare,
                                    variant: 'outline',
                                    icon: <Share2 className="h-4 w-4" />,
                                },
                            ]}
                        />

                        <MinifyPane
                            className="mx-auto"
                            sortKeys={minifySortKeys}
                            removeWhitespace={minifyRemoveWhitespace}
                            onError={handleError}
                            onValidationChange={() => {}}
                        />
                    </div>
                </TabsContent>

                <TabsContent value="viewer" className="mt-0">
                    <div>
                        <Toolbar
                            toggles={[
                                {
                                    id: 'showTypes',
                                    label: 'Show Types',
                                    checked: viewerShowTypes,
                                    onChange: setViewerShowTypes,
                                },
                                {
                                    id: 'showPaths',
                                    label: 'Show Paths',
                                    checked: viewerShowPaths,
                                    onChange: setViewerShowPaths,
                                },
                                {
                                    id: 'sortKeys',
                                    label: 'Sort Keys',
                                    checked: viewerSortKeys,
                                    onChange: setViewerSortKeys,
                                },
                            ]}
                            actions={[
                                {
                                    id: 'clear',
                                    label: 'Clear All',
                                    onClick: handleClear,
                                    variant: 'outline',
                                    icon: <Trash2 className="h-4 w-4" />,
                                },
                                {
                                    id: 'share',
                                    label: 'Share',
                                    onClick: handleViewerShare,
                                    variant: 'outline',
                                    icon: <Share2 className="h-4 w-4" />,
                                },
                            ]}
                        />

                        <ViewerPane
                            className="mx-auto"
                            showTypes={viewerShowTypes}
                            showPaths={viewerShowPaths}
                            sortKeys={viewerSortKeys}
                            onError={handleError}
                            onValidationChange={() => {}}
                        />
                    </div>
                </TabsContent>

                <TabsContent value="parser" className="mt-0">
                    <div>
                        <Toolbar
                            toggles={[
                                {
                                    id: 'showTypes',
                                    label: 'Show Types',
                                    checked: parserShowTypes,
                                    onChange: setParserShowTypes,
                                },
                                {
                                    id: 'showPaths',
                                    label: 'Show Paths',
                                    checked: parserShowPaths,
                                    onChange: setParserShowPaths,
                                },
                                {
                                    id: 'showStatistics',
                                    label: 'Show Statistics',
                                    checked: parserShowStatistics,
                                    onChange: setParserShowStatistics,
                                },
                            ]}
                            actions={[
                                {
                                    id: 'clear',
                                    label: 'Clear All',
                                    onClick: handleClear,
                                    variant: 'outline',
                                    icon: <Trash2 className="h-4 w-4" />,
                                },
                                {
                                    id: 'share',
                                    label: 'Share',
                                    onClick: handleParserShare,
                                    variant: 'outline',
                                    icon: <Share2 className="h-4 w-4" />,
                                },
                            ]}
                        />

                        <ParserPane
                            className="mx-auto"
                            showTypes={parserShowTypes}
                            showPaths={parserShowPaths}
                            showStatistics={parserShowStatistics}
                            onError={handleError}
                            onValidationChange={() => {}}
                        />
                    </div>
                </TabsContent>

                <TabsContent value="export" className="mt-0">
                    <div>
                        <Toolbar
                            toggles={[]}
                            actions={[
                                {
                                    id: 'clear',
                                    label: 'Clear All',
                                    onClick: handleClear,
                                    variant: 'outline',
                                    icon: <Trash2 className="h-4 w-4" />,
                                },
                                {
                                    id: 'share',
                                    label: 'Share',
                                    onClick: handleExportShare,
                                    variant: 'outline',
                                    icon: <Share2 className="h-4 w-4" />,
                                },
                            ]}
                        />

                        <ExportPane
                            className="mx-auto"
                            onError={handleError}
                            onValidationChange={() => {}}
                        />
                    </div>
                </TabsContent>

                <TabsContent value="schema" className="mt-0">
                    <div>
                        <Toolbar
                            toggles={[
                                {
                                    id: 'schema-generate',
                                    label: 'Generate Schema',
                                    checked: schemaMode === 'generate',
                                    onChange: () => setSchemaMode('generate'),
                                },
                                {
                                    id: 'schema-validate',
                                    label: 'Validate JSON',
                                    checked: schemaMode === 'validate',
                                    onChange: () => setSchemaMode('validate'),
                                },
                            ]}
                            actions={[
                                {
                                    id: 'clear',
                                    label: 'Clear All',
                                    onClick: handleClear,
                                    variant: 'outline',
                                    icon: <Trash2 className="h-4 w-4" />,
                                },
                                {
                                    id: 'share',
                                    label: 'Share',
                                    onClick: handleSchemaShare,
                                    variant: 'outline',
                                    icon: <Share2 className="h-4 w-4" />,
                                },
                            ]}
                        />

                        <SchemaPane
                            mode={schemaMode}
                            className="mx-auto"
                            onError={handleError}
                            onValidationChange={() => {}}
                            onContentChange={(_jsonContent: string, schemaContent: string) => {
                                setSchemaContent(schemaContent);
                            }}
                        />
                    </div>
                </TabsContent>

                <TabsContent value="share" className="mt-0">
                    <div className="container mx-auto px-4 py-8">
                        <div className="max-w-4xl">
                            <h2 className="text-2xl font-bold mb-4">Share JSON</h2>
                            <p className="text-muted-foreground mb-6">
                                Share your JSON data with others through shareable links and
                                collaborative features.
                            </p>
                            <div className="space-y-4">
                                <div className="p-4 border rounded-lg">
                                    <h3 className="font-semibold mb-2">Generate Share Link</h3>
                                    <p className="text-sm text-muted-foreground">
                                        Coming soon: Create a unique shareable link for your JSON
                                        data.
                                    </p>
                                </div>
                                <div className="p-4 border rounded-lg">
                                    <h3 className="font-semibold mb-2">Export Options</h3>
                                    <p className="text-sm text-muted-foreground">
                                        Coming soon: Export JSON to various formats (JSON, CSV, XML,
                                        YAML).
                                    </p>
                                </div>
                                <div className="p-4 border rounded-lg">
                                    <h3 className="font-semibold mb-2">Collaborative Editing</h3>
                                    <p className="text-sm text-muted-foreground">
                                        Coming soon: Real-time collaboration features for JSON
                                        editing.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
}
