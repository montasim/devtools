'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { Toolbar } from '@/components/toolbar';
import { EditorPane, type EditorPaneRef } from '@/components/editor-pane';
import { FormatPane, FormatShareDialog } from '@/components/format-pane';
import { MinifyPane, MinifyShareDialog } from '@/components/minify-pane';
import { ViewerPane, ViewerShareDialog } from '@/components/viewer-pane';
import { ParserPane, ParserShareDialog } from '@/components/parser-pane';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Settings, GitCompare, Code, Minimize2, FileJson, Share2, Trash2, Eye } from 'lucide-react';

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
    const [canFormat, setCanFormat] = useState(false);
    const [shareDialogOpen, setShareDialogOpen] = useState(false);
    const [formatContent, setFormatContent] = useState('');
    const [minifySortKeys, setMinifySortKeys] = useState(false);
    const [minifyRemoveWhitespace, setMinifyRemoveWhitespace] = useState(true);
    const [canMinify, setCanMinify] = useState(false);
    const [minifyShareDialogOpen, setMinifyShareDialogOpen] = useState(false);
    const [minifyContent, setMinifyContent] = useState('');
    const [viewerShowTypes, setViewerShowTypes] = useState(false);
    const [viewerShowPaths, setViewerShowPaths] = useState(false);
    const [viewerSortKeys, setViewerSortKeys] = useState(false);
    const [canView, setCanView] = useState(false);
    const [viewerShareDialogOpen, setViewerShareDialogOpen] = useState(false);
    const [viewerContent, setViewerContent] = useState('');
    const [parserShowTypes, setParserShowTypes] = useState(true);
    const [parserShowPaths, setParserShowPaths] = useState(true);
    const [parserShowStatistics, setParserShowStatistics] = useState(true);
    const [canParse, setCanParse] = useState(false);
    const [parserShareDialogOpen, setParserShareDialogOpen] = useState(false);
    const [parserContent, setParserContent] = useState('');

    const editorPaneRef = useRef<EditorPaneRef>(null);

    const handleCompare = useCallback(
        (result: { hunks: unknown[]; additionCount: number; deletionCount: number }) => {
            // console.log('Diff result:', result);
        },
        [],
    );

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

    return (
        <div className="min-h-screen">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
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
                                {[{ value: 'options', label: 'Options', icon: Settings }].map(
                                    ({ value, label, icon: Icon }) => (
                                        <TabsTrigger
                                            key={value}
                                            value={value}
                                            className="gap-2 data-[icon=true]:pr-4"
                                        >
                                            <Icon data-icon="true" className="w-4 h-4" />
                                            {label}
                                        </TabsTrigger>
                                    ),
                                )}
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
                            onValidationChange={setCanFormat}
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
                            onValidationChange={setCanMinify}
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
                            onValidationChange={setCanView}
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
                            onValidationChange={setCanParse}
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
