'use client';

import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import { Copy, Check, Download, MessageCircle, FileText, FileCode } from 'lucide-react';
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

interface TextDiffShareDialogProps {
    leftContent: string;
    rightContent: string;
    stats: {
        addedLines: number;
        removedLines: number;
        unchangedLines: number;
    } | null;
    changePercentage: number;
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
}

export function TextDiffShareDialog({
    leftContent,
    rightContent,
    stats,
    changePercentage,
    open,
    onOpenChange,
}: TextDiffShareDialogProps) {
    // Use the same prop names for consistency
    const left = leftContent;
    const right = rightContent;
    const [copied, setCopied] = useState(false);

    // Generate shareable URL
    const generateShareUrl = useCallback(() => {
        if (!left && !right) return '';

        try {
            // Encode both text contents
            const encodedLeft = left ? btoa(encodeURIComponent(left)) : '';
            const encodedRight = right ? btoa(encodeURIComponent(right)) : '';

            // Create URL with encoded content
            const url = new URL(window.location.href);
            url.searchParams.set('left', encodedLeft);
            url.searchParams.set('right', encodedRight);

            return url.toString();
        } catch (error) {
            console.error('Error generating share URL:', error);
            return '';
        }
    }, [left, right]);

    // Copy share URL to clipboard
    const copyShareUrl = useCallback(async () => {
        const url = generateShareUrl();
        if (!url) return;

        try {
            await navigator.clipboard.writeText(url);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
            toast.success('Shareable link copied to clipboard');
        } catch (error) {
            console.error('Failed to copy URL:', error);
            toast.error('Failed to copy shareable link');
        }
    }, [generateShareUrl]);

    // Copy diff to clipboard
    const copyDiffToClipboard = useCallback(async () => {
        if (!stats) return;

        try {
            // Create formatted diff text
            let diffText = `Text Diff (${new Date().toISOString()})\n`;
            diffText += `Additions: ${stats.addedLines}, Deletions: ${stats.removedLines}, Unchanged: ${stats.unchangedLines}\n`;
            diffText += `Changed: ${changePercentage}%\n\n`;

            diffText += `--- Original\n`;
            diffText += `+++ Modified\n`;

            const leftLines = left.split('\n');
            const rightLines = right.split('\n');

            // Simple line-by-line diff
            const maxLines = Math.max(leftLines.length, rightLines.length);
            for (let i = 0; i < maxLines; i++) {
                const leftLine = leftLines[i] || '';
                const rightLine = rightLines[i] || '';

                if (leftLine === rightLine) {
                    diffText += ` ${leftLine}\n`;
                } else if (!leftLine && rightLine) {
                    diffText += `+${rightLine}\n`;
                } else if (leftLine && !rightLine) {
                    diffText += `-${leftLine}\n`;
                } else {
                    diffText += `-${leftLine}\n`;
                    diffText += `+${rightLine}\n`;
                }
            }

            await navigator.clipboard.writeText(diffText);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
            toast.success('Copied diff to clipboard');
        } catch (error) {
            console.error('Failed to copy diff:', error);
            toast.error('Failed to copy diff');
        }
    }, [stats, left, right, changePercentage]);

    // Copy as Unified Diff
    const copyAsUnifiedDiff = useCallback(async () => {
        if (!stats) return;

        try {
            let diffText = `--- original.txt\t${new Date().toISOString()}\n`;
            diffText += `+++ modified.txt\t${new Date().toISOString()}\n`;
            diffText += `@@ -1,${left.split('\n').length} +1,${right.split('\n').length} @@\n`;

            const leftLines = left.split('\n');
            const rightLines = right.split('\n');

            const maxLines = Math.max(leftLines.length, rightLines.length);
            for (let i = 0; i < maxLines; i++) {
                const leftLine = leftLines[i] || '';
                const rightLine = rightLines[i] || '';

                if (leftLine === rightLine) {
                    diffText += ` ${leftLine}\n`;
                } else if (!leftLine && rightLine) {
                    diffText += `+${rightLine}\n`;
                } else if (leftLine && !rightLine) {
                    diffText += `-${leftLine}\n`;
                } else {
                    diffText += `-${leftLine}\n`;
                    diffText += `+${rightLine}\n`;
                }
            }

            await navigator.clipboard.writeText(diffText);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
            toast.success('Copied unified diff to clipboard');
        } catch (error) {
            console.error('Failed to copy unified diff:', error);
            toast.error('Failed to copy unified diff');
        }
    }, [stats, left, right]);

    // Download Patch
    const downloadPatch = useCallback(() => {
        if (!stats) return;

        try {
            let patch = `--- original.txt\t${new Date().toISOString()}\n`;
            patch += `+++ modified.txt\t${new Date().toISOString()}\n`;
            patch += `@@ -1,${left.split('\n').length} +1,${right.split('\n').length} @@\n`;

            const leftLines = left.split('\n');
            const rightLines = right.split('\n');

            const maxLines = Math.max(leftLines.length, rightLines.length);
            for (let i = 0; i < maxLines; i++) {
                const leftLine = leftLines[i] || '';
                const rightLine = rightLines[i] || '';

                if (leftLine === rightLine) {
                    patch += ` ${leftLine}\n`;
                } else if (!leftLine && rightLine) {
                    patch += `+${rightLine}\n`;
                } else if (leftLine && !rightLine) {
                    patch += `-${leftLine}\n`;
                } else {
                    patch += `-${leftLine}\n`;
                    patch += `+${rightLine}\n`;
                }
            }

            const blob = new Blob([patch], { type: 'text/plain' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'text-diff.patch';
            a.click();
            URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Failed to download patch:', error);
        }
    }, [stats, left, right]);

    // Export HTML Report
    const exportHTMLReport = useCallback(() => {
        if (!stats) return;

        try {
            const leftLines = left.split('\n');
            const rightLines = right.split('\n');

            const html = `<!DOCTYPE html>
<html>
<head>
    <title>Text Diff Report</title>
    <style>
        body { font-family: monospace; padding: 20px; }
        .addition { background: #d4edda; }
        .deletion { background: #f8d7da; }
        .unchanged { background: #f8f9fa; }
        .line { padding: 2px 8px; }
        .stats { margin-bottom: 20px; padding: 10px; background: #e9ecef; border-radius: 4px; }
    </style>
</head>
<body>
    <h1>Text Diff Report</h1>
    <div class="stats">
        <p><strong>Changes:</strong> ${stats.addedLines} additions, ${stats.removedLines} deletions, ${stats.unchangedLines} unchanged</p>
        <p><strong>Changed:</strong> ${changePercentage}%</p>
    </div>
    ${leftLines
        .map((leftLine, i) => {
            const rightLine = rightLines[i] || '';
            let className = 'unchanged';
            let prefix = ' ';
            let content = leftLine;

            if (leftLine === rightLine) {
                className = 'unchanged';
                prefix = ' ';
                content = leftLine;
            } else if (!leftLine && rightLine) {
                className = 'addition';
                prefix = '+';
                content = rightLine;
            } else if (leftLine && !rightLine) {
                className = 'deletion';
                prefix = '-';
                content = leftLine;
            } else {
                return `<div class="line deletion">-${leftLine}</div><div class="line addition">+${rightLine}</div>`;
            }

            return `<div class="line ${className}">${prefix} ${content}</div>`;
        })
        .join('')}
</body>
</html>`;

            const blob = new Blob([html], { type: 'text/html' });
            const url = URL.createObjectURL(blob);
            window.open(url, '_blank');
        } catch (error) {
            console.error('Failed to export HTML report:', error);
        }
    }, [stats, left, right, changePercentage]);

    // Share using Web Share API (if available)
    const shareNative = useCallback(async () => {
        if (typeof navigator.share !== 'function') {
            toast.error('Native sharing is not supported in this browser.');
            return;
        }

        const url = generateShareUrl();
        if (!url) return;

        try {
            await navigator.share({
                title: 'Text Diff',
                text: `Check out this text diff with ${stats?.addedLines || 0} additions and ${stats?.removedLines || 0} deletions (${changePercentage}% changed).`,
                url: url,
            });
        } catch (error) {
            console.error('Failed to share:', error);
        }
    }, [generateShareUrl, stats, changePercentage]);

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent side="right" className="w-96">
                <SheetHeader>
                    <SheetTitle>Share Text Diff</SheetTitle>
                    <SheetDescription>
                        Share this text diff with others using various methods
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
                            Anyone with this link can view the diff
                        </p>
                    </div>

                    <Separator />

                    {/* Copy Diff Section */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            Copy Diff Content
                        </label>

                        <div className="grid grid-cols-1 gap-2 mt-2">
                            {[
                                {
                                    icon: Copy,
                                    label: 'Copy Diff to Clipboard',
                                    onClick: copyDiffToClipboard,
                                },
                                {
                                    icon: FileCode,
                                    label: 'Copy as Unified Diff',
                                    onClick: copyAsUnifiedDiff,
                                },
                            ].map(({ icon: Icon, label, onClick }) => (
                                <Button
                                    key={label}
                                    variant="outline"
                                    className="w-full justify-start"
                                    onClick={onClick}
                                    disabled={!stats}
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
                                { icon: Download, label: 'Download Patch', onClick: downloadPatch },
                                {
                                    icon: FileText,
                                    label: 'Export HTML Report',
                                    onClick: exportHTMLReport,
                                },
                            ].map(({ icon: Icon, label, onClick }) => (
                                <Button
                                    key={label}
                                    variant="outline"
                                    className="w-full justify-start"
                                    onClick={onClick}
                                    disabled={!stats}
                                >
                                    <Icon className="h-4 w-4 mr-2" />
                                    {label}
                                </Button>
                            ))}
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
                        💡 Tip: Use the shareable link to collaborate with others in real-time
                    </p>
                </SheetFooter>
            </SheetContent>
        </Sheet>
    );
}
