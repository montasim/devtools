'use client';

import { useRef, useState, useEffect, useCallback } from 'react';
import { Upload, ClipboardPaste, Copy, Link, X, Loader2, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from '@/components/ui/dialog';

interface EditorPaneHeaderProps {
    label: string;
    content?: string;
    onContentChange?: (value: string) => void;
    onClear?: () => void;
    accept?: string;
    downloadFilename?: string;
    hideInputActions?: boolean;
}

export function EditorPaneHeader({
    label,
    content = '',
    onContentChange,
    onClear,
    accept = '.json,.txt,.csv,.xml,.yaml,.yml',
    downloadFilename,
    hideInputActions = false,
}: EditorPaneHeaderProps) {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [urlDialogOpen, setUrlDialogOpen] = useState(false);
    const [url, setUrl] = useState('');
    const [urlLoading, setUrlLoading] = useState(false);
    const [urlError, setUrlError] = useState('');
    const [hasClipboard, setHasClipboard] = useState(false);

    const hasContent = content.trim().length > 0;

    const checkClipboard = useCallback(async () => {
        try {
            const text = await navigator.clipboard.readText();
            setHasClipboard(text.length > 0);
        } catch {
            setHasClipboard(false);
        }
    }, []);

    useEffect(() => {
        checkClipboard();
        const onFocus = () => checkClipboard();
        window.addEventListener('focus', onFocus);
        return () => window.removeEventListener('focus', onFocus);
    }, [checkClipboard]);

    const handleUpload = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !onContentChange) return;
        const reader = new FileReader();
        reader.onload = (ev) => {
            const text = ev.target?.result;
            if (typeof text === 'string') {
                onContentChange(text);
            }
        };
        reader.readAsText(file);
        e.target.value = '';
    };

    const handlePaste = async () => {
        if (!onContentChange) return;
        try {
            const text = await navigator.clipboard.readText();
            if (text) {
                onContentChange(text);
            }
        } catch {
            // clipboard access denied
        }
    };

    const handleCopy = async () => {
        if (!content) return;
        try {
            await navigator.clipboard.writeText(content);
        } catch {
            // clipboard access denied
        }
    };

    const handleClear = () => {
        onClear?.();
    };

    const handleDownload = () => {
        if (!content || !downloadFilename) return;
        const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = downloadFilename;
        a.click();
        URL.revokeObjectURL(url);
    };

    const handleFetchUrl = async () => {
        if (!url.trim() || !onContentChange) return;
        setUrlLoading(true);
        setUrlError('');
        try {
            const res = await fetch(url.trim());
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const text = await res.text();
            onContentChange(text);
            setUrlDialogOpen(false);
            setUrl('');
        } catch (err) {
            setUrlError(err instanceof Error ? err.message : 'Failed to fetch content from URL');
        } finally {
            setUrlLoading(false);
        }
    };

    return (
        <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-muted-foreground">{label}</label>
            <div className="flex items-center gap-2">
                <input
                    ref={fileInputRef}
                    type="file"
                    className="hidden"
                    accept={accept}
                    onChange={handleFileChange}
                />
                {!hideInputActions && (
                    <>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    variant="outline"
                                    size="icon"
                                    className="h-7 w-7"
                                    onClick={handleUpload}
                                >
                                    <Upload className="h-3.5 w-3.5" />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>Upload file</TooltipContent>
                        </Tooltip>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    variant="outline"
                                    size="icon"
                                    className="h-7 w-7"
                                    onClick={() => {
                                        setUrlError('');
                                        setUrlDialogOpen(true);
                                    }}
                                >
                                    <Link className="h-3.5 w-3.5" />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>Load from URL</TooltipContent>
                        </Tooltip>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    variant="outline"
                                    size="icon"
                                    className="h-7 w-7"
                                    onClick={handlePaste}
                                    disabled={!hasClipboard}
                                >
                                    <ClipboardPaste className="h-3.5 w-3.5" />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>Paste from clipboard</TooltipContent>
                        </Tooltip>
                    </>
                )}
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button
                            variant="outline"
                            size="icon"
                            className="h-7 w-7"
                            onClick={handleCopy}
                            disabled={!hasContent}
                        >
                            <Copy className="h-3.5 w-3.5" />
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent>Copy content</TooltipContent>
                </Tooltip>
                {downloadFilename && (
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button
                                variant="outline"
                                size="icon"
                                className="h-7 w-7"
                                onClick={handleDownload}
                                disabled={!hasContent}
                            >
                                <Download className="h-3.5 w-3.5" />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>Download</TooltipContent>
                    </Tooltip>
                )}
                {onClear && (
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button
                                variant="outline"
                                size="icon"
                                className="h-7 w-7"
                                onClick={handleClear}
                                disabled={!hasContent}
                            >
                                <X className="h-3.5 w-3.5" />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>Clear</TooltipContent>
                    </Tooltip>
                )}
            </div>

            <Dialog open={urlDialogOpen} onOpenChange={setUrlDialogOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Load content from URL</DialogTitle>
                        <DialogDescription>
                            Enter a URL to fetch and load its content
                        </DialogDescription>
                    </DialogHeader>
                    <div className="flex flex-col gap-3">
                        <div className="flex gap-2">
                            <Input
                                value={url}
                                onChange={(e) => {
                                    setUrl(e.target.value);
                                    setUrlError('');
                                }}
                                placeholder="https://example.com/data.json"
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') handleFetchUrl();
                                }}
                            />
                            <Button
                                onClick={handleFetchUrl}
                                disabled={urlLoading || !url.trim()}
                                size="sm"
                            >
                                {urlLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Load'}
                            </Button>
                        </div>
                        {urlError && <p className="text-xs text-destructive">{urlError}</p>}
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
