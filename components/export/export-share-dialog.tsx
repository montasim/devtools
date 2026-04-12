'use client';

import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import { Copy, Check, Share2, Download, FileDown } from 'lucide-react';
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
import type { ExportFormat } from '@/components/export/types';

interface ExportShareDialogProps {
    content: string;
    format: ExportFormat;
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
}

export function ExportShareDialog({ content, format, open, onOpenChange }: ExportShareDialogProps) {
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
            url.searchParams.set('format', format);
            url.hash = 'export';

            return url.toString();
        } catch (error) {
            console.error('Failed to generate share URL:', error);
            return '';
        }
    }, [content, format]);

    const shareUrl = generateShareUrl();

    // Copy content to clipboard
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

    // Copy as original JSON
    const copyAsJSON = useCallback(async () => {
        if (!content) return;

        try {
            // Convert back to JSON if it's not already
            let jsonContent = content;
            if (format !== 'json') {
                // For simplicity, we'll just try to parse and re-stringify
                // In a real implementation, you'd have proper format converters
                const parsed = JSON.parse(content);
                jsonContent = JSON.stringify(parsed, null, 2);
            }
            await navigator.clipboard.writeText(jsonContent);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
            toast.success('Copied as JSON');
        } catch (error) {
            console.error('Failed to copy as JSON:', error);
            toast.error('Failed to copy as JSON');
        }
    }, [content, format]);

    // Helper function to get MIME type
    function getMimeType(fmt: ExportFormat): string {
        const mimes: Record<ExportFormat, string> = {
            csv: 'text/csv',
            xml: 'application/xml',
            yaml: 'application/x-yaml',
            toml: 'application/toml',
            json: 'application/json',
        };
        return mimes[fmt] || 'text/plain';
    }

    // Download as file
    const downloadAsFile = useCallback(() => {
        if (!content) return;

        try {
            const mimeType = getMimeType(format);
            const blob = new Blob([content], { type: mimeType });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `exported.${format}`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Failed to download file:', error);
        }
    }, [content, format]);

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

    const formatLabel = format.toUpperCase();

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent side="right" className="w-96">
                <SheetHeader>
                    <SheetTitle className="flex items-center gap-2">
                        <Share2 className="h-5 w-5" />
                        Share Exported {formatLabel}
                    </SheetTitle>
                    <SheetDescription>
                        Share this exported {formatLabel} content with others
                    </SheetDescription>
                </SheetHeader>

                <div className="flex flex-col gap-4 p-4">
                    {/* Shareable Link Section */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            Shareable Link
                        </label>

                        <div className="flex gap-2 mt-2">
                            <Input
                                value={shareUrl}
                                readOnly
                                placeholder="Generating link..."
                                className="flex-1 text-xs"
                            />
                            <Button
                                size="sm"
                                onClick={copyShareUrl}
                                disabled={!shareUrl}
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
                            Anyone with this link can view the exported content
                        </p>
                    </div>

                    <Separator />

                    {/* Copy Content Section */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            Copy Content
                        </label>

                        <div className="grid grid-cols-1 gap-2 mt-2">
                            {[
                                {
                                    icon: Copy,
                                    label: 'Copy Exported',
                                    onClick: copyToClipboard,
                                },
                                {
                                    icon: Copy,
                                    label: 'Copy as JSON',
                                    onClick: copyAsJSON,
                                },
                            ].map(({ icon: Icon, label, onClick }) => (
                                <Button
                                    key={label}
                                    variant="outline"
                                    className="w-full justify-start"
                                    onClick={onClick}
                                    disabled={!content}
                                >
                                    <Icon className="h-4 w-4 mr-2" />
                                    {label}
                                </Button>
                            ))}
                        </div>
                    </div>

                    <Separator />

                    {/* Export Options Section */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            Export Options
                        </label>

                        <div className="grid grid-cols-1 gap-2 mt-2">
                            {[
                                {
                                    icon: Download,
                                    label: `Download as ${formatLabel}`,
                                    onClick: downloadAsFile,
                                },
                            ].map(({ icon: Icon, label, onClick }) => (
                                <Button
                                    key={label}
                                    variant="outline"
                                    className="w-full justify-start"
                                    onClick={onClick}
                                    disabled={!content}
                                >
                                    <Icon className="h-4 w-4 mr-2" />
                                    {label}
                                </Button>
                            ))}
                        </div>
                    </div>
                </div>

                <SheetFooter>
                    <p className="text-xs text-gray-500 dark:text-gray-400 text-left w-full">
                        💡 Tip: Use the shareable link to collaborate with others in real-time
                    </p>
                </SheetFooter>
            </SheetContent>
        </Sheet>
    );
}
