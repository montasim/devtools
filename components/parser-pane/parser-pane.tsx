'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { toast } from 'sonner';
import { Copy, Download, ScanSearch } from 'lucide-react';
import { JsonEditor } from '../editor-pane/json-editor';
import { Separator } from '../ui/separator';
import { Button } from '../ui/button';
import { EmptyEditorPrompt } from '@/components/ui/empty-editor-prompt';
import { useJsonParser } from './use-json-parser';
import { ParserResults } from './parser-results';
import type { ParserPaneProps } from './types';
import { STORAGE_KEYS } from '@/lib/constants';

export const ParserPane = ({
    showTypes = true,
    showPaths = true,
    showStatistics = true,
    onError,
    onValidationChange,
    initialContent = '',
    className,
}: ParserPaneProps) => {
    // State with lazy initialization from localStorage
    const [leftContent, setLeftContent] = useState<string>(() => {
        if (initialContent !== '') return initialContent;
        try {
            return localStorage.getItem(STORAGE_KEYS.JSON_PARSER_CONTENT) || initialContent;
        } catch {
            return initialContent;
        }
    });

    // Track initial content to avoid saving it to localStorage
    const initialContentRef = useRef(initialContent);

    useEffect(() => {
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
    }, [leftContent]);

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
                        totalKeys={
                            parsedData.isValid && parsedData.statistics.totalKeys > 0
                                ? parsedData.statistics.totalKeys
                                : undefined
                        }
                        totalValues={
                            parsedData.isValid && parsedData.statistics.totalValues > 0
                                ? parsedData.statistics.totalValues
                                : undefined
                        }
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
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8"
                                    onClick={handleCopy}
                                    disabled={!parsedData.isValid || !leftContent}
                                    title="Copy to clipboard"
                                >
                                    <Copy className="h-4 w-4" />
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8"
                                    onClick={handleDownload}
                                    disabled={!parsedData.isValid || !leftContent}
                                    title="Download as JSON"
                                >
                                    <Download className="h-4 w-4" />
                                </Button>
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
