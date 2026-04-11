'use client';

import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import { Copy, Check, Download, MessageCircle, FileText, Share2 } from 'lucide-react';
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
import { DiffResult } from '@/components/editor-pane/types';

interface ShareDialogProps {
    diffResult: DiffResult | null;
    leftContent: string;
    rightContent: string;
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
}

export function ShareDialog({
    diffResult,
    leftContent,
    rightContent,
    open,
    onOpenChange,
}: ShareDialogProps) {
    const [copied, setCopied] = useState(false);

    // Generate shareable URL
    const generateShareUrl = useCallback(() => {
        if (!leftContent && !rightContent) return '';

        try {
            // Encode both JSON contents
            const encodedLeft = leftContent ? btoa(encodeURIComponent(leftContent)) : '';
            const encodedRight = rightContent ? btoa(encodeURIComponent(rightContent)) : '';

            // Create URL with encoded content
            const url = new URL(window.location.href);
            url.searchParams.set('left', encodedLeft);
            url.searchParams.set('right', encodedRight);

            return url.toString();
        } catch (error) {
            console.error('Error generating share URL:', error);
            return '';
        }
    }, [leftContent, rightContent]);

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

    // Copy diff to clipboard
    const copyDiffToClipboard = useCallback(async () => {
        if (!diffResult) return;

        try {
            // Create formatted diff text
            let diffText = `JSON Diff (${new Date().toISOString()})\n`;
            diffText += `Additions: ${diffResult.additionCount}, Deletions: ${diffResult.deletionCount}, Modifications: ${diffResult.modificationCount}\n\n`;

            diffResult.hunks.forEach((hunk, index) => {
                diffText += `@@ Hunk ${index + 1} @@\n`;
                hunk.lines.forEach((line) => {
                    const prefix =
                        line.type === 'addition' ? '+' : line.type === 'deletion' ? '-' : ' ';
                    diffText += `${prefix} ${line.content}\n`;
                });
                diffText += '\n';
            });

            await navigator.clipboard.writeText(diffText);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (error) {
            console.error('Failed to copy diff:', error);
        }
    }, [diffResult]);

    // Generate JSON Patch format
    const generateJSONPatch = useCallback(() => {
        if (!diffResult) return [];

        return diffResult.hunks.map((hunk) => ({
            op: 'replace',
            path: '/path',
            value: hunk.lines
                .filter((l) => l.type === 'addition' || l.type === 'unchanged')
                .map((l) => l.content)
                .join(''),
        }));
    }, [diffResult]);

    // Copy as JSON Patch
    const copyAsJSONPatch = useCallback(async () => {
        if (!diffResult) return;

        try {
            const patch = generateJSONPatch();
            await navigator.clipboard.writeText(JSON.stringify(patch, null, 2));
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (error) {
            console.error('Failed to copy JSON Patch:', error);
        }
    }, [diffResult, generateJSONPatch]);

    // Generate Merge Patch format
    const generateMergePatch = useCallback(() => {
        if (!diffResult) return [];

        return diffResult.hunks.map((hunk) => ({
            conflict: 'modify',
            file: '/path',
            changes: hunk.lines.map((l) => l.content),
        }));
    }, [diffResult]);

    // Copy as Merge Patch
    const copyAsMergePatch = useCallback(async () => {
        if (!diffResult) return;

        try {
            const patch = generateMergePatch();
            await navigator.clipboard.writeText(JSON.stringify(patch, null, 2));
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (error) {
            console.error('Failed to copy Merge Patch:', error);
        }
    }, [diffResult, generateMergePatch]);

    // Download Patch
    const downloadPatch = useCallback(() => {
        if (!diffResult) return;

        try {
            const patch = diffResult.hunks
                .map((hunk) => {
                    const header = `@@ -${hunk.oldStart},${hunk.oldLines} +${hunk.newStart},${hunk.newLines} @@`;
                    const lines = hunk.lines
                        .map((line) => {
                            const prefix =
                                line.type === 'addition'
                                    ? '+'
                                    : line.type === 'deletion'
                                      ? '-'
                                      : ' ';
                            return `${prefix}${line.content}`;
                        })
                        .join('\n');
                    return `${header}\n${lines}`;
                })
                .join('\n');

            const blob = new Blob([patch], { type: 'text/plain' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'changes.patch';
            a.click();
            URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Failed to download patch:', error);
        }
    }, [diffResult]);

    // Export HTML Report
    const exportHTMLReport = useCallback(() => {
        if (!diffResult) return;

        try {
            const html = `<!DOCTYPE html>
<html>
<head>
    <title>Diff Report</title>
    <style>
        body { font-family: monospace; padding: 20px; }
        .addition { background: #d4edda; }
        .deletion { background: #f8d7da; }
        .hunk { margin-bottom: 20px; border: 1px solid #ddd; padding: 10px; }
    </style>
</head>
<body>
    <h1>Diff Report</h1>
    <p><strong>Changes:</strong> ${diffResult.additionCount} additions, ${diffResult.deletionCount} deletions, ${diffResult.modificationCount} modifications</p>
    ${diffResult.hunks
        .map(
            (hunk) => `
        <div class="hunk">
            <h2>@@ -${hunk.oldStart},${hunk.oldLines} +${hunk.newStart},${hunk.newLines} @@</h2>
            ${hunk.lines
                .map((line) => {
                    const className =
                        line.type === 'addition'
                            ? 'addition'
                            : line.type === 'deletion'
                              ? 'deletion'
                              : '';
                    return `<div class="${className}">${line.type === 'addition' ? '+' : line.type === 'deletion' ? '-' : ' '} ${line.content}</div>`;
                })
                .join('')}
        </div>
    `,
        )
        .join('')}
</body>
</html>`;

            const blob = new Blob([html], { type: 'text/html' });
            const url = URL.createObjectURL(blob);
            window.open(url, '_blank');
        } catch (error) {
            console.error('Failed to export HTML report:', error);
        }
    }, [diffResult]);

    // Copy JSON Paths
    const copyJSONPaths = useCallback(async () => {
        if (!diffResult) return;

        try {
            const paths: string[] = [];
            diffResult.hunks.forEach((hunk) => {
                hunk.lines.forEach((line) => {
                    if (line.content.includes('/')) {
                        const match = line.content.match(/"([^"]+)"/);
                        if (match) paths.push(match[1]);
                    }
                });
            });

            const uniquePaths = [...new Set(paths)];
            await navigator.clipboard.writeText(JSON.stringify(uniquePaths, null, 2));
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (error) {
            console.error('Failed to copy JSON paths:', error);
        }
    }, [diffResult]);

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
                title: 'JSON Diff',
                text: `Check out this JSON diff with ${diffResult?.additionCount || 0} additions and ${diffResult?.deletionCount || 0} deletions.`,
                url: url,
            });
        } catch (error) {
            console.error('Failed to share:', error);
        }
    }, [generateShareUrl, diffResult]);

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent side="right" className="w-96">
                <SheetHeader>
                    <SheetTitle>Share Diff</SheetTitle>
                    <SheetDescription>
                        Share this JSON diff with others using various methods
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
                                    icon: Copy,
                                    label: 'Copy as JSON Patch',
                                    onClick: copyAsJSONPatch,
                                },
                                {
                                    icon: Copy,
                                    label: 'Copy as Merge Patch',
                                    onClick: copyAsMergePatch,
                                },
                                { icon: Share2, label: 'Copy JSON Paths', onClick: copyJSONPaths },
                            ].map(({ icon: Icon, label, onClick }) => (
                                <Button
                                    key={label}
                                    variant="outline"
                                    className="w-full justify-start"
                                    onClick={onClick}
                                    disabled={!diffResult}
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
                                    disabled={!diffResult}
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
