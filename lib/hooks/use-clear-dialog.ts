'use client';

import { useState, useCallback } from 'react';

export function useClearDialog(onConfirm: () => void) {
    const [open, setOpen] = useState(false);
    const openDialog = useCallback(() => setOpen(true), []);
    const confirm = useCallback(() => {
        setOpen(false);
        onConfirm();
    }, [onConfirm]);

    return { open, setOpen, openDialog, confirm };
}
