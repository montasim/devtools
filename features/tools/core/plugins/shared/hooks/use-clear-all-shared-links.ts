'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api/client';
import { handleApiError } from '@/lib/hooks/use-error-handler';

export function useClearAllSharedLinks(queryKey: string, pageName: string) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (ids: string[]) => {
            await Promise.all(ids.map((id) => apiClient.delete(`/api/shares/${id}`)));
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [queryKey, pageName] });
        },
        onError: (error) => {
            handleApiError('Failed to clear shared links', error);
        },
    });
}
