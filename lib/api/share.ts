'use client';

import axios from 'axios';
import { z } from 'zod';
import type {
    CreateShareInput,
    ShareMetadata,
    ShareAccessResponse,
    CreateShareResponse,
    ShareError,
} from '@/lib/types/share';
import {
    CreateShareSchema,
    ShareMetadataSchema,
    ShareAccessResponseSchema,
    CreateShareResponseSchema,
    ShareErrorSchema,
    AccessShareSchema,
} from '@/lib/schemas/share';

// Create axios instance
const api = axios.create({
    baseURL: '/api/share',
    headers: {
        'Content-Type': 'application/json',
    },
});

// Response validation helper
function validateResponse<T>(schema: z.ZodSchema<T>, data: unknown): T {
    return schema.parse(data);
}

// Error handling helper
function handleApiError(error: unknown): ShareError {
    if (axios.isAxiosError(error)) {
        const data = error.response?.data;
        if (data) {
            try {
                return ShareErrorSchema.parse(data);
            } catch {
                return {
                    error: 'INVALID_STATE',
                    message: 'Invalid error response from server',
                };
            }
        }
    }
    return {
        error: 'INVALID_STATE',
        message: 'An unexpected error occurred',
    };
}

// API methods
export const shareApi = {
    async create(input: CreateShareInput): Promise<CreateShareResponse> {
        try {
            console.log('🐛 [shareApi.create] Input:', {
                pageName: input.pageName,
                tabName: input.tabName,
                title: input.title,
                hasComment: !!input.comment,
                hasPassword: !!input.password,
                expiration: input.expiration,
                stateKeys: Object.keys(input.state || {}),
                stateSize: JSON.stringify(input.state).length,
            });

            const validated = CreateShareSchema.parse(input);
            console.log('🐛 [shareApi.create] Validation passed');

            const response = await api.post<CreateShareResponse>('/create', validated);
            console.log('🐛 [shareApi.create] Response received:', {
                status: response.status,
                hasData: !!response.data,
                dataKeys: response.data ? Object.keys(response.data) : [],
            });

            return validateResponse(CreateShareResponseSchema, response.data);
        } catch (error) {
            console.error('🐛 [shareApi.create] Error:', {
                error,
                message: error instanceof Error ? error.message : 'Unknown error',
                isAxiosError: axios.isAxiosError(error),
                response: axios.isAxiosError(error)
                    ? {
                          status: error.response?.status,
                          statusText: error.response?.statusText,
                          data: error.response?.data,
                      }
                    : null,
            });
            throw handleApiError(error);
        }
    },

    async getMetadata(id: string): Promise<ShareMetadata> {
        try {
            const response = await api.get<ShareMetadata>(`/${id}`);
            return validateResponse(ShareMetadataSchema, response.data);
        } catch (error) {
            throw handleApiError(error);
        }
    },

    async access(id: string, password?: string): Promise<ShareAccessResponse> {
        try {
            const validated = AccessShareSchema.parse({ password });
            const response = await api.post<ShareAccessResponse>(`/${id}/access`, validated);
            return validateResponse(ShareAccessResponseSchema, response.data);
        } catch (error) {
            throw handleApiError(error);
        }
    },
};

// React Query hooks
import { useMutation, useQuery } from '@tanstack/react-query';

export function useCreateShare() {
    return useMutation({
        mutationFn: shareApi.create,
    });
}

export function useShareMetadata(id: string) {
    return useQuery({
        queryKey: ['share-metadata', id],
        queryFn: () => shareApi.getMetadata(id),
        enabled: !!id,
        staleTime: 0,
    });
}

export function useAccessShare() {
    return useMutation({
        mutationFn: ({ id, password }: { id: string; password?: string }) =>
            shareApi.access(id, password),
    });
}
