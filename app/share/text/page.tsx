'use client';

import { useState, useEffect, useRef, Suspense } from 'react';
import { toast } from 'sonner';
import { Copy, Share2, Sparkles, Type, Trash2, Upload } from 'lucide-react';
import { TextareaFooter } from '@/components/text/text-editor/textarea-footer';
import { EditorActions } from '@/components/editor/editor-actions';
import { EmptyEditorPrompt } from '@/components/ui/empty-editor-prompt';
import { useDebouncedSave } from '@/components/text/shared/use-debounced-save';
import { SharedContentBanner } from '@/components/shared/shared-content-banner';
import { TextShareShareDialog } from '@/components/share-text/text-share-share-dialog';
import { STORAGE_KEYS } from '@/lib/constants';

interface SharedData {
    title: string;
    comment?: string | null;
    expiresAt?: string | null;
    hasPassword: boolean;
    viewCount: number;
    createdAt: string;
    state?: {
        content?: string;
    };
}

function ShareTextPageContent() {
    const sharedDataLoadedRef = useRef(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [sharedData, setSharedData] = useState<SharedData | null>(null);
    const [content, setContent] = useState<string>(() => {
        try {
            return localStorage.getItem(STORAGE_KEYS.SHARE_TEXT_CONTENT) || '';
        } catch {
            return '';
        }
    });
    const [shareDialogOpen, setShareDialogOpen] = useState(false);

    // Handle async shared data arrival
    useEffect(() => {
        if (sharedData?.state?.content && !sharedDataLoadedRef.current) {
            sharedDataLoadedRef.current = true;
            // eslint-disable-next-line react-hooks/set-state-in-effect -- Required for shared data synchronization
            setContent(sharedData.state.content);
        }
    }, [sharedData]);

    // Check for shared state on mount
    useEffect(() => {
        const sharedStateStr = sessionStorage.getItem('sharedState');
        if (sharedStateStr) {
            try {
                const sharedState = JSON.parse(sharedStateStr);
                // eslint-disable-next-line react-hooks/set-state-in-effect -- Required for shared data synchronization
                setSharedData(sharedState);
                sessionStorage.removeItem('sharedState');
            } catch (error) {
                console.error('Failed to parse shared state:', error);
                sessionStorage.removeItem('sharedState');
            }
        }
    }, []);

    // Debounced save to localStorage
    useDebouncedSave(content, STORAGE_KEYS.SHARE_TEXT_CONTENT);

    const handleClear = () => {
        setContent('');
        try {
            localStorage.removeItem(STORAGE_KEYS.SHARE_TEXT_CONTENT);
        } catch (error) {
            console.error('Failed to clear share text content:', error);
        }
    };

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(content);
            toast.success('Copied to clipboard');
        } catch (error) {
            console.error('Failed to copy:', error);
            toast.error('Failed to copy to clipboard');
        }
    };

    const handleUpload = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        // Check if file is a text file
        if (
            !file.type.startsWith('text/') &&
            !file.name.endsWith('.txt') &&
            !file.name.endsWith('.md')
        ) {
            toast.error('Please upload a text file');
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            const text = e.target?.result as string;
            setContent(text);
            toast.success('File uploaded successfully');
        };
        reader.onerror = () => {
            toast.error('Failed to read file');
        };
        reader.readAsText(file);

        // Reset the input
        event.target.value = '';
    };

    const handleShare = () => {
        if (!content) {
            toast.error('No content to share. Please add some text first.');
            return;
        }
        setShareDialogOpen(true);
    };

    return (
        <>
            {sharedData && (
                <SharedContentBanner
                    title={sharedData.title}
                    comment={sharedData.comment}
                    expiresAt={sharedData.expiresAt}
                    hasPassword={sharedData.hasPassword}
                    viewCount={sharedData.viewCount}
                    createdAt={sharedData.createdAt}
                    onClose={() => setSharedData(null)}
                />
            )}
            <div className="mt-2">
                {/* Hidden file input */}
                <input
                    ref={fileInputRef}
                    type="file"
                    accept=".txt,.md,text/*"
                    onChange={handleFileChange}
                    className="hidden"
                />

                <div className="flex flex-col gap-4">
                    <div className="w-full">
                        <div className="flex flex-col h-full py-2">
                            {/* Header with label and actions */}
                            <div className="flex items-center justify-between mb-2 shrink-0">
                                <div className="flex items-center gap-2">
                                    <Type className="h-4 w-4 text-muted-foreground" />
                                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                        Share Text
                                    </label>
                                </div>
                                <EditorActions
                                    buttons={[
                                        {
                                            id: 'upload',
                                            icon: Upload,
                                            label: 'Upload',
                                            onClick: handleUpload,
                                            title: 'Upload from file',
                                        },
                                        {
                                            id: 'copy',
                                            icon: Copy,
                                            label: 'Copy',
                                            onClick: handleCopy,
                                            disabled: !content,
                                            title: 'Copy to clipboard',
                                        },
                                        {
                                            id: 'clear',
                                            icon: Trash2,
                                            label: 'Clear',
                                            onClick: handleClear,
                                            disabled: !content,
                                            title: 'Clear editor',
                                        },
                                        {
                                            id: 'share',
                                            icon: Share2,
                                            label: 'Share',
                                            onClick: handleShare,
                                            disabled: !content,
                                            title: 'Share text',
                                        },
                                    ]}
                                />
                            </div>

                            {/* Textarea container with overlay */}
                            <div
                                className="border border-input rounded-md shrink-0 overflow-hidden relative"
                                style={{ height: '600px', position: 'relative' }}
                            >
                                <textarea
                                    value={content}
                                    onChange={(e) => setContent(e.target.value)}
                                    className="w-full h-full resize-none p-3 font-mono text-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                                />

                                {/* Empty state overlay - shown on top when editor is empty */}
                                {!content && (
                                    <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                                        <EmptyEditorPrompt
                                            icon={Sparkles}
                                            title="No text yet"
                                            description="Start typing or paste text to share"
                                            showActions={true}
                                        />
                                    </div>
                                )}
                            </div>

                            {/* Footer with statistics */}
                            <div className="shrink-0">
                                <TextareaFooter content={content} error={null} />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Share dialog */}
            <TextShareShareDialog
                content={content}
                open={shareDialogOpen}
                onOpenChange={setShareDialogOpen}
            />
        </>
    );
}

export default function ShareTextPage() {
    return (
        <div className="min-h-screen">
            <Suspense fallback={<div className="min-h-screen" />}>
                <ShareTextPageContent />
            </Suspense>
        </div>
    );
}
