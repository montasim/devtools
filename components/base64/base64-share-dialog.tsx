'use client';

import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import { Copy, Share2, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ShareForm } from '@/components/share/share-form';
import { PAGE_NAMES, BASE64_TABS } from '@/lib/constants/tabs';
import { saveBase64SharedItem } from '@/lib/base64-shared-utils';
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
    leftContent?: string; // Input content (file name/URL) for media-to-base64 tab
    pageName?: (typeof PAGE_NAMES)[keyof typeof PAGE_NAMES];
    tabName?: (typeof BASE64_TABS)[keyof typeof BASE64_TABS];
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
}

export function Base64ShareDialog({
    content,
    leftContent,
    pageName,
    tabName,
    open,
    onOpenChange,
}: Base64ShareDialogProps) {
    const [shareTitle, setShareTitle] = useState('');
    const [shareComment, setShareComment] = useState('');
    const [shareExpiration, setShareExpiration] = useState<'1h' | '1d' | '7d' | '30d'>('7d');

    const defaultPageName = PAGE_NAMES.BASE64;
    const defaultTabName = BASE64_TABS.MEDIA_TO_BASE64;

    // Copy Base64 to clipboard
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

    // Get tab display name
    const getTabDisplayName = (tab: string): string => {
        if (tab === BASE64_TABS.MEDIA_TO_BASE64) return 'Media to Base64';
        if (tab === BASE64_TABS.BASE64_TO_MEDIA) return 'Base64 to Media';
        return tab;
    };

    // Handle link generation and save to shared items
    const handleLinkGenerated = useCallback((url: string) => {
        try {
            // Extract share ID from URL
            const urlObj = new URL(url);
            const pathParts = urlObj.pathname.split('/');
            const shareId = pathParts[pathParts.length - 1];

            // Calculate expiration time in hours
            const expirationHours: Record<string, number> = {
                '1h': 1,
                '1d': 24,
                '7d': 24 * 7,
                '30d': 24 * 30,
            };

            const expirationTime = expirationHours[shareExpiration];

            // Save to localStorage
            const tabDisplayName = getTabDisplayName(tabName || defaultTabName);
            saveBase64SharedItem(
                shareId,
                url,
                shareTitle,
                tabDisplayName,
                content,
                shareComment || undefined,
                expirationTime,
            );
        } catch (error) {
            console.error('Failed to save shared item:', error);
        }
    }, [content, tabName, defaultTabName, shareTitle, shareComment, shareExpiration]);

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
                    <ShareForm
                        pageName={pageName || defaultPageName}
                        tabName={tabName || defaultTabName}
                        getState={() => {
                            // For media-to-base64 tab, send both input and output
                            if (
                                tabName === BASE64_TABS.MEDIA_TO_BASE64 &&
                                leftContent !== undefined
                            ) {
                                return {
                                    leftContent,
                                    rightContent: content,
                                };
                            }
                            // For base64-to-media tab, send only the input
                            return {
                                leftContent: content,
                            };
                        }}
                        onLinkGenerated={handleLinkGenerated}
                        onTitleChange={setShareTitle}
                        onCommentChange={setShareComment}
                        onExpirationChange={setShareExpiration}
                    />

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
