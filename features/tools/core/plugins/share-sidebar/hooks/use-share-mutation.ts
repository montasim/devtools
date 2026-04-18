'use client';

import { useMutation } from '@tanstack/react-query';
import { apiClient } from '@/lib/api/client';
import { handleApiError } from '@/lib/hooks/use-error-handler';

interface CreateShareParams {
    pageName: string;
    tabName: string;
    title: string;
    comment?: string;
    expiresAt?: string | null;
    password?: string;
    state: Record<string, unknown>;
}

export function useShareMutation() {
    return useMutation({
        mutationFn: async (params: CreateShareParams) => {
            const res = await apiClient.post<{ id: string; url: string }>('/api/shares', params);
            if (!res.ok) {
                throw new Error(res.error?.message ?? 'Failed to create share');
            }
            return res.data!;
        },
        onError: (error) => {
            handleApiError('Failed to create share link', error);
        },
    });
}
