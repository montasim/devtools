'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { Copy, Download } from 'lucide-react';
import { JsonEditor } from '../editor-pane/json-editor';
import { Separator } from '../ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Button } from '../ui/button';
import { useJsonExport } from './use-json-export';
import type { ExportPaneProps, ExportFormat } from './types';

export const ExportPane = ({
    onError,
    onValidationChange,
    initialContent = '',
    className,
}: ExportPaneProps) => {
    // State with lazy initialization from localStorage
    const [leftContent, setLeftContent] = useState<string>(() => {
        if (initialContent !== '') return initialContent;
        try {
            return localStorage.getItem('json-export-content') || initialContent;
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
                localStorage.setItem('json-export-content', leftContent);
            } catch (error) {
                console.error('Failed to save left content to localStorage:', error);
            }
        }
    }, [leftContent]);

    // Export options state
    const [exportFormat, setExportFormat] = useState<ExportFormat>('csv');

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
            console.log('Copied to clipboard');
        } catch (error) {
            console.error('Failed to copy:', error);
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

    const formatOptions: { value: ExportFormat; label: string; extension: string }[] = [
        { value: 'csv', label: 'CSV', extension: 'csv' },
        { value: 'xml', label: 'XML', extension: 'xml' },
        { value: 'yaml', label: 'YAML', extension: 'yaml' },
        { value: 'toml', label: 'TOML', extension: 'toml' },
        { value: 'json', label: 'JSON', extension: 'json' },
    ];

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
                        <div className="flex items-center gap-3">
                            <Select
                                value={exportFormat}
                                onValueChange={(value) => setExportFormat(value as ExportFormat)}
                            >
                                <SelectTrigger className="h-8 w-[120px] text-xs">
                                    <SelectValue placeholder="Format" />
                                </SelectTrigger>
                                <SelectContent>
                                    {formatOptions.map((option) => (
                                        <SelectItem key={option.value} value={option.value}>
                                            {option.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <div className="flex items-center gap-2">
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8"
                                    onClick={handleCopy}
                                    disabled={isDisabled}
                                    title="Copy to clipboard"
                                >
                                    <Copy className="h-4 w-4" />
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8"
                                    onClick={handleDownload}
                                    disabled={isDisabled}
                                    title="Download file"
                                >
                                    <Download className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    </div>

                    {/* Export Output */}
                    <div className="border border-gray-300 rounded-md dark:border-gray-600 p-4 overflow-auto max-w-full flex-1">
                        {exportResult.isValid && exportResult.converted ? (
                            <pre className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap break-all font-mono">
                                {exportResult.converted}
                            </pre>
                        ) : (
                            <div className="text-gray-400 text-center py-8">
                                {exportResult.error ? (
                                    <div className="text-red-500">
                                        <div className="font-medium">Invalid JSON</div>
                                        <div className="text-sm mt-1">{exportResult.error}</div>
                                    </div>
                                ) : (
                                    'Enter JSON to export to different formats'
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
