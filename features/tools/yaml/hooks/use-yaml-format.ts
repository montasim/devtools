'use client';

import { useMemo } from 'react';
import { formatYaml } from '../utils/yaml-operations';

export function useYamlFormat(content: string) {
    const result = useMemo(() => {
        if (!content) return { formatted: '', error: null };
        try {
            return { formatted: formatYaml(content), error: null };
        } catch (error) {
            return {
                formatted: '',
                error: error instanceof Error ? error.message : String(error),
            };
        }
    }, [content]);

    return result;
}
