'use client';

import { useMemo } from 'react';
import { minifyCss } from '../utils/css-operations';

export function useCssMinify(content: string) {
    const result = useMemo(() => {
        if (!content) return { minified: '', error: null };
        try {
            return { minified: minifyCss(content), error: null };
        } catch (error) {
            return {
                minified: '',
                error: error instanceof Error ? error.message : String(error),
            };
        }
    }, [content]);

    return result;
}
