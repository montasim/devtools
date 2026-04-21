'use client';

import { useCallback } from 'react';
import { apiClient } from '@/lib/api/client';
import type { SharedTabConfig } from '../types';

export function useSharedRestore(config: SharedTabConfig) {
    const restoreItem = useCallback(
        async (shareId: string) => {
            try {
                const res = await apiClient.post<{
                    metadata: { tabName: string };
                    content: { state: Record<string, unknown> };
                }>(`/api/shares/${shareId}/access`);
                if (!res.ok || !res.data) return null;

                const tabId = config.tabMapping[res.data.metadata.tabName];
                if (!tabId) return null;

                const state = res.data.content.state;
                const content =
                    (state.leftContent as string) ??
                    (state.inputContent as string) ??
                    (state.content as string) ??
                    (state.text as string) ??
                    '';

                if (content && typeof window !== 'undefined') {
                    try {
                        localStorage.setItem(
                            config.storageKeys?.[tabId] ?? `${config.pageName}-${tabId}`,
                            JSON.stringify(content),
                        );
                    } catch (error) {
                        console.error('Failed to write to localStorage:', error);
                    }
                }

                return tabId;
            } catch (error) {
                console.error('Failed to restore shared item:', error);
                return null;
            }
        },
        [config],
    );

    return { restoreItem };
}
