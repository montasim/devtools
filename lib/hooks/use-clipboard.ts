'use client';

import { useCallback } from 'react';
import { toast } from 'sonner';

export function useClipboard() {
    const copy = useCallback(async (text: string, successMessage = 'Copied to clipboard') => {
        try {
            await navigator.clipboard.writeText(text);
            toast.success(successMessage);
        } catch {
            toast.error('Failed to copy to clipboard');
        }
    }, []);

    return { copy };
}
