'use client';

import { useMemo } from 'react';
import { exportToJson } from '../utils/json-operations';

export function useJsonExport(content: string, format: 'csv' | 'xml' | 'yaml') {
    const result = useMemo(() => {
        if (!content) return { exported: '', error: null };
        try {
            return { exported: exportToJson(content, format), error: null };
        } catch (error) {
            return {
                exported: '',
                error: error instanceof Error ? error.message : 'Export failed',
            };
        }
    }, [content, format]);

    return result;
}
