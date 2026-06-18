'use client';

import { useMemo } from 'react';
import { formatSql, type SqlDialect } from '../utils/sql-operations';

export function useSqlFormat(content: string, dialect: SqlDialect) {
    const result = useMemo(() => {
        if (!content) return { formatted: '', error: null };
        try {
            return { formatted: formatSql(content, dialect), error: null };
        } catch (error) {
            return {
                formatted: '',
                error: error instanceof Error ? error.message : String(error),
            };
        }
    }, [content, dialect]);

    return result;
}
