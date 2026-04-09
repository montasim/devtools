'use client';

import { useEffect, useRef, useState, useMemo, useCallback } from 'react';
import { EditorState } from '@codemirror/state';
import { EditorView, keymap, lineNumbers } from '@codemirror/view';
import { json } from '@codemirror/lang-json';
import { defaultKeymap, history, historyKeymap } from '@codemirror/commands';
import { search, highlightSelectionMatches } from '@codemirror/search';
import { X, Link2, Search, Upload, MoreVertical } from 'lucide-react';
import { EditorActions } from './editor-actions';
import { EditorFooter } from './editor-footer';
import { validateJson } from './utils/validation';
import type { ParseError } from './types';
import type { JsonEditorProps } from './types';

export function JsonEditor({ value, onChange, onError, label, readOnly = false }: JsonEditorProps) {
    const editorRef = useRef<HTMLDivElement>(null);
    const viewRef = useRef<EditorView | null>(null);
    const valueRef = useRef(value);
    const [error, setError] = useState<ParseError | null>(null);

    // Keep valueRef updated so it's always current when we need it
    useEffect(() => {
        valueRef.current = value;
    }, [value]);

    // Initialize CodeMirror editor
    useEffect(() => {
        if (!editorRef.current) return;

        // Create debounced validation function
        let timeout: ReturnType<typeof setTimeout> | null = null;
        const debouncedValidate = (content: string) => {
            if (timeout) clearTimeout(timeout);
            timeout = setTimeout(() => {
                const validationError = validateJson(content);
                setError(validationError);
                onError(validationError);
            }, 300);
        };

        // Create editor state
        const state = EditorState.create({
            doc: valueRef.current,
            extensions: [
                lineNumbers(),
                keymap.of(defaultKeymap),
                keymap.of(historyKeymap),
                history(),
                json(),
                search({ top: true }),
                highlightSelectionMatches(),
                EditorView.updateListener.of((update) => {
                    if (update.docChanged) {
                        const newValue = update.state.doc.toString();
                        onChange(newValue);
                        debouncedValidate(newValue);
                    }
                }),
                EditorView.theme({
                    '&': {
                        fontSize: '14px',
                        height: '100%',
                    },
                    '.cm-scroller': {
                        fontFamily:
                            'ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, "Liberation Mono", monospace',
                        overflow: 'auto',
                    },
                    '.cm-content': {
                        padding: '12px',
                        minHeight: '100%',
                    },
                    '.cm-focused': {
                        outline: 'none',
                    },
                    '.cm-line': {
                        padding: '0 0',
                    },
                    // Search highlighting
                    '&.cm-json .cm-searchMatch': {
                        backgroundColor: '#fef08a',
                        color: 'inherit',
                    },
                    '&.cm-json .cm-searchMatch-selected': {
                        backgroundColor: '#fbbf24',
                        color: 'inherit',
                    },
                    '&.cm-json .cm-selectionMatch': {
                        backgroundColor: '#fef08a80',
                    },
                    // JSON Syntax Highlighting
                    '&.cm-json .tok-propertyName': {
                        color: '#0451a5',
                    },
                    '&.cm-json .tok-string': {
                        color: '#a31515',
                    },
                    '&.cm-json .tok-number': {
                        color: '#098658',
                    },
                    '&.cm-json .tok-bool': {
                        color: '#0000ff',
                    },
                    '&.cm-json .tok-null': {
                        color: '#0000ff',
                    },
                    '&.cm-json .tok-keyword': {
                        color: '#0000ff',
                    },
                    // Dark mode syntax highlighting
                    '.dark &.cm-json .tok-propertyName': {
                        color: '#9cdcfe',
                    },
                    '.dark &.cm-json .tok-string': {
                        color: '#ce9178',
                    },
                    '.dark &.cm-json .tok-number': {
                        color: '#b5cea8',
                    },
                    '.dark &.cm-json .tok-bool': {
                        color: '#569cd6',
                    },
                    '.dark &.cm-json .tok-null': {
                        color: '#569cd6',
                    },
                    '.dark &.cm-json .tok-keyword': {
                        color: '#569cd6',
                    },
                    // Dark mode search highlighting
                    '.dark &.cm-json .cm-searchMatch': {
                        backgroundColor: '#854d0e',
                        color: 'inherit',
                    },
                    '.dark &.cm-json .cm-searchMatch-selected': {
                        backgroundColor: '#a16207',
                        color: 'inherit',
                    },
                    '.dark &.cm-json .cm-selectionMatch': {
                        backgroundColor: '#854d0e80',
                    },
                }),
                readOnly ? EditorState.readOnly.of(true) : [],
            ],
        });

        // Create editor view
        const view = new EditorView({
            state,
            parent: editorRef.current,
        });
        viewRef.current = view;

        // Initial validation
        debouncedValidate(valueRef.current);

        // Cleanup
        return () => {
            if (timeout) clearTimeout(timeout);
            view.destroy();
            viewRef.current = null;
        };
    }, [onChange, onError, readOnly]);

    // Update editor when value prop changes externally
    useEffect(() => {
        if (!viewRef.current) return;

        const currentValue = viewRef.current.state.doc.toString();
        if (currentValue !== value) {
            viewRef.current.dispatch({
                changes: {
                    from: 0,
                    to: currentValue.length,
                    insert: value,
                },
            });
        }
    }, [value]);

    // Handle file upload
    const handleFileUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        // Check file size (50MB hard limit)
        const MAX_SIZE = 50 * 1024 * 1024; // 50MB in bytes
        const WARNING_SIZE = 10 * 1024 * 1024; // 10MB in bytes

        if (file.size > MAX_SIZE) {
            const sizeError: ParseError = {
                message: `File too large. Maximum size is 50MB.`,
                line: 1,
                column: 1,
            };
            setError(sizeError);
            onError(sizeError);
            return;
        }

        if (file.size > WARNING_SIZE) {
            console.warn(
                `Large file detected (${(file.size / 1024 / 1024).toFixed(2)}MB). Upload may take a moment.`,
            );
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            const content = e.target?.result as string;
            onChange(content);
            // Validate immediately for file upload
            const validationError = validateJson(content);
            setError(validationError);
            onError(validationError);
        };
        reader.onerror = () => {
            const readError: ParseError = {
                message: 'Failed to read file. Please try again.',
                line: 1,
                column: 1,
            };
            setError(readError);
            onError(readError);
        };
        reader.readAsText(file);

        // Reset input so same file can be selected again
        event.target.value = '';
    }, [onChange, onError]);

    // Handle clear editor content
    const handleClear = useCallback(() => {
        onChange('');
        setError(null);
        onError(null);
    }, [onChange, onError]);

    // Handle copy link to clipboard
    const handleCopyLink = useCallback(() => {
        // Generate a shareable link with current content
        const encoded = btoa(value);
        const url = `${window.location.origin}?content=${encoded}`;
        navigator.clipboard.writeText(url);
    }, [value]);

    // Handle search in editor
    const handleSearch = useCallback(() => {
        // Open CodeMirror's built-in search panel
        if (viewRef.current) {
            const view = viewRef.current;
            // Trigger search command to open the search panel
            import('@codemirror/search').then(({ openSearchPanel }) => {
                openSearchPanel(view);
            });
        }
    }, []);

    // Handle more menu
    const handleMoreMenu = useCallback(() => {
        // Open more options menu
        console.log('More menu opened');
    }, []);

    // Define action buttons dynamically
    const actionButtons = useMemo(
        () => [
            {
                id: 'upload',
                icon: Upload,
                label: 'Upload file',
                accept: '.json,application/json',
                onChange: handleFileUpload,
                title: 'Upload file',
            },
            {
                id: 'copy-link',
                icon: Link2,
                label: 'Copy link',
                onClick: handleCopyLink,
                title: 'Copy link',
            },
            {
                id: 'search',
                icon: Search,
                label: 'Search',
                onClick: handleSearch,
                title: 'Search',
                isSearch: true,
            },
            {
                id: 'clear',
                icon: X,
                label: 'Clear editor',
                onClick: handleClear,
                title: 'Clear editor',
            },
            {
                id: 'more-menu',
                icon: MoreVertical,
                label: 'More options',
                onClick: handleMoreMenu,
                title: 'More options',
            },
        ],
        [handleClear, handleCopyLink, handleSearch, handleFileUpload, handleMoreMenu],
    );

    return (
        <div className="flex flex-col h-full">
            {/* Header with label and validation status */}
            <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {label}
                </label>
                <div className="flex items-center gap-2">
                    {/* Action buttons */}
                    <EditorActions buttons={actionButtons} readOnly={readOnly} editorView={viewRef} />
                </div>
            </div>

            {/* Editor container */}
            <div className="flex-1 border border-gray-300 rounded-md overflow-hidden dark:border-gray-600">
                <div ref={editorRef} className="h-full" />
            </div>

            {/* Error display */}
            {error && (
                <div className="mt-2 p-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded dark:text-red-400 dark:bg-red-900/20 dark:border-red-800">
                    <div className="font-medium">{error.message}</div>
                    <div className="text-xs mt-1">Line {error.line}, Column {error.column}</div>
                </div>
            )}

            {/* Footer with statistics and validation */}
            <EditorFooter content={value} error={error} />
        </div>
    );
}
