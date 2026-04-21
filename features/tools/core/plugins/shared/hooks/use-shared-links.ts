'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api/client';
import { handleApiError } from '@/lib/hooks/use-error-handler';
import type { SharedLinkItemData } from '../types';

export function useSharedLinks(pageName: string, queryKey: string) {
    return useQuery({
        queryKey: [queryKey, pageName],
        queryFn: async () => {
            const res = await apiClient.get<SharedLinkItemData[]>(
                `/api/shares?pageName=${pageName}`,
            );
            if (!res.ok) {
                handleApiError('Failed to load shared links', res.error);
                return [];
            }
            return res.data ?? [];
        },
    });
}

export function useDeleteSharedLink(queryKey: string) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (id: string) => {
            const res = await apiClient.delete(`/api/shares/${id}`);
            if (!res.ok) throw new Error(res.error?.message ?? 'Failed to delete');
            return res;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [queryKey] });
        },
        onError: (error) => {
            handleApiError('Failed to delete shared link', error);
        },
    });
}
