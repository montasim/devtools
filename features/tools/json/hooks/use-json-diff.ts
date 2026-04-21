'use client';

import { useMemo } from 'react';
import { computeJsonDiff } from '../utils/json-operations';

export function useJsonDiff(leftContent: string, rightContent: string) {
    const stats = useMemo(() => {
        if (!leftContent || !rightContent) return null;
        try {
            return computeJsonDiff(leftContent, rightContent);
        } catch {
            return null;
        }
    }, [leftContent, rightContent]);

    const isValid = useMemo(() => {
        try {
            JSON.parse(leftContent);
            JSON.parse(rightContent);
            return true;
        } catch {
            return false;
        }
    }, [leftContent, rightContent]);

    return { stats, isValid };
}
