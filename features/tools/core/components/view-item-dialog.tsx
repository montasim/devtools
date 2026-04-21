'use client';

import { useState, type ReactNode } from 'react';
import { Eye } from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from '@/components/ui/dialog';
import { ActionButtonGroup, type ActionButton } from '@/components/ui/action-button-group';

interface ViewItemDialogProps {
    title: ReactNode;
    description?: ReactNode;
    actions?: ActionButton[];
    children: ReactNode;
}

export function ViewItemDialog({ title, description, actions, children }: ViewItemDialogProps) {
    const [open, setOpen] = useState(false);

    return (
        <>
            <Eye
                className="h-4 w-4 cursor-pointer text-muted-foreground hover:text-foreground"
                onClick={() => setOpen(true)}
            />

            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent className="max-h-[85vh] overflow-hidden sm:max-w-2xl">
                    <DialogHeader className="border-b">
                        <DialogTitle>{title}</DialogTitle>
                        {description && <DialogDescription>{description}</DialogDescription>}
                        {actions && actions.length > 0 && (
                            <div className="mb-2">
                                <ActionButtonGroup actions={actions} />
                            </div>
                        )}
                    </DialogHeader>
                    <div className="flex-1 overflow-auto px-6 pb-6">{children}</div>
                </DialogContent>
            </Dialog>
        </>
    );
}
