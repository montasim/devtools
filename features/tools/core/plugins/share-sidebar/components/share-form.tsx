'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

interface ShareFormProps {
    onSubmit: (data: {
        title: string;
        comment: string;
        expiresAt: string | null;
        password: string;
    }) => void;
    isLoading: boolean;
}

export function ShareForm({ onSubmit, isLoading }: ShareFormProps) {
    const [title, setTitle] = useState('');
    const [comment, setComment] = useState('');
    const [expiration, setExpiration] = useState('never');
    const [hasPassword, setHasPassword] = useState(false);
    const [password, setPassword] = useState('');

    const getExpiresAt = (): string | null => {
        const now = new Date();
        switch (expiration) {
            case '1h':
                return new Date(now.getTime() + 60 * 60 * 1000).toISOString();
            case '24h':
                return new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString();
            case '7d':
                return new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString();
            case '30d':
                return new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString();
            default:
                return null;
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit({
            title: title || 'Untitled Share',
            comment,
            expiresAt: getExpiresAt(),
            password: hasPassword ? password : '',
        });
    };

    return (
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
                <Label htmlFor="share-title">Title</Label>
                <Input
                    id="share-title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Enter a title..."
                />
            </div>
            <div className="flex flex-col gap-2">
                <Label htmlFor="share-comment">Comment (optional)</Label>
                <Textarea
                    id="share-comment"
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Add a comment..."
                    rows={2}
                />
            </div>
            <div className="flex flex-col gap-2">
                <Label>Expiration</Label>
                <RadioGroup value={expiration} onValueChange={setExpiration}>
                    <div className="flex items-center gap-2">
                        <RadioGroupItem value="never" id="never" />
                        <Label htmlFor="never">Never</Label>
                    </div>
                    <div className="flex items-center gap-2">
                        <RadioGroupItem value="1h" id="1h" />
                        <Label htmlFor="1h">1 Hour</Label>
                    </div>
                    <div className="flex items-center gap-2">
                        <RadioGroupItem value="24h" id="24h" />
                        <Label htmlFor="24h">24 Hours</Label>
                    </div>
                    <div className="flex items-center gap-2">
                        <RadioGroupItem value="7d" id="7d" />
                        <Label htmlFor="7d">7 Days</Label>
                    </div>
                    <div className="flex items-center gap-2">
                        <RadioGroupItem value="30d" id="30d" />
                        <Label htmlFor="30d">30 Days</Label>
                    </div>
                </RadioGroup>
            </div>
            <div className="flex items-center gap-3">
                <Switch
                    checked={hasPassword}
                    onCheckedChange={setHasPassword}
                    id="share-password-toggle"
                />
                <Label htmlFor="share-password-toggle">Password protect</Label>
            </div>
            {hasPassword && (
                <div className="flex flex-col gap-2">
                    <Label htmlFor="share-password">Password</Label>
                    <Input
                        id="share-password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Enter password..."
                    />
                </div>
            )}
            <Button type="submit" disabled={isLoading} className="w-full">
                {isLoading ? 'Creating...' : 'Create Share Link'}
            </Button>
        </form>
    );
}
