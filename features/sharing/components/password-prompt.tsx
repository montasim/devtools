'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Lock, Loader2 } from 'lucide-react';
import { PasswordInput } from '@/components/auth/password-input';
import { Logo } from '@/components/layout/logo';

interface PasswordPromptProps {
    onSubmit: (password: string) => void;
    isLoading?: boolean;
}

export function PasswordPrompt({ onSubmit, isLoading }: PasswordPromptProps) {
    const [password, setPassword] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit(password);
    };

    return (
        <div className="flex min-h-screen items-center justify-center">
            <div className="w-full max-w-md space-y-8 rounded-lg border bg-background p-4 shadow-sm">
                <div className="flex justify-center">
                    <Logo />
                </div>
                <div>
                    <div className="flex justify-center mb-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                            <Lock className="h-6 w-6 text-primary" />
                        </div>
                    </div>
                    <h2 className="text-center text-3xl font-bold">Protected Content</h2>
                    <p className="mt-2 text-center text-sm text-muted-foreground">
                        Enter the password to access this shared content
                    </p>
                </div>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <Label className="mb-2" htmlFor="share-password">
                            Password
                        </Label>
                        <PasswordInput
                            id="share-password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                            required
                        />
                    </div>
                    <Button type="submit" disabled={isLoading || !password} className="w-full">
                        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {isLoading ? 'Verifying...' : 'Access Content'}
                    </Button>
                </form>
            </div>
        </div>
    );
}
