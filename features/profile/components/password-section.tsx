'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { FormField } from '@/components/auth/form-field';
import { Loader2 } from 'lucide-react';

interface PasswordSectionProps {
    onSave: (currentPassword: string, newPassword: string) => Promise<void>;
}

export function PasswordSection({ onSave }: PasswordSectionProps) {
    const [changing, setChanging] = useState(false);
    const [loading, setLoading] = useState(false);
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    function reset() {
        setChanging(false);
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (newPassword !== confirmPassword) return;
        setLoading(true);
        try {
            await onSave(currentPassword, newPassword);
            reset();
        } finally {
            setLoading(false);
        }
    }

    return (
        <div>
            <label className="mb-2 block text-sm font-medium">Password</label>
            {!changing ? (
                <Button variant="outline" size="sm" onClick={() => setChanging(true)}>
                    Change password
                </Button>
            ) : (
                <form onSubmit={handleSubmit} className="max-w-md space-y-4">
                    <FormField
                        id="current-password"
                        label="Current password"
                        type="password"
                        value={currentPassword}
                        onChange={setCurrentPassword}
                        placeholder="••••••••"
                        required
                    />
                    <FormField
                        id="new-password"
                        label="New password"
                        type="password"
                        value={newPassword}
                        onChange={setNewPassword}
                        placeholder="••••••••"
                        required
                    />
                    <FormField
                        id="confirm-password"
                        label="Confirm new password"
                        type="password"
                        value={confirmPassword}
                        onChange={setConfirmPassword}
                        placeholder="••••••••"
                        required
                    />
                    <div className="flex gap-2">
                        <Button type="submit" disabled={loading} size="sm">
                            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Update password
                        </Button>
                        <Button type="button" variant="outline" onClick={reset} size="sm">
                            Cancel
                        </Button>
                    </div>
                </form>
            )}
        </div>
    );
}
