'use client';

import { useMemo } from 'react';
import { minifyHtml } from '../utils/html-operations';

export function useHtmlMinify(content: string) {
    const result = useMemo(() => {
        if (!content) return { minified: '', error: null };
        try {
            return { minified: minifyHtml(content), error: null };
        } catch (error) {
            return {
                minified: '',
                error: error instanceof Error ? error.message : String(error),
            };
        }
    }, [content]);

    return result;
}
