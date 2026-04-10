'use client';

import { useState, useCallback } from 'react';
import { Copy, Check, Download, FileText, FileCode, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetFooter,
} from '@/components/ui/sheet';
import { Separator } from '@/components/ui/separator';

interface ConvertShareDialogProps {
    inputContent: string;
    outputContent: string;
    conversionType: string | null;
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
}

export function ConvertShareDialog({
    inputContent,
    outputContent,
    conversionType,
    open,
    onOpenChange,
}: ConvertShareDialogProps) {
    const [copied, setCopied] = useState(false);

    // Generate shareable URL
    const generateShareUrl = useCallback(() => {
        if (!inputContent && !outputContent) return '';

        try {
            // Encode both text contents
            const encodedInput = inputContent ? btoa(encodeURIComponent(inputContent)) : '';
            const encodedOutput = outputContent ? btoa(encodeURIComponent(outputContent)) : '';

            // Create URL with encoded content
            const url = new URL(window.location.href);
            url.searchParams.set('input', encodedInput);
            url.searchParams.set('output', encodedOutput);
            if (conversionType) {
                url.searchParams.set('type', conversionType);
            }

            return url.toString();
        } catch (error) {
            console.error('Error generating share URL:', error);
            return '';
        }
    }, [inputContent, outputContent, conversionType]);

    // Copy share URL to clipboard
    const copyShareUrl = useCallback(async () => {
        const url = generateShareUrl();
        if (!url) return;

        try {
            await navigator.clipboard.writeText(url);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (error) {
            console.error('Failed to copy URL:', error);
        }
    }, [generateShareUrl]);

    // Copy output to clipboard
    const copyOutputToClipboard = useCallback(async () => {
        if (!outputContent) return;

        try {
            await navigator.clipboard.writeText(outputContent);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (error) {
            console.error('Failed to copy output:', error);
        }
    }, [outputContent]);

    // Download output as file
    const downloadOutput = useCallback(() => {
        if (!outputContent) return;

        try {
            const blob = new Blob([outputContent], { type: 'text/plain' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `converted-${conversionType?.toLowerCase().replace(/\s+/g, '-') || 'text'}.txt`;
            a.click();
            URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Failed to download:', error);
        }
    }, [outputContent, conversionType]);

    // Export HTML Report
    const exportHTMLReport = useCallback(() => {
        if (!inputContent && !outputContent) return;

        try {
            const html = `<!DOCTYPE html>
<html>
<head>
    <title>Text Conversion Report</title>
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
            <h1>Text Conversion Report</h1>
            <p><strong>Conversion Type:</strong> ${conversionType || 'Unknown'}</p>
            <p><strong>Date:</strong> ${new Date().toISOString()}</p>
        </div>
        <div class="section">
            <h3>Input</h3>
            <div class="content">${inputContent || '(empty)'}</div>
        </div>
        <div class="section">
            <h3>Output (${conversionType || 'Converted'})</h3>
            <div class="content">${outputContent || '(empty)'}</div>
        </div>
    </div>
</body>
</html>`;

            const blob = new Blob([html], { type: 'text/html' });
            const url = URL.createObjectURL(blob);
            window.open(url, '_blank');
        } catch (error) {
            console.error('Failed to export HTML report:', error);
        }
    }, [inputContent, outputContent, conversionType]);

    // Share using Web Share API (if available)
    const shareNative = useCallback(async () => {
        if (typeof navigator.share !== 'function') {
            alert('Native sharing is not supported in this browser.');
            return;
        }

        const url = generateShareUrl();
        if (!url) return;

        try {
            await navigator.share({
                title: `Converted Text (${conversionType || 'Text Conversion'})`,
                text: outputContent,
                url: url,
            });
        } catch (error) {
            console.error('Failed to share:', error);
        }
    }, [generateShareUrl, outputContent, conversionType]);

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent side="right" className="w-96">
                <SheetHeader>
                    <SheetTitle>Share Converted Text</SheetTitle>
                    <SheetDescription>
                        Share this converted text with others using various methods
                    </SheetDescription>
                </SheetHeader>

                <div className="flex flex-col gap-4 p-4">
                    {/* Share URL Section */}
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
                            Anyone with this link can view the conversion
                        </p>
                    </div>

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
                                disabled={!outputContent}
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
                                disabled={!outputContent}
                            >
                                <Download className="h-4 w-4 mr-2" />
                                Download as Text File
                            </Button>
                            <Button
                                variant="outline"
                                className="w-full justify-start"
                                onClick={exportHTMLReport}
                                disabled={!inputContent && !outputContent}
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
