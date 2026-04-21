'use client';

import { useState, useCallback } from 'react';

export function useLocalStorage<T>(key: string, initialValue: T) {
    const [storedValue, setStoredValue] = useState<T>(() => {
        if (typeof window === 'undefined') return initialValue;
        try {
            const item = window.localStorage.getItem(key);
            return item ? JSON.parse(item) : initialValue;
        } catch {
            return initialValue;
        }
    });

    const setValue = useCallback(
        (value: T | ((val: T) => T)) => {
            setStoredValue((prev) => {
                const valueToStore = value instanceof Function ? value(prev) : value;
                try {
                    window.localStorage.setItem(key, JSON.stringify(valueToStore));
                } catch (error) {
                    console.error(`Failed to save to localStorage key "${key}":`, error);
                }
                return valueToStore;
            });
        },
        [key],
    );

    const remove = useCallback(() => {
        try {
            window.localStorage.removeItem(key);
            setStoredValue(initialValue);
        } catch (error) {
            console.error(`Failed to remove localStorage key "${key}":`, error);
        }
    }, [key, initialValue]);

    return [storedValue, setValue, remove] as const;
}
