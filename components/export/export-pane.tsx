'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { toast } from 'sonner';
import { Copy, Download, FileDown } from 'lucide-react';
import { JsonEditor } from '@/components/editor/json-editor';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { EmptyEditorPrompt } from '@/components/ui/empty-editor-prompt';
import { useJsonExport } from '@/components/export/use-json-export';
import type { ExportPaneProps, ExportFormat } from '@/components/export/types';
import { STORAGE_KEYS } from '@/lib/constants';

export const ExportPane = ({
    onError,
    onValidationChange,
    onContentChange,
    initialContent = '',
    className,
    exportFormat: propExportFormat,
    onExportFormatChange,
}: ExportPaneProps) => {
    // Track if we've loaded shared data
    const sharedDataLoadedRef = useRef(!!initialContent);

    // State with simplified initialization: shared content > localStorage > empty
    const [leftContent, setLeftContent] = useState<string>(() => {
        // Priority 1: Use initial content if provided (shared data)
        if (initialContent) {
            return initialContent;
        }
        // Priority 2: Load from localStorage
        try {
            const saved = localStorage.getItem(STORAGE_KEYS.JSON_EXPORT_CONTENT);
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

    // Mark shared data as loaded on mount if initial content was provided
    useEffect(() => {
        if (initialContent) {
            sharedDataLoadedRef.current = true;
        }
    }, [initialContent]);

    // Save to localStorage whenever content changes (but not on initial render)
    useEffect(() => {
        // Only save if content is different from initial props
        if (leftContent !== initialContentRef.current) {
            try {
                localStorage.setItem(STORAGE_KEYS.JSON_EXPORT_CONTENT, leftContent);
            } catch (error) {
                console.error('Failed to save left content to localStorage:', error);
            }
        }
        // Notify parent of content change
        onContentChange?.(leftContent);
    }, [leftContent, onContentChange]);

    // Export options state - use prop if provided, otherwise use local state
    const [localExportFormat, setLocalExportFormat] = useState<ExportFormat>('csv');
    const exportFormat = propExportFormat ?? localExportFormat;
    const handleExportFormatChange = (format: ExportFormat) => {
        if (onExportFormatChange) {
            onExportFormatChange(format);
        } else {
            setLocalExportFormat(format);
        }
    };

    // Export JSON
    const exportResult = useJsonExport(leftContent, { format: exportFormat });

    // Handle validation changes
    useEffect(() => {
        onValidationChange?.(exportResult.isValid);
    }, [exportResult.isValid, onValidationChange]);

    // Handle errors
    useEffect(() => {
        if (exportResult.error) {
            onError?.(new Error(exportResult.error));
        }
    }, [exportResult.error, onError]);

    // Handle copy
    const handleCopy = useCallback(async () => {
        try {
            await navigator.clipboard.writeText(exportResult.converted);
            toast.success('Copied to clipboard');
        } catch (error) {
            console.error('Failed to copy:', error);
            toast.error('Failed to copy to clipboard');
            onError?.(error as Error);
        }
    }, [exportResult.converted, onError]);

    // Handle download
    const handleDownload = useCallback(() => {
        try {
            const blob = new Blob([exportResult.converted], { type: 'text/plain' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `exported.${exportFormat}`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            console.log('Downloaded file');
        } catch (error) {
            console.error('Failed to download:', error);
            onError?.(error as Error);
        }
    }, [exportResult.converted, exportFormat, onError]);

    const isDisabled = !exportResult.isValid || !exportResult.converted;

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
                            Exported Output
                        </label>
                        <div className="flex items-center gap-2">
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8"
                                        onClick={handleCopy}
                                        disabled={isDisabled}
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
                                        disabled={isDisabled}
                                    >
                                        <Download className="h-4 w-4" />
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p>Download file</p>
                                </TooltipContent>
                            </Tooltip>
                        </div>
                    </div>

                    {/* Export Output */}
                    <div className="border border-gray-300 rounded-md dark:border-gray-600 p-4 overflow-auto max-w-full flex-1">
                        {exportResult.isValid && exportResult.converted ? (
                            <pre className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap break-all font-mono">
                                {exportResult.converted}
                            </pre>
                        ) : exportResult.error ? (
                            <div className="text-red-500 text-center py-8">
                                <div className="font-medium">Invalid JSON</div>
                                <div className="text-sm mt-1">{exportResult.error}</div>
                            </div>
                        ) : (
                            <EmptyEditorPrompt
                                icon={FileDown}
                                title="No export data"
                                description="Enter JSON in the editor to export to different formats"
                                showActions={false}
                            />
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
