'use client';

import { useCallback, useSyncExternalStore, useRef } from 'react';
import type { HistoryItem, HistoryTabConfig } from '../types';

function loadHistoryItems(config: HistoryTabConfig): HistoryItem[] {
    if (typeof window === 'undefined') return [];

    const historyItems: HistoryItem[] = [];
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (!key || !config.storageKeyFilter(key)) continue;

        try {
            const raw = localStorage.getItem(key);
            if (!raw) continue;

            const content = JSON.parse(raw);
            const tabName =
                Object.entries(config.tabMapping).find(([, storageKey]) =>
                    key.includes(storageKey),
                )?.[0] || 'unknown';

            historyItems.push({
                key,
                content: typeof content === 'string' ? content : String(content),
                timestamp: 0,
                tabName,
            });
        } catch {
            continue;
        }
    }

    return historyItems;
}

let historyVersion = 0;
const subscribers = new Set<() => void>();

function subscribeHistory(callback: () => void) {
    subscribers.add(callback);
    return () => subscribers.delete(callback);
}

function notifyHistoryChange() {
    historyVersion++;
    subscribers.forEach((cb) => cb());
}

const emptyItems: HistoryItem[] = [];

export function useHistoryItems(config: HistoryTabConfig) {
    const cachedRef = useRef<{ version: number; items: HistoryItem[] }>({
        version: -1,
        items: emptyItems,
    });

    const getSnapshot = () => {
        if (cachedRef.current.version !== historyVersion) {
            cachedRef.current = {
                version: historyVersion,
                items: loadHistoryItems(config),
            };
        }
        return cachedRef.current.items;
    };

    const items = useSyncExternalStore(subscribeHistory, getSnapshot, () => emptyItems);

    const deleteItem = useCallback((key: string) => {
        try {
            localStorage.removeItem(key);
            notifyHistoryChange();
        } catch (error) {
            console.error('Failed to delete history item:', error);
        }
    }, []);

    const clearAll = useCallback(() => {
        const currentItems = loadHistoryItems(config);
        for (const item of currentItems) {
            try {
                localStorage.removeItem(item.key);
            } catch {
                // skip
            }
        }
        notifyHistoryChange();
    }, [config]);

    return { items, deleteItem, clearAll, refresh: notifyHistoryChange };
}
