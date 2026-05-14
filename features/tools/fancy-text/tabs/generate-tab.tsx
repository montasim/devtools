'use client';

import { useState, useMemo, useCallback } from 'react';
import { useToolState } from '../../core/hooks/use-tool-state';
import { useToolActions } from '../../core/hooks/use-tool-actions';
import { ToolTabWrapper } from '../../core/components/tool-tab-wrapper';
import { STORAGE_KEYS } from '@/lib/utils/constants';
import { TextEditor } from '../../text/components/text-editor';
import { useClipboard } from '@/lib/hooks/use-clipboard';
import { Button } from '@/components/ui/button';
import { Copy, Check, Sparkles } from 'lucide-react';
import { EditorPaneHeader } from '../../core/components/editor-pane-header';
import { STYLE_DEFS } from '../utils/unicode-mappings';
import type { TabComponentProps } from '../../core/types/tool';

export default function GenerateTab({ sharedData, readOnly }: TabComponentProps) {
    const { content, setContent, isReady } = useToolState({
        storageKey: STORAGE_KEYS.FANCY_TEXT_INPUT,
        sharedData,
        tabId: 'generate',
        readOnly,
    });

    const [shareOpen, setShareOpen] = useState(false);

    const { actions } = useToolActions({
        pageName: 'fancy-text',
        tabId: 'generate',
        getContent: () => content,
        onClear: () => setContent(''),
        shareDialogOpen: shareOpen,
        setShareDialogOpen: setShareOpen,
        readOnly,
    });

    const [copiedId, setCopiedId] = useState<string | null>(null);
    const { copy } = useClipboard();

    const transformed = useMemo(() => {
        if (!content) return [];
        return STYLE_DEFS.map((style) => ({
            id: style.id,
            name: style.name,
            text: style.transform(content),
        }));
    }, [content]);

    const handleCopy = useCallback(
        (text: string, styleId: string) => {
            copy(text);
            setCopiedId(styleId);
            setTimeout(() => setCopiedId(null), 2000);
        },
        [copy],
    );

    if (!isReady) return null;

    return (
        <ToolTabWrapper actions={actions}>
            <div className="flex flex-col gap-4 md:flex-row">
                <div className="min-w-0 w-full md:w-1/2">
                    <div className="flex flex-col gap-2">
                        <EditorPaneHeader
                            label="Input"
                            content={content}
                            onContentChange={setContent}
                            onClear={() => setContent('')}
                            hideInputActions={readOnly}
                        />
                        <TextEditor
                            value={content}
                            onChange={setContent}
                            readOnly={readOnly}
                            emptyIcon={Sparkles}
                            emptyTitle="Add text to transform"
                            emptyDescription="Type or paste text to see 110 fancy Unicode styles"
                        />
                    </div>
                </div>
                <div className="min-w-0 w-full md:w-1/2">
                    <div className="flex flex-col gap-2">
                        <div className="flex items-center justify-between px-1 mt-4">
                            <span className="text-sm font-medium text-muted-foreground">
                                Fancy Text Styles
                            </span>
                            {content && (
                                <span className="text-xs text-muted-foreground">
                                    {STYLE_DEFS.length} styles
                                </span>
                            )}
                        </div>
                        <div
                            className="flex flex-col gap-1.5 overflow-y-auto"
                            style={{ maxHeight: 'calc(100vh - 435px)' }}
                        >
                            {content ? (
                                transformed.map((style) => (
                                    <div
                                        key={style.id}
                                        className="group flex items-center gap-3 rounded-md border px-3 py-2 transition-colors hover:bg-muted/50"
                                    >
                                        <span className="w-28 shrink-0 truncate text-xs font-medium text-muted-foreground">
                                            {style.name}
                                        </span>
                                        <span className="min-w-0 flex-1 select-all truncate text-sm">
                                            {style.text}
                                        </span>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-7 w-7 shrink-0 opacity-0 transition-opacity group-hover:opacity-100"
                                            onClick={() => handleCopy(style.text, style.id)}
                                        >
                                            {copiedId === style.id ? (
                                                <Check className="h-3.5 w-3.5 text-green-500" />
                                            ) : (
                                                <Copy className="h-3.5 w-3.5" />
                                            )}
                                        </Button>
                                    </div>
                                ))
                            ) : (
                                <div className="flex flex-col items-center justify-center gap-2 py-12 text-center">
                                    <Sparkles className="h-10 w-10 text-muted-foreground/30" />
                                    <p className="text-sm text-muted-foreground">
                                        Type text on the left to see fancy styles here
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </ToolTabWrapper>
    );
}
