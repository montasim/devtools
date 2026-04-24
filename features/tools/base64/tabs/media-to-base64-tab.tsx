'use client';

import { useState, useCallback, useRef } from 'react';
import { useToolActions } from '../../core/hooks/use-tool-actions';
import { ToolTabWrapper } from '../../core/components/tool-tab-wrapper';
import { ShareSidebarModal } from '../../core/plugins/share-sidebar';
import { STORAGE_KEYS } from '@/lib/utils/constants';
import { fileToBase64 } from '../utils/mime-detection';
import { useLocalStorage } from '@/lib/hooks/use-local-storage';
import { useClipboard } from '@/lib/hooks/use-clipboard';
import { Textarea } from '@/components/ui/textarea';
import { Upload, Copy, FileCode, File } from 'lucide-react';
import Image from 'next/image';
import { EmptyEditorPrompt } from '@/components/ui/empty-editor-prompt';
import { EditorPaneHeader } from '../../core/components/editor-pane-header';
import { EditorFooter } from '../../core/components/editor-footer';
import type { TabComponentProps } from '../../core/types/tool';

export default function MediaToBase64Tab({ readOnly }: TabComponentProps) {
    const [output, setOutput] = useLocalStorage(STORAGE_KEYS.BASE64_MEDIA_TO_BASE64_OUTPUT, '');
    const [shareOpen, setShareOpen] = useState(false);
    const [isConverting, setIsConverting] = useState(false);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [fileName, setFileName] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const { copy } = useClipboard();

    const handleFileUpload = useCallback(
        async (e: React.ChangeEvent<HTMLInputElement>) => {
            const file = e.target.files?.[0];
            if (!file) return;
            setIsConverting(true);
            setFileName(file.name);
            try {
                const base64 = await fileToBase64(file);
                setOutput(base64);
                if (file.type.startsWith('image/')) {
                    setPreviewUrl(base64);
                } else {
                    setPreviewUrl(null);
                }
            } catch (error) {
                console.error('Failed to convert file:', error);
            } finally {
                setIsConverting(false);
            }
        },
        [setOutput],
    );

    const handleClear = useCallback(() => {
        setOutput('');
        setPreviewUrl(null);
        setFileName(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    }, [setOutput]);

    const { actions } = useToolActions({
        pageName: 'base64',
        tabId: 'media-to-base64',
        getContent: () => output,
        onClear: handleClear,
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
                            label="Upload File"
                            content={output}
                            onClear={handleClear}
                            hideInputActions
                        />
                        {output && previewUrl ? (
                            <div className="relative flex min-h-[250px] items-center justify-center rounded-lg border p-4 md:min-h-[400px] lg:min-h-[500px]">
                                <Image
                                    src={previewUrl}
                                    alt={fileName ?? 'Preview'}
                                    fill
                                    className="object-contain"
                                />
                            </div>
                        ) : output && fileName ? (
                            <div className="relative flex min-h-[250px] flex-col items-center justify-center gap-3 rounded-lg border p-4 md:min-h-[400px] lg:min-h-[500px]">
                                <File className="h-12 w-12 text-muted-foreground" />
                                <span className="max-w-full truncate text-sm font-medium">
                                    {fileName}
                                </span>
                            </div>
                        ) : (
                            <label
                                className={`flex min-h-[250px] cursor-pointer flex-col items-center justify-center gap-3 rounded-lg border border-dashed p-4 text-muted-foreground hover:bg-primary/10 hover:text-primary md:min-h-[400px] lg:min-h-[500px] ${readOnly ? 'pointer-events-none opacity-50' : ''}`}
                            >
                                <Upload className="h-8 w-8" />
                                <span className="text-sm font-medium">
                                    {isConverting
                                        ? 'Converting...'
                                        : 'Click to upload or drag & drop'}
                                </span>
                                <span className="text-xs">Images, audio, video, PDF, ZIP</span>
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    className="hidden"
                                    onChange={handleFileUpload}
                                    accept="image/*,audio/*,video/*,.pdf,.zip"
                                    disabled={readOnly}
                                />
                            </label>
                        )}
                    </div>
                </div>
                <div className="min-w-0 w-full md:w-1/2">
                    <div className="flex flex-col gap-2">
                        <EditorPaneHeader
                            label="Base64 Output"
                            content={output}
                            onContentChange={setOutput}
                            onClear={() => setOutput('')}
                            hideInputActions
                        />
                        {output ? (
                            <div className="flex flex-col gap-1">
                                <Textarea
                                    value={output}
                                    readOnly
                                    className="min-h-[250px] resize-none font-mono text-xs md:min-h-[400px] lg:min-h-[500px]"
                                    style={{ fieldSizing: 'fixed', overflow: 'auto' }}
                                />
                                <EditorFooter content={output} mode="base64" />
                            </div>
                        ) : (
                            <div className="relative min-h-[250px] rounded-lg border md:min-h-[400px] lg:min-h-[500px]">
                                <EmptyEditorPrompt
                                    icon={FileCode}
                                    title="Base64 output"
                                    description="Upload a file to see the Base64 encoded result"
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
                    tabName: 'media-to-base64',
                    getState: () => ({ base64: output }),
                    extraActions: output
                        ? [
                              {
                                  id: 'copy-base64',
                                  label: 'Copy Base64',
                                  icon: Copy,
                                  handler: () => copy(output),
                              },
                          ]
                        : [],
                }}
            />
        </ToolTabWrapper>
    );
}
