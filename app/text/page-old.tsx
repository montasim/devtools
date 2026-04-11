'use client';

import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Toolbar } from '@/components/toolbar';
import { FormatPane, FormatShareDialog } from '@/components/format-pane';
import { ParserPane, ParserShareDialog } from '@/components/parser-pane';
import { TextDiffPane } from '@/components/text-tools/diff-pane/diff-pane';
import { ConvertPane } from '@/components/text-tools/convert-pane/convert-pane';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Settings, GitCompare, Code, FileJson, Share2, Trash2, Repeat } from 'lucide-react';
import { STORAGE_KEYS } from '@/lib/constants';

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
                const content = localStorage.getItem(STORAGE_KEYS.JSON_FORMAT_LEFT_CONTENT) || '';
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
                const content = localStorage.getItem(STORAGE_KEYS.JSON_PARSER_CONTENT) || '';
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
            STORAGE_KEYS.TEXT_DIFF_LEFT_CONTENT,
            STORAGE_KEYS.TEXT_DIFF_RIGHT_CONTENT,
            STORAGE_KEYS.TEXT_CONVERT_INPUT_CONTENT,
            STORAGE_KEYS.JSON_FORMAT_LEFT_CONTENT,
            STORAGE_KEYS.JSON_MINIFY_LEFT_CONTENT,
            STORAGE_KEYS.JSON_VIEWER_CONTENT,
            STORAGE_KEYS.JSON_PARSER_CONTENT,
            STORAGE_KEYS.JSON_EXPORT_CONTENT,
            STORAGE_KEYS.JSON_SCHEMA_JSON_CONTENT,
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
        const formattedContent = localStorage.getItem(STORAGE_KEYS.JSON_FORMAT_LEFT_CONTENT);
        if (!formattedContent) {
            toast.error('No content to share. Please enter some JSON first.');
            return;
        }

        // Open the share dialog
        setShareDialogOpen(true);
    };

    const handleParserShare = () => {
        // Get the parser content from localStorage
        const parserContentData = localStorage.getItem(STORAGE_KEYS.JSON_PARSER_CONTENT);
        if (!parserContentData) {
            toast.error('No content to share. Please enter some JSON first.');
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
            </Tabs>
        </div>
    );
}
