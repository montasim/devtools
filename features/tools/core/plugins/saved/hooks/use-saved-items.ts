'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api/client';
import { handleApiError } from '@/lib/hooks/use-error-handler';
import type { SavedItemData } from '../types';

export function useSavedItems(pageName: string, queryKey: string) {
    return useQuery({
        queryKey: [queryKey, pageName],
        queryFn: async () => {
            const res = await apiClient.get<SavedItemData[]>(`/api/saved?pageName=${pageName}`);
            if (!res.ok) {
                handleApiError('Failed to load saved items', res.error);
                return [];
            }
            return res.data ?? [];
        },
    });
}

export function useDeleteSavedItem(queryKey: string) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (id: string) => {
            const res = await apiClient.delete(`/api/saved/${id}`);
            if (!res.ok) throw new Error(res.error?.message ?? 'Failed to delete');
            return res;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [queryKey] });
        },
        onError: (error) => {
            handleApiError('Failed to delete saved item', error);
        },
    });
}
