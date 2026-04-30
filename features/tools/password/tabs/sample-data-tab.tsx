'use client';

import { useMemo, useState, useCallback } from 'react';
import { useTheme } from 'next-themes';
import { ToolTabWrapper } from '../../core/components/tool-tab-wrapper';
import { useClipboard } from '@/lib/hooks/use-clipboard';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
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
    Hash,
    Type,
    ShieldAlert,
} from 'lucide-react';
import type { TabComponentProps } from '../../core/types/tool';
import precomputedStats from '../data/password-stats.json';
import allPasswordsRaw from '../data/common-passwords.json';

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

type LengthFilter = 'all' | 'short' | 'medium' | 'long';

const LENGTH_FILTERS: { id: LengthFilter; label: string; desc: string }[] = [
    { id: 'all', label: 'All', desc: 'All passwords' },
    { id: 'short', label: '≤ 5', desc: '5 chars or less' },
    { id: 'medium', label: '6–8', desc: '6 to 8 chars' },
    { id: 'long', label: '9+', desc: '9 chars or more' },
];

const LENGTH_RANGES: Record<LengthFilter, [number, number]> = {
    all: [0, Infinity],
    short: [0, 5],
    medium: [6, 8],
    long: [9, Infinity],
};

function getCategoryColor(cat: string): string {
    if (cat === 'Numeric only')
        return 'bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300';
    if (cat === 'Lowercase alpha')
        return 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300';
    if (cat === 'Alphanumeric')
        return 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300';
    if (cat === 'Mixed case alpha')
        return 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300';
    if (cat === 'Has special chars')
        return 'bg-rose-100 text-rose-700 dark:bg-rose-900 dark:text-rose-300';
    return 'bg-muted text-muted-foreground';
}

function categorizePassword(pw: string): string {
    const hasNum = /\d/.test(pw);
    const hasAlpha = /[a-zA-Z]/.test(pw);
    const hasSpecial = /[^a-zA-Z0-9]/.test(pw);
    const hasUpper = /[A-Z]/.test(pw);
    const hasLower = /[a-z]/.test(pw);

    if (hasSpecial) return 'Has special chars';
    if (hasNum && hasAlpha) return 'Alphanumeric';
    if (hasNum && !hasAlpha) return 'Numeric only';
    if (hasUpper && hasLower) return 'Mixed case alpha';
    if (hasLower) return 'Lowercase alpha';
    return 'Other';
}

function MiniBarChart({
    data,
    colors,
    xLabel,
}: {
    data: { name: string; value: number }[];
    colors: string[];
    xLabel?: string;
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
                    width={80}
                    tick={{ fontSize: 10 }}
                    className="fill-muted-foreground"
                />
                <Tooltip
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
                            xLabel || 'Count',
                        ]) as never
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
            <ResponsiveContainer width="50%" height={140}>
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
                    <Tooltip
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
                                'Count',
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

export default function SampleDataTab({ readOnly }: TabComponentProps) {
    const { resolvedTheme } = useTheme();
    const isDark = resolvedTheme === 'dark';
    const colors = isDark ? CHART_COLORS_DARK : CHART_COLORS;
    const [search, setSearch] = useState('');
    const [lengthFilter, setLengthFilter] = useState<LengthFilter>('all');
    const [copiedIdx, setCopiedIdx] = useState<number | null>(null);
    const [overviewOpen, setOverviewOpen] = useState(false);
    const [page, setPage] = useState(0);
    const { copy } = useClipboard();

    const allPasswords = allPasswordsRaw as string[];
    const total = precomputedStats.total;
    const lengthDist = precomputedStats.lengthDistribution as { name: string; value: number }[];
    const charsetDist = precomputedStats.charsetDistribution as { name: string; value: number }[];

    const filtered = useMemo(() => {
        let result = allPasswords;
        if (lengthFilter !== 'all') {
            const [min, max] = LENGTH_RANGES[lengthFilter];
            result = result.filter((pw) => pw.length >= min && pw.length <= max);
        }
        if (search.trim()) {
            const q = search.toLowerCase();
            result = result.filter((pw) => pw.toLowerCase().includes(q));
        }
        return result;
    }, [allPasswords, lengthFilter, search]);

    const counts = useMemo(() => {
        const base = search.trim()
            ? allPasswords.filter((pw) => pw.toLowerCase().includes(search.toLowerCase()))
            : allPasswords;
        const map: Record<string, number> = { all: base.length };
        for (const [id, range] of Object.entries(LENGTH_RANGES)) {
            if (id === 'all') continue;
            map[id] = base.filter((pw) => pw.length >= range[0] && pw.length <= range[1]).length;
        }
        return map;
    }, [allPasswords, search]);

    const paged = filtered.slice(0, (page + 1) * PAGE_SIZE);
    const hasMore = filtered.length > (page + 1) * PAGE_SIZE;

    const handleCopy = useCallback(
        async (pw: string, idx: number) => {
            await copy(pw);
            setCopiedIdx(idx);
            setTimeout(() => setCopiedIdx(null), 1500);
        },
        [copy],
    );

    return (
        <ToolTabWrapper>
            <div className="flex flex-col gap-4 py-4">
                <div className="flex items-center gap-2">
                    <ShieldAlert className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Common Passwords</span>
                    <Badge variant="outline" className="text-[10px] font-mono">
                        {total.toLocaleString()} entries
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
                            placeholder="Search passwords..."
                            className="h-8 pl-8 text-xs"
                            spellCheck={false}
                            readOnly={readOnly}
                        />
                    </div>
                    <div className="flex gap-1 shrink-0 flex-wrap">
                        {LENGTH_FILTERS.map((f) => {
                            const isActive = lengthFilter === f.id;
                            return (
                                <button
                                    key={f.id}
                                    onClick={() => {
                                        setLengthFilter(f.id);
                                        setPage(0);
                                    }}
                                    title={f.desc}
                                    className={`rounded-md border px-2 py-1 text-[11px] font-medium transition-colors ${
                                        isActive
                                            ? 'border-primary/50 bg-primary/10 text-primary'
                                            : 'text-muted-foreground hover:bg-muted/50'
                                    }`}
                                >
                                    {f.label} ({counts[f.id] ?? 0})
                                </button>
                            );
                        })}
                    </div>
                </div>

                <div className="rounded-lg border">
                    <button
                        type="button"
                        className="flex items-center justify-between w-full px-4 py-2.5 transition-colors hover:bg-muted/50"
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
                    </button>
                    {overviewOpen && (
                        <div className="border-t px-4 py-3">
                            <div className="grid gap-4 sm:grid-cols-2">
                                <div>
                                    <h4 className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                                        <Hash className="h-3 w-3" />
                                        Password Length Distribution
                                    </h4>
                                    <MiniBarChart
                                        data={lengthDist}
                                        colors={colors}
                                        xLabel="Passwords"
                                    />
                                </div>
                                <div>
                                    <h4 className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                                        <Type className="h-3 w-3" />
                                        Character Composition
                                    </h4>
                                    <MiniDonut data={charsetDist} colors={colors} />
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {filtered.length > 0 ? (
                    <div className="flex flex-col gap-1">
                        <div className="grid grid-cols-[48px_1fr_120px_80px_32px] gap-2 px-3 py-1.5 text-[10px] font-mono uppercase tracking-wider text-muted-foreground border-b">
                            <span>#</span>
                            <span>Password</span>
                            <span>Category</span>
                            <span>Length</span>
                            <span />
                        </div>
                        <div className="flex flex-col">
                            {paged.map((pw, idx) => {
                                const cat = categorizePassword(pw);
                                return (
                                    <div
                                        key={idx}
                                        className="grid grid-cols-[48px_1fr_120px_80px_32px] gap-2 items-center px-3 py-1.5 border-b last:border-0 hover:bg-muted/30 transition-colors"
                                    >
                                        <span className="text-[11px] text-muted-foreground tabular-nums">
                                            {idx + 1}
                                        </span>
                                        <code className="font-mono text-xs truncate">{pw}</code>
                                        <Badge
                                            className={`text-[10px] px-1.5 py-0 w-fit ${getCategoryColor(cat)}`}
                                        >
                                            {cat}
                                        </Badge>
                                        <span className="text-[11px] text-muted-foreground tabular-nums">
                                            {pw.length} chars
                                        </span>
                                        <Button
                                            variant="ghost"
                                            size="icon-xs"
                                            className="shrink-0"
                                            onClick={() => handleCopy(pw, idx)}
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
                            <button
                                type="button"
                                onClick={() => setPage(page + 1)}
                                className="w-full rounded-md border py-2 text-xs font-medium text-muted-foreground hover:bg-muted/50 transition-colors mt-1"
                            >
                                Load more ({filtered.length - (page + 1) * PAGE_SIZE} remaining)
                            </button>
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
                            No matching passwords
                        </p>
                        <p className="text-xs text-muted-foreground/60 mt-1">
                            Try a different search term or filter
                        </p>
                    </div>
                )}
            </div>
        </ToolTabWrapper>
    );
}
