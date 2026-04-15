'use client';

import { useCallback } from 'react';
import { toast } from 'sonner';
import { Copy, Share2, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ShareForm } from '@/components/share/share-form';
import { PAGE_NAMES, JSON_TABS } from '@/lib/constants/tabs';
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetFooter,
    SheetHeader,
    SheetTitle,
} from '@/components/ui/sheet';

interface FormatShareDialogProps {
    content: string;
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
}

export function FormatShareDialog({ content, open, onOpenChange }: FormatShareDialogProps) {

    // Copy formatted JSON to clipboard
    const copyToClipboard = useCallback(async () => {
        if (!content) return;

        try {
            await navigator.clipboard.writeText(content);
            toast.success('Copied to clipboard');
        } catch (error) {
            console.error('Failed to copy to clipboard:', error);
            toast.error('Failed to copy to clipboard');
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
            a.download = 'formatted.json';
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
                        Share Formatted JSON
                    </SheetTitle>
                    <SheetDescription>
                        Share this formatted JSON with others using various methods
                    </SheetDescription>
                </SheetHeader>

                <div className="flex flex-col gap-4 p-4">
                    <ShareForm
                        pageName={PAGE_NAMES.JSON}
                        tabName={JSON_TABS.FORMAT}
                        getState={() => ({
                            input: content,
                            output: content,
                            indent: 2,
                        })}
                    />

                    <Separator />

                    {/* Copy Formatted JSON Section */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            Copy Formatted JSON Content
                        </label>

                        <div className="grid grid-cols-1 gap-2 mt-2">
                            {[
                                {
                                    icon: Copy,
                                    label: 'Copy to Clipboard',
                                    onClick: copyToClipboard,
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
