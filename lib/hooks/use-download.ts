'use client';

import { useCallback } from 'react';
import { toast } from 'sonner';

export function useDownload() {
    const download = useCallback((content: string, filename: string, mimeType = 'text/plain') => {
        try {
            const blob = new Blob([content], { type: mimeType });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = filename;
            a.click();
            URL.revokeObjectURL(url);
            toast.success(`Downloaded ${filename}`);
        } catch {
            toast.error('Failed to download file');
        }
    }, []);

    return { download };
}
