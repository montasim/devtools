'use client';

import { useCallback } from 'react';
import type { SavedItemData, SavedTabConfig } from '../types';

export function useSavedRestore(config: SavedTabConfig) {
    const restoreItem = useCallback(
        (item: SavedItemData) => {
            const tabId = config.tabMapping[item.tabName];
            if (!tabId) return;

            const storageKey = config.storageKeyMapping[tabId];
            if (!storageKey) return;

            const content = config.extractContent
                ? config.extractContent(item)
                : (item.content.content as string) || JSON.stringify(item.content);

            try {
                localStorage.setItem(storageKey, JSON.stringify(content));
            } catch (error) {
                console.error('Failed to restore saved item:', error);
            }

            return tabId;
        },
        [config],
    );

    return { restoreItem };
}
