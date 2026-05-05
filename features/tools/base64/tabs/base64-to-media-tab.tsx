'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useToolActions } from '../../core/hooks/use-tool-actions';
import { ToolTabWrapper } from '../../core/components/tool-tab-wrapper';
import { ShareSidebarModal } from '../../core/plugins/share-sidebar';
import {
    detectMimeFromBase64,
    getMediaCategory,
    type MediaCategory,
} from '../utils/mime-detection';
import { useClipboard } from '@/lib/hooks/use-clipboard';
import { Textarea } from '@/components/ui/textarea';
import {
    Download,
    Copy,
    FileDown,
    ImageIcon,
    Video,
    Music,
    FileText,
    File,
    Loader2,
} from 'lucide-react';
import Image from 'next/image';
import { EmptyEditorPrompt } from '@/components/ui/empty-editor-prompt';
import { EditorPaneHeader } from '../../core/components/editor-pane-header';
import { EditorFooter } from '../../core/components/editor-footer';
import type { TabComponentProps } from '../../core/types/tool';

const CATEGORY_ICONS: Record<MediaCategory, React.ComponentType<{ className?: string }>> = {
    image: ImageIcon,
    video: Video,
    audio: Music,
    pdf: FileText,
    other: File,
};

function cleanBase64(raw: string): string {
    return raw.replace(/^data:[^;]+;base64,/, '').replace(/\s/g, '');
}

export default function Base64ToMediaTab({ readOnly }: TabComponentProps) {
    const [input, setInput] = useState('');
    const [shareOpen, setShareOpen] = useState(false);
    const [blobUrl, setBlobUrl] = useState<string | null>(null);
    const [loadedInput, setLoadedInput] = useState('');
    const prevUrlRef = useRef<string | null>(null);
    const { copy } = useClipboard();

    const { mime, extension } = detectMimeFromBase64(input);
    const category = input ? getMediaCategory(mime) : null;

    // Async blob creation via fetch(dataUrl) — handles large files (up to 16MB)
    // without the memory overhead of atob() + charCodeAt loop
    useEffect(() => {
        if (prevUrlRef.current) {
            URL.revokeObjectURL(prevUrlRef.current);
            prevUrlRef.current = null;
        }

        if (!input || input.trim() === '') {
            return;
        }

        let cancelled = false;
        const data = `data:${mime};base64,${cleanBase64(input)}`;

        fetch(data)
            .then((res) => res.blob())
            .then((blob) => {
                if (cancelled) return;
                const url = URL.createObjectURL(blob);
                prevUrlRef.current = url;
                setBlobUrl(url);
                setLoadedInput(input);
            })
            .catch(() => {
                if (!cancelled) {
                    setBlobUrl(null);
                    setLoadedInput('');
                }
            });

        return () => {
            cancelled = true;
        };
    }, [input, mime]);

    const effectiveBlobUrl = input ? blobUrl : null;
    const effectiveLoading = !!input && loadedInput !== input;

    const handleDownload = useCallback(() => {
        if (!effectiveBlobUrl) return;
        const a = document.createElement('a');
        a.href = effectiveBlobUrl;
        a.download = `converted.${extension}`;
        a.click();
    }, [effectiveBlobUrl, extension]);

    const { actions } = useToolActions({
        pageName: 'base64',
        tabId: 'base64-to-media',
        getContent: () => input,
        onClear: () => setInput(''),
        shareDialogOpen: shareOpen,
        setShareDialogOpen: setShareOpen,
        readOnly,
    });

    const renderPreview = () => {
        if (effectiveLoading) {
            return (
                <div className="flex h-full items-center justify-center">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
            );
        }

        if (!effectiveBlobUrl || !category) {
            return (
                <EmptyEditorPrompt
                    icon={ImageIcon}
                    title="Decoded output"
                    description="Preview and download the decoded file here"
                    showActions={false}
                    overlay
                />
            );
        }

        const Icon = CATEGORY_ICONS[category];

        switch (category) {
            case 'image':
                return (
                    <Image
                        src={effectiveBlobUrl ?? ''}
                        alt="Preview"
                        fill
                        className="object-contain p-2"
                        unoptimized
                    />
                );
            case 'video':
                return (
                    <video
                        src={effectiveBlobUrl}
                        controls
                        className="absolute inset-0 h-full w-full object-contain"
                    />
                );
            case 'audio':
                return (
                    <div className="flex h-full items-center justify-center gap-4 p-8">
                        <div className="flex flex-col items-center gap-4">
                            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted">
                                <Music className="h-10 w-10 text-muted-foreground" />
                            </div>
                            <span className="text-sm font-medium text-muted-foreground">
                                {mime}
                            </span>
                            <audio src={effectiveBlobUrl} controls className="w-80" />
                        </div>
                    </div>
                );
            case 'pdf':
                return (
                    <iframe
                        src={effectiveBlobUrl}
                        className="h-full w-full border-0"
                        title="PDF Preview"
                    />
                );
            default:
                return (
                    <div className="flex h-full flex-col items-center justify-center gap-4 p-8">
                        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted">
                            <Icon className="h-10 w-10 text-muted-foreground" />
                        </div>
                        <div className="text-center">
                            <p className="font-medium">{mime}</p>
                            <p className="text-sm text-muted-foreground">File type: .{extension}</p>
                        </div>
                        <button
                            onClick={handleDownload}
                            className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
                        >
                            <Download className="h-4 w-4" />
                            Download File
                        </button>
                    </div>
                );
        }
    };

    return (
        <ToolTabWrapper actions={actions}>
            <div className="flex flex-col gap-4 md:flex-row">
                <div className="min-w-0 w-full md:w-1/2">
                    <div className="flex flex-col gap-2">
                        <EditorPaneHeader
                            label="Base64 Input"
                            content={input}
                            onContentChange={setInput}
                            onClear={() => setInput('')}
                            hideInputActions={readOnly}
                        />
                        <div className="relative">
                            <Textarea
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                readOnly={readOnly}
                                className="min-h-[250px] resize-none font-mono text-xs md:min-h-[400px] lg:min-h-[500px]"
                                style={{ fieldSizing: 'fixed', overflow: 'auto' }}
                            />
                            {(!input || input.trim() === '') && (
                                <EmptyEditorPrompt
                                    icon={FileDown}
                                    title="Paste Base64 string"
                                    description="Paste a Base64 encoded string to decode and download the file (max 16 MB)"
                                    overlay
                                />
                            )}
                        </div>
                        <EditorFooter content={input} mode="base64" />
                    </div>
                </div>
                <div className="min-w-0 w-full md:w-1/2">
                    <div className="flex flex-col gap-2">
                        <EditorPaneHeader
                            label="Decoded Output"
                            content={input}
                            onContentChange={() => {}}
                            onClear={() => setInput('')}
                            hideInputActions
                            downloadFilename={`converted.${extension}`}
                        />
                        <div className="relative min-h-[250px] overflow-hidden rounded-lg border md:min-h-[400px] lg:min-h-[500px]">
                            {renderPreview()}
                        </div>
                    </div>
                </div>
            </div>
            <ShareSidebarModal
                open={shareOpen}
                onOpenChange={setShareOpen}
                config={{
                    pageName: 'base64',
                    tabName: 'base64-to-media',
                    getState: () => ({ base64: input }),
                    extraActions: input
                        ? [
                              {
                                  id: 'copy-base64',
                                  label: 'Copy Base64',
                                  icon: Copy,
                                  handler: () => copy(input),
                              },
                              {
                                  id: 'download-file',
                                  label: 'Download File',
                                  icon: Download,
                                  handler: handleDownload,
                              },
                          ]
                        : [],
                }}
            />
        </ToolTabWrapper>
    );
}
