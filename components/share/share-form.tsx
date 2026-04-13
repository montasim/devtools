'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { Copy, Check, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { useCreateShare } from '@/lib/api/share';
import type { ShareError } from '@/lib/types/share';

interface ShareFormProps {
    pageName: string;
    tabName: string;
    getState: () => any;
    onLinkGenerated?: (url: string) => void;
}

export function ShareForm({ pageName, tabName, getState, onLinkGenerated }: ShareFormProps) {
    const createShare = useCreateShare();
    const [title, setTitle] = useState('');
    const [comment, setComment] = useState('');
    const [expiration, setExpiration] = useState<'1h' | '1d' | '7d' | '30d'>('7d');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [generatedUrl, setGeneratedUrl] = useState<string | null>(null);
    const [copied, setCopied] = useState(false);

    const handleGenerateLink = async () => {
        if (!title.trim()) {
            toast.error('Title is required');
            return;
        }

        try {
            const state = getState();
            const input = {
                pageName,
                tabName,
                title: title.trim(),
                comment: comment.trim() || undefined,
                state,
                expiration,
                password: password || undefined,
            };

            console.log('🐛 [ShareForm] Sending to API:', {
                pageName,
                tabName,
                title: input.title,
                expiration,
                hasPassword: !!input.password,
                stateKeys: Object.keys(state || {}),
                stateSize: JSON.stringify(state).length,
            });

            const response = await createShare.mutateAsync(input);
            console.log('🐛 [ShareForm] API Response:', {
                success: true,
                fullUrl: response.fullUrl,
                id: response.id,
            });
            setGeneratedUrl(response.fullUrl);
            onLinkGenerated?.(response.fullUrl);
            toast.success('Share link generated!');
        } catch (error) {
            console.error('🐛 [ShareForm] Error caught:', error);

            if (error && typeof error === 'object' && 'error' in error) {
                const shareError = error as ShareError;
                console.error('🐛 [ShareForm] ShareError details:', shareError);

                switch (shareError.error) {
                    case 'STATE_TOO_LARGE':
                        toast.error('Content is too large to share (max 5MB)');
                        break;
                    case 'RATE_LIMITED':
                        toast.error('Too many shares created. Try again later.');
                        break;
                    default:
                        console.error('🐛 [ShareForm] Unknown error type:', shareError.error);
                        toast.error(shareError.message || 'Failed to create share link');
                }
            } else {
                console.error('🐛 [ShareForm] Error is not a ShareError:', error);
                toast.error('Failed to create share link');
            }
        }
    };

    const handleCopy = async () => {
        if (generatedUrl) {
            await navigator.clipboard.writeText(generatedUrl);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
            toast.success('Link copied to clipboard!');
        }
    };

    return (
        <div className="flex flex-col gap-4">
            {!generatedUrl ? (
                <>
                    <div className="space-y-2">
                        <Label htmlFor="title">
                            Title <span className="text-red-500">*</span>
                        </Label>
                        <Input
                            id="title"
                            placeholder="My awesome content"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="comment">Comment</Label>
                        <Textarea
                            id="comment"
                            placeholder="Add a description..."
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            rows={2}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="expiration">Expiration</Label>
                            <Select value={expiration} onValueChange={(v: any) => setExpiration(v)}>
                                <SelectTrigger id="expiration">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="1h">1 hour</SelectItem>
                                    <SelectItem value="1d">1 day</SelectItem>
                                    <SelectItem value="7d">7 days</SelectItem>
                                    <SelectItem value="30d">30 days</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="password">Password</Label>
                            <div className="relative">
                                <Input
                                    id="password"
                                    type={showPassword ? 'text' : 'password'}
                                    placeholder="Leave empty for public access"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="pr-10"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                                >
                                    {showPassword ? (
                                        <EyeOff className="h-4 w-4" />
                                    ) : (
                                        <Eye className="h-4 w-4" />
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>

                    <Button
                        onClick={handleGenerateLink}
                        disabled={!title.trim() || createShare.isPending}
                        className="w-full"
                    >
                        {createShare.isPending ? 'Generating...' : 'Generate Link'}
                    </Button>
                </>
            ) : (
                <>
                    <div className="p-4 bg-green-50 dark:bg-green-950 rounded-lg">
                        <p className="text-sm font-medium text-green-900 dark:text-green-100">
                            ✓ Share link created successfully!
                        </p>
                    </div>

                    <div className="space-y-2">
                        <Label>Shareable Link</Label>
                        <div className="flex gap-2">
                            <Input value={generatedUrl} readOnly className="flex-1 text-xs" />
                            <Button size="sm" onClick={handleCopy} className="shrink-0">
                                {copied ? (
                                    <Check className="h-4 w-4" />
                                ) : (
                                    <Copy className="h-4 w-4" />
                                )}
                            </Button>
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Anyone with this link can view the content
                        </p>
                    </div>
                </>
            )}
        </div>
    );
}
