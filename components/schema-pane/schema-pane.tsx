'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { JsonEditor } from '../editor-pane/json-editor';
import { Separator } from '../ui/separator';
import { useJsonSchemaGenerator } from './use-json-schema-generator';
import { useJsonSchemaValidator } from './use-json-schema-validator';
import { SchemaOutput } from './schema-output';
import { ValidationResults } from './validation-results';
import type { SchemaPaneProps, SchemaMode } from './types';

export const SchemaPane = ({
    mode: externalMode,
    onError,
    onValidationChange,
    onContentChange,
    className,
}: SchemaPaneProps) => {
    // Mode state - use external mode if provided, otherwise use internal state
    const [internalMode] = useState<SchemaMode>(() => {
        if (typeof window === 'undefined') return 'generate';
        try {
            return (localStorage.getItem('json-schema-mode') as SchemaMode) || 'generate';
        } catch {
            return 'generate';
        }
    });

    const mode = externalMode !== undefined ? externalMode : internalMode;

    // JSON input state
    const [jsonInput, setJsonInput] = useState<string>(() => {
        if (typeof window === 'undefined') return '';
        try {
            return localStorage.getItem('json-schema-json-content') || '';
        } catch {
            return '';
        }
    });

    // Schema input state (validate mode)
    const [schemaInput, setSchemaInput] = useState<string>(() => {
        if (typeof window === 'undefined') return '';
        try {
            return localStorage.getItem('json-schema-schema-content') || '';
        } catch {
            return '';
        }
    });

    // Track initial content to avoid saving empty string to localStorage
    const initialJsonInputRef = useRef(jsonInput);
    const initialSchemaInputRef = useRef(schemaInput);

    // Save to localStorage
    useEffect(() => {
        if (jsonInput !== initialJsonInputRef.current) {
            try {
                localStorage.setItem('json-schema-json-content', jsonInput);
            } catch (error) {
                console.error('Failed to save JSON input:', error);
            }
        }
    }, [jsonInput]);

    useEffect(() => {
        if (schemaInput !== initialSchemaInputRef.current) {
            try {
                localStorage.setItem('json-schema-schema-content', schemaInput);
            } catch (error) {
                console.error('Failed to save schema input:', error);
            }
        }
    }, [schemaInput]);

    // Notify parent of content changes (for share dialog)
    useEffect(() => {
        onContentChange?.(jsonInput, schemaInput);
    }, [jsonInput, schemaInput, onContentChange]);

    // Generate schema with default options
    const generationResult = useJsonSchemaGenerator(jsonInput, {
        strictMode: true,
        schemaVersion: 'draft-07',
        viewMode: 'list',
        patterns: {},
        ranges: {},
        enums: {},
        required: [],
    });

    // Validate JSON
    const validationResult = useJsonSchemaValidator(jsonInput, schemaInput);

    // Handle validation changes
    useEffect(() => {
        const isValid = mode === 'generate' ? generationResult.isValid : validationResult.isValid;
        onValidationChange?.(isValid);
    }, [generationResult.isValid, validationResult.isValid, mode, onValidationChange]);

    // Handle errors
    useEffect(() => {
        if (generationResult.error) {
            onError?.(new Error(generationResult.error));
        }
    }, [generationResult.error, onError]);

    // Handle copy schema
    const handleCopySchema = useCallback(async () => {
        try {
            await navigator.clipboard.writeText(generationResult.schema);
            console.log('Schema copied to clipboard');
        } catch (error) {
            console.error('Failed to copy schema:', error);
            onError?.(error as Error);
        }
    }, [generationResult.schema, onError]);

    // Handle download schema
    const handleDownloadSchema = useCallback(() => {
        try {
            const blob = new Blob([generationResult.schema], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'schema.json';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            console.log('Schema downloaded');
        } catch (error) {
            console.error('Failed to download schema:', error);
            onError?.(error as Error);
        }
    }, [generationResult.schema, onError]);

    return (
        <div className={className}>
            {/* Content */}
            {mode === 'generate' ? (
                <div className="flex flex-col md:flex-row gap-4">
                    {/* Left: JSON Input */}
                    <div className="w-full md:w-1/2 min-w-0">
                        <JsonEditor
                            label="JSON Input"
                            value={jsonInput}
                            onChange={setJsonInput}
                            onError={() => {}}
                            height="600px"
                        />
                    </div>

                    <Separator orientation="vertical" className="hidden md:block" />
                    <Separator orientation="horizontal" className="block md:hidden" />

                    {/* Right: Schema Output */}
                    <div className="w-full md:w-1/2 min-w-0">
                        <SchemaOutput
                            schema={generationResult.schema}
                            isValid={generationResult.isValid}
                            error={generationResult.error}
                            onCopy={handleCopySchema}
                            onDownload={handleDownloadSchema}
                        />
                    </div>
                </div>
            ) : (
                <div className="flex flex-col">
                    {/* Top: JSON Input and Schema side by side */}
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="w-full md:w-1/2 min-w-0">
                            <JsonEditor
                                label="JSON Input"
                                value={jsonInput}
                                onChange={setJsonInput}
                                onError={() => {}}
                                height="400px"
                            />
                        </div>

                        <Separator orientation="vertical" className="hidden md:block" />
                        <Separator orientation="horizontal" className="block md:hidden" />

                        <div className="w-full md:w-1/2 min-w-0">
                            <JsonEditor
                                label="Schema"
                                value={schemaInput}
                                onChange={setSchemaInput}
                                onError={() => {}}
                                height="400px"
                            />
                        </div>
                    </div>

                    {/* Bottom: Validation Results (full width) */}
                    <div className="w-full">
                        <ValidationResults result={validationResult} />
                    </div>
                </div>
            )}
        </div>
    );
};
