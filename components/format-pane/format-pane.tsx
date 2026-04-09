'use client';

import { useState, useCallback, useEffect } from 'react';
import { JsonEditor } from '../editor-pane/json-editor';
import { Separator } from '../ui/separator';
import { FormatActions } from './format-actions';
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

    return (
        <div className={className}>
            {/* Format Actions Toolbar */}
            <div className="flex items-center justify-between mb-4 px-4">
                <div className="text-sm text-muted-foreground">
                    Format Options: {formatOptions.indentation} spaces
                    {formatOptions.sortKeys && ', Sort Keys'}
                    {formatOptions.removeTrailingCommas && ', No Trailing Commas'}
                    {formatOptions.escapeUnicode && ', Escape Unicode'}
                </div>
                <FormatActions
                    formattedContent={formatResult.formatted}
                    isValid={formatResult.isValid}
                    onCopySuccess={handleCopySuccess}
                    onDownloadSuccess={handleDownloadSuccess}
                    onCopyError={handleCopyError}
                    onDownloadError={handleDownloadError}
                />
            </div>

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

                <div className="w-full md:w-1/2">
                    <JsonEditor
                        label="Formatted JSON"
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
