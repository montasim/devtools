'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { Link2, Upload, Search, MoreVertical, X, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { TextareaFooter } from '@/components/text-tools/text-editor/textarea-footer';
import { TextOperationsMenu } from '@/components/text-tools/text-editor/text-operations-menu';
import { EmptyEditorPrompt } from '@/components/ui/empty-editor-prompt';
import { DropdownMenu, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import {
    toUpperCase,
    toLowerCase,
    toTitleCase,
    trim,
    removeExtraSpaces,
} from '@/components/text-tools/text-editor/utils/text-operations';
import type { TextEditorProps } from '@/components/text-tools/text-editor/types';

export function TextEditor({
    value,
    onChange,
    onError,
    label,
    readOnly = false,
    height = '400px',
    onClear,
    showEmptyPrompt = false,
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
                toast.error('Text not found');
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
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8"
                                    disabled={readOnly}
                                    title="Upload file"
                                    type="button"
                                    asChild
                                >
                                    <span>
                                        <Upload className="h-4 w-4" />
                                        <input
                                            type="file"
                                            accept=".txt,text/plain"
                                            onChange={handleFileUpload}
                                            className="hidden"
                                        />
                                    </span>
                                </Button>
                            </label>

                            {/* Copy button */}
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={handleCopy}
                                disabled={readOnly}
                                title="Copy to clipboard"
                            >
                                <Link2 className="h-4 w-4" />
                            </Button>

                            {/* Search button */}
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={handleSearch}
                                disabled={readOnly}
                                title="Search"
                            >
                                <Search className="h-4 w-4" />
                            </Button>

                            {/* Clear button */}
                            {onClear && (
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8"
                                    onClick={onClear}
                                    disabled={readOnly || !value}
                                    title="Clear editor"
                                >
                                    <X className="h-4 w-4" />
                                </Button>
                            )}

                            {/* More options menu */}
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8"
                                        disabled={readOnly}
                                        title="More options"
                                    >
                                        <MoreVertical className="h-4 w-4" />
                                    </Button>
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
                className="border border-input rounded-md shrink-0 overflow-hidden relative"
                style={{ height: height, position: 'relative' }}
            >
                {/* Always render the textarea */}
                <textarea
                    ref={textareaRef}
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    readOnly={readOnly}
                    className="w-full h-full resize-none p-3 font-mono text-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                    style={{ minHeight: height }}
                />

                {/* Empty state overlay - shown on top when editor is empty */}
                {showEmptyPrompt && !value && (
                    <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                        <EmptyEditorPrompt
                            icon={FileText}
                            title={`Start adding ${label?.toLowerCase() || 'text'} data`}
                            description="Begin typing, paste content, or upload a file"
                            showActions={!readOnly}
                        />
                    </div>
                )}
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
