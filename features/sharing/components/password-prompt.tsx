'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Lock } from 'lucide-react';

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
        <div className="flex flex-col items-center justify-center gap-6 py-12">
            <div className="rounded-full bg-muted p-4">
                <Lock className="h-8 w-8 text-muted-foreground" />
            </div>
            <div className="text-center">
                <h2 className="text-xl font-semibold">Password Required</h2>
                <p className="text-sm text-muted-foreground">
                    Enter the password to access this shared content
                </p>
            </div>
            <form onSubmit={handleSubmit} className="flex w-full max-w-sm flex-col gap-4">
                <div className="flex flex-col gap-2">
                    <Label htmlFor="password">Password</Label>
                    <Input
                        id="password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Enter password..."
                    />
                </div>
                <Button type="submit" disabled={isLoading || !password}>
                    {isLoading ? 'Verifying...' : 'Access Content'}
                </Button>
            </form>
        </div>
    );
}
