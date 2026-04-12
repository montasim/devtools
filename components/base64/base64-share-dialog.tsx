'use client';

import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import { Copy, Check, Share2, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetFooter,
    SheetHeader,
    SheetTitle,
} from '@/components/ui/sheet';

interface Base64ShareDialogProps {
    content: string;
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
}

export function Base64ShareDialog({ content, open, onOpenChange }: Base64ShareDialogProps) {
    const [copied, setCopied] = useState(false);

    // Generate shareable URL
    const generateShareUrl = useCallback(() => {
        if (!content) return '';

        try {
            // Encode the Base64 content
            const encoded = btoa(encodeURIComponent(content));

            // Create URL with encoded content
            const url = new URL(window.location.href);
            url.searchParams.set('content', encoded);
            url.hash = 'base64';

            return url.toString();
        } catch (error) {
            console.error('Failed to generate share URL:', error);
            return '';
        }
    }, [content]);

    const shareUrl = generateShareUrl();

    // Copy Base64 to clipboard
    const copyToClipboard = useCallback(async () => {
        if (!content) return;

        try {
            await navigator.clipboard.writeText(content);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
            toast.success('Copied to clipboard');
        } catch (error) {
            console.error('Failed to copy to clipboard:', error);
            toast.error('Failed to copy to clipboard');
        }
    }, [content]);

    // Download Base64 as file
    const downloadAsFile = useCallback(() => {
        if (!content) return;

        try {
            const blob = new Blob([content], { type: 'text/plain' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'base64.txt';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Failed to download file:', error);
        }
    }, [content]);

    // Copy share URL
    const copyShareUrl = useCallback(async () => {
        if (!shareUrl) return;

        try {
            await navigator.clipboard.writeText(shareUrl);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
            toast.success('Shareable link copied to clipboard');
        } catch (error) {
            console.error('Failed to copy URL:', error);
            toast.error('Failed to copy shareable link');
        }
    }, [shareUrl]);

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent side="right" className="w-96">
                <SheetHeader>
                    <SheetTitle className="flex items-center gap-2">
                        <Share2 className="h-5 w-5" />
                        Share Base64 Output
                    </SheetTitle>
                    <SheetDescription>Share this Base64 encoded data with others</SheetDescription>
                </SheetHeader>

                <div className="flex flex-col gap-4 p-4">
                    {/* Shareable Link Section */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            Shareable Link
                        </label>

                        <div className="flex gap-2 mt-2">
                            <Input
                                value={generateShareUrl()}
                                readOnly
                                placeholder="Generating link..."
                                className="flex-1 text-xs"
                            />
                            <Button
                                size="sm"
                                onClick={copyShareUrl}
                                disabled={!generateShareUrl()}
                                className="shrink-0"
                            >
                                {copied ? (
                                    <Check className="h-4 w-4" />
                                ) : (
                                    <Copy className="h-4 w-4" />
                                )}
                            </Button>
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                            Anyone with this link can view the shared content
                        </p>
                    </div>

                    <Separator />

                    {/* Copy Content Section */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            Copy Content
                        </label>

                        <div className="grid grid-cols-1 gap-2 mt-2">
                            <Button
                                variant="outline"
                                className="w-full justify-start"
                                onClick={copyToClipboard}
                                disabled={!content}
                            >
                                <Copy className="h-4 w-4 mr-2" />
                                Copy Base64
                            </Button>
                        </div>
                    </div>

                    <Separator />

                    {/* Export Options Section */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            Export Options
                        </label>

                        <div className="grid grid-cols-1 gap-2 mt-2">
                            <Button
                                variant="outline"
                                className="w-full justify-start"
                                onClick={downloadAsFile}
                                disabled={!content}
                            >
                                <Download className="h-4 w-4 mr-2" />
                                Download Base64
                            </Button>
                        </div>
                    </div>
                </div>

                <SheetFooter>
                    <p className="text-xs text-gray-500 dark:text-gray-400 text-left w-full">
                        💡 Tip: Use the shareable link to collaborate with others
                    </p>
                </SheetFooter>
            </SheetContent>
        </Sheet>
    );
}
