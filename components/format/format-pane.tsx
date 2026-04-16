'use client';

import { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import { toast } from 'sonner';
import { Copy, Download, FileCode, FileJson } from 'lucide-react';
import { JsonEditor } from '@/components/editor/json-editor';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { useFormatJson } from '@/components/format/use-format-json';
import type { FormatPaneProps, FormatOptions } from '@/components/format/types';
import { STORAGE_KEYS } from '@/lib/constants';

export const FormatPane = ({
    indentation = 2,
    sortKeys = false,
    removeTrailingCommas = false,
    escapeUnicode = false,
    onError,
    onValidationChange,
    onContentChange,
    initialLeftContent = '',
    className,
}: FormatPaneProps) => {
    // Track if we've loaded shared data
    const sharedDataLoadedRef = useRef(!!initialLeftContent);

    // Track initial content to avoid saving it to localStorage
    const initialLeftContentRef = useRef(initialLeftContent);

    // State with localStorage loading during initialization
    const [leftContent, setLeftContent] = useState<string>(() => {
        if (initialLeftContent) {
            return initialLeftContent;
        }
        if (typeof window !== 'undefined') {
            try {
                const saved = localStorage.getItem(STORAGE_KEYS.JSON_FORMAT_LEFT_CONTENT);
                if (saved) return saved;
            } catch (error) {
                console.error('Failed to load from localStorage:', error);
            }
        }
        return '';
    });

    // Save to localStorage whenever content changes (but not on initial render)
    useEffect(() => {
        // Only save if content is different from initial props
        if (leftContent !== initialLeftContentRef.current) {
            try {
                localStorage.setItem(STORAGE_KEYS.JSON_FORMAT_LEFT_CONTENT, leftContent);
            } catch (error) {
                console.error('Failed to save left content to localStorage:', error);
            }
        }
        // Notify parent of content change
        onContentChange?.(leftContent);
    }, [leftContent, onContentChange]);

    // Load format options from localStorage on mount
    const [savedFormatOptions] = useState<FormatOptions | null>(() => {
        if (typeof window === 'undefined') return null;

        try {
            const saved = localStorage.getItem(STORAGE_KEYS.FORMAT_OPTIONS);
            if (saved) {
                return JSON.parse(saved);
            }
        } catch (error) {
            console.error('Failed to load format options:', error);
        }

        return null;
    });

    // Derive format options from props and saved options
    const formatOptions = useMemo<FormatOptions>(() => {
        const baseOptions = {
            indentation: indentation || 2,
            sortKeys,
            removeTrailingCommas,
            escapeUnicode,
        };

        if (savedFormatOptions) {
            return {
                ...baseOptions,
                // Use saved values for non-indentation options if not explicitly provided
                sortKeys: sortKeys ?? savedFormatOptions.sortKeys,
                removeTrailingCommas:
                    removeTrailingCommas ?? savedFormatOptions.removeTrailingCommas,
                escapeUnicode: escapeUnicode ?? savedFormatOptions.escapeUnicode,
            };
        }

        return baseOptions;
    }, [indentation, sortKeys, removeTrailingCommas, escapeUnicode, savedFormatOptions]);

    // Save format options to localStorage when they change (except indentation which is managed by parent)
    useEffect(() => {
        if (typeof window === 'undefined') return;

        try {
            const optionsToSave = {
                sortKeys: formatOptions.sortKeys,
                removeTrailingCommas: formatOptions.removeTrailingCommas,
                escapeUnicode: formatOptions.escapeUnicode,
            };
            localStorage.setItem(STORAGE_KEYS.FORMAT_OPTIONS, JSON.stringify(optionsToSave));
        } catch (error) {
            console.error('Failed to save format options:', error);
        }
    }, [formatOptions.sortKeys, formatOptions.removeTrailingCommas, formatOptions.escapeUnicode]);

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
        toast.success('Copied to clipboard');
    }, []);

    // Handle download success
    const handleDownloadSuccess = useCallback(() => {
        // Could show toast notification here
        console.log('Downloaded file');
    }, []);

    // Handle copy error
    const handleCopyError = useCallback(
        (error: Error) => {
            console.error('Failed to copy:', error);
            onError?.(error);
        },
        [onError],
    );

    // Handle download error
    const handleDownloadError = useCallback(
        (error: Error) => {
            console.error('Failed to download:', error);
            onError?.(error);
        },
        [onError],
    );

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
                <div className="w-full md:w-1/2 min-w-0">
                    <JsonEditor
                        label="Unformatted JSON"
                        value={leftContent}
                        onChange={setLeftContent}
                        onError={() => {}}
                        height="600px"
                        emptyStateIcon={FileJson}
                    />
                </div>

                <Separator orientation="vertical" className="hidden md:block" />
                <Separator orientation="horizontal" className="block md:hidden" />

                <div className="w-full md:w-1/2 min-w-0">
                    <JsonEditor
                        label="Formatted JSON"
                        value={formatResult.formatted}
                        onChange={() => {}}
                        onError={() => {}}
                        readOnly={true}
                        height="600px"
                        showEmptyPrompt={true}
                        emptyStateIcon={FileCode}
                        customToolbar={
                            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-2 shrink-0">
                                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Formatted JSON
                                </label>
                                <div className="flex flex-wrap items-center gap-2 sm:gap-3 w-full sm:w-auto">
                                    <span className="text-sm text-muted-foreground">
                                        {formatOptions.indentation} space
                                        {formatOptions.indentation !== 1 ? 's' : ''}
                                        {formatOptions.sortKeys && ', Sort'}
                                        {formatOptions.removeTrailingCommas && ', No Commas'}
                                        {formatOptions.escapeUnicode && ', Unicode'}
                                    </span>
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
                                                <p>Download as JSON</p>
                                            </TooltipContent>
                                        </Tooltip>
                                    </div>
                                </div>
                            </div>
                        }
                    />
                </div>
            </div>
        </div>
    );
};
