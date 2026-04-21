'use client';

import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api/client';
import { handleApiError } from '@/lib/hooks/use-error-handler';
import type { ShareMetadata, ShareAccessResponse } from '../types/share';

export function useShareMetadata(shareId: string) {
    return useQuery({
        queryKey: ['share-metadata', shareId],
        queryFn: async () => {
            const res = await apiClient.get<ShareMetadata>(`/api/shares/${shareId}`);
            if (!res.ok) {
                handleApiError('Failed to load share metadata', res.error);
                return null;
            }
            return res.data ?? null;
        },
        enabled: !!shareId,
    });
}

export function useShareAccess(shareId: string, password?: string, hasPassword?: boolean) {
    return useQuery({
        queryKey: ['share-access', shareId, password],
        queryFn: async () => {
            const res = await apiClient.post<ShareAccessResponse>(
                `/api/shares/${shareId}/access`,
                password ? { password } : undefined,
            );
            if (!res.ok) {
                handleApiError('Failed to access shared content', res.error);
                return null;
            }
            return res.data ?? null;
        },
        enabled: !!shareId && hasPassword !== undefined && (!hasPassword || !!password),
    });
}
