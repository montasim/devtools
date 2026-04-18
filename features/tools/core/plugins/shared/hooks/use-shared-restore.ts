'use client';

import { useCallback } from 'react';
import { apiClient } from '@/lib/api/client';
import type { SharedTabConfig } from '../types';

export function useSharedRestore(config: SharedTabConfig) {
    const restoreItem = useCallback(
        async (shareId: string) => {
            try {
                const res = await apiClient.post<{ content: { state: Record<string, unknown> } }>(
                    `/api/shares/${shareId}/access`,
                );
                if (!res.ok || !res.data) return null;

                const { state } = res.data.content;
                const tabId = config.tabMapping[state.tabName as string];
                if (!tabId) return null;

                sessionStorage.setItem(`shared-restore-${config.pageName}`, JSON.stringify(state));

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
