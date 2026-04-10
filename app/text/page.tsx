'use client';

import { useState, useEffect } from 'react';
import { Toolbar } from '@/components/toolbar';
import { FormatPane, FormatShareDialog } from '@/components/format-pane';
import { ParserPane, ParserShareDialog } from '@/components/parser-pane';
import { TextDiffPane } from '@/components/text-tools/diff-pane/diff-pane';
import { ConvertPane } from '@/components/text-tools/convert-pane/convert-pane';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Settings, GitCompare, Code, FileJson, Share2, Trash2, Repeat } from 'lucide-react';

export default function Home() {
    const [activeTab, setActiveTab] = useState('diff');
    const [formatIndentation, setFormatIndentation] = useState(2);
    const [formatSortKeys, setFormatSortKeys] = useState(false);
    const [formatRemoveTrailingCommas, setFormatRemoveTrailingCommas] = useState(false);
    const [formatEscapeUnicode, setFormatEscapeUnicode] = useState(false);
    const [shareDialogOpen, setShareDialogOpen] = useState(false);
    const [formatContent, setFormatContent] = useState('');
    const [parserShowTypes, setParserShowTypes] = useState(true);
    const [parserShowPaths, setParserShowPaths] = useState(true);
    const [parserShowStatistics, setParserShowStatistics] = useState(true);
    const [parserShareDialogOpen, setParserShareDialogOpen] = useState(false);
    const [parserContent, setParserContent] = useState('');

    const handleError = (error: Error) => {
        console.error('Error:', error);
    };

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
        // Clear all text and json tool localStorage
        const keys = [
            'text-diff-left-content',
            'text-diff-right-content',
            'text-convert-input-content',
            'json-format-left-content',
            'json-minify-left-content',
            'json-viewer-content',
            'json-parser-content',
            'json-export-content',
            'json-schema-json-content',
        ];
        keys.forEach((key) => {
            try {
                localStorage.removeItem(key);
            } catch (error) {
                console.error(`Failed to clear ${key}:`, error);
            }
        });
        // Reload page to reset state
        window.location.reload();
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
                                    { value: 'convert', label: 'Convert', icon: Repeat },
                                    { value: 'format', label: 'Format', icon: Code },
                                    { value: 'parser', label: 'Parser', icon: FileJson },
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
                            toggles={[]}
                            actions={[
                                {
                                    id: 'clear',
                                    label: 'Clear All',
                                    onClick: handleClear,
                                    variant: 'outline',
                                },
                            ]}
                        />

                        <div className="mx-auto">
                            <TextDiffPane />
                        </div>
                    </div>
                </TabsContent>

                <TabsContent value="convert" className="mt-0">
                    <div>
                        <ConvertPane />
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

                <ParserShareDialog
                    content={parserContent}
                    open={parserShareDialogOpen}
                    onOpenChange={setParserShareDialogOpen}
                />

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
            </Tabs>
        </div>
    );
}
