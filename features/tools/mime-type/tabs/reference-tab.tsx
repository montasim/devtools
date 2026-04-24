'use client';

import { useState, useCallback, useMemo } from 'react';
import { ToolTabWrapper } from '../../core/components/tool-tab-wrapper';
import { useClipboard } from '@/lib/hooks/use-clipboard';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Copy, Check, Search, FileText } from 'lucide-react';
import type { TabComponentProps } from '../../core/types/tool';
import {
    CATEGORY_META,
    type MimeCategory,
    type MimeEntry,
    searchMimeTypes,
} from '../utils/mime-type-data';

const ALL_CATEGORIES: (MimeCategory | 'all')[] = [
    'all',
    'application',
    'audio',
    'font',
    'image',
    'model',
    'text',
    'video',
];

export default function ReferenceTab({}: TabComponentProps) {
    const [search, setSearch] = useState('');
    const [activeCategory, setActiveCategory] = useState<MimeCategory | 'all'>('all');
    const [copiedMime, setCopiedMime] = useState<string | null>(null);
    const [expandedMime, setExpandedMime] = useState<string | null>(null);
    const { copy } = useClipboard();

    const filtered = useMemo(() => {
        const matched = searchMimeTypes(search);
        if (activeCategory === 'all') return matched;
        return matched.filter((e) => e.category === activeCategory);
    }, [search, activeCategory]);

    const counts = useMemo(() => {
        const all = searchMimeTypes(search);
        const map: Record<string, number> = { all: all.length };
        for (const e of all) {
            map[e.category] = (map[e.category] || 0) + 1;
        }
        return map;
    }, [search]);

    const handleCopy = useCallback(
        async (entry: MimeEntry) => {
            await copy(entry.mimeType);
            setCopiedMime(entry.mimeType);
            setTimeout(() => setCopiedMime(null), 1500);
        },
        [copy],
    );

    const handleCopyExt = useCallback(
        async (ext: string) => {
            await copy(ext);
            setCopiedMime(ext);
            setTimeout(() => setCopiedMime(null), 1500);
        },
        [copy],
    );

    const handleToggleExpand = useCallback((mime: string) => {
        setExpandedMime((prev) => (prev === mime ? null : mime));
    }, []);

    return (
        <ToolTabWrapper>
            <div className="flex flex-col gap-4 py-4">
                <div className="flex flex-col gap-3 md:flex-row md:items-start">
                    <div className="relative flex-1">
                        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search by MIME type, extension, or category..."
                            className="h-9 pl-9 text-sm"
                            spellCheck={false}
                        />
                    </div>
                    <div className="flex gap-1 shrink-0 flex-wrap">
                        {ALL_CATEGORIES.map((cat) => {
                            const isActive = activeCategory === cat;
                            const meta = cat !== 'all' ? CATEGORY_META[cat] : null;
                            return (
                                <button
                                    key={cat}
                                    onClick={() => setActiveCategory(cat)}
                                    className={`rounded-md border px-2.5 py-1.5 text-[11px] font-medium transition-colors ${
                                        isActive
                                            ? 'border-primary/50 bg-primary/10 text-primary'
                                            : 'text-muted-foreground hover:bg-muted/50'
                                    }`}
                                >
                                    {cat === 'all'
                                        ? `All (${counts.all ?? 0})`
                                        : `${meta?.label ?? cat} (${counts[cat] ?? 0})`}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {filtered.length > 0 ? (
                    <div className="flex flex-col gap-0.5">
                        <div className="grid grid-cols-[1fr_120px_80px] md:grid-cols-[1fr_200px_80px] gap-2 px-3 py-1.5 text-[10px] font-mono uppercase tracking-wider text-muted-foreground border-b">
                            <span>MIME Type</span>
                            <span>Extensions</span>
                            <span className="text-right">Action</span>
                        </div>
                        <div className="flex flex-col">
                            {filtered.map((entry) => {
                                const meta = CATEGORY_META[entry.category];
                                const isExpanded = expandedMime === entry.mimeType;
                                return (
                                    <div key={entry.mimeType} className="contents">
                                        <button
                                            onClick={() => handleToggleExpand(entry.mimeType)}
                                            className="grid grid-cols-[1fr_120px_80px] md:grid-cols-[1fr_200px_80px] gap-2 px-3 py-2 items-center text-left transition-colors hover:bg-muted/50 rounded-md"
                                        >
                                            <div className="flex items-center gap-2 min-w-0">
                                                <span
                                                    className={`inline-flex items-center justify-center rounded-md px-1.5 py-0.5 text-[10px] font-medium shrink-0 ${meta.color}`}
                                                >
                                                    {entry.category}
                                                </span>
                                                <code className="text-sm font-mono truncate">
                                                    {entry.mimeType}
                                                </code>
                                            </div>
                                            <div className="flex gap-1 flex-wrap">
                                                {entry.extensions.length > 0 ? (
                                                    entry.extensions.slice(0, 3).map((ext) => (
                                                        <span
                                                            key={ext}
                                                            className="inline-flex items-center rounded bg-muted px-1.5 py-0.5 text-[11px] font-mono"
                                                        >
                                                            {ext}
                                                        </span>
                                                    ))
                                                ) : (
                                                    <span className="text-[11px] text-muted-foreground">
                                                        —
                                                    </span>
                                                )}
                                                {entry.extensions.length > 3 && (
                                                    <span className="text-[10px] text-muted-foreground">
                                                        +{entry.extensions.length - 3}
                                                    </span>
                                                )}
                                            </div>
                                            <span className="flex justify-end">
                                                <Button
                                                    variant="ghost"
                                                    size="icon-xs"
                                                    className="shrink-0"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleCopy(entry);
                                                    }}
                                                >
                                                    {copiedMime === entry.mimeType ? (
                                                        <Check className="h-3 w-3 text-green-500" />
                                                    ) : (
                                                        <Copy className="h-3 w-3" />
                                                    )}
                                                </Button>
                                            </span>
                                        </button>
                                        {isExpanded && (
                                            <div className="px-3 pb-2 pl-3">
                                                <div className="flex flex-col gap-2 rounded-lg border bg-muted/30 p-3">
                                                    <div className="flex items-center gap-2">
                                                        <code className="text-sm font-mono font-medium">
                                                            {entry.mimeType}
                                                        </code>
                                                        <span
                                                            className={`inline-flex items-center rounded-md px-1.5 py-0.5 text-[10px] font-medium ${meta.color}`}
                                                        >
                                                            {meta.label}
                                                        </span>
                                                    </div>
                                                    {entry.extensions.length > 0 && (
                                                        <div className="flex items-center gap-1.5 flex-wrap">
                                                            <span className="text-[11px] text-muted-foreground font-medium">
                                                                Extensions:
                                                            </span>
                                                            {entry.extensions.map((ext) => (
                                                                <button
                                                                    key={ext}
                                                                    onClick={() =>
                                                                        handleCopyExt(ext)
                                                                    }
                                                                    className="inline-flex items-center gap-1 rounded border bg-background px-1.5 py-0.5 text-[11px] font-mono hover:bg-muted/50 transition-colors"
                                                                >
                                                                    {ext}
                                                                    {copiedMime === ext ? (
                                                                        <Check className="h-2.5 w-2.5 text-green-500" />
                                                                    ) : (
                                                                        <Copy className="h-2.5 w-2.5 text-muted-foreground" />
                                                                    )}
                                                                </button>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                        <div className="mt-2 text-[11px] text-muted-foreground text-right">
                            {filtered.length} MIME type{filtered.length !== 1 ? 's' : ''}
                        </div>
                    </div>
                ) : (
                    <div className="h-48 flex flex-col items-center justify-center rounded-lg border p-8 text-center">
                        <FileText className="h-10 w-10 text-muted-foreground/40 mb-3" />
                        <p className="text-sm font-medium text-muted-foreground">
                            No matching MIME types
                        </p>
                        <p className="text-xs text-muted-foreground/60 mt-1">
                            Try a different search term or category filter
                        </p>
                    </div>
                )}
            </div>
        </ToolTabWrapper>
    );
}
