'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { toast } from 'sonner';
import { Copy, Download, ScanSearch } from 'lucide-react';
import { JsonEditor } from '@/components/editor/json-editor';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { EmptyEditorPrompt } from '@/components/ui/empty-editor-prompt';
import { useJsonParser } from '@/components/parser/use-json-parser';
import { ParserResults } from '@/components/parser/parser-results';
import type { ParserPaneProps } from '@/components/parser/types';
import { STORAGE_KEYS } from '@/lib/constants';

export const ParserPane = ({
    showTypes = true,
    showPaths = true,
    showStatistics = true,
    onError,
    onValidationChange,
    onContentChange,
    initialContent = '',
    className,
}: ParserPaneProps) => {
    // Track if we've loaded shared data
    const sharedDataLoadedRef = useRef(!!initialContent);

    // State with simplified initialization: shared content > localStorage > empty
    const [leftContent, setLeftContent] = useState<string>(() => {
        // Priority 1: Use initial content if provided (shared data)
        if (initialContent) {
            sharedDataLoadedRef.current = true;
            return initialContent;
        }
        // Priority 2: Load from localStorage
        try {
            const saved = localStorage.getItem(STORAGE_KEYS.JSON_PARSER_CONTENT);
            if (saved) {
                return saved;
            }
        } catch (error) {
            console.error('Failed to load from localStorage:', error);
        }
        // Priority 3: Empty string
        return '';
    });

    // Track initial content to avoid saving it to localStorage
    const initialContentRef = useRef(initialContent);

    // Update content when shared data arrives asynchronously
    useEffect(() => {
        // If shared data just arrived (was undefined, now has value)
        if (initialContent && !sharedDataLoadedRef.current) {
            sharedDataLoadedRef.current = true;
            setLeftContent(initialContent);
        }
        initialContentRef.current = initialContent;
    }, [initialContent]);

    // Save to localStorage whenever content changes (but not on initial render)
    useEffect(() => {
        // Only save if content is different from initial props
        if (leftContent !== initialContentRef.current) {
            try {
                localStorage.setItem(STORAGE_KEYS.JSON_PARSER_CONTENT, leftContent);
            } catch (error) {
                console.error('Failed to save content to localStorage:', error);
            }
        }
        // Notify parent of content change
        onContentChange?.(leftContent);
    }, [leftContent, onContentChange]);

    // Parse JSON
    const parsedData = useJsonParser(leftContent, { showTypes, showPaths, showStatistics });

    // Handle validation changes
    useEffect(() => {
        onValidationChange?.(parsedData.isValid);
    }, [parsedData.isValid, onValidationChange]);

    // Handle errors
    useEffect(() => {
        if (parsedData.error) {
            onError?.(new Error(parsedData.error));
        }
    }, [parsedData.error, onError]);

    // Handle copy
    const handleCopy = useCallback(async () => {
        try {
            await navigator.clipboard.writeText(leftContent);
            toast.success('Copied to clipboard');
        } catch (error) {
            console.error('Failed to copy:', error);
            toast.error('Failed to copy to clipboard');
            onError?.(error as Error);
        }
    }, [leftContent, onError]);

    // Handle download
    const handleDownload = useCallback(() => {
        try {
            const blob = new Blob([leftContent], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'parsed.json';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            console.log('Downloaded file');
        } catch (error) {
            console.error('Failed to download:', error);
            onError?.(error as Error);
        }
    }, [leftContent, onError]);

    return (
        <div className={className}>
            {/* Editor Panes */}
            <div className="flex flex-col md:flex-row gap-4">
                <div className="w-full md:w-1/2 min-w-0">
                    <JsonEditor
                        label="JSON Input"
                        value={leftContent}
                        onChange={setLeftContent}
                        onError={() => {}}
                        height="600px"
                    />
                </div>

                <Separator orientation="vertical" className="hidden md:block" />
                <Separator orientation="horizontal" className="block md:hidden" />

                <div className="w-full md:w-1/2 min-w-0 flex flex-col" style={{ height: '650px' }}>
                    {/* Toolbar */}
                    <div className="flex items-center justify-between py-2 shrink-0">
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            Parser Results
                        </label>
                        <div className="flex items-center gap-2">
                            <div className="flex items-center gap-2">
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8"
                                            onClick={handleCopy}
                                            disabled={!parsedData.isValid || !leftContent}
                                        >
                                            <Copy className="h-4 w-4" />
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <p>Copy to clipboard</p>
                                    </TooltipContent>
                                </Tooltip>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8"
                                            onClick={handleDownload}
                                            disabled={!parsedData.isValid || !leftContent}
                                        >
                                            <Download className="h-4 w-4" />
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <p>Download as JSON</p>
                                    </TooltipContent>
                                </Tooltip>
                            </div>
                        </div>
                    </div>

                    {/* Results */}
                    <div className="overflow-auto max-w-full flex-1">
                        {parsedData.isValid && parsedData.structure ? (
                            <ParserResults
                                parsedData={parsedData}
                                showTypes={showTypes}
                                showPaths={showPaths}
                                showStatistics={showStatistics}
                            />
                        ) : parsedData.error ? (
                            <div className="text-red-500 text-center py-8">
                                <div className="font-medium">Invalid JSON</div>
                                <div className="text-sm mt-1">{parsedData.error}</div>
                            </div>
                        ) : (
                            <EmptyEditorPrompt
                                icon={ScanSearch}
                                title="No parsed data"
                                description="Enter JSON in the editor to parse and analyze its structure"
                                showActions={false}
                            />
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
