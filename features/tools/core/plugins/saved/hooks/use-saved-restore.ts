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

            const data = item.content;
            let content: string;
            if (typeof data === 'string') {
                content = data;
            } else if (typeof data.text === 'string') {
                content = data.text;
            } else if (config.extractContent) {
                content = config.extractContent(item);
            } else {
                content = JSON.stringify(data);
            }

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
