'use client';

import { useState, useMemo } from 'react';
import { useToolState } from '../../core/hooks/use-tool-state';
import { useToolActions } from '../../core/hooks/use-tool-actions';
import { ToolTabWrapper } from '../../core/components/tool-tab-wrapper';
import { EditorPaneHeader } from '../../core/components/editor-pane-header';
import { STORAGE_KEYS } from '@/lib/utils/constants';
import { Textarea } from '@/components/ui/textarea';
import { EmptyEditorPrompt } from '@/components/ui/empty-editor-prompt';
import { AlertCircle, Type } from 'lucide-react';
import { autoDecodeArt } from '../utils/art-decode';
import type { TabComponentProps } from '../../core/types/tool';

export default function DecodeTab({ sharedData, readOnly }: TabComponentProps) {
    const { content, setContent, isReady } = useToolState({
        storageKey: STORAGE_KEYS.TEXT_ART_DECODE_INPUT,
        sharedData,
        tabId: 'decode',
        readOnly,
    });

    const [shareOpen, setShareOpen] = useState(false);

    const { decoded, method, confidence, isSame } = useMemo(() => {
        if (!content) return { decoded: '', method: '', confidence: 0, isSame: true };
        const result = autoDecodeArt(content);
        return {
            decoded: result.decoded,
            method: result.method,
            confidence: result.confidence,
            isSame: result.decoded === content,
        };
    }, [content]);

    const { actions } = useToolActions({
        pageName: 'text-art',
        tabId: 'decode',
        getContent: () => content,
        onClear: () => setContent(''),
        shareDialogOpen: shareOpen,
        setShareDialogOpen: setShareOpen,
        readOnly,
    });

    if (!isReady) return null;

    return (
        <ToolTabWrapper actions={actions}>
            <div className="flex flex-col gap-4 md:flex-row">
                <div className="min-w-0 w-full md:w-1/2">
                    <div className="flex flex-col gap-2">
                        <EditorPaneHeader
                            label="Text Art"
                            content={content}
                            onContentChange={setContent}
                            onClear={() => setContent('')}
                            hideInputActions={readOnly}
                        />
                        <div className="relative flex-1">
                            <Textarea
                                value={content}
                                onChange={(e) => setContent(e.target.value)}
                                readOnly={readOnly}
                                placeholder="Paste text art here..."
                                className="min-h-[350px] resize-none font-mono text-sm md:min-h-[400px] lg:min-h-[500px]"
                                style={{ fieldSizing: 'fixed', overflow: 'auto' }}
                            />
                            {!content && (
                                <EmptyEditorPrompt
                                    icon={Type}
                                    title="Enter text art"
                                    description="Paste ASCII art or decorated text to decode"
                                    showActions={!readOnly}
                                    overlay
                                />
                            )}
                        </div>
                    </div>
                </div>
                <div className="min-w-0 w-full md:w-1/2">
                    <div className="flex flex-col gap-2">
                        <EditorPaneHeader
                            label="Decoded Output"
                            content={decoded}
                            onContentChange={() => {}}
                            downloadFilename="decoded.txt"
                            hideInputActions
                        />
                        {content && isSame ? (
                            <div className="flex min-h-[350px] items-center justify-center rounded-lg border md:min-h-[400px] lg:min-h-[500px]">
                                <div className="flex flex-col items-center gap-3 text-center">
                                    <AlertCircle className="h-10 w-10 text-muted-foreground/40" />
                                    <p className="text-sm text-muted-foreground">
                                        Could not detect text art encoding
                                    </p>
                                    <p className="text-xs text-muted-foreground/60">
                                        Paste ASCII art, boxed text, or decorated text
                                    </p>
                                </div>
                            </div>
                        ) : (
                            <div className="relative flex-1">
                                <Textarea
                                    value={decoded}
                                    readOnly
                                    className="min-h-[350px] resize-none font-mono text-sm md:min-h-[400px] lg:min-h-[500px]"
                                    style={{ fieldSizing: 'fixed', overflow: 'auto' }}
                                />
                                {!decoded && (
                                    <EmptyEditorPrompt
                                        icon={Type}
                                        title="Decoded output"
                                        description="Plain text will appear here once you add input"
                                        showActions={false}
                                        overlay
                                    />
                                )}
                                {content && !isSame && method && (
                                    <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
                                        <span>
                                            Detected: <span className="font-medium">{method}</span>
                                        </span>
                                        {confidence > 0 && (
                                            <span className="text-muted-foreground/60">
                                                {Math.round(confidence * 100)}% confidence
                                            </span>
                                        )}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </ToolTabWrapper>
    );
}
