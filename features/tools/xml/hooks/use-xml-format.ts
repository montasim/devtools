'use client';

import { useMemo } from 'react';
import { formatXml } from '../utils/xml-operations';

export function useXmlFormat(content: string, indent = '  ') {
    const result = useMemo(() => {
        if (!content) return { formatted: '', error: null };
        try {
            return { formatted: formatXml(content, indent), error: null };
        } catch (error) {
            return {
                formatted: '',
                error: error instanceof Error ? error.message : 'Invalid XML',
            };
        }
    }, [content, indent]);

    return result;
}
