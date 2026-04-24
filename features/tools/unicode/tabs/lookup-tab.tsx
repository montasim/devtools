'use client';

import { useState, useCallback, useMemo } from 'react';
import { ToolTabWrapper } from '../../core/components/tool-tab-wrapper';
import { useClipboard } from '@/lib/hooks/use-clipboard';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Copy, Check, Search, Languages } from 'lucide-react';
import type { TabComponentProps } from '../../core/types/tool';
import {
    CATEGORY_META,
    ALL_CATEGORIES,
    searchUnicode,
    type UnicodeCategory,
} from '../utils/unicode-data';

export default function LookupTab({}: TabComponentProps) {
    const [search, setSearch] = useState('');
    const [activeCategory, setActiveCategory] = useState<UnicodeCategory | 'all'>('all');
    const [copiedValue, setCopiedValue] = useState<string | null>(null);
    const [expandedEntry, setExpandedEntry] = useState<number | null>(null);
    const { copy } = useClipboard();

    const filtered = useMemo(() => {
        const matched = searchUnicode(search);
        if (activeCategory === 'all') return matched;
        return matched.filter((e) => e.category === activeCategory);
    }, [search, activeCategory]);

    const counts = useMemo(() => {
        const all = searchUnicode(search);
        const map: Record<string, number> = { all: all.length };
        for (const e of all) {
            map[e.category] = (map[e.category] || 0) + 1;
        }
        return map;
    }, [search]);

    const handleCopy = useCallback(
        async (value: string) => {
            await copy(value);
            setCopiedValue(value);
            setTimeout(() => setCopiedValue(null), 1500);
        },
        [copy],
    );

    return (
        <ToolTabWrapper>
            <div className="flex flex-col gap-4 py-4">
                <div className="flex flex-col gap-3 md:flex-row md:items-start">
                    <div className="relative flex-1">
                        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search by name, codepoint (U+0041), character, or block..."
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
                        <div className="grid grid-cols-[48px_80px_1fr_100px_48px] md:grid-cols-[48px_90px_1fr_140px_48px] gap-2 px-3 py-1.5 text-[10px] font-mono uppercase tracking-wider text-muted-foreground border-b">
                            <span>Char</span>
                            <span>U+</span>
                            <span>Name</span>
                            <span className="hidden md:block">Block</span>
                            <span className="text-right">Copy</span>
                        </div>
                        <div className="flex flex-col">
                            {filtered.map((entry) => {
                                const meta = CATEGORY_META[entry.category];
                                const isExpanded = expandedEntry === entry.codepoint;
                                const hex = entry.codepoint
                                    .toString(16)
                                    .toUpperCase()
                                    .padStart(4, '0');
                                return (
                                    <div key={entry.codepoint} className="contents">
                                        <button
                                            onClick={() =>
                                                setExpandedEntry((prev) =>
                                                    prev === entry.codepoint
                                                        ? null
                                                        : entry.codepoint,
                                                )
                                            }
                                            className="grid grid-cols-[48px_80px_1fr_100px_48px] md:grid-cols-[48px_90px_1fr_140px_48px] gap-2 px-3 py-2 items-center text-left transition-colors hover:bg-muted/50 rounded-md"
                                        >
                                            <span className="text-lg text-center font-mono">
                                                {entry.codepoint >= 0x20 ? entry.char : '·'}
                                            </span>
                                            <code className="text-xs font-mono text-muted-foreground">
                                                U+{hex}
                                            </code>
                                            <div className="flex items-center gap-2 min-w-0">
                                                <span
                                                    className={`inline-flex items-center justify-center rounded-md px-1.5 py-0.5 text-[10px] font-medium shrink-0 ${meta.color}`}
                                                >
                                                    {entry.category}
                                                </span>
                                                <span className="text-xs truncate">
                                                    {entry.name}
                                                </span>
                                            </div>
                                            <span className="hidden md:block text-[11px] text-muted-foreground truncate">
                                                {entry.block}
                                            </span>
                                            <span className="flex justify-end">
                                                <Button
                                                    variant="ghost"
                                                    size="icon-xs"
                                                    className="shrink-0"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleCopy(entry.char);
                                                    }}
                                                >
                                                    {copiedValue === entry.char ? (
                                                        <Check className="h-3 w-3 text-green-500" />
                                                    ) : (
                                                        <Copy className="h-3 w-3" />
                                                    )}
                                                </Button>
                                            </span>
                                        </button>
                                        {isExpanded && (
                                            <div className="px-3 pb-2">
                                                <div className="flex flex-col gap-3 rounded-lg border bg-muted/30 p-3">
                                                    <div className="flex items-center gap-3">
                                                        <span className="text-3xl font-mono">
                                                            {entry.codepoint >= 0x20
                                                                ? entry.char
                                                                : '·'}
                                                        </span>
                                                        <div>
                                                            <div className="text-sm font-medium">
                                                                {entry.name}
                                                            </div>
                                                            <div className="flex items-center gap-2 mt-0.5">
                                                                <code className="text-xs font-mono text-muted-foreground">
                                                                    U+{hex}
                                                                </code>
                                                                <span
                                                                    className={`inline-flex items-center rounded-md px-1.5 py-0.5 text-[10px] font-medium ${meta.color}`}
                                                                >
                                                                    {entry.category}
                                                                </span>
                                                                <span className="text-[11px] text-muted-foreground">
                                                                    {entry.block}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
                                                        {[
                                                            {
                                                                label: 'HTML Decimal',
                                                                value: entry.htmlDecimal,
                                                            },
                                                            {
                                                                label: 'HTML Hex',
                                                                value: entry.htmlHex,
                                                            },
                                                            { label: 'CSS', value: entry.css },
                                                            {
                                                                label: 'JavaScript',
                                                                value: entry.js,
                                                            },
                                                            {
                                                                label: 'UTF-8 Bytes',
                                                                value: entry.utf8Bytes,
                                                            },
                                                            {
                                                                label: 'Codepoint',
                                                                value: String(entry.codepoint),
                                                            },
                                                        ].map((fmt) => (
                                                            <div
                                                                key={fmt.label}
                                                                className="flex items-center justify-between gap-2 rounded-md border bg-background px-2.5 py-1.5"
                                                            >
                                                                <div className="min-w-0">
                                                                    <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
                                                                        {fmt.label}
                                                                    </span>
                                                                    <code className="block text-xs font-mono truncate">
                                                                        {fmt.value}
                                                                    </code>
                                                                </div>
                                                                <Button
                                                                    variant="ghost"
                                                                    size="icon-xs"
                                                                    className="shrink-0"
                                                                    onClick={() =>
                                                                        handleCopy(fmt.value)
                                                                    }
                                                                >
                                                                    {copiedValue === fmt.value ? (
                                                                        <Check className="h-3 w-3 text-green-500" />
                                                                    ) : (
                                                                        <Copy className="h-3 w-3" />
                                                                    )}
                                                                </Button>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                        <div className="mt-2 text-[11px] text-muted-foreground text-right">
                            {filtered.length} character{filtered.length !== 1 ? 's' : ''}
                        </div>
                    </div>
                ) : (
                    <div className="h-48 flex flex-col items-center justify-center rounded-lg border p-8 text-center">
                        <Languages className="h-10 w-10 text-muted-foreground/40 mb-3" />
                        <p className="text-sm font-medium text-muted-foreground">
                            No matching characters
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
