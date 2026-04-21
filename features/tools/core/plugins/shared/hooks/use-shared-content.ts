'use client';

import { useState, useCallback } from 'react';
import { apiClient } from '@/lib/api/client';

interface SharedContentData {
    state: Record<string, unknown> | null;
}

export function useSharedContent() {
    const [loading, setLoading] = useState(false);

    const fetchContent = useCallback(async (id: string): Promise<SharedContentData | null> => {
        setLoading(true);
        try {
            const res = await apiClient.get<SharedContentData>(`/api/shares/${id}`);
            if (res.ok && res.data?.state) {
                return res.data;
            }
            return null;
        } catch {
            return null;
        } finally {
            setLoading(false);
        }
    }, []);

    return { fetchContent, loading };
}
