'use client';

import { useMemo } from 'react';
import { formatCss } from '../utils/css-operations';

export function useCssFormat(content: string, indent = '  ') {
    const result = useMemo(() => {
        if (!content) return { formatted: '', error: null };
        try {
            return { formatted: formatCss(content, indent), error: null };
        } catch (error) {
            return {
                formatted: '',
                error: error instanceof Error ? error.message : String(error),
            };
        }
    }, [content, indent]);

    return result;
}
