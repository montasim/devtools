'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { Link2, Upload, Search, MoreVertical } from 'lucide-react';
import { TextareaFooter } from './textarea-footer';
import { TextOperationsMenu } from './text-operations-menu';
import { DropdownMenu, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import {
    toUpperCase,
    toLowerCase,
    toTitleCase,
    trim,
    removeExtraSpaces,
} from './utils/text-operations';
import type { TextEditorProps } from './types';

export function TextEditor({
    value,
    onChange,
    onError,
    label,
    readOnly = false,
    height = '400px',
}: TextEditorProps) {
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const [error, setError] = useState<string | null>(null);

    // Handle copy to clipboard
    const handleCopy = useCallback(() => {
        navigator.clipboard.writeText(value);
        toast.success('Copied to clipboard');
    }, [value]);

    // Handle file upload
    const handleFileUpload = useCallback(
        (event: React.ChangeEvent<HTMLInputElement>) => {
            const file = event.target.files?.[0];
            if (!file) return;

            const reader = new FileReader();
            reader.onload = (e) => {
                const content = e.target?.result as string;
                onChange(content);
            };
            reader.readAsText(file);

            // Reset input so same file can be selected again
            event.target.value = '';
        },
        [onChange],
    );

    // Handle search
    const handleSearch = useCallback(() => {
        // Use browser's built-in find
        const searchText = prompt('Search for:');
        if (searchText && textareaRef.current) {
            const found = textareaRef.current.value
                .toLowerCase()
                .includes(searchText.toLowerCase());
            if (!found) {
                alert('Text not found');
            } else {
                // Select the first occurrence
                const index = textareaRef.current.value
                    .toLowerCase()
                    .indexOf(searchText.toLowerCase());
                textareaRef.current.focus();
                textareaRef.current.setSelectionRange(index, index + searchText.length);
            }
        }
    }, []);

    // Text operation handlers
    const handleUpperCase = useCallback(() => {
        onChange(toUpperCase(value));
    }, [value, onChange]);

    const handleLowerCase = useCallback(() => {
        onChange(toLowerCase(value));
    }, [value, onChange]);

    const handleTitleCase = useCallback(() => {
        onChange(toTitleCase(value));
    }, [value, onChange]);

    const handleTrim = useCallback(() => {
        onChange(trim(value));
    }, [value, onChange]);

    const handleRemoveExtraSpaces = useCallback(() => {
        onChange(removeExtraSpaces(value));
    }, [value, onChange]);

    // Handle keyboard shortcuts
    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
            const cmdOrCtrl = isMac ? event.metaKey : event.ctrlKey;
            const shift = event.shiftKey;
            const alt = event.altKey;

            // Uppercase: Cmd+Shift+U (Mac) / Ctrl+Shift+U (Windows/Linux)
            if (cmdOrCtrl && shift && event.key === 'U') {
                event.preventDefault();
                handleUpperCase();
            }
            // Lowercase: Cmd+Shift+L (Mac) / Ctrl+Shift+L (Windows/Linux)
            else if (cmdOrCtrl && shift && event.key === 'L') {
                event.preventDefault();
                handleLowerCase();
            }
            // Title Case: Cmd+Shift+T (Mac) / Ctrl+Shift+T (Windows/Linux)
            else if (cmdOrCtrl && shift && event.key === 'T') {
                event.preventDefault();
                handleTitleCase();
            }
            // Trim: Cmd+Alt+T (Mac) / Ctrl+Alt+T (Windows/Linux)
            else if (cmdOrCtrl && alt && event.key === 't') {
                event.preventDefault();
                handleTrim();
            }
            // Remove Extra Spaces: Cmd+Alt+S (Mac) / Ctrl+Alt+S (Windows/Linux)
            else if (cmdOrCtrl && alt && event.key === 's') {
                event.preventDefault();
                handleRemoveExtraSpaces();
            }
        };

        // Add event listener when textarea is focused
        const textareaElement = textareaRef.current;
        if (textareaElement) {
            textareaElement.addEventListener('keydown', handleKeyDown);
            return () => {
                textareaElement.removeEventListener('keydown', handleKeyDown);
            };
        }
    }, [handleUpperCase, handleLowerCase, handleTitleCase, handleTrim, handleRemoveExtraSpaces]);

    return (
        <div className="flex flex-col h-full py-2">
            {/* Header with label and actions */}
            <div className="flex items-center justify-between mb-2 shrink-0">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {label}
                </label>
                <div className="flex items-center gap-2">
                    {!readOnly && (
                        <>
                            {/* Upload button */}
                            <label>
                                <button
                                    type="button"
                                    className="h-8 w-8 inline-flex items-center justify-center rounded-md hover:bg-accent transition-colors"
                                    disabled={readOnly}
                                    title="Upload file"
                                >
                                    <Upload className="h-4 w-4" />
                                </button>
                                <input
                                    type="file"
                                    accept=".txt,text/plain"
                                    onChange={handleFileUpload}
                                    className="hidden"
                                />
                            </label>

                            {/* Copy button */}
                            <button
                                type="button"
                                className="h-8 w-8 inline-flex items-center justify-center rounded-md hover:bg-accent transition-colors"
                                onClick={handleCopy}
                                disabled={readOnly}
                                title="Copy to clipboard"
                            >
                                <Link2 className="h-4 w-4" />
                            </button>

                            {/* Search button */}
                            <button
                                type="button"
                                className="h-8 w-8 inline-flex items-center justify-center rounded-md hover:bg-accent transition-colors"
                                onClick={handleSearch}
                                disabled={readOnly}
                                title="Search"
                            >
                                <Search className="h-4 w-4" />
                            </button>

                            {/* More options menu */}
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <button
                                        type="button"
                                        className="h-8 w-8 inline-flex items-center justify-center rounded-md hover:bg-accent transition-colors"
                                        disabled={readOnly}
                                        title="More options"
                                    >
                                        <MoreVertical className="h-4 w-4" />
                                    </button>
                                </DropdownMenuTrigger>
                                <TextOperationsMenu
                                    content={value}
                                    onContentChange={onChange}
                                    onError={(error) => {
                                        if (error) {
                                            setError(error);
                                            onError(error);
                                        } else {
                                            setError(null);
                                            onError(null);
                                        }
                                    }}
                                />
                            </DropdownMenu>
                        </>
                    )}
                </div>
            </div>

            {/* Textarea container */}
            <div
                className="border border-input rounded-md shrink-0 overflow-hidden"
                style={{ height: height }}
            >
                <textarea
                    ref={textareaRef}
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    readOnly={readOnly}
                    className="w-full h-full resize-none p-3 font-mono text-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                    style={{ minHeight: height }}
                />
            </div>

            {/* Error display */}
            {error && (
                <div className="mt-2 p-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded dark:text-red-400 dark:bg-red-900/20 dark:border-red-800 shrink-0">
                    <div className="font-medium">{error}</div>
                </div>
            )}

            {/* Footer with statistics */}
            <div className="shrink-0">
                <TextareaFooter content={value} error={error} />
            </div>
        </div>
    );
}
