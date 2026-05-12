'use client';

import { useState, useMemo, useCallback } from 'react';
import { useToolState } from '../../core/hooks/use-tool-state';
import { useToolActions } from '../../core/hooks/use-tool-actions';
import { ToolTabWrapper } from '../../core/components/tool-tab-wrapper';
import { STORAGE_KEYS } from '@/lib/utils/constants';
import { TextEditor } from '../../text/components/text-editor';
import { useClipboard } from '@/lib/hooks/use-clipboard';
import { Button } from '@/components/ui/button';
import { Copy, Check, Type } from 'lucide-react';
import { EditorPaneHeader } from '../../core/components/editor-pane-header';
import { ART_STYLES, ART_CATEGORIES, type ArtCategory } from '../utils/art-styles';
import type { TabComponentProps } from '../../core/types/tool';

export default function GenerateTab({ sharedData, readOnly }: TabComponentProps) {
    const { content, setContent, isReady } = useToolState({
        storageKey: STORAGE_KEYS.TEXT_ART_INPUT,
        sharedData,
        tabId: 'generate',
        readOnly,
    });

    const [shareOpen, setShareOpen] = useState(false);
    const [activeCategories, setActiveCategories] = useState<Set<ArtCategory>>(new Set());
    const [copiedId, setCopiedId] = useState<string | null>(null);
    const { copy } = useClipboard();

    const { actions } = useToolActions({
        pageName: 'text-art',
        tabId: 'generate',
        getContent: () => content,
        onClear: () => setContent(''),
        shareDialogOpen: shareOpen,
        setShareDialogOpen: setShareOpen,
        readOnly,
    });

    const filteredStyles = useMemo(() => {
        if (activeCategories.size === 0) return ART_STYLES;
        return ART_STYLES.filter((s) => activeCategories.has(s.category));
    }, [activeCategories]);

    const transformed = useMemo(() => {
        if (!content) return [];
        return filteredStyles.map((style) => ({
            id: style.id,
            name: style.name,
            category: style.category,
            text: style.generate(content),
        }));
    }, [content, filteredStyles]);

    const handleCopy = useCallback(
        (text: string, styleId: string) => {
            copy(text);
            setCopiedId(styleId);
            setTimeout(() => setCopiedId(null), 2000);
        },
        [copy],
    );

    const toggleCategory = (cat: ArtCategory) => {
        setActiveCategories((prev) => {
            const next = new Set(prev);
            if (next.has(cat)) next.delete(cat);
            else next.add(cat);
            return next;
        });
    };

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
                            emptyIcon={Type}
                            emptyTitle="Add text to convert"
                            emptyDescription="Type or paste text to generate ASCII art styles"
                        />
                    </div>
                </div>
                <div className="min-w-0 w-full md:w-1/2">
                    <div className="flex flex-col gap-2">
                        <div className="flex items-center justify-between px-1 mt-3.5">
                            <div className="flex items-center gap-2">
                                <span className="text-sm font-medium text-muted-foreground">
                                    Text Art Styles
                                </span>
                                {content && (
                                    <span className="text-xs text-muted-foreground">
                                        {filteredStyles.length} styles
                                    </span>
                                )}
                            </div>
                            <div className="flex items-center gap-1.5">
                                <Button
                                    variant={activeCategories.size === 0 ? 'default' : 'outline'}
                                    size="sm"
                                    className="h-6 text-[11px]"
                                    onClick={() => setActiveCategories(new Set())}
                                >
                                    All
                                </Button>
                                {ART_CATEGORIES.map((cat) => {
                                    const count = ART_STYLES.filter(
                                        (s) => s.category === cat,
                                    ).length;
                                    return (
                                        <Button
                                            key={cat}
                                            variant={
                                                activeCategories.has(cat) ? 'default' : 'outline'
                                            }
                                            size="sm"
                                            className="h-6 text-[11px]"
                                            onClick={() => toggleCategory(cat)}
                                        >
                                            {cat === 'ASCII Banner'
                                                ? 'Banners'
                                                : cat === 'Text Box'
                                                  ? 'Boxes'
                                                  : 'Blocks'}
                                            <span className="ml-0.5 opacity-60">{count}</span>
                                        </Button>
                                    );
                                })}
                            </div>
                        </div>
                        <div
                            className="flex flex-col gap-1.5 overflow-y-auto"
                            style={{ maxHeight: 'calc(100vh - 435px)' }}
                        >
                            {content ? (
                                transformed.map((style) => (
                                    <div
                                        key={style.id}
                                        className="group flex items-start gap-3 rounded-md border px-3 py-2 transition-colors hover:bg-muted/50"
                                    >
                                        <div className="flex w-28 shrink-0 flex-col gap-0.5 pt-0.5">
                                            <span className="truncate text-xs font-medium text-muted-foreground">
                                                {style.name}
                                            </span>
                                            <span className="text-[10px] text-muted-foreground/60">
                                                {style.category}
                                            </span>
                                        </div>
                                        <pre className="min-w-0 flex-1 overflow-x-auto whitespace-pre text-xs leading-tight">
                                            {style.text}
                                        </pre>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="mt-0.5 h-7 w-7 shrink-0 opacity-0 transition-opacity group-hover:opacity-100"
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
                                    <Type className="h-10 w-10 text-muted-foreground/30" />
                                    <p className="text-sm text-muted-foreground">
                                        Type text on the left to see art styles here
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
