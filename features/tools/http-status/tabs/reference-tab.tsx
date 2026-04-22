'use client';

import { useState, useCallback, useMemo } from 'react';
import { ToolTabWrapper } from '../../core/components/tool-tab-wrapper';
import { useClipboard } from '@/lib/hooks/use-clipboard';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Copy, Check, Search, Globe } from 'lucide-react';
import type { TabComponentProps } from '../../core/types/tool';
import {
    CATEGORY_META,
    type StatusCodeCategory,
    type HttpStatusEntry,
    searchStatusCodes,
} from '../utils/http-status-data';

const ALL_CATEGORIES: (StatusCodeCategory | 'all')[] = ['all', '1xx', '2xx', '3xx', '4xx', '5xx'];

export default function ReferenceTab({ readOnly }: TabComponentProps) {
    const [search, setSearch] = useState('');
    const [activeCategory, setActiveCategory] = useState<StatusCodeCategory | 'all'>('all');
    const [copiedCode, setCopiedCode] = useState<number | null>(null);
    const [expandedCode, setExpandedCode] = useState<number | null>(null);
    const { copy } = useClipboard();

    const filtered = useMemo(() => {
        const matched = searchStatusCodes(search);
        if (activeCategory === 'all') return matched;
        return matched.filter((e) => e.category === activeCategory);
    }, [search, activeCategory]);

    const counts = useMemo(() => {
        const all = searchStatusCodes(search);
        const map: Record<string, number> = { all: all.length };
        for (const e of all) {
            map[e.category] = (map[e.category] || 0) + 1;
        }
        return map;
    }, [search]);

    const handleCopy = useCallback(
        async (entry: HttpStatusEntry) => {
            await copy(`${entry.code} ${entry.phrase}`);
            setCopiedCode(entry.code);
            setTimeout(() => setCopiedCode(null), 1500);
        },
        [copy],
    );

    const handleToggleExpand = useCallback((code: number) => {
        setExpandedCode((prev) => (prev === code ? null : code));
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
                            placeholder="Search by code, phrase, or description..."
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
                                        : `${cat} (${counts[cat] ?? 0})`}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {filtered.length > 0 ? (
                    <div className="flex flex-col gap-0.5">
                        <div className="grid grid-cols-[64px_1fr_80px] md:grid-cols-[80px_1fr_160px_80px] gap-2 px-3 py-1.5 text-[10px] font-mono uppercase tracking-wider text-muted-foreground border-b">
                            <span>Code</span>
                            <span>Phrase</span>
                            <span className="hidden md:block">Spec</span>
                            <span className="text-right">Action</span>
                        </div>
                        <div className="flex flex-col">
                            {filtered.map((entry) => {
                                const meta = CATEGORY_META[entry.category];
                                const isExpanded = expandedCode === entry.code;
                                return (
                                    <div key={entry.code} className="contents">
                                        <button
                                            onClick={() => handleToggleExpand(entry.code)}
                                            className="grid grid-cols-[64px_1fr_80px] md:grid-cols-[80px_1fr_160px_80px] gap-2 px-3 py-2 items-center text-left transition-colors hover:bg-muted/50 rounded-md"
                                        >
                                            <span
                                                className={`inline-flex items-center justify-center rounded-md px-1.5 py-0.5 text-xs font-mono font-bold ${meta.color}`}
                                            >
                                                {entry.code}
                                            </span>
                                            <span className="text-sm font-medium truncate">
                                                {entry.phrase}
                                            </span>
                                            <span className="hidden md:block text-[11px] text-muted-foreground truncate">
                                                {entry.spec ?? '—'}
                                            </span>
                                            <span className="flex justify-end gap-1">
                                                <Button
                                                    variant="ghost"
                                                    size="icon-xs"
                                                    className="shrink-0"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleCopy(entry);
                                                    }}
                                                >
                                                    {copiedCode === entry.code ? (
                                                        <Check className="h-3 w-3 text-green-500" />
                                                    ) : (
                                                        <Copy className="h-3 w-3" />
                                                    )}
                                                </Button>
                                            </span>
                                        </button>
                                        {isExpanded && (
                                            <div className="px-3 pb-2 pl-[80px] md:pl-[96px]">
                                                <div className="flex flex-col gap-1.5 rounded-lg border bg-muted/30 p-3">
                                                    <p className="text-xs text-muted-foreground leading-relaxed">
                                                        {entry.description}
                                                    </p>
                                                    <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
                                                        <span
                                                            className={`inline-flex items-center rounded-md px-1.5 py-0.5 font-mono font-bold ${meta.color}`}
                                                        >
                                                            {entry.code}
                                                        </span>
                                                        <span className="font-medium">
                                                            {entry.phrase}
                                                        </span>
                                                        <span>·</span>
                                                        <span>{meta.label}</span>
                                                        {entry.spec && (
                                                            <>
                                                                <span>·</span>
                                                                <span>{entry.spec}</span>
                                                            </>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                        <div className="mt-2 text-[11px] text-muted-foreground text-right">
                            {filtered.length} status code{filtered.length !== 1 ? 's' : ''}
                        </div>
                    </div>
                ) : (
                    <div className="h-48 flex flex-col items-center justify-center rounded-lg border p-8 text-center">
                        <Globe className="h-10 w-10 text-muted-foreground/40 mb-3" />
                        <p className="text-sm font-medium text-muted-foreground">
                            No matching status codes
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
