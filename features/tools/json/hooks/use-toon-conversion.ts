'use client';

import { useMemo } from 'react';
import { jsonToToon, toonToJson } from '../utils/toon-operations';

export function useJsonToToon(content: string) {
    return useMemo(() => {
        if (!content.trim()) return { output: '', error: null };

        try {
            return { output: jsonToToon(content), error: null };
        } catch (error) {
            return {
                output: '',
                error: error instanceof Error ? error.message : String(error),
            };
        }
    }, [content]);
}

export function useToonToJson(content: string) {
    return useMemo(() => {
        if (!content.trim()) return { output: '', error: null };

        try {
            return { output: toonToJson(content), error: null };
        } catch (error) {
            return {
                output: '',
                error: error instanceof Error ? error.message : String(error),
            };
        }
    }, [content]);
}
