'use client';

import { useMemo } from 'react';
import { computeTextDiff } from '../utils/text-operations';

export function useTextDiff(leftContent: string, rightContent: string) {
    const stats = useMemo(() => {
        if (!leftContent || !rightContent) return null;
        return computeTextDiff(leftContent, rightContent);
    }, [leftContent, rightContent]);

    return { stats };
}
