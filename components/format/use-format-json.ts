'use client';

import { useState, useEffect, useRef } from 'react';
import type { FormatOptions, FormatResult } from './types';
import { validateJson } from '@/components/editor/utils/validation';
import { formatJson, sortKeys, escapeUnicode } from '@/components/editor/utils/json-operations';

// Format JSON with options
const formatJsonWith = (json: string, options: FormatOptions): string => {
    try {
        const parsed = JSON.parse(json);

        // Apply sort keys if enabled
        let formatted = parsed;
        if (options.sortKeys) {
            const sorted = JSON.parse(sortKeys(json));
            formatted = sorted;
        }

        // Format with indentation
        let result = JSON.stringify(formatted, null, options.indentation);

        // Apply remove trailing commas if enabled
        if (options.removeTrailingCommas) {
            result = result.replace(/,(\s*[}\]])/g, '$1');
        }

        // Apply escape unicode if enabled
        if (options.escapeUnicode) {
            result = result.replace(
                /[\u007F-\uFFFF]/g,
                (c) => '\\u' + ('0000' + c.charCodeAt(0).toString(16)).slice(-4),
            );
        }

        return result;
    } catch (error) {
        throw error;
    }
};

export const useFormatJson = (json: string, options: FormatOptions): FormatResult => {
    const [result, setResult] = useState<FormatResult>({
        formatted: '',
        error: null,
        isValid: false,
    });

    const optionsRef = useRef(options);
    useEffect(() => {
        optionsRef.current = options;
    }, [options]);

    useEffect(() => {
        const timeout = setTimeout(() => {
            try {
                if (!json.trim()) {
                    setResult({
                        formatted: '',
                        error: null,
                        isValid: false,
                    });
                    return;
                }

                const validationError = validateJson(json);
                if (validationError) {
                    setResult({
                        formatted: json, // Show original with error
                        error: validationError,
                        isValid: false,
                    });
                    return;
                }

                const formatted = formatJsonWith(json, optionsRef.current);
                setResult({
                    formatted,
                    error: null,
                    isValid: true,
                });
            } catch (error) {
                const parseError = {
                    message: (error as Error).message,
                    line: 1,
                    column: 1,
                };
                setResult({
                    formatted: json,
                    error: parseError,
                    isValid: false,
                });
            }
        }, 300);

        return () => clearTimeout(timeout);
    }, [json, options]);

    return result;
};
