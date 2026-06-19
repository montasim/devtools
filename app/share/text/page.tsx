'use client';

import { useState, useEffect, Suspense } from 'react';
import { Type, Globe, Share2 } from 'lucide-react';
import ShareTextLoading from './loading';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { TextEditor } from '@/features/tools/text/components/text-editor';
import { EditorPaneHeader } from '@/features/tools/core/components/editor-pane-header';
import { SharedContentBanner } from '@/features/sharing/components/shared-content-banner';
import { ShareSidebarModal } from '@/features/tools/core/plugins/share-sidebar';
import { createSharedTabPlugin } from '@/features/tools/core/plugins/shared';
import { STORAGE_KEYS } from '@/lib/utils/constants';
import type { ShareAccessResponse } from '@/features/sharing/types/share';

const SESSION_KEY = 'share-text-access-data';

const tabTriggerClass =
    'gap-2 whitespace-nowrap rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-primary data-[state=active]:text-primary data-[state=active]:font-semibold data-[state=active]:bg-primary/10';

const SharedTab = createSharedTabPlugin({
    pageName: 'text',
    queryKey: 'text-shared',
    toolMapping: {
        share: {
            name: 'Share Text',
            icon: Type,
            color: 'bg-primary/10 text-primary',
        },
    },
    tabMapping: { share: 'editor' },
    storageKeys: { share: STORAGE_KEYS.SHARE_TEXT_CONTENT },
});

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

const SHARE_TEXT_FEATURES = [
    {
        icon: Type,
        title: 'Plain Text & Snippets',
        description: 'Share raw text, code snippets, logs, or formatted content easily',
    },
    {
        icon: Globe,
        title: 'Global Sharing',
        description: 'Generate access links with custom passwords or expiry times',
    },
    {
        icon: Share2,
        title: 'Quick Sharing Plugin',
        description: 'Save shared texts directly in your local history for quick lookup',
    },
];

function ShareTextPageContent() {
    const initial = loadSharedData();

    const [content, setContent] = useState(initial.content);
    const [shareOpen, setShareOpen] = useState(false);
    const [accessData, setAccessData] = useState<ShareAccessResponse | null>(initial.accessData);
    const [sharedSnapshot, setSharedSnapshot] = useState<string | null>(initial.isShared ? initial.content : null);
    const [activeTab, setActiveTab] = useState('editor');

    useEffect(() => {
        try {
            localStorage.setItem(STORAGE_KEYS.SHARE_TEXT_CONTENT, content);
        } catch {
            // ignore
        }
    }, [content]);

    const isReadOnly = sharedSnapshot !== null && content === sharedSnapshot;

    return (
        <div className="py-6 space-y-8 animate-in fade-in duration-500">
            {sharedSnapshot && accessData?.metadata && (
                <div className="mb-4">
                    <SharedContentBanner
                        metadata={accessData.metadata}
                        onOpenInEditor={() => {
                            setSharedSnapshot(null);
                            setAccessData(null);
                        }}
                    />
                </div>
            )}

            <div className="flex flex-col-reverse lg:grid lg:grid-cols-12 gap-8">
                {/* Left Side: Stats and Info (4 cols) */}
                <div className="lg:col-span-4 space-y-6">
                    <div className="rounded-2xl border bg-card p-4 shadow-sm relative overflow-hidden">
                        <div className="absolute inset-y-0 right-0 w-1/2 bg-gradient-to-l from-primary/5 to-transparent pointer-events-none" />
                        <h2 className="text-lg font-bold text-foreground mb-4">Text Sharing Tools</h2>
                        <div className="space-y-4">
                            {SHARE_TEXT_FEATURES.map((feature) => (
                                <div key={feature.title} className="flex gap-3.5 items-start p-2 rounded-xl transition hover:bg-muted/50">
                                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary border border-primary/10">
                                        <feature.icon className="h-4 w-4" />
                                    </div>
                                    <div>
                                        <p className="text-xs font-semibold text-foreground">{feature.title}</p>
                                        <p className="text-[11px] text-muted-foreground leading-relaxed mt-0.5">
                                            {feature.description}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="rounded-2xl border bg-card p-6 shadow-sm flex flex-col justify-between">
                        <div className="space-y-2">
                            <h3 className="text-sm font-semibold text-muted-foreground">Editor Shortcuts</h3>
                            <div className="space-y-2 pt-2 text-[11px] text-muted-foreground">
                                <div className="flex justify-between items-center border-b pb-1">
                                    <span>Copy All</span>
                                    <kbd className="px-1.5 py-0.5 rounded bg-muted border font-mono text-[9px]">Ctrl + C</kbd>
                                </div>
                                <div className="flex justify-between items-center border-b pb-1">
                                    <span>Paste Content</span>
                                    <kbd className="px-1.5 py-0.5 rounded bg-muted border font-mono text-[9px]">Ctrl + V</kbd>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span>Clear Editor</span>
                                    <kbd className="px-1.5 py-0.5 rounded bg-muted border font-mono text-[9px]">Clear button</kbd>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Side: Editor Workspace (8 cols) */}
                <div className="lg:col-span-8">
                    <div className="rounded-2xl border bg-card p-4 shadow-sm min-h-[500px] flex flex-col">
                        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full flex-1 flex flex-col">
                            <TabsList variant="line" className="w-full justify-start border-b pb-1 mb-6 bg-transparent gap-2">
                                <TabsTrigger value="editor" className={tabTriggerClass}>
                                    <Type className="h-4 w-4 shrink-0" />
                                    Text Editor
                                </TabsTrigger>
                                <TabsTrigger value="shared" className={tabTriggerClass}>
                                    <Globe className="h-4 w-4 shrink-0" />
                                    Shared History
                                </TabsTrigger>
                            </TabsList>

                            <div className="flex-1 flex flex-col">
                                <TabsContent value="editor" className="mt-0 flex-1 flex flex-col gap-4">
                                    <div className="flex flex-col gap-3">
                                        <EditorPaneHeader
                                            label="Text Editor"
                                            content={content}
                                            onContentChange={isReadOnly ? undefined : setContent}
                                            onClear={isReadOnly ? undefined : () => setContent('')}
                                            hideInputActions={isReadOnly}
                                            actions={
                                                <Button
                                                    variant="outline"
                                                    size="icon"
                                                    onClick={() => setShareOpen(true)}
                                                    disabled={!content || isReadOnly}
                                                    title="Share text"
                                                    className="h-7 w-7 text-primary"
                                                >
                                                    <Share2 className="h-3.5 w-3.5" />
                                                </Button>
                                            }
                                        />
                                        <TextEditor
                                            value={content}
                                            onChange={setContent}
                                            readOnly={isReadOnly}
                                            emptyTitle="No text yet"
                                            emptyDescription="Start typing, paste content, or upload a file"
                                            showEmptyPrompt
                                        />
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
                                </TabsContent>

                                <TabsContent value="shared" className="mt-0 flex-1">
                                    <SharedTab onTabChange={() => setActiveTab('editor')} />
                                </TabsContent>
                            </div>
                        </Tabs>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function ShareTextPage() {
    return (
        <Suspense fallback={<ShareTextLoading />}>
            <ShareTextPageContent />
        </Suspense>
    );
}
