'use client';

import { useState, useEffect, Suspense } from 'react';
import { Type, Globe, Share2 } from 'lucide-react';
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

function ShareTextPageContent() {
    const initial = loadSharedData();

    const [content, setContent] = useState(initial.content);
    const [shareOpen, setShareOpen] = useState(false);
    const [accessData] = useState<ShareAccessResponse | null>(initial.accessData);
    const [sharedSnapshot] = useState(initial.isShared ? initial.content : null);
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
        <div className="mx-auto py-4">
            {sharedSnapshot && accessData?.metadata && (
                <SharedContentBanner metadata={accessData.metadata} />
            )}

            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <div className=" border-b pb-2">
                    <TabsList
                        variant="line"
                        className="h-auto w-full justify-start overflow-x-auto border-0 bg-transparent p-0 scrollbar-hide"
                    >
                        <div className="flex w-full min-w-max justify-between gap-2">
                            <div className="flex min-w-max gap-1">
                                <TabsTrigger value="editor" className={tabTriggerClass}>
                                    <Type className="h-4 w-4 shrink-0" />
                                    Editor
                                </TabsTrigger>
                            </div>
                            <div className="flex min-w-max gap-1">
                                <TabsTrigger value="shared" className={tabTriggerClass}>
                                    <Globe className="h-4 w-4 shrink-0" />
                                    Shared
                                </TabsTrigger>
                            </div>
                        </div>
                    </TabsList>
                </div>

                <div className="mx-auto">
                    <TabsContent value="editor" className="mt-0">
                        <div className="flex flex-col gap-2">
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

                    <TabsContent value="shared" className="mt-0">
                        <SharedTab onTabChange={() => setActiveTab('editor')} />
                    </TabsContent>
                </div>
            </Tabs>
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
