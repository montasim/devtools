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
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip as RechartsTooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    CartesianGrid,
} from 'recharts';
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
import type { TabComponentProps } from '../../core/types/tool';
import rawWords from '../data/words.json';
import precomputedStats from '../data/stats.json';

const CHART_COLORS = [
    'hsl(258, 90%, 66%)',
    'hsl(210, 90%, 56%)',
    'hsl(147, 70%, 45%)',
    'hsl(30, 95%, 55%)',
    'hsl(340, 82%, 60%)',
    'hsl(175, 70%, 42%)',
    'hsl(45, 90%, 50%)',
    'hsl(280, 70%, 58%)',
    'hsl(15, 85%, 55%)',
    'hsl(200, 80%, 50%)',
];

const CHART_COLORS_DARK = [
    'hsl(258, 80%, 72%)',
    'hsl(210, 80%, 65%)',
    'hsl(147, 65%, 55%)',
    'hsl(30, 85%, 62%)',
    'hsl(340, 75%, 68%)',
    'hsl(175, 65%, 52%)',
    'hsl(45, 85%, 58%)',
    'hsl(280, 65%, 66%)',
    'hsl(15, 80%, 62%)',
    'hsl(200, 75%, 58%)',
];

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

function MiniBarChart({
    data,
    colors,
}: {
    data: { name: string; value: number }[];
    colors: string[];
}) {
    return (
        <ResponsiveContainer width="100%" height={data.length * 28 + 16}>
            <BarChart
                data={data}
                layout="vertical"
                margin={{ left: 0, right: 12, top: 0, bottom: 0 }}
            >
                <CartesianGrid horizontal={false} strokeDasharray="3 3" className="stroke-border" />
                <XAxis type="number" tick={{ fontSize: 10 }} />
                <YAxis
                    type="category"
                    dataKey="name"
                    width={100}
                    tick={{ fontSize: 10 }}
                    className="fill-muted-foreground"
                />
                <RechartsTooltip
                    contentStyle={{
                        fontSize: 11,
                        borderRadius: 8,
                        border: '1px solid hsl(var(--border))',
                        backgroundColor: 'hsl(var(--popover))',
                        color: 'hsl(var(--popover-foreground))',
                    }}
                    formatter={
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        ((value: any) => [Number(value ?? 0).toLocaleString(), 'Words']) as never
                    }
                />
                <Bar dataKey="value" radius={[0, 3, 3, 0]} barSize={16}>
                    {data.map((_, idx) => (
                        <Cell key={idx} fill={colors[idx % colors.length]} />
                    ))}
                </Bar>
            </BarChart>
        </ResponsiveContainer>
    );
}

function MiniDonut({
    data,
    colors,
}: {
    data: { name: string; value: number }[];
    colors: string[];
}) {
    const total = data.reduce((s, d) => s + d.value, 0);

    return (
        <div className="flex items-center gap-3">
            <ResponsiveContainer width="50%" height={Math.min(data.length * 20 + 40, 180)}>
                <PieChart>
                    <Pie
                        data={data}
                        cx="50%"
                        cy="50%"
                        innerRadius={38}
                        outerRadius={60}
                        paddingAngle={2}
                        dataKey="value"
                        stroke="none"
                    >
                        {data.map((_, idx) => (
                            <Cell key={idx} fill={colors[idx % colors.length]} />
                        ))}
                    </Pie>
                    <RechartsTooltip
                        contentStyle={{
                            fontSize: 11,
                            borderRadius: 8,
                            border: '1px solid hsl(var(--border))',
                            backgroundColor: 'hsl(var(--popover))',
                            color: 'hsl(var(--popover-foreground))',
                        }}
                        formatter={
                            // eslint-disable-next-line @typescript-eslint/no-explicit-any
                            ((value: any) => [
                                Number(value ?? 0).toLocaleString(),
                                'Words',
                            ]) as never
                        }
                    />
                </PieChart>
            </ResponsiveContainer>
            <div className="flex flex-col gap-1 min-w-0 flex-1">
                {data.map((d, idx) => (
                    <div key={d.name} className="flex items-center gap-1.5 text-[11px]">
                        <span
                            className="shrink-0 h-2 w-2 rounded-full"
                            style={{ backgroundColor: colors[idx % colors.length] }}
                        />
                        <span className="truncate text-muted-foreground">{d.name}</span>
                        <span className="ml-auto font-medium tabular-nums shrink-0">
                            {d.value.toLocaleString()}
                            <span className="text-muted-foreground font-normal">
                                {' '}
                                ({((d.value / total) * 100).toFixed(0)}%)
                            </span>
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
}

const PAGE_SIZE = 50;

export default function BrowserTab({ readOnly }: TabComponentProps) {
    const { resolvedTheme } = useTheme();
    const isDark = resolvedTheme === 'dark';
    const colors = isDark ? CHART_COLORS_DARK : CHART_COLORS;
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
                                    <MiniBarChart data={catDist.slice(0, 10)} colors={colors} />
                                </div>
                                <div>
                                    <h4 className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                                        <Type className="h-3 w-3" />
                                        Starting Letter
                                    </h4>
                                    <MiniBarChart data={letterDist.slice(0, 10)} colors={colors} />
                                </div>
                                <div>
                                    <h4 className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                                        <Tag className="h-3 w-3" />
                                        Category Distribution
                                    </h4>
                                    <MiniDonut data={catDist.slice(0, 8)} colors={colors} />
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
