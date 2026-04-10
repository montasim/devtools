'use client';

import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';

interface UseClearDialogProps {
    onConfirm: () => void;
}

export function useClearDialog({ onConfirm }: UseClearDialogProps) {
    const [showDialog, setShowDialog] = useState(false);

    const handleClearClick = useCallback(() => {
        setShowDialog(true);
    }, []);

    const handleConfirmClear = useCallback(() => {
        onConfirm();
        setShowDialog(false);
    }, [onConfirm]);

    const ClearButton = ({ children, ...props }: React.ComponentProps<typeof Button>) => (
        <>
            <Button {...props} onClick={handleClearClick}>
                {children}
            </Button>
            <ConfirmDialog
                open={showDialog}
                onOpenChange={setShowDialog}
                title="Clear All Content"
                description="Are you sure you want to clear all content? This will reload the page and remove all unsaved data."
                confirmLabel="Clear All"
                cancelLabel="Cancel"
                onConfirm={handleConfirmClear}
                variant="destructive"
            />
        </>
    );

    return { ClearButton, showDialog, setShowDialog };
}
