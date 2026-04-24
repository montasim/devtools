'use client';

import { useState, useCallback, useMemo } from 'react';
import { ToolTabWrapper } from '../../core/components/tool-tab-wrapper';
import { useClipboard } from '@/lib/hooks/use-clipboard';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Copy, Check, Search, Table } from 'lucide-react';
import type { TabComponentProps } from '../../core/types/tool';
import {
    CATEGORY_META,
    ALL_CATEGORIES,
    searchAscii,
    type AsciiCategory,
} from '../utils/ascii-data';

export default function ReferenceTab({}: TabComponentProps) {
    const [search, setSearch] = useState('');
    const [activeCategory, setActiveCategory] = useState<AsciiCategory | 'all'>('all');
    const [copiedValue, setCopiedValue] = useState<string | null>(null);
    const [expandedEntry, setExpandedEntry] = useState<number | null>(null);
    const { copy } = useClipboard();

    const filtered = useMemo(() => {
        const matched = searchAscii(search);
        if (activeCategory === 'all') return matched;
        return matched.filter((e) => e.category === activeCategory);
    }, [search, activeCategory]);

    const counts = useMemo(() => {
        const all = searchAscii(search);
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
                            placeholder="Search by name, decimal, hex (0x41), binary, or character..."
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
                        <div className="grid grid-cols-[48px_56px_80px_1fr_72px_48px] md:grid-cols-[48px_64px_90px_1fr_90px_48px] gap-2 px-3 py-1.5 text-[10px] font-mono uppercase tracking-wider text-muted-foreground border-b">
                            <span>Dec</span>
                            <span>Hex</span>
                            <span>Char</span>
                            <span>Name</span>
                            <span className="hidden md:block">Category</span>
                            <span className="text-right">Copy</span>
                        </div>
                        <div className="flex flex-col">
                            {filtered.map((entry) => {
                                const meta = CATEGORY_META[entry.category];
                                const isExpanded = expandedEntry === entry.decimal;
                                const displayChar =
                                    entry.category === 'control' ? '⌃' : entry.char || '·';
                                return (
                                    <div key={entry.decimal} className="contents">
                                        <button
                                            onClick={() =>
                                                setExpandedEntry((prev) =>
                                                    prev === entry.decimal ? null : entry.decimal,
                                                )
                                            }
                                            className="grid grid-cols-[48px_56px_80px_1fr_72px_48px] md:grid-cols-[48px_64px_90px_1fr_90px_48px] gap-2 px-3 py-2 items-center text-left transition-colors hover:bg-muted/50 rounded-md"
                                        >
                                            <code className="text-xs font-mono text-muted-foreground">
                                                {entry.decimal}
                                            </code>
                                            <code className="text-xs font-mono text-muted-foreground">
                                                0x{entry.hex}
                                            </code>
                                            <span className="text-lg text-center font-mono">
                                                {displayChar}
                                            </span>
                                            <div className="flex items-center gap-2 min-w-0">
                                                <span className="text-xs truncate">
                                                    {entry.name}
                                                </span>
                                            </div>
                                            <span className="hidden md:flex items-center">
                                                <span
                                                    className={`inline-flex items-center justify-center rounded-md px-1.5 py-0.5 text-[10px] font-medium shrink-0 ${meta.color}`}
                                                >
                                                    {meta.label}
                                                </span>
                                            </span>
                                            <span className="flex justify-end">
                                                <Button
                                                    variant="ghost"
                                                    size="icon-xs"
                                                    className="shrink-0"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        const copyVal =
                                                            entry.category === 'control'
                                                                ? String.fromCharCode(entry.decimal)
                                                                : entry.char;
                                                        handleCopy(copyVal);
                                                    }}
                                                >
                                                    {copiedValue ===
                                                    (entry.category === 'control'
                                                        ? String.fromCharCode(entry.decimal)
                                                        : entry.char) ? (
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
                                                            {displayChar}
                                                        </span>
                                                        <div>
                                                            <div className="text-sm font-medium">
                                                                {entry.name}
                                                            </div>
                                                            <div className="flex items-center gap-2 mt-0.5">
                                                                <code className="text-xs font-mono text-muted-foreground">
                                                                    Decimal {entry.decimal}
                                                                </code>
                                                                <span
                                                                    className={`inline-flex items-center rounded-md px-1.5 py-0.5 text-[10px] font-medium ${meta.color}`}
                                                                >
                                                                    {meta.label}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="text-xs text-muted-foreground">
                                                        {entry.description}
                                                    </div>
                                                    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
                                                        {[
                                                            {
                                                                label: 'Decimal',
                                                                value: String(entry.decimal),
                                                            },
                                                            {
                                                                label: 'Hexadecimal',
                                                                value: `0x${entry.hex}`,
                                                            },
                                                            {
                                                                label: 'Binary',
                                                                value: entry.binary,
                                                            },
                                                            {
                                                                label: 'HTML Entity',
                                                                value: entry.htmlEntity || 'N/A',
                                                            },
                                                            {
                                                                label: 'Escape Sequence',
                                                                value:
                                                                    entry.escapeSequence || 'N/A',
                                                            },
                                                            {
                                                                label: 'Octal',
                                                                value: entry.decimal
                                                                    .toString(8)
                                                                    .padStart(3, '0'),
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
                                                                {fmt.value !== 'N/A' && (
                                                                    <Button
                                                                        variant="ghost"
                                                                        size="icon-xs"
                                                                        className="shrink-0"
                                                                        onClick={() =>
                                                                            handleCopy(fmt.value)
                                                                        }
                                                                    >
                                                                        {copiedValue ===
                                                                        fmt.value ? (
                                                                            <Check className="h-3 w-3 text-green-500" />
                                                                        ) : (
                                                                            <Copy className="h-3 w-3" />
                                                                        )}
                                                                    </Button>
                                                                )}
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
                        <Table className="h-10 w-10 text-muted-foreground/40 mb-3" />
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
