'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { Toolbar } from '@/components/toolbar';
import { EditorPane, type EditorPaneRef } from '@/components/editor-pane';
import { FormatPane, FormatShareDialog } from '@/components/format-pane';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Settings, GitCompare, Code, Minimize2, FileJson, Share2, Trash2 } from 'lucide-react';

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

    return (
        <div className="min-h-screen">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <div className="border-b">
                    <div className="mx-auto py-4">
                        <TabsList variant="line" className="h-auto p-0 bg-transparent border-0 w-full justify-between">
                            <div className="flex gap-2">
                                {[
                                    { value: 'diff', label: 'Diff', icon: GitCompare },
                                    { value: 'format', label: 'Format', icon: Code },
                                    { value: 'minify', label: 'Minify', icon: Minimize2 },
                                    { value: 'parser', label: 'Parser', icon: FileJson },
                                    { value: 'share', label: 'Share', icon: Share2 },
                                ].map(({ value, label, icon: Icon }) => (
                                    <TabsTrigger key={value} value={value} className="gap-2 data-[icon=true]:pr-4">
                                        <Icon data-icon="true" className="w-4 h-4" />
                                        {label}
                                    </TabsTrigger>
                                ))}
                            </div>
                            <div className="flex gap-2">
                                {[
                                    { value: 'options', label: 'Options', icon: Settings },
                                ].map(({ value, label, icon: Icon }) => (
                                    <TabsTrigger key={value} value={value} className="gap-2 data-[icon=true]:pr-4">
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
                                    onChange: () => setFormatIndentation(formatIndentation === 2 ? 4 : 2),
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
                        className='mx-auto'
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

                <TabsContent value="minify" className="mt-0">
                    <div className="container mx-auto px-4 py-8">
                        <div className="max-w-4xl">
                            <h2 className="text-2xl font-bold mb-4">Minify JSON</h2>
                            <p className="text-muted-foreground mb-6">
                                Compress your JSON by removing unnecessary whitespace and formatting.
                            </p>
                            <div className="space-y-4">
                                <div className="p-4 border rounded-lg">
                                    <h3 className="font-semibold mb-2">JSON Minifier</h3>
                                    <p className="text-sm text-muted-foreground">
                                        Coming soon: Paste your JSON here to minify it for production use.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </TabsContent>

                <TabsContent value="parser" className="mt-0">
                    <div className="container mx-auto px-4 py-8">
                        <div className="max-w-4xl">
                            <h2 className="text-2xl font-bold mb-4">JSON Parser</h2>
                            <p className="text-muted-foreground mb-6">
                                Parse and validate JSON data with detailed error reporting and structure visualization.
                            </p>
                            <div className="space-y-4">
                                <div className="p-4 border rounded-lg">
                                    <h3 className="font-semibold mb-2">JSON Parser</h3>
                                    <p className="text-sm text-muted-foreground">
                                        Coming soon: Parse JSON to validate structure and visualize data hierarchy.
                                    </p>
                                </div>
                                <div className="p-4 border rounded-lg">
                                    <h3 className="font-semibold mb-2">Path Explorer</h3>
                                    <p className="text-sm text-muted-foreground">
                                        Coming soon: Navigate and explore JSON paths with dot notation support.
                                    </p>
                                </div>
                                <div className="p-4 border rounded-lg">
                                    <h3 className="font-semibold mb-2">Type Inspector</h3>
                                    <p className="text-sm text-muted-foreground">
                                        Coming soon: Inspect data types and validate JSON schema compliance.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </TabsContent>

                <TabsContent value="share" className="mt-0">
                    <div className="container mx-auto px-4 py-8">
                        <div className="max-w-4xl">
                            <h2 className="text-2xl font-bold mb-4">Share JSON</h2>
                            <p className="text-muted-foreground mb-6">
                                Share your JSON data with others through shareable links and collaborative features.
                            </p>
                            <div className="space-y-4">
                                <div className="p-4 border rounded-lg">
                                    <h3 className="font-semibold mb-2">Generate Share Link</h3>
                                    <p className="text-sm text-muted-foreground">
                                        Coming soon: Create a unique shareable link for your JSON data.
                                    </p>
                                </div>
                                <div className="p-4 border rounded-lg">
                                    <h3 className="font-semibold mb-2">Export Options</h3>
                                    <p className="text-sm text-muted-foreground">
                                        Coming soon: Export JSON to various formats (JSON, CSV, XML, YAML).
                                    </p>
                                </div>
                                <div className="p-4 border rounded-lg">
                                    <h3 className="font-semibold mb-2">Collaborative Editing</h3>
                                    <p className="text-sm text-muted-foreground">
                                        Coming soon: Real-time collaboration features for JSON editing.
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
