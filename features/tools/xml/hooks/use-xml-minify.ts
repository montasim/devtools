'use client';

import { useMemo } from 'react';
import { minifyXml } from '../utils/xml-operations';

export function useXmlMinify(content: string) {
    const result = useMemo(() => {
        if (!content) return { minified: '', error: null };
        try {
            return { minified: minifyXml(content), error: null };
        } catch (error) {
            return {
                minified: '',
                error: error instanceof Error ? error.message : 'Invalid XML',
            };
        }
    }, [content]);

    return result;
}
