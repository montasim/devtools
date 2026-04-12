import { useMemo } from 'react';
import type { MinifyOptions } from './types';

interface MinifyResult {
    minified: string;
    isValid: boolean;
    error: Error | null;
}

export function useMinifyJson(json: string, options: MinifyOptions): MinifyResult {
    return useMemo(() => {
        if (!json || json.trim().length === 0) {
            return {
                minified: '',
                isValid: false,
                error: null,
            };
        }

        try {
            const parsed = JSON.parse(json);

            // Sort keys if option is enabled
            let processed = parsed;
            if (options.sortKeys) {
                processed = sortKeys(parsed);
            }

            // Remove whitespace by minifying
            const minified = JSON.stringify(processed);

            return {
                minified,
                isValid: true,
                error: null,
            };
        } catch (error) {
            return {
                minified: '',
                isValid: false,
                error: error as Error,
            };
        }
    }, [json, options.sortKeys, options.removeWhitespace]);
}

// Helper function to sort object keys recursively
function sortKeys(obj: any): any {
    if (obj === null || typeof obj !== 'object') {
        return obj;
    }

    if (Array.isArray(obj)) {
        return obj.map(sortKeys);
    }

    const sortedObj: any = {};
    const keys = Object.keys(obj).sort();
    for (const key of keys) {
        sortedObj[key] = sortKeys(obj[key]);
    }

    return sortedObj;
}
