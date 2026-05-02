'use client';

import { useMemo, useState, useCallback } from 'react';
import { useTheme } from 'next-themes';
import { ToolTabWrapper } from '../../core/components/tool-tab-wrapper';
import { useClipboard } from '@/lib/hooks/use-clipboard';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Badge } from '@/components/ui/badge';
import {
    Search,
    Database,
    ChevronDown,
    ChevronRight,
    Copy,
    Check,
    BarChart3,
    Tag,
    Type,
} from 'lucide-react';
import { MiniBarChart, MiniDonut, useChartColors } from '../../shared/charts';
import type { TabComponentProps } from '../../core/types/tool';
import WORD_LIST from '../utils/wordlist.json';
import precomputedStats from '../data/stats.json';

function getLengthCategory(len: number): string {
    if (len <= 3) return 'Short (1-3)';
    if (len <= 5) return 'Medium (4-5)';
    if (len <= 7) return 'Standard (6-7)';
    if (len <= 9) return 'Long (8-9)';
    if (len <= 12) return 'Extended (10-12)';
    return 'Maximum (13+)';
}

const CATEGORY_COLORS: Record<string, string> = {
    'Short (1-3)': 'bg-sky-100 text-sky-700 dark:bg-sky-900 dark:text-sky-300',
    'Medium (4-5)': 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
    'Standard (6-7)': 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300',
    'Long (8-9)': 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300',
    'Extended (10-12)': 'bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300',
    'Maximum (13+)': 'bg-rose-100 text-rose-700 dark:bg-rose-900 dark:text-rose-300',
};

const PAGE_SIZE = 50;

const LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

const ALL_CATEGORIES = [
    'all',
    'Short (1-3)',
    'Medium (4-5)',
    'Standard (6-7)',
    'Long (8-9)',
    'Extended (10-12)',
    'Maximum (13+)',
];

export default function BrowserTab({ readOnly }: TabComponentProps) {
    const { resolvedTheme } = useTheme();
    const colors = useChartColors(resolvedTheme === 'dark');
    const [search, setSearch] = useState('');
    const [categoryFilter, setCategoryFilter] = useState<string>('all');
    const [letterFilter, setLetterFilter] = useState<string>('all');
    const [copiedIdx, setCopiedIdx] = useState<number | null>(null);
    const [overviewOpen, setOverviewOpen] = useState(false);
    const [page, setPage] = useState(0);
    const { copy } = useClipboard();

    const total = precomputedStats.total;
    const catDist = precomputedStats.categoryDistribution as { name: string; value: number }[];
    const letterDist = precomputedStats.startingLetterDistribution as { name: string; value: number }[];
    const lengthDist = precomputedStats.lengthDistribution as { name: string; value: number }[];

    const filtered = useMemo(() => {
        let result = WORD_LIST as string[];
        if (categoryFilter !== 'all') {
            result = result.filter((w) => getLengthCategory(w.length) === categoryFilter);
        }
        if (letterFilter !== 'all') {
            const letter = letterFilter.toLowerCase();
            result = result.filter((w) => w[0] === letter);
        }
        if (search.trim()) {
            const q = search.toLowerCase();
            result = result.filter((w) => w.toLowerCase().includes(q));
        }
        return result;
    }, [categoryFilter, letterFilter, search]);

    const counts = useMemo(() => {
        let base = WORD_LIST as string[];
        if (search.trim()) {
            const q = search.toLowerCase();
            base = base.filter((w) => w.toLowerCase().includes(q));
        }
        const result: Record<string, number> = { all: base.length };
        for (const w of base) {
            const cat = getLengthCategory(w.length);
            result[cat] = (result[cat] || 0) + 1;
        }
        return result;
    }, [search]);

    const paged = filtered.slice(0, (page + 1) * PAGE_SIZE);
    const hasMore = filtered.length > (page + 1) * PAGE_SIZE;

    const handleCopy = useCallback(
        async (word: string, idx: number) => {
            await copy(word);
            setCopiedIdx(idx);
            setTimeout(() => setCopiedIdx(null), 1500);
        },
        [copy],
    );

    const resetFilters = useCallback(() => {
        setCategoryFilter('all');
        setLetterFilter('all');
        setSearch('');
        setPage(0);
    }, []);

    return (
        <ToolTabWrapper>
            <div className="flex flex-col gap-4 py-4">
                <div className="flex items-center gap-2">
                    <Database className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Passphrase Word List</span>
                    <Badge variant="outline" className="text-[10px] font-mono">
                        {total.toLocaleString()} words
                    </Badge>
                </div>

                <div className="flex flex-col gap-2 sm:flex-row sm:items-start">
                    <div className="relative flex-1">
                        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                        <Input
                            value={search}
                            onChange={(e) => {
                                setSearch(e.target.value);
                                setPage(0);
                            }}
                            placeholder="Search words..."
                            className="h-8 pl-8 text-xs"
                            spellCheck={false}
                            readOnly={readOnly}
                        />
                    </div>
                    <div className="flex gap-1 shrink-0 flex-wrap max-h-24 overflow-y-auto">
                        {ALL_CATEGORIES.map((cat) => {
                            const isActive = categoryFilter === cat;
                            const label = cat === 'all' ? 'All' : cat;
                            return (
                                <Tooltip key={cat}>
                                    <TooltipTrigger asChild>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => {
                                                setCategoryFilter(cat);
                                                setPage(0);
                                            }}
                                            className={`h-auto px-2 py-1 text-[11px] font-medium ${
                                                isActive
                                                    ? 'border-primary/50 bg-primary/10 text-primary hover:bg-primary/15'
                                                    : 'text-muted-foreground hover:bg-muted/50'
                                            }`}
                                        >
                                            {label} ({counts[cat] ?? 0})
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        {cat === 'all' ? 'Show all words' : `Only ${cat} words`}
                                    </TooltipContent>
                                </Tooltip>
                            );
                        })}
                    </div>
                </div>

                <div className="flex flex-wrap gap-1">
                    <Button
                        variant={letterFilter === 'all' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => { setLetterFilter('all'); setPage(0); }}
                        className="h-6 w-6 p-0 text-[10px]"
                    >
                        *
                    </Button>
                    {LETTERS.map((letter) => (
                        <Button
                            key={letter}
                            variant={letterFilter === letter ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => { setLetterFilter(letter); setPage(0); }}
                            className="h-6 w-6 p-0 text-[10px]"
                        >
                            {letter}
                        </Button>
                    ))}
                </div>

                <div className="rounded-lg border">
                    <Button
                        variant="ghost"
                        className="flex items-center justify-between w-full px-4 py-2.5 h-auto"
                        onClick={() => setOverviewOpen(!overviewOpen)}
                    >
                        <span className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                            <BarChart3 className="h-3.5 w-3.5" />
                            Overview
                        </span>
                        {overviewOpen ? (
                            <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
                        ) : (
                            <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
                        )}
                    </Button>
                    {overviewOpen && (
                        <div className="border-t px-4 py-3">
                            <div className="grid gap-4 sm:grid-cols-3">
                                <div>
                                    <h4 className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                                        <Tag className="h-3 w-3" />
                                        By Length
                                    </h4>
                                    <MiniBarChart data={catDist} colors={colors} xLabel="Words" />
                                </div>
                                <div>
                                    <h4 className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                                        <Type className="h-3 w-3" />
                                        Starting Letter
                                    </h4>
                                    <MiniBarChart data={letterDist.slice(0, 10)} colors={colors} xLabel="Words" />
                                </div>
                                <div>
                                    <h4 className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                                        <Tag className="h-3 w-3" />
                                        Length Distribution
                                    </h4>
                                    <MiniDonut data={lengthDist} colors={colors} xLabel="Words" />
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {filtered.length > 0 ? (
                    <div className="flex flex-col gap-1">
                        <div className="grid grid-cols-[48px_1fr_120px_48px_32px] gap-2 px-3 py-1.5 text-[10px] font-mono uppercase tracking-wider text-muted-foreground border-b">
                            <span>#</span>
                            <span>Word</span>
                            <span>Category</span>
                            <span>Len</span>
                            <span />
                        </div>
                        <div className="flex flex-col">
                            {paged.map((word, idx) => {
                                const cat = getLengthCategory(word.length);
                                return (
                                    <div
                                        key={`${word}-${idx}`}
                                        className="grid grid-cols-[48px_1fr_120px_48px_32px] gap-2 items-center px-3 py-1.5 border-b last:border-0 hover:bg-muted/30 transition-colors"
                                    >
                                        <span className="text-[11px] text-muted-foreground tabular-nums">
                                            {idx + 1}
                                        </span>
                                        <code className="font-mono text-xs truncate">{word}</code>
                                        <Badge
                                            variant="outline"
                                            className={`text-[10px] px-1.5 py-0 w-fit ${CATEGORY_COLORS[cat] || ''}`}
                                        >
                                            {cat}
                                        </Badge>
                                        <span className="text-[11px] text-muted-foreground tabular-nums">
                                            {word.length}
                                        </span>
                                        <Button
                                            variant="ghost"
                                            size="icon-xs"
                                            className="shrink-0"
                                            onClick={() => handleCopy(word, idx)}
                                        >
                                            {copiedIdx === idx ? (
                                                <Check className="h-3 w-3 text-green-500" />
                                            ) : (
                                                <Copy className="h-3 w-3" />
                                            )}
                                        </Button>
                                    </div>
                                );
                            })}
                        </div>
                        {hasMore && (
                            <Button
                                variant="outline"
                                className="w-full py-2 h-auto text-xs font-medium text-muted-foreground mt-1"
                                onClick={() => setPage(page + 1)}
                            >
                                Load more ({filtered.length - (page + 1) * PAGE_SIZE} remaining)
                            </Button>
                        )}
                        <div className="mt-1 text-[11px] text-muted-foreground text-right">
                            Showing {Math.min((page + 1) * PAGE_SIZE, filtered.length)} of{' '}
                            {filtered.length}
                        </div>
                    </div>
                ) : (
                    <div className="h-48 flex flex-col items-center justify-center rounded-lg border p-8 text-center">
                        <Database className="h-10 w-10 text-muted-foreground/40 mb-3" />
                        <p className="text-sm font-medium text-muted-foreground">
                            No matching words
                        </p>
                        <p className="text-xs text-muted-foreground/60 mt-1">
                            Try a different search term or filter
                        </p>
                        <Button
                            variant="ghost"
                            size="sm"
                            className="mt-3 text-xs"
                            onClick={resetFilters}
                        >
                            Clear all filters
                        </Button>
                    </div>
                )}
            </div>
        </ToolTabWrapper>
    );
}
