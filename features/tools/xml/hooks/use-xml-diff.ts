'use client';

import { useMemo } from 'react';
import { computeXmlDiff } from '../utils/xml-operations';

export function useXmlDiff(leftContent: string, rightContent: string) {
    const stats = useMemo(() => {
        if (!leftContent || !rightContent) return null;
        try {
            return computeXmlDiff(leftContent, rightContent);
        } catch {
            return null;
        }
    }, [leftContent, rightContent]);

    return { stats, isValid: true };
}
