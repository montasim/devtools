'use client';

import { useState } from 'react';
import { useToolActions } from '../../core/hooks/use-tool-actions';
import { ToolTabWrapper } from '../../core/components/tool-tab-wrapper';
import { ShareSidebarModal } from '../../core/plugins/share-sidebar';
import { detectMimeFromBase64 } from '../utils/mime-detection';
import { useClipboard } from '@/lib/hooks/use-clipboard';
import { Textarea } from '@/components/ui/textarea';
import { Download, Copy, FileDown, ImageIcon } from 'lucide-react';
import Image from 'next/image';
import { EmptyEditorPrompt } from '@/components/ui/empty-editor-prompt';
import { EditorPaneHeader } from '../../core/components/editor-pane-header';
import { EditorFooter } from '../../core/components/editor-footer';
import type { TabComponentProps } from '../../core/types/tool';

export default function Base64ToMediaTab({ readOnly }: TabComponentProps) {
    const [input, setInput] = useState('');
    const [shareOpen, setShareOpen] = useState(false);
    const { copy } = useClipboard();

    const { mime, extension } = detectMimeFromBase64(input);
    const previewUrl = input.startsWith('data:image/') ? input : null;

    const handleDownload = () => {
        if (!input) return;
        const cleanBase64 = input.replace(/^data:[^;]+;base64,/, '');
        const binaryString = atob(cleanBase64);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
            bytes[i] = binaryString.charCodeAt(i);
        }
        const blob = new Blob([bytes], { type: mime });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `converted.${extension}`;
        a.click();
        URL.revokeObjectURL(url);
    };

    const { actions } = useToolActions({
        pageName: 'base64',
        tabId: 'base64-to-media',
        getContent: () => input,
        onClear: () => setInput(''),
        shareDialogOpen: shareOpen,
        setShareDialogOpen: setShareOpen,
        readOnly,
    });

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
                        {previewUrl ? (
                            <div className="relative flex min-h-[250px] items-center justify-center rounded-lg border p-4 md:min-h-[400px] lg:min-h-[500px]">
                                <Image
                                    src={previewUrl}
                                    alt="Preview"
                                    fill
                                    className="object-contain"
                                />
                            </div>
                        ) : (
                            <div className="relative min-h-[250px] rounded-lg border md:min-h-[400px] lg:min-h-[500px]">
                                <EmptyEditorPrompt
                                    icon={ImageIcon}
                                    title="Decoded output"
                                    description="Preview and download the decoded file here"
                                    showActions={false}
                                    overlay
                                />
                            </div>
                        )}
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
