'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

const EXPIRATION_OPTIONS = [
    { value: 'never', label: 'Never', ms: 0 },
    { value: '1h', label: '1 Hour', ms: 3600_000 },
    { value: '24h', label: '24 Hours', ms: 86400_000 },
    { value: '7d', label: '7 Days', ms: 604_800_000 },
    { value: '30d', label: '30 Days', ms: 2592_000_000 },
] as const;

const FORM_FIELDS = [
    { id: 'share-title', label: 'Title', placeholder: 'Enter a title...', type: 'input' },
    {
        id: 'share-comment',
        label: 'Comment (optional)',
        placeholder: 'Add a comment...',
        type: 'textarea',
    },
] as const;

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
        const option = EXPIRATION_OPTIONS.find((o) => o.value === expiration);
        if (!option || option.ms === 0) return null;
        return new Date(Date.now() + option.ms).toISOString();
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

    const formValues: Record<string, string> = { 'share-title': title, 'share-comment': comment };
    const formSetters: Record<string, (v: string) => void> = {
        'share-title': setTitle,
        'share-comment': setComment,
    };

    return (
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {FORM_FIELDS.map((field) => (
                <div key={field.id} className="flex flex-col gap-2">
                    <Label htmlFor={field.id}>{field.label}</Label>
                    {field.type === 'textarea' ? (
                        <Textarea
                            id={field.id}
                            value={formValues[field.id]}
                            onChange={(e) => formSetters[field.id](e.target.value)}
                            placeholder={field.placeholder}
                            rows={2}
                        />
                    ) : (
                        <Input
                            id={field.id}
                            value={formValues[field.id]}
                            onChange={(e) => formSetters[field.id](e.target.value)}
                            placeholder={field.placeholder}
                        />
                    )}
                </div>
            ))}
            <div className="flex flex-col gap-2">
                <Label>Expiration</Label>
                <RadioGroup value={expiration} onValueChange={setExpiration}>
                    {EXPIRATION_OPTIONS.map((option) => (
                        <div key={option.value} className="flex items-center gap-2">
                            <RadioGroupItem value={option.value} id={option.value} />
                            <Label htmlFor={option.value}>{option.label}</Label>
                        </div>
                    ))}
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
