'use client';

import { useState, useCallback, useEffect } from 'react';
import { Copy, Download } from 'lucide-react';
import { JsonEditor } from '../editor-pane/json-editor';
import { Separator } from '../ui/separator';
import { Button } from '../ui/button';
import { useFormatJson } from './use-format-json';
import type { FormatPaneProps, FormatOptions } from './types';

export const FormatPane = ({
    indentation = 2,
    sortKeys = false,
    removeTrailingCommas = false,
    escapeUnicode = false,
    onError,
    onValidationChange,
    className,
}: FormatPaneProps) => {
    const [leftContent, setLeftContent] = useState('');
    const [leftValid, setLeftValid] = useState(false);

    // Load format options from localStorage on mount
    const [formatOptions, setFormatOptions] = useState<FormatOptions>(() => {
        if (typeof window === 'undefined') {
            return { indentation: indentation || 2, sortKeys, removeTrailingCommas, escapeUnicode };
        }

        try {
            const saved = localStorage.getItem('format-options');
            if (saved) {
                return { ...JSON.parse(saved), indentation: indentation || 2 };
            }
        } catch (error) {
            console.error('Failed to load format options:', error);
        }

        return { indentation: indentation || 2, sortKeys, removeTrailingCommas, escapeUnicode };
    });

    // Save format options to localStorage when they change
    useEffect(() => {
        try {
            localStorage.setItem('format-options', JSON.stringify(formatOptions));
        } catch (error) {
            console.error('Failed to save format options:', error);
        }
    }, [formatOptions]);

    // Format JSON
    const formatResult = useFormatJson(leftContent, formatOptions);

    // Handle validation changes
    useEffect(() => {
        onValidationChange?.(formatResult.isValid);
    }, [formatResult.isValid, onValidationChange]);

    // Handle errors
    useEffect(() => {
        if (formatResult.error) {
            onError?.(new Error(formatResult.error.message));
        }
    }, [formatResult.error, onError]);

    // Handle copy success
    const handleCopySuccess = useCallback(() => {
        // Could show toast notification here
        console.log('Copied to clipboard');
    }, []);

    // Handle download success
    const handleDownloadSuccess = useCallback(() => {
        // Could show toast notification here
        console.log('Downloaded file');
    }, []);

    // Handle copy error
    const handleCopyError = useCallback((error: Error) => {
        console.error('Failed to copy:', error);
        onError?.(error);
    }, [onError]);

    // Handle download error
    const handleDownloadError = useCallback((error: Error) => {
        console.error('Failed to download:', error);
        onError?.(error);
    }, [onError]);

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(formatResult.formatted);
            handleCopySuccess();
        } catch (error) {
            handleCopyError(error as Error);
        }
    };

    const handleDownload = () => {
        try {
            const blob = new Blob([formatResult.formatted], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'formatted.json';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            handleDownloadSuccess();
        } catch (error) {
            handleDownloadError(error as Error);
        }
    };

    const isDisabled = !formatResult.isValid || !formatResult.formatted;

    return (
        <div className={className}>
            {/* Editor Panes */}
            <div className="flex flex-col md:flex-row gap-4">
                <div className="w-full md:w-1/2">
                    <JsonEditor
                        label="Unformatted JSON"
                        value={leftContent}
                        onChange={setLeftContent}
                        onError={(error) => {
                            setLeftValid(error === null && leftContent.trim().length > 0);
                        }}
                    />
                </div>

                <Separator orientation="vertical" className="hidden md:block" />
                <Separator orientation="horizontal" className="block md:hidden" />

                <div className="w-full md:w-1/2 flex flex-col">
                    {/* Custom header for Formatted JSON with action buttons */}
                    <div className="flex items-center justify-between mb-2 shrink-0">
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            Formatted JSON
                        </label>
                        <div className="flex items-center gap-3">
                            <span className="text-sm text-muted-foreground">
                                {formatOptions.indentation} spaces
                                {formatOptions.sortKeys && ', Sort'}
                                {formatOptions.removeTrailingCommas && ', No Commas'}
                                {formatOptions.escapeUnicode && ', Unicode'}
                            </span>
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
                                    title="Download as JSON"
                                >
                                    <Download className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    </div>

                    <JsonEditor
                        label=""
                        value={formatResult.formatted}
                        onChange={() => {}}
                        onError={() => {}}
                        readOnly={true}
                    />
                </div>
            </div>
        </div>
    );
};
