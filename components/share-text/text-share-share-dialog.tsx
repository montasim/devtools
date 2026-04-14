'use client';

import { useCallback } from 'react';
import { toast } from 'sonner';
import { Copy, Download, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetFooter,
    SheetHeader,
    SheetTitle,
} from '@/components/ui/sheet';
import { Separator } from '@/components/ui/separator';
import { ShareForm } from '@/components/share/share-form';

interface TextShareShareDialogProps {
    content: string;
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
}

export function TextShareShareDialog({ content, open, onOpenChange }: TextShareShareDialogProps) {
    // Copy to clipboard
    const copyToClipboard = useCallback(async () => {
        if (!content) return;

        try {
            await navigator.clipboard.writeText(content);
            toast.success('Copied to clipboard');
        } catch (error) {
            console.error('Failed to copy:', error);
            toast.error('Failed to copy to clipboard');
        }
    }, [content]);

    // Download as file
    const downloadFile = useCallback(() => {
        if (!content) return;

        try {
            const blob = new Blob([content], { type: 'text/plain' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'shared-text.txt';
            a.click();
            URL.revokeObjectURL(url);
            toast.success('Downloaded successfully');
        } catch (error) {
            console.error('Failed to download:', error);
            toast.error('Failed to download file');
        }
    }, [content]);

    // Share using Web Share API (if available)
    const shareNative = useCallback(async () => {
        if (typeof navigator.share !== 'function') {
            toast.error('Native sharing is not supported in this browser.');
            return;
        }

        try {
            await navigator.share({
                title: 'Shared Text',
                text: content,
            });
        } catch (error) {
            console.error('Failed to share:', error);
        }
    }, [content]);

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent side="right" className="w-96">
                <SheetHeader>
                    <SheetTitle>Share Text</SheetTitle>
                    <SheetDescription>
                        Share this text with others using various methods
                    </SheetDescription>
                </SheetHeader>

                <div className="flex flex-col gap-4 p-4">
                    <ShareForm
                        pageName="share"
                        tabName="text"
                        getState={() => ({
                            content,
                        })}
                    />

                    <Separator />

                    {/* Copy Section */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            Copy
                        </label>

                        <div className="grid grid-cols-1 gap-2 mt-2">
                            <Button
                                variant="outline"
                                className="w-full justify-start"
                                onClick={copyToClipboard}
                                disabled={!content}
                            >
                                <Copy className="h-4 w-4 mr-2" />
                                Copy to Clipboard
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
                                onClick={downloadFile}
                                disabled={!content}
                            >
                                <Download className="h-4 w-4 mr-2" />
                                Download as Text File
                            </Button>
                        </div>
                    </div>

                    <Separator />

                    {/* Native Share Section */}
                    {typeof navigator.share === 'function' && (
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                Native Share
                            </label>
                            <Button
                                variant="outline"
                                className="w-full justify-start"
                                onClick={shareNative}
                            >
                                <MessageCircle className="h-4 w-4 mr-2" />
                                Share Using Device Share Menu
                            </Button>
                        </div>
                    )}
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
