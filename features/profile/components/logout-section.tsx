'use client';

import { useLogoutConfirmDialog } from '@/components/auth/logout-confirm-dialog';

interface LogoutSectionProps {
    onLogout: () => Promise<void>;
}

export function LogoutSection({ onLogout }: LogoutSectionProps) {
    const { LogoutButton } = useLogoutConfirmDialog({ onConfirm: onLogout });

    return (
        <div className="mt-8 border-t pt-6">
            <LogoutButton variant="destructive">Logout</LogoutButton>
        </div>
    );
}
