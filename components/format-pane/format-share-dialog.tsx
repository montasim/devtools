'use client';

import { useState, useCallback } from 'react';
import { Copy, Check, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';

interface FormatShareDialogProps {
    content: string;
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
}

export function FormatShareDialog({
    content,
    open,
    onOpenChange,
}: FormatShareDialogProps) {
    const [copied, setCopied] = useState(false);

    // Generate shareable URL
    const generateShareUrl = useCallback(() => {
        if (!content) return '';

        try {
            // Encode the JSON content
            const encoded = btoa(encodeURIComponent(content));

            // Create URL with encoded content
            const url = new URL(window.location.href);
            url.searchParams.set('content', encoded);
            url.hash = 'format';

            return url.toString();
        } catch (error) {
            console.error('Failed to generate share URL:', error);
            return '';
        }
    }, [content]);

    const shareUrl = generateShareUrl();

    // Copy URL to clipboard
    const handleCopy = async () => {
        if (!shareUrl) return;

        try {
            await navigator.clipboard.writeText(shareUrl);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (error) {
            console.error('Failed to copy to clipboard:', error);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Share2 className="h-5 w-5" />
                        Share Formatted JSON
                    </DialogTitle>
                    <DialogDescription>
                        Generate a shareable link to your formatted JSON. Anyone with the link can view and download your formatted JSON.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    {/* Share URL Input */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Share Link</label>
                        <div className="flex gap-2">
                            <Input
                                value={shareUrl}
                                readOnly
                                placeholder="Generating share link..."
                                className="flex-1"
                            />
                            <Button
                                onClick={handleCopy}
                                disabled={!shareUrl}
                                variant="outline"
                                className="shrink-0"
                            >
                                {copied ? (
                                    <>
                                        <Check className="h-4 w-4 mr-2" />
                                        Copied!
                                    </>
                                ) : (
                                    <>
                                        <Copy className="h-4 w-4 mr-2" />
                                        Copy
                                    </>
                                )}
                            </Button>
                        </div>
                    </div>

                    {/* Info Section */}
                    <div className="bg-muted/50 rounded-lg p-4 space-y-2">
                        <h4 className="text-sm font-semibold">How sharing works:</h4>
                        <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                            <li>Share link contains your formatted JSON content</li>
                            <li>Recipients can view and download the formatted JSON</li>
                            <li>Link works in any browser - no account required</li>
                            <li>Content is encoded directly in the URL</li>
                        </ul>
                    </div>
                </div>

                <DialogFooter>
                    <Button onClick={() => onOpenChange?.(false)}>
                        Done
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
