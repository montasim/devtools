'use client';

import { useMemo } from 'react';
import { parseJson } from '../utils/json-operations';

export function useJsonParser(content: string) {
    const result = useMemo(() => {
        if (!content) return { parsed: null, type: null, keys: undefined, error: null };
        try {
            const { parsed, type, keys } = parseJson(content);
            return { parsed, type, keys, error: null };
        } catch (error) {
            return {
                parsed: null,
                type: null,
                keys: undefined,
                error: error instanceof Error ? error.message : 'Invalid JSON',
            };
        }
    }, [content]);

    return result;
}
