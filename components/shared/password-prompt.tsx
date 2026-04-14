'use client';

import { useState } from 'react';
import { Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface PasswordPromptProps {
    pageType: string;
    id: string;
    metadata: {
        title?: string;
        pageType?: string;
    };
    onUnlock: (password: string) => Promise<{ error?: string }>;
}

export function PasswordPrompt({
    // eslint-disable-next-line @typescript-eslint/no-unused-vars -- Parameters reserved for future use
    pageType: _pageType,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars -- Parameters reserved for future use
    id: _id,
    metadata,
    onUnlock,
}: PasswordPromptProps) {
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        const result = await onUnlock(password);

        if (result?.error) {
            if (result.error === 'INVALID_PASSWORD') {
                setError('Incorrect password');
            } else {
                setError(result.error);
            }
        }

        setIsLoading(false);
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen p-8">
            <div className="max-w-md w-full">
                <div className="text-center mb-8">
                    <Lock className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <h1 className="text-2xl font-bold mb-2">Password Protected</h1>
                    <p className="text-muted-foreground">
                        This content is protected with a password
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <Label htmlFor="password">Password</Label>
                        <Input
                            className="mt-2"
                            id="password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Enter password"
                            autoFocus
                        />
                    </div>

                    {error && <p className="text-sm text-red-500">{error}</p>}

                    <Button type="submit" disabled={!password || isLoading} className="w-full">
                        {isLoading ? 'Unlocking...' : 'Unlock'}
                    </Button>
                </form>

                {metadata.title && (
                    <p className="text-xs text-center text-muted-foreground mt-6">
                        Sharing &quot;{metadata.title}&quot;
                    </p>
                )}
            </div>
        </div>
    );
}
