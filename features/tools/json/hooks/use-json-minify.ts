'use client';

import { useMemo } from 'react';
import { minifyJson } from '../utils/json-operations';

export function useJsonMinify(content: string) {
    const result = useMemo(() => {
        if (!content) return { minified: '', error: null };
        try {
            return { minified: minifyJson(content), error: null };
        } catch (error) {
            return { minified: '', error: error instanceof Error ? error.message : 'Invalid JSON' };
        }
    }, [content]);

    return result;
}
