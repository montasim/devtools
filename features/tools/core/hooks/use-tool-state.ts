'use client';

import { useState, useCallback, useSyncExternalStore } from 'react';
import type { SharedData } from '../types/tool';

interface UseToolStateOptions {
    storageKey: string;
    sharedData?: SharedData | null;
    tabId: string;
    initialValue?: string;
    readOnly?: boolean;
}

function getStorageValue(key: string, fallback: string): string {
    if (typeof window === 'undefined') return fallback;
    const saved = localStorage.getItem(key);
    if (!saved) return fallback;
    try {
        const parsed = JSON.parse(saved);
        return typeof parsed === 'string' ? parsed : String(parsed);
    } catch {
        return saved;
    }
}

function resolveInitialContent(
    storageKey: string,
    initialValue: string,
    sharedData: SharedData | null | undefined,
    tabId: string,
): string {
    const sharedValue =
        sharedData?.tabName === tabId && sharedData?.state
            ? ((sharedData.state as Record<string, unknown>).leftContent as string) ||
              ((sharedData.state as Record<string, unknown>).content as string) ||
              ((sharedData.state as Record<string, unknown>).inputContent as string) ||
              ''
            : '';

    if (sharedValue) return sharedValue;
    return getStorageValue(storageKey, initialValue);
}

export function useToolState(options: UseToolStateOptions) {
    const { storageKey, sharedData, tabId, initialValue = '', readOnly = false } = options;

    const [content, setContent] = useState(() =>
        resolveInitialContent(storageKey, initialValue, sharedData, tabId),
    );

    const isReady = useSyncExternalStore(
        () => () => {},
        () => true,
        () => false,
    );

    const setAndSave = useCallback(
        (value: string) => {
            if (readOnly) return;
            setContent(value);
            if (typeof window !== 'undefined') {
                try {
                    localStorage.setItem(storageKey, JSON.stringify(value));
                } catch (error) {
                    console.error(`Failed to save to localStorage key "${storageKey}":`, error);
                }
            }
        },
        [storageKey, readOnly],
    );

    return { content, setContent: setAndSave, isReady, readOnly };
}
