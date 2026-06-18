'use client';

import { useMemo } from 'react';
import { yamlToJson } from '../utils/yaml-operations';

export function useYamlToJson(content: string) {
    const result = useMemo(() => {
        if (!content) return { json: '', error: null };
        try {
            return { json: yamlToJson(content), error: null };
        } catch (error) {
            return {
                json: '',
                error: error instanceof Error ? error.message : String(error),
            };
        }
    }, [content]);

    return result;
}
