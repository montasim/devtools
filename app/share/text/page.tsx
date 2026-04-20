'use client';

import { useState, useEffect, useRef, Suspense } from 'react';
import { Copy, Upload, Trash2, Share2, Type } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { EmptyEditorPrompt } from '@/components/ui/empty-editor-prompt';
import { EditorFooter } from '@/features/tools/core/components/editor-footer';
import { SharedContentBanner } from '@/features/sharing/components/shared-content-banner';
import { ShareSidebarModal } from '@/features/tools/core/plugins/share-sidebar';
import { STORAGE_KEYS } from '@/lib/utils/constants';
import type { ShareAccessResponse } from '@/features/sharing/types/share';

const SESSION_KEY = 'share-text-access-data';

function extractStateContent(state: Record<string, unknown> | undefined): string {
    if (!state) return '';
    const text = state.content ?? state.leftContent ?? state.inputContent ?? state.text;
    if (typeof text === 'string') return text;
    return '';
}

function loadSharedData(): {
    content: string;
    accessData: ShareAccessResponse | null;
    isShared: boolean;
} {
    if (typeof window === 'undefined') {
        return { content: '', accessData: null, isShared: false };
    }
    try {
        const raw = sessionStorage.getItem(SESSION_KEY);
        if (!raw) {
            return {
                content: localStorage.getItem(STORAGE_KEYS.SHARE_TEXT_CONTENT) || '',
                accessData: null,
                isShared: false,
            };
        }
        const data: ShareAccessResponse = JSON.parse(raw);
        sessionStorage.removeItem(SESSION_KEY);
        const stateContent = extractStateContent(data.content.state);
        if (stateContent) {
            return { content: stateContent, accessData: data, isShared: true };
        }
        return {
            content: localStorage.getItem(STORAGE_KEYS.SHARE_TEXT_CONTENT) || '',
            accessData: data,
            isShared: false,
        };
    } catch {
        try {
            sessionStorage.removeItem(SESSION_KEY);
        } catch {
            // ignore
        }
        return {
            content: localStorage.getItem(STORAGE_KEYS.SHARE_TEXT_CONTENT) || '',
            accessData: null,
            isShared: false,
        };
    }
}

function ShareTextPageContent() {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const initial = loadSharedData();

    const [content, setContent] = useState(initial.content);
    const [shareOpen, setShareOpen] = useState(false);
    const [accessData, setAccessData] = useState<ShareAccessResponse | null>(initial.accessData);
    const [sharedSnapshot] = useState(initial.isShared ? initial.content : null);

    useEffect(() => {
        try {
            localStorage.setItem(STORAGE_KEYS.SHARE_TEXT_CONTENT, content);
        } catch {
            // ignore
        }
    }, [content]);

    const isReadOnly = sharedSnapshot !== null && content === sharedSnapshot;

    const handleClear = () => {
        setContent('');
        setAccessData(null);
        toast.success('Editor cleared');
    };

    const handleUpload = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (e) => {
            const text = e.target?.result as string;
            setContent(text);
            setAccessData(null);
            toast.success('File uploaded successfully');
        };
        reader.onerror = () => toast.error('Failed to read file');
        reader.readAsText(file);
        event.target.value = '';
    };

    return (
        <div className="mx-auto py-4">
            {sharedSnapshot && accessData?.metadata && (
                <SharedContentBanner metadata={accessData.metadata} />
            )}

            <input
                ref={fileInputRef}
                type="file"
                accept=".txt,.md,.json,.csv,.xml,.yaml,.yml,text/*"
                onChange={handleFileChange}
                className="hidden"
            />

            <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Type className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium">Text Editor</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <Button
                            variant="outline"
                            size="icon"
                            onClick={handleUpload}
                            disabled={isReadOnly}
                            title="Upload from file"
                        >
                            <Upload className="h-4 w-4" />
                        </Button>
                        <Button
                            variant="outline"
                            size="icon"
                            onClick={async () => {
                                try {
                                    await navigator.clipboard.writeText(content);
                                    toast.success('Copied to clipboard');
                                } catch {
                                    toast.error('Failed to copy');
                                }
                            }}
                            disabled={!content}
                            title="Copy to clipboard"
                        >
                            <Copy className="h-4 w-4" />
                        </Button>
                        <Button
                            variant="outline"
                            size="icon"
                            onClick={handleClear}
                            disabled={!content || isReadOnly}
                            title="Clear editor"
                        >
                            <Trash2 className="h-4 w-4" />
                        </Button>
                        <Button
                            variant="outline"
                            size="icon"
                            onClick={() => setShareOpen(true)}
                            disabled={!content || isReadOnly}
                            title="Share text"
                            className="text-primary"
                        >
                            <Share2 className="h-4 w-4" />
                        </Button>
                    </div>
                </div>

                <div className="relative">
                    <Textarea
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        readOnly={isReadOnly}
                        className="min-h-[500px] resize-none font-mono text-sm md:min-h-[600px]"
                        style={{ fieldSizing: 'fixed', overflow: 'auto' }}
                    />
                    {!content && (
                        <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                            <EmptyEditorPrompt
                                icon={Type}
                                title="No text yet"
                                description="Start typing, paste content, or upload a file"
                                showActions
                            />
                        </div>
                    )}
                </div>

                <EditorFooter content={content} mode="text" />
            </div>

            <ShareSidebarModal
                open={shareOpen}
                onOpenChange={setShareOpen}
                config={{
                    pageName: 'text',
                    tabName: 'share',
                    getState: () => ({ content }),
                }}
            />
        </div>
    );
}

export default function ShareTextPage() {
    return (
        <Suspense
            fallback={
                <div className="flex min-h-screen items-center justify-center">
                    <Type className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
            }
        >
            <ShareTextPageContent />
        </Suspense>
    );
}
