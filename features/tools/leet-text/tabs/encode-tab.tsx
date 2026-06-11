'use client';
import { ToolContentSkeleton } from '@/app/(tools)/loading';

import { useState, useMemo, useCallback } from 'react';
import { useToolState } from '../../core/hooks/use-tool-state';
import { useToolActions } from '../../core/hooks/use-tool-actions';
import { ToolTabWrapper } from '../../core/components/tool-tab-wrapper';
import { STORAGE_KEYS } from '@/lib/utils/constants';
import { TextEditor } from '../../text/components/text-editor';
import { useClipboard } from '@/lib/hooks/use-clipboard';
import { Button } from '@/components/ui/button';
import { Copy, Check, Terminal, Filter } from 'lucide-react';
import { EditorPaneHeader } from '../../core/components/editor-pane-header';
import { ALL_LEVELS, leetEncode, upsideDownEncode, getCategories } from '../utils/leet-mappings';
import type { TabComponentProps } from '../../core/types/tool';

export default function EncodeTab({ sharedData, readOnly }: TabComponentProps) {
    const { content, setContent, isReady } = useToolState({
        storageKey: STORAGE_KEYS.LEET_TEXT_ENCODE_INPUT,
        sharedData,
        tabId: 'encode',
        readOnly,
    });

    const [shareOpen, setShareOpen] = useState(false);
    const [activeCategories, setActiveCategories] = useState<Set<string>>(new Set());

    const { actions } = useToolActions({
        pageName: 'leet-text',
        tabId: 'encode',
        getContent: () => content,
        onClear: () => setContent(''),
        shareDialogOpen: shareOpen,
        setShareDialogOpen: setShareOpen,
        readOnly,
    });

    const [copiedId, setCopiedId] = useState<string | null>(null);
    const { copy } = useClipboard();

    const categories = useMemo(() => getCategories(), []);

    const filteredLevels = useMemo(() => {
        if (activeCategories.size === 0) return ALL_LEVELS;
        return ALL_LEVELS.filter((l) => activeCategories.has(l.category));
    }, [activeCategories]);

    const transformed = useMemo(() => {
        if (!content) return [];
        return filteredLevels.map((level) => ({
            id: level.id,
            name: level.name,
            description: level.description,
            category: level.category,
            text: level.isUpsideDown ? upsideDownEncode(content) : leetEncode(content, level),
        }));
    }, [content, filteredLevels]);

    const toggleCategory = useCallback((cat: string) => {
        setActiveCategories((prev) => {
            const next = new Set(prev);
            if (next.has(cat)) {
                next.delete(cat);
            } else {
                next.add(cat);
            }
            return next;
        });
    }, []);

    const clearFilters = useCallback(() => {
        setActiveCategories(new Set());
    }, []);

    const handleCopy = useCallback(
        (text: string, levelId: string) => {
            copy(text);
            setCopiedId(levelId);
            setTimeout(() => setCopiedId(null), 2000);
        },
        [copy],
    );

    if (!isReady) return <ToolContentSkeleton />;

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
                            emptyIcon={Terminal}
                            emptyTitle="Enter text to leet-ify"
                            emptyDescription="Type or paste text to see 10 leet speak variants"
                        />
                    </div>
                </div>
                <div className="min-w-0 w-full md:w-1/2">
                    <div className="flex flex-col gap-2">
                        <div className="flex items-center justify-between px-1 mt-2">
                            <div className="flex items-center gap-2">
                                <Filter className="h-3.5 w-3.5 text-muted-foreground" />
                                <span className="text-sm font-medium text-muted-foreground">
                                    Leet Variants
                                </span>
                            </div>
                            <div className="flex items-center gap-1.5">
                                <Button
                                    variant={activeCategories.size === 0 ? 'default' : 'outline'}
                                    size="sm"
                                    className="h-7 text-xs"
                                    onClick={clearFilters}
                                >
                                    All
                                </Button>
                                {categories.map((cat) => (
                                    <Button
                                        key={cat}
                                        variant={activeCategories.has(cat) ? 'default' : 'outline'}
                                        size="sm"
                                        className="h-7 text-xs"
                                        onClick={() => toggleCategory(cat)}
                                    >
                                        {cat}
                                    </Button>
                                ))}
                                {activeCategories.size > 0 && (
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-7 text-xs"
                                        onClick={clearFilters}
                                    >
                                        Clear
                                    </Button>
                                )}
                            </div>
                        </div>
                        <div
                            className="flex flex-col gap-1.5 overflow-y-auto"
                            style={{ maxHeight: 'calc(100vh - 435px)' }}
                        >
                            {content ? (
                                transformed.map((level) => (
                                    <div
                                        key={level.id}
                                        className="group flex items-center gap-3 rounded-md border px-3 py-2 transition-colors hover:bg-muted/50"
                                    >
                                        <div className="w-28 shrink-0">
                                            <span className="block truncate text-xs font-medium text-muted-foreground">
                                                {level.name}
                                            </span>
                                            <span className="block truncate text-[10px] text-muted-foreground/60">
                                                {level.description}
                                            </span>
                                        </div>
                                        <span className="min-w-0 flex-1 select-all truncate text-sm font-mono">
                                            {level.text}
                                        </span>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-7 w-7 shrink-0 opacity-0 transition-opacity group-hover:opacity-100"
                                            onClick={() => handleCopy(level.text, level.id)}
                                        >
                                            {copiedId === level.id ? (
                                                <Check className="h-3.5 w-3.5 text-green-500" />
                                            ) : (
                                                <Copy className="h-3.5 w-3.5" />
                                            )}
                                        </Button>
                                    </div>
                                ))
                            ) : (
                                <div className="flex flex-col items-center justify-center gap-2 py-12 text-center">
                                    <Terminal className="h-10 w-10 text-muted-foreground/30" />
                                    <p className="text-sm text-muted-foreground">
                                        Type text on the left to see leet variants here
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
