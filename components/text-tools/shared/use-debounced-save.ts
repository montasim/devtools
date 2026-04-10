import { useEffect, useRef } from 'react';

export function useDebouncedSave(value: string, key: string, delay = 500) {
    const timeoutRef = useRef<NodeJS.Timeout>();

    useEffect(() => {
        timeoutRef.current = setTimeout(() => {
            try {
                localStorage.setItem(key, value);
            } catch (error) {
                console.error(`Failed to save ${key}:`, error);
            }
        }, delay);

        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
        };
    }, [value, key, delay]);
}
