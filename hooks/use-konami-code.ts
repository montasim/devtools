'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

const KONAMI_CODE = [
    'ArrowUp',
    'ArrowUp',
    'ArrowDown',
    'ArrowDown',
    'ArrowLeft',
    'ArrowRight',
    'ArrowLeft',
    'ArrowRight',
    'b',
    'a',
] as const;

export function useKonamiCode(callback: () => void) {
    const indexRef = useRef(0);

    const handleKeyDown = useCallback(
        (e: KeyboardEvent) => {
            const key =
                e.key === 'Enter' ? e.key : e.key.length === 1 ? e.key.toLowerCase() : e.key;

            if (key === KONAMI_CODE[indexRef.current]) {
                indexRef.current++;
                if (indexRef.current === KONAMI_CODE.length) {
                    indexRef.current = 0;
                    callback();
                }
            } else {
                indexRef.current = 0;
            }
        },
        [callback],
    );

    useEffect(() => {
        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [handleKeyDown]);
}

export function useKonamiProgress() {
    const [progress, setProgress] = useState(0);
    const indexRef = useRef(0);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            const key = e.key.length === 1 ? e.key.toLowerCase() : e.key;

            if (key === KONAMI_CODE[indexRef.current]) {
                indexRef.current++;
                setProgress(indexRef.current / KONAMI_CODE.length);
            } else {
                indexRef.current = 0;
                setProgress(0);
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, []);

    return progress;
}
