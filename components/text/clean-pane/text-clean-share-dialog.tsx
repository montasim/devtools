'use client';

import { useCallback } from 'react';
import { toast } from 'sonner';
import { Copy, Download, FileText, MessageCircle } from 'lucide-react';
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

interface TextCleanShareDialogProps {
    leftContent: string;
    rightContent: string;
    cleanType: string | null;
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
}

export function TextCleanShareDialog({
    leftContent,
    rightContent,
    cleanType,
    open,
    onOpenChange,
}: TextCleanShareDialogProps) {
    // Copy output to clipboard
    const copyOutputToClipboard = useCallback(async () => {
        if (!rightContent) return;

        try {
            await navigator.clipboard.writeText(rightContent);
            toast.success('Copied to clipboard');
        } catch (error) {
            console.error('Failed to copy output:', error);
            toast.error('Failed to copy to clipboard');
        }
    }, [rightContent]);

    // Download output as file
    const downloadOutput = useCallback(() => {
        if (!rightContent) return;

        try {
            const blob = new Blob([rightContent], { type: 'text/plain' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `cleaned-${cleanType?.toLowerCase().replace(/\s+/g, '-') || 'text'}.txt`;
            a.click();
            URL.revokeObjectURL(url);
            toast.success('Downloaded successfully');
        } catch (error) {
            console.error('Failed to download:', error);
            toast.error('Failed to download file');
        }
    }, [rightContent, cleanType]);

    // Export HTML Report
    const exportHTMLReport = useCallback(() => {
        if (!leftContent && !rightContent) return;

        try {
            const html = `<!DOCTYPE html>
<html>
<head>
    <title>Text Cleaning Report</title>
    <style>
        body { font-family: monospace; padding: 20px; }
        .container { max-width: 1200px; margin: 0 auto; }
        .header { margin-bottom: 20px; padding: 10px; background: #e9ecef; border-radius: 4px; }
        .section { margin-bottom: 20px; }
        .section h3 { margin-bottom: 10px; }
        .content { padding: 10px; background: #f8f9fa; border-radius: 4px; white-space: pre-wrap; word-wrap: break-word; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Text Cleaning Report</h1>
            <p><strong>Cleaning Operation:</strong> ${cleanType || 'Unknown'}</p>
            <p><strong>Date:</strong> ${new Date().toISOString()}</p>
        </div>
        <div class="section">
            <h3>Input</h3>
            <div class="content">${leftContent || '(empty)'}</div>
        </div>
        <div class="section">
            <h3>Output (${cleanType || 'Cleaned'})</h3>
            <div class="content">${rightContent || '(empty)'}</div>
        </div>
    </div>
</body>
</html>`;

            const blob = new Blob([html], { type: 'text/html' });
            const url = URL.createObjectURL(blob);
            window.open(url, '_blank');
        } catch (error) {
            console.error('Failed to export HTML report:', error);
            toast.error('Failed to export HTML report');
        }
    }, [leftContent, rightContent, cleanType]);

    // Share using Web Share API (if available)
    const shareNative = useCallback(async () => {
        if (typeof navigator.share !== 'function') {
            toast.error('Native sharing is not supported in this browser.');
            return;
        }

        try {
            await navigator.share({
                title: `Cleaned Text (${cleanType || 'Text Cleaning'})`,
                text: rightContent,
            });
        } catch (error) {
            console.error('Failed to share:', error);
        }
    }, [rightContent, cleanType]);

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent side="right" className="w-96">
                <SheetHeader>
                    <SheetTitle>Share Cleaned Text</SheetTitle>
                    <SheetDescription>
                        Share this cleaned text with others using various methods
                    </SheetDescription>
                </SheetHeader>

                <div className="flex flex-col gap-4 p-4">
                    <ShareForm
                        pageName="text"
                        tabName="clean"
                        getState={() => ({
                            leftContent,
                            rightContent,
                            cleanType,
                        })}
                    />

                    <Separator />

                    {/* Copy Output Section */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            Copy Output
                        </label>

                        <div className="grid grid-cols-1 gap-2 mt-2">
                            <Button
                                variant="outline"
                                className="w-full justify-start"
                                onClick={copyOutputToClipboard}
                                disabled={!rightContent}
                            >
                                <Copy className="h-4 w-4 mr-2" />
                                Copy Output to Clipboard
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
                                onClick={downloadOutput}
                                disabled={!rightContent}
                            >
                                <Download className="h-4 w-4 mr-2" />
                                Download as Text File
                            </Button>
                            <Button
                                variant="outline"
                                className="w-full justify-start"
                                onClick={exportHTMLReport}
                                disabled={!leftContent && !rightContent}
                            >
                                <FileText className="h-4 w-4 mr-2" />
                                Export HTML Report
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
