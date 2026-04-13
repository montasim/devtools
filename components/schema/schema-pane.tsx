'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { toast } from 'sonner';
import { JsonEditor } from '@/components/editor/json-editor';
import { Separator } from '@/components/ui/separator';
import { useJsonSchemaGenerator } from '@/components/schema/use-json-schema-generator';
import { useJsonSchemaValidator } from '@/components/schema/use-json-schema-validator';
import { SchemaOutput } from '@/components/schema/schema-output';
import { ValidationResults } from '@/components/schema/validation-results';
import type { SchemaPaneProps, SchemaMode } from '@/components/schema/types';
import { STORAGE_KEYS } from '@/lib/constants';

export const SchemaPane = ({
    mode: externalMode,
    onError,
    onValidationChange,
    onContentChange,
    initialJsonContent = '',
    className,
}: SchemaPaneProps) => {
    // Track if we've loaded shared data
    const sharedDataLoadedRef = useRef(!!initialJsonContent);

    // Mode state - use external mode if provided, otherwise use internal state
    const [internalMode] = useState<SchemaMode>(() => {
        if (typeof window === 'undefined') return 'generate';
        try {
            return (
                (localStorage.getItem(STORAGE_KEYS.JSON_SCHEMA_MODE) as SchemaMode) || 'generate'
            );
        } catch {
            return 'generate';
        }
    });

    const mode = externalMode !== undefined ? externalMode : internalMode;

    // JSON input state
    const [jsonInput, setJsonInput] = useState<string>(() => {
        // Priority 1: Use initial content if provided (shared data)
        if (initialJsonContent) {
            sharedDataLoadedRef.current = true;
            return initialJsonContent;
        }
        // Priority 2: Load from localStorage
        if (typeof window === 'undefined') return '';
        try {
            return localStorage.getItem(STORAGE_KEYS.JSON_SCHEMA_JSON_CONTENT) || '';
        } catch {
            return '';
        }
    });

    // Schema input state (validate mode)
    const [schemaInput, setSchemaInput] = useState<string>(() => {
        if (typeof window === 'undefined') return '';
        try {
            return localStorage.getItem(STORAGE_KEYS.JSON_SCHEMA_SCHEMA_CONTENT) || '';
        } catch {
            return '';
        }
    });

    // Track initial content to avoid saving empty string to localStorage
    const initialJsonInputRef = useRef(initialJsonContent);
    const initialSchemaInputRef = useRef(schemaInput);

    // Update content when shared data arrives asynchronously
    useEffect(() => {
        // If shared data just arrived (was undefined, now has value)
        if (initialJsonContent && !sharedDataLoadedRef.current) {
            sharedDataLoadedRef.current = true;
            setJsonInput(initialJsonContent);
        }
        initialJsonInputRef.current = initialJsonContent;
    }, [initialJsonContent]);

    // Save to localStorage
    useEffect(() => {
        if (jsonInput !== initialJsonInputRef.current) {
            try {
                localStorage.setItem(STORAGE_KEYS.JSON_SCHEMA_JSON_CONTENT, jsonInput);
            } catch (error) {
                console.error('Failed to save JSON input:', error);
            }
        }
        // Notify parent of content change (for share dialog)
        if (schemaInput !== initialSchemaInputRef.current) {
            onContentChange?.(jsonInput, schemaInput);
        }
    }, [jsonInput, schemaInput, onContentChange]);

    useEffect(() => {
        if (schemaInput !== initialSchemaInputRef.current) {
            try {
                localStorage.setItem(STORAGE_KEYS.JSON_SCHEMA_SCHEMA_CONTENT, schemaInput);
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
            toast.success('Schema copied to clipboard');
        } catch (error) {
            console.error('Failed to copy schema:', error);
            toast.error('Failed to copy schema to clipboard');
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
