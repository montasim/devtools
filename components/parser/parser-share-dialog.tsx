'use client';

import { useCallback, useState } from 'react';
import { toast } from 'sonner';
import { Copy, Share2, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ShareForm } from '@/components/share/share-form';
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetFooter,
    SheetHeader,
    SheetTitle,
} from '@/components/ui/sheet';

interface ParserShareDialogProps {
    content: string;
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
}

export function ParserShareDialog({ content, open, onOpenChange }: ParserShareDialogProps) {
    const [copied, setCopied] = useState(false);

    // Copy JSON to clipboard
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

    // Copy as formatted
    const copyAsFormatted = useCallback(async () => {
        if (!content) return;

        try {
            const formatted = JSON.stringify(JSON.parse(content), null, 2);
            await navigator.clipboard.writeText(formatted);
            toast.success('Copied formatted JSON to clipboard');
        } catch (error) {
            console.error('Failed to copy formatted:', error);
            toast.error('Failed to copy formatted JSON');
        }
    }, [content]);

    // Copy as minified
    const copyAsMinified = useCallback(async () => {
        if (!content) return;

        try {
            const minified = JSON.stringify(JSON.parse(content));
            await navigator.clipboard.writeText(minified);
            toast.success('Copied minified JSON to clipboard');
        } catch (error) {
            console.error('Failed to copy minified:', error);
            toast.error('Failed to copy minified JSON');
        }
    }, [content]);

    // Download as JSON
    const downloadAsJSON = useCallback(() => {
        if (!content) return;

        try {
            const blob = new Blob([content], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'parsed.json';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Failed to download JSON:', error);
        }
    }, [content]);

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent side="right" className="w-96">
                <SheetHeader>
                    <SheetTitle className="flex items-center gap-2">
                        <Share2 className="h-5 w-5" />
                        Share Parsed JSON
                    </SheetTitle>
                    <SheetDescription>
                        Share this parsed JSON with others using various methods
                    </SheetDescription>
                </SheetHeader>

                <div className="flex flex-col gap-4 p-4">
                    <ShareForm
                        pageName="json"
                        tabName="parser"
                        getState={() => ({
                            input: content,
                            parsed: null,
                        })}
                    />

                    <Separator />

                    {/* Copy JSON Content Section */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            Copy JSON Content
                        </label>

                        <div className="grid grid-cols-1 gap-2 mt-2">
                            {[
                                {
                                    icon: Copy,
                                    label: 'Copy as Original',
                                    onClick: copyToClipboard,
                                },
                                {
                                    icon: Copy,
                                    label: 'Copy as Formatted',
                                    onClick: copyAsFormatted,
                                },
                                {
                                    icon: Copy,
                                    label: 'Copy as Minified',
                                    onClick: copyAsMinified,
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
                                    label: 'Download as JSON',
                                    onClick: downloadAsJSON,
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
