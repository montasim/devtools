'use client';

import { useMemo } from 'react';
import { validateJsonSchema, generateSchema } from '../utils/validation';

export function useJsonSchema(
    jsonContent: string,
    schemaContent: string,
    mode: 'validate' | 'generate',
) {
    return useMemo(() => {
        if (mode === 'generate') {
            if (!jsonContent) return { result: null, error: null };
            try {
                const parsed = JSON.parse(jsonContent);
                const schema = generateSchema(parsed);
                return { result: JSON.stringify(schema, null, 2), error: null };
            } catch (error) {
                return {
                    result: null,
                    error: error instanceof Error ? error.message : 'Invalid JSON',
                };
            }
        }

        if (!jsonContent || !schemaContent) return { result: null, error: null };
        try {
            const json = JSON.parse(jsonContent);
            const schema = JSON.parse(schemaContent);
            const validation = validateJsonSchema(json, schema);
            return { result: validation, error: null };
        } catch (error) {
            return {
                result: null,
                error: error instanceof Error ? error.message : 'Invalid input',
            };
        }
    }, [jsonContent, schemaContent, mode]);
}
