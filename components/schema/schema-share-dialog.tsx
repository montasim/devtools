'use client';

import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import { Copy, Check, Share2, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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

interface SchemaShareDialogProps {
    content: string;
    schema?: string;
    mode?: 'generate' | 'validate';
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
}

export function SchemaShareDialog({
    content,
    schema,
    mode = 'generate',
    open,
    onOpenChange,
}: SchemaShareDialogProps) {
    const [copied, setCopied] = useState(false);

    const generateShareUrl = useCallback(() => {
        if (!content) return '';

        try {
            const encoded = btoa(encodeURIComponent(content));
            const url = new URL(window.location.href);
            url.searchParams.set('content', encoded);
            if (schema && mode === 'validate') {
                url.searchParams.set('schema', btoa(encodeURIComponent(schema)));
            }
            url.hash = 'schema';
            return url.toString();
        } catch (error) {
            console.error('Failed to generate share URL:', error);
            return '';
        }
    }, [content, schema, mode]);

    const shareUrl = generateShareUrl();

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

    const downloadAsFile = useCallback(() => {
        if (!content) return;

        try {
            const blob = new Blob([content], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = mode === 'generate' ? 'schema.json' : 'json-data.json';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Failed to download file:', error);
        }
    }, [content, mode]);

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent side="right" className="w-96">
                <SheetHeader>
                    <SheetTitle className="flex items-center gap-2">
                        <Share2 className="h-5 w-5" />
                        Share {mode === 'generate' ? 'Schema' : 'Validation'}
                    </SheetTitle>
                    <SheetDescription>
                        Share this {mode === 'generate' ? 'JSON schema' : 'JSON data'} with others
                    </SheetDescription>
                </SheetHeader>

                <div className="flex flex-col gap-4 p-4">
                    <ShareForm
                        pageName="json"
                        tabName="schema"
                        getState={() => ({
                            input: content,
                            schema: schema || '',
                            validationErrors: [],
                        })}
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
                                Copy {mode === 'generate' ? 'Schema' : 'JSON'}
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
                                Download {mode === 'generate' ? 'Schema' : 'JSON'}
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
