'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api/client';
import { handleApiError } from '@/lib/hooks/use-error-handler';

export function useClearAllSavedItems(queryKey: string, pageName: string) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (ids: string[]) => {
            await Promise.all(ids.map((id) => apiClient.delete(`/api/saved/${id}`)));
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [queryKey, pageName] });
        },
        onError: (error) => {
            handleApiError('Failed to clear saved items', error);
        },
    });
}
