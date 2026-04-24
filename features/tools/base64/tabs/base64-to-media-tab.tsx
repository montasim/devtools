'use client';

import { useState, useMemo, useEffect, useCallback } from 'react';
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
import { Download, Copy, FileDown, ImageIcon, Video, Music, FileText, File } from 'lucide-react';
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

function base64ToBlob(base64: string, mime: string): Blob | null {
    try {
        const cleanBase64 = base64.replace(/^data:[^;]+;base64,/, '');
        const binaryString = atob(cleanBase64);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
            bytes[i] = binaryString.charCodeAt(i);
        }
        return new Blob([bytes], { type: mime });
    } catch {
        return null;
    }
}

export default function Base64ToMediaTab({ readOnly }: TabComponentProps) {
    const [input, setInput] = useState('');
    const [shareOpen, setShareOpen] = useState(false);
    const { copy } = useClipboard();

    const { mime, extension } = detectMimeFromBase64(input);
    const category = input ? getMediaCategory(mime) : null;

    const blobUrl = useMemo(() => {
        if (!input || input.trim() === '') return null;
        const blob = base64ToBlob(input, mime);
        return blob ? URL.createObjectURL(blob) : null;
    }, [input, mime]);

    useEffect(() => {
        return () => {
            if (blobUrl) URL.revokeObjectURL(blobUrl);
        };
    }, [blobUrl]);

    const handleDownload = useCallback(() => {
        if (!input) return;
        const blob = base64ToBlob(input, mime);
        if (!blob) return;
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `converted.${extension}`;
        a.click();
        URL.revokeObjectURL(url);
    }, [input, mime, extension]);

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
        if (!blobUrl || !category) {
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
                    <img
                        src={blobUrl}
                        alt="Preview"
                        className="absolute inset-0 h-full w-full object-contain p-2"
                    />
                );
            case 'video':
                return (
                    <video
                        src={blobUrl}
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
                            <audio src={blobUrl} controls className="w-80" />
                        </div>
                    </div>
                );
            case 'pdf':
                return (
                    <iframe src={blobUrl} className="h-full w-full border-0" title="PDF Preview" />
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
                                    description="Paste a Base64 encoded string to decode and download the file"
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
