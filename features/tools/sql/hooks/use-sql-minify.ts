'use client';

import { useMemo } from 'react';
import { minifySql } from '../utils/sql-operations';

export function useSqlMinify(content: string) {
    const result = useMemo(() => {
        if (!content) return { minified: '', error: null };
        try {
            return { minified: minifySql(content), error: null };
        } catch (error) {
            return {
                minified: '',
                error: error instanceof Error ? error.message : String(error),
            };
        }
    }, [content]);

    return result;
}
