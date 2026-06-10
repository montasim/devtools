'use client';

import { useMemo } from 'react';
import { parseXml } from '../utils/xml-operations';

export function useXmlParser(content: string) {
    const result = useMemo(() => {
        if (!content) return { parsed: null, type: '', keys: undefined, error: null };
        try {
            const { parsed, type, keys } = parseXml(content);
            return { parsed, type, keys, error: null };
        } catch (error) {
            return {
                parsed: null,
                type: '',
                keys: undefined,
                error: error instanceof Error ? error.message : 'Invalid XML',
            };
        }
    }, [content]);

    return result;
}
