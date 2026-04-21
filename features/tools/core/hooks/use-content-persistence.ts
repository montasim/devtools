'use client';

import { useEffect, useRef } from 'react';

export function useContentPersistence(content: string, storageKey: string, delay = 500) {
    const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const contentRef = useRef(content);

    useEffect(() => {
        contentRef.current = content;
    }, [content]);

    useEffect(() => {
        if (timerRef.current) {
            clearTimeout(timerRef.current);
        }

        timerRef.current = setTimeout(() => {
            if (typeof window !== 'undefined' && contentRef.current) {
                try {
                    localStorage.setItem(storageKey, JSON.stringify(contentRef.current));
                } catch (error) {
                    console.error(`Failed to persist content for key "${storageKey}":`, error);
                }
            }
        }, delay);

        return () => {
            if (timerRef.current) {
                clearTimeout(timerRef.current);
            }
        };
    }, [content, storageKey, delay]);
}
