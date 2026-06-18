'use client';

import { useMemo } from 'react';
import { jsonToYaml } from '../utils/yaml-operations';

export function useJsonToYaml(content: string) {
    const result = useMemo(() => {
        if (!content) return { yamlOutput: '', error: null };
        try {
            return { yamlOutput: jsonToYaml(content), error: null };
        } catch (error) {
            return {
                yamlOutput: '',
                error: error instanceof Error ? error.message : String(error),
            };
        }
    }, [content]);

    return result;
}
