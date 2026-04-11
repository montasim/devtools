'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { toast } from 'sonner';
import { Copy, Download } from 'lucide-react';
import { JsonEditor } from '../editor-pane/json-editor';
import { Separator } from '../ui/separator';
import { Button } from '../ui/button';
import { useMinifyJson } from './use-minify-json';
import type { MinifyPaneProps } from './types';
import { STORAGE_KEYS } from '@/lib/constants';

export const MinifyPane = ({
    sortKeys = false,
    removeWhitespace = true,
    onError,
    onValidationChange,
    initialLeftContent = '',
    className,
}: MinifyPaneProps) => {
    // State with lazy initialization from localStorage
    const [leftContent, setLeftContent] = useState<string>(() => {
        if (initialLeftContent !== '') return initialLeftContent;
        try {
            return (
                localStorage.getItem(STORAGE_KEYS.JSON_MINIFY_LEFT_CONTENT) || initialLeftContent
            );
        } catch {
            return initialLeftContent;
        }
    });

    const [leftValid, setLeftValid] = useState(false);

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
                localStorage.setItem(STORAGE_KEYS.JSON_MINIFY_LEFT_CONTENT, leftContent);
            } catch (error) {
                console.error('Failed to save left content to localStorage:', error);
            }
        }
    }, [leftContent]);

    // Load minify options from localStorage on mount
    const [minifyOptions, setMinifyOptions] = useState(() => {
        if (typeof window === 'undefined') {
            return { sortKeys, removeWhitespace };
        }

        try {
            const saved = localStorage.getItem(STORAGE_KEYS.MINIFY_OPTIONS);
            if (saved) {
                return { ...JSON.parse(saved) };
            }
        } catch (error) {
            console.error('Failed to load minify options:', error);
        }

        return { sortKeys, removeWhitespace };
    });

    // Save minify options to localStorage when they change
    useEffect(() => {
        try {
            localStorage.setItem(STORAGE_KEYS.MINIFY_OPTIONS, JSON.stringify(minifyOptions));
        } catch (error) {
            console.error('Failed to save minify options:', error);
        }
    }, [minifyOptions]);

    // Minify JSON
    const minifyResult = useMinifyJson(leftContent, minifyOptions);

    // Handle validation changes
    useEffect(() => {
        onValidationChange?.(minifyResult.isValid);
    }, [minifyResult.isValid, onValidationChange]);

    // Handle errors
    useEffect(() => {
        if (minifyResult.error) {
            onError?.(new Error(minifyResult.error.message));
        }
    }, [minifyResult.error, onError]);

    // Handle copy success
    const handleCopySuccess = useCallback(() => {
        toast.success('Copied to clipboard');
    }, []);

    // Handle download success
    const handleDownloadSuccess = useCallback(() => {
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
            await navigator.clipboard.writeText(minifyResult.minified);
            handleCopySuccess();
        } catch (error) {
            handleCopyError(error as Error);
        }
    };

    const handleDownload = () => {
        try {
            const blob = new Blob([minifyResult.minified], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'minified.json';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            handleDownloadSuccess();
        } catch (error) {
            handleDownloadError(error as Error);
        }
    };

    const isDisabled = !minifyResult.isValid || !minifyResult.minified;

    return (
        <div className={className}>
            {/* Editor Panes */}
            <div className="flex flex-col md:flex-row gap-4">
                <div className="w-full md:w-1/2 min-w-0">
                    <JsonEditor
                        label="Original JSON"
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

                <div className="w-full md:w-1/2 min-w-0">
                    <JsonEditor
                        label="Minified JSON"
                        value={minifyResult.minified}
                        onChange={() => {}}
                        onError={() => {}}
                        readOnly={true}
                        height="600px"
                        showEmptyPrompt={true}
                        customToolbar={
                            <div className="flex items-center justify-between mb-2 shrink-0">
                                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Minified JSON
                                </label>
                                <div className="flex items-center gap-3">
                                    <span className="text-sm text-muted-foreground">
                                        {minifyOptions.sortKeys && 'Sort'}
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
                        }
                    />
                </div>
            </div>
        </div>
    );
};
