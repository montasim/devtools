'use client';
import { ToolContentSkeleton } from '@/app/(tools)/loading';

import { useState, useMemo } from 'react';
import { useToolState } from '../../core/hooks/use-tool-state';
import { useToolActions } from '../../core/hooks/use-tool-actions';
import { ToolTabWrapper } from '../../core/components/tool-tab-wrapper';
import { STORAGE_KEYS } from '@/lib/utils/constants';
import { TextEditor } from '../../text/components/text-editor';
import { Textarea } from '@/components/ui/textarea';
import { EmptyEditorPrompt } from '@/components/ui/empty-editor-prompt';
import {
    Terminal,
    AlertCircle,
    Type,
    HardDrive,
    AlignLeft,
    WholeWord,
    MessageSquare,
} from 'lucide-react';
import { EditorPaneHeader } from '../../core/components/editor-pane-header';
import { autoDecode } from '../utils/leet-mappings';
import type { TabComponentProps } from '../../core/types/tool';

function Stat({
    icon: Icon,
    label,
}: {
    icon: React.ComponentType<{ className?: string }>;
    label: string;
}) {
    return (
        <span className="inline-flex items-center gap-1">
            <Icon className="h-3 w-3" />
            {label}
        </span>
    );
}

function formatSize(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function DecodeTab({ sharedData, readOnly }: TabComponentProps) {
    const { content, setContent, isReady } = useToolState({
        storageKey: STORAGE_KEYS.LEET_TEXT_DECODE_INPUT,
        sharedData,
        tabId: 'decode',
        readOnly,
    });

    const [shareOpen, setShareOpen] = useState(false);

    const { decoded, levelName, confidence, isSame } = useMemo(() => {
        if (!content) return { decoded: '', levelName: '', confidence: 0, isSame: true };
        const result = autoDecode(content);
        return {
            decoded: result.decoded,
            levelName: result.levelName,
            confidence: result.confidence,
            isSame: result.decoded === content,
        };
    }, [content]);

    const stats = useMemo(() => {
        const bytes = new TextEncoder().encode(decoded).length;
        const chars = decoded.length;
        const lines = decoded ? decoded.split('\n').length : 0;
        const words = decoded.trim() ? decoded.trim().split(/\s+/).length : 0;
        const sentences = decoded.split(/[.!?]+/).filter((s) => s.trim()).length;
        return { bytes, chars, lines, words, sentences };
    }, [decoded]);

    const { actions } = useToolActions({
        pageName: 'leet-text',
        tabId: 'decode',
        getContent: () => content,
        onClear: () => setContent(''),
        shareDialogOpen: shareOpen,
        setShareDialogOpen: setShareOpen,
        readOnly,
    });

    if (!isReady) return <ToolContentSkeleton />;

    return (
        <ToolTabWrapper actions={actions}>
            <div className="flex flex-col gap-4 md:flex-row">
                <div className="min-w-0 w-full md:w-1/2">
                    <div className="flex flex-col gap-2">
                        <EditorPaneHeader
                            label="Leet Text"
                            content={content}
                            onContentChange={setContent}
                            onClear={() => setContent('')}
                            hideInputActions={readOnly}
                        />
                        <TextEditor
                            value={content}
                            onChange={setContent}
                            readOnly={readOnly}
                            emptyIcon={Terminal}
                            emptyTitle="Enter leet text"
                            emptyDescription="Paste leet speak text to decode back to plain text"
                        />
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
                                        Could not detect leet encoding
                                    </p>
                                    <p className="text-xs text-muted-foreground/60">
                                        Make sure the text contains leet speak characters
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
                                        description="Decoded text will appear here once you add input"
                                        showActions={false}
                                        overlay
                                    />
                                )}
                                <div className="mt-2 flex flex-wrap items-center justify-between gap-x-4 gap-y-1 text-xs text-muted-foreground">
                                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
                                        <Stat icon={HardDrive} label={formatSize(stats.bytes)} />
                                        <Stat
                                            icon={Type}
                                            label={`${stats.chars.toLocaleString()} chars`}
                                        />
                                        <Stat
                                            icon={AlignLeft}
                                            label={`${stats.lines.toLocaleString()} lines`}
                                        />
                                        <Stat
                                            icon={WholeWord}
                                            label={`${stats.words.toLocaleString()} words`}
                                        />
                                        <Stat
                                            icon={MessageSquare}
                                            label={`${stats.sentences.toLocaleString()} sentences`}
                                        />
                                    </div>
                                    {content && !isSame && levelName && (
                                        <div className="flex items-center gap-1.5">
                                            <span>
                                                Detected:{' '}
                                                <span className="font-medium">{levelName}</span>
                                            </span>
                                            {confidence > 0 && (
                                                <span className="text-muted-foreground/60">
                                                    ({Math.round(confidence * 100)}% confidence)
                                                </span>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </ToolTabWrapper>
    );
}
