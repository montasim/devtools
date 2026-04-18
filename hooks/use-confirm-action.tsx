'use client';

import { useState, useCallback } from 'react';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';

interface ConfirmConfig {
    title: string;
    description: string;
    confirmLabel?: string;
    cancelLabel?: string;
    variant?: 'default' | 'destructive';
}

export function useConfirmAction() {
    const [open, setOpen] = useState(false);
    const [config, setConfig] = useState<ConfirmConfig>({
        title: '',
        description: '',
    });
    const [pendingAction, setPendingAction] = useState<(() => void) | null>(null);

    const confirm = useCallback((action: () => void, cfg: ConfirmConfig) => {
        setPendingAction(() => action);
        setConfig(cfg);
        setOpen(true);
    }, []);

    const handleConfirm = useCallback(() => {
        pendingAction?.();
        setOpen(false);
        setPendingAction(null);
    }, [pendingAction]);

    const dialog = (
        <ConfirmDialog
            open={open}
            onOpenChange={setOpen}
            title={config.title}
            description={config.description}
            confirmLabel={config.confirmLabel}
            cancelLabel={config.cancelLabel}
            variant={config.variant}
            onConfirm={handleConfirm}
        />
    );

    return { confirm, dialog };
}
