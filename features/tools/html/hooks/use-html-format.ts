'use client';

import { useMemo } from 'react';
import { formatHtml } from '../utils/html-operations';

export function useHtmlFormat(content: string, indent = '  ') {
    const result = useMemo(() => {
        if (!content) return { formatted: '', error: null };
        try {
            return { formatted: formatHtml(content, indent), error: null };
        } catch (error) {
            return {
                formatted: '',
                error: error instanceof Error ? error.message : String(error),
            };
        }
    }, [content, indent]);

    return result;
}
