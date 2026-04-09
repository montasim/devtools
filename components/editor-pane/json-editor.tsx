'use client';

import { useEffect, useRef, useState } from 'react';
import { EditorState } from '@codemirror/state';
import { EditorView, keymap, placeholder as placeholderExt } from '@codemirror/view';
import { json } from '@codemirror/lang-json';
import { defaultKeymap, history, historyKeymap } from '@codemirror/commands';
import { autocompletion } from '@codemirror/autocomplete';
import { debounce, validateJson } from './utils/validation';
import type { ParseError } from './types';
import type { JsonEditorProps } from './types';

export function JsonEditor({
    value,
    onChange,
    onError,
    label,
    placeholder = 'Enter or paste JSON here...',
    readOnly = false,
}: JsonEditorProps) {
    const editorRef = useRef<HTMLDivElement>(null);
    const viewRef = useRef<EditorView | null>(null);
    const [error, setError] = useState<ParseError | null>(null);

    // Debounced validation function
    const debouncedValidate = useRef(
        debounce((content: string) => {
            const validationError = validateJson(content);
            setError(validationError);
            onError(validationError);
        }, 300)
    ).current;

    // Initialize CodeMirror editor
    useEffect(() => {
        if (!editorRef.current) return;

        // Create editor state
        const state = EditorState.create({
            doc: value,
            extensions: [
                json(),
                history(),
                keymap.of([...defaultKeymap, ...historyKeymap]),
                autocompletion(),
                placeholderExt(placeholder),
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
                        fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, "Liberation Mono", monospace',
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
        debouncedValidate(value);

        // Cleanup
        return () => {
            view.destroy();
            viewRef.current = null;
        };
    }, []); // Empty deps array - initialize once

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
    const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
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
            console.warn(`Large file detected (${(file.size / 1024 / 1024).toFixed(2)}MB). Upload may take a moment.`);
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            const content = e.target?.result as string;
            onChange(content);
            debouncedValidate(content);
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
    };

    return (
        <div className="flex flex-col h-full">
            {/* Header with label and validation status */}
            <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {label}
                </label>
                <div className="flex items-center gap-2">
                    {/* Validation status indicator */}
                    <span
                        className={`text-xs font-medium ${
                            error
                                ? 'text-red-600 dark:text-red-400'
                                : value.trim()
                                  ? 'text-green-600 dark:text-green-400'
                                  : 'text-gray-400 dark:text-gray-500'
                        }`}
                    >
                        {error ? 'Invalid JSON' : value.trim() ? 'Valid JSON' : 'Empty'}
                    </span>

                    {/* File upload button */}
                    {!readOnly && (
                        <label className="cursor-pointer inline-flex items-center px-2 py-1 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-50 dark:text-gray-300 dark:bg-gray-800 dark:border-gray-600 dark:hover:bg-gray-700">
                            <svg
                                className="w-4 h-4 mr-1"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
                                />
                            </svg>
                            Upload
                            <input
                                type="file"
                                accept=".json,application/json"
                                onChange={handleFileUpload}
                                className="hidden"
                            />
                        </label>
                    )}
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
                    <div className="text-xs mt-1">
                        Line {error.line}, Column {error.column}
                    </div>
                </div>
            )}
        </div>
    );
}
