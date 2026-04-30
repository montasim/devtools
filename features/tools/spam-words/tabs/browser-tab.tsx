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
import rawWords from '../data/words.json';
import precomputedStats from '../data/stats.json';

type SpamWord = { word: string; category: string; length: number };

const CATEGORY_COLORS: Record<string, string> = {
    'Free / Giveaway': 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300',
    'Money / Income': 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300',
    'Call to Action': 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
    'Urgency': 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300',
    'Guarantee / Risk-free': 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300',
    'Spam / Legal': 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300',
    'Discount / Pricing': 'bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300',
    'Financial': 'bg-teal-100 text-teal-700 dark:bg-teal-900 dark:text-teal-300',
    'Health / Pharma': 'bg-pink-100 text-pink-700 dark:bg-pink-900 dark:text-pink-300',
    'Marketing': 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900 dark:text-cyan-300',
    'Business Opportunity': 'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300',
    'General': 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300',
};

const PAGE_SIZE = 50;

export default function BrowserTab({ readOnly }: TabComponentProps) {
    const { resolvedTheme } = useTheme();
    const colors = useChartColors(resolvedTheme === 'dark');
    const [search, setSearch] = useState('');
    const [categoryFilter, setCategoryFilter] = useState<string>('all');
    const [copiedIdx, setCopiedIdx] = useState<number | null>(null);
    const [overviewOpen, setOverviewOpen] = useState(false);
    const [page, setPage] = useState(0);
    const { copy } = useClipboard();

    const allWords = rawWords as SpamWord[];
    const total = precomputedStats.total;
    const catDist = precomputedStats.categoryDistribution as { name: string; value: number }[];
    const letterDist = precomputedStats.startingLetterDistribution as { name: string; value: number }[];

    const categories = useMemo(
        () => ['all', ...Array.from(new Set(allWords.map((w) => w.category))).sort()],
        [allWords],
    );

    const filtered = useMemo(() => {
        let result = allWords;
        if (categoryFilter !== 'all') {
            result = result.filter((w) => w.category === categoryFilter);
        }
        if (search.trim()) {
            const q = search.toLowerCase();
            result = result.filter((w) => w.word.toLowerCase().includes(q));
        }
        return result;
    }, [allWords, categoryFilter, search]);

    const counts = useMemo(() => {
        const base = search.trim()
            ? allWords.filter((w) => w.word.toLowerCase().includes(search.toLowerCase()))
            : allWords;
        const result: Record<string, number> = { all: base.length };
        for (const w of base) {
            result[w.category] = (result[w.category] || 0) + 1;
        }
        return result;
    }, [allWords, search]);

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

    return (
        <ToolTabWrapper>
            <div className="flex flex-col gap-4 py-4">
                <div className="flex items-center gap-2">
                    <Database className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Spam Trigger Words</span>
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
                        {categories.map((cat) => {
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
                                        Categories
                                    </h4>
                                    <MiniBarChart data={catDist.slice(0, 10)} colors={colors} xLabel="Words" />
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
                                        Category Distribution
                                    </h4>
                                    <MiniDonut data={catDist.slice(0, 8)} colors={colors} xLabel="Words" />
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {filtered.length > 0 ? (
                    <div className="flex flex-col gap-1">
                        <div className="grid grid-cols-[48px_1fr_120px_32px] gap-2 px-3 py-1.5 text-[10px] font-mono uppercase tracking-wider text-muted-foreground border-b">
                            <span>#</span>
                            <span>Word / Phrase</span>
                            <span>Category</span>
                            <span />
                        </div>
                        <div className="flex flex-col">
                            {paged.map((item, idx) => (
                                <div
                                    key={idx}
                                    className="grid grid-cols-[48px_1fr_120px_32px] gap-2 items-center px-3 py-1.5 border-b last:border-0 hover:bg-muted/30 transition-colors"
                                >
                                    <span className="text-[11px] text-muted-foreground tabular-nums">
                                        {idx + 1}
                                    </span>
                                    <code className="font-mono text-xs truncate">{item.word}</code>
                                    <Badge
                                        variant="outline"
                                        className={`text-[10px] px-1.5 py-0 w-fit ${CATEGORY_COLORS[item.category] || ''}`}
                                    >
                                        {item.category}
                                    </Badge>
                                    <Button
                                        variant="ghost"
                                        size="icon-xs"
                                        className="shrink-0"
                                        onClick={() => handleCopy(item.word, idx)}
                                    >
                                        {copiedIdx === idx ? (
                                            <Check className="h-3 w-3 text-green-500" />
                                        ) : (
                                            <Copy className="h-3 w-3" />
                                        )}
                                    </Button>
                                </div>
                            ))}
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
                            Try a different search term or category filter
                        </p>
                    </div>
                )}
            </div>
        </ToolTabWrapper>
    );
}
