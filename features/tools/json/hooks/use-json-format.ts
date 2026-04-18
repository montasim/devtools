'use client';

import { useMemo } from 'react';
import { formatJson } from '../utils/json-operations';

export function useJsonFormat(content: string, indent = 2) {
    const result = useMemo(() => {
        if (!content) return { formatted: '', error: null };
        try {
            return { formatted: formatJson(content, indent), error: null };
        } catch (error) {
            return {
                formatted: '',
                error: error instanceof Error ? error.message : 'Invalid JSON',
            };
        }
    }, [content, indent]);

    return result;
}
