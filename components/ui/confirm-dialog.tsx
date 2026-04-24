'use client';

import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useState } from 'react';

interface ConfirmDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    title: string;
    description: string;
    confirmLabel?: string;
    cancelLabel?: string;
    onConfirm: () => void;
    variant?: 'default' | 'destructive';
}

export function ConfirmDialog({
    open,
    onOpenChange,
    title,
    description,
    confirmLabel = 'Confirm',
    cancelLabel = 'Cancel',
    onConfirm,
    variant = 'default',
}: ConfirmDialogProps) {
    return (
        <AlertDialog open={open} onOpenChange={onOpenChange}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>{title}</AlertDialogTitle>
                    <AlertDialogDescription>{description}</AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>{cancelLabel}</AlertDialogCancel>
                    <AlertDialogAction
                        onClick={onConfirm}
                        className={
                            variant === 'destructive'
                                ? 'bg-destructive text-white hover:bg-destructive/90'
                                : ''
                        }
                    >
                        {confirmLabel}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}

interface UseConfirmDialogOptions {
    title: string;
    description: string;
    confirmLabel?: string;
    cancelLabel?: string;
    onConfirm: () => void;
}

export function useConfirmDialog({
    title,
    description,
    confirmLabel,
    cancelLabel,
    onConfirm,
}: UseConfirmDialogOptions) {
    const [open, setOpen] = useState(false);

    const trigger = () => setOpen(true);
    const handleConfirm = () => {
        onConfirm();
        setOpen(false);
    };

    const dialog = (
        <ConfirmDialog
            open={open}
            onOpenChange={setOpen}
            title={title}
            description={description}
            confirmLabel={confirmLabel}
            cancelLabel={cancelLabel}
            onConfirm={handleConfirm}
        />
    );

    return { trigger, dialog };
}
