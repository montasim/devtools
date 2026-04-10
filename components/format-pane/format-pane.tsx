'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { toast } from 'sonner';
import { Copy, Download } from 'lucide-react';
import { JsonEditor } from '../editor-pane/json-editor';
import { Separator } from '../ui/separator';
import { Button } from '../ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Input } from '../ui/input';
import { useFormatJson } from './use-format-json';
import type { FormatPaneProps, FormatOptions } from './types';

export const FormatPane = ({
    indentation = 2,
    sortKeys = false,
    removeTrailingCommas = false,
    escapeUnicode = false,
    onError,
    onValidationChange,
    onIndentationChange,
    initialLeftContent = '',
    className,
}: FormatPaneProps) => {
    // State with lazy initialization from localStorage
    const [leftContent, setLeftContent] = useState<string>(() => {
        if (initialLeftContent !== '') return initialLeftContent;
        try {
            return localStorage.getItem('json-format-left-content') || initialLeftContent;
        } catch {
            return initialLeftContent;
        }
    });

    const [leftValid, setLeftValid] = useState(false);
    const [customIndent, setCustomIndent] = useState('');
    const [showCustomInput, setShowCustomInput] = useState(false);

    // Track initial content to avoid saving it to localStorage
    const initialLeftContentRef = useRef(initialLeftContent);

    useEffect(() => {
        initialLeftContentRef.current = initialLeftContent;
    }, [initialLeftContent]);

    // Save to localStorage whenever content changes (but not on initial render)
    useEffect(() => {
        // Only save if content is different from initial props
        if (leftContent !== initialLeftContentRef.current) {
            try {
                localStorage.setItem('json-format-left-content', leftContent);
            } catch (error) {
                console.error('Failed to save left content to localStorage:', error);
            }
        }
    }, [leftContent]);

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

    const handleIndentChange = (value: string) => {
        if (value === 'custom') {
            setShowCustomInput(true);
        } else {
            setShowCustomInput(false);
            setCustomIndent('');
            const indent = parseInt(value);
            if (!isNaN(indent) && indent > 0) {
                onIndentationChange?.(indent);
            }
        }
    };

    const handleCustomIndentChange = (value: string) => {
        setCustomIndent(value);
        const indent = parseInt(value);
        if (!isNaN(indent) && indent > 0 && indent <= 10) {
            onIndentationChange?.(indent);
        }
    };

    const isDisabled = !formatResult.isValid || !formatResult.formatted;

    return (
        <div className={`${className} h-[calc(100vh-140px)]`}>
            {/* Editor Panes */}
            <div className="flex flex-col md:flex-row gap-4 h-full">
                <div className="w-full md:w-1/2 min-w-0 h-full">
                    <JsonEditor
                        label="Unformatted JSON"
                        value={leftContent}
                        onChange={setLeftContent}
                        onError={(error) => {
                            setLeftValid(error === null && leftContent.trim().length > 0);
                        }}
                        height="600px"
                    />
                </div>

                <Separator orientation="vertical" className="hidden md:block" />
                <Separator orientation="horizontal" className="block md:hidden" />

                <div className="w-full md:w-1/2 min-w-0 h-full">
                    <JsonEditor
                        label="Formatted JSON"
                        value={formatResult.formatted}
                        onChange={() => {}}
                        onError={() => {}}
                        readOnly={true}
                        height="600px"
                        showEmptyPrompt={false}
                        customToolbar={
                            <div className="flex items-center justify-between mb-2 shrink-0">
                                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Formatted JSON
                                </label>
                                <div className="flex items-center gap-3">
                                    <span className="text-sm text-muted-foreground">
                                        {formatOptions.sortKeys && 'Sort'}
                                        {formatOptions.sortKeys &&
                                            (formatOptions.removeTrailingCommas ||
                                                formatOptions.escapeUnicode) &&
                                            ', '}
                                        {formatOptions.removeTrailingCommas && 'No Commas'}
                                        {formatOptions.removeTrailingCommas &&
                                            formatOptions.escapeUnicode &&
                                            ', '}
                                        {formatOptions.escapeUnicode && 'Unicode'}
                                    </span>
                                    <Select
                                        value={
                                            showCustomInput
                                                ? 'custom'
                                                : String(formatOptions.indentation)
                                        }
                                        onValueChange={handleIndentChange}
                                    >
                                        <SelectTrigger className="h-8 w-[120px] text-xs">
                                            <SelectValue placeholder="Spaces" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="2">2 spaces</SelectItem>
                                            <SelectItem value="4">4 spaces</SelectItem>
                                            <SelectItem value="custom">Custom...</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    {showCustomInput && (
                                        <Input
                                            type="number"
                                            placeholder="Spaces"
                                            value={customIndent}
                                            onChange={(e) =>
                                                handleCustomIndentChange(e.target.value)
                                            }
                                            className="h-8 w-[60px] text-xs"
                                            min="1"
                                            max="10"
                                        />
                                    )}
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
                        }
                    />
                </div>
            </div>
        </div>
    );
};
