'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';

interface UseLogoutConfirmDialogProps {
    onConfirm: () => void;
}

export function useLogoutConfirmDialog({ onConfirm }: UseLogoutConfirmDialogProps) {
    const [showDialog, setShowDialog] = useState(false);

    const handleLogoutClick = () => {
        setShowDialog(true);
    };

    const handleConfirmLogout = () => {
        onConfirm();
        setShowDialog(false);
    };

    const LogoutButton = ({ children, ...props }: React.ComponentProps<typeof Button>) => (
        <>
            <Button {...props} onClick={handleLogoutClick}>
                {children}
            </Button>
            <ConfirmDialog
                open={showDialog}
                onOpenChange={setShowDialog}
                title="Confirm Logout"
                description="Are you sure you want to logout? You will need to sign in again to access your account."
                confirmLabel="Logout"
                cancelLabel="Cancel"
                onConfirm={handleConfirmLogout}
                variant="destructive"
            />
        </>
    );

    return { LogoutButton, showDialog, setShowDialog };
}
