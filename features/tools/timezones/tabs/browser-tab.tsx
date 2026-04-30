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
    Tooltip as RechartsTooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    CartesianGrid,
} from 'recharts';
import {
    Search,
    Globe2,
    ChevronDown,
    ChevronRight,
    Copy,
    Check,
    BarChart3,
    Map,
    Clock,
} from 'lucide-react';
import type { TabComponentProps } from '../../core/types/tool';
import rawCountries from '../data/countries.json';
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

type Country = { code: string; name: string; timezones: string[] };
type RegionFilter = 'all' | string;

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
                    width={80}
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
                        ((value: any) => [Number(value ?? 0).toLocaleString(), 'Timezones']) as never
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
                                'Timezones',
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

const PAGE_SIZE = 30;

export default function BrowserTab({ readOnly }: TabComponentProps) {
    const { resolvedTheme } = useTheme();
    const isDark = resolvedTheme === 'dark';
    const colors = isDark ? CHART_COLORS_DARK : CHART_COLORS;
    const [search, setSearch] = useState('');
    const [regionFilter, setRegionFilter] = useState<string>('all');
    const [copiedIdx, setCopiedIdx] = useState<number | null>(null);
    const [overviewOpen, setOverviewOpen] = useState(false);
    const [page, setPage] = useState(0);
    const [expanded, setExpanded] = useState<Set<string>>(new Set());
    const { copy } = useClipboard();

    const countries = rawCountries as Country[];
    const stats = precomputedStats;
    const regionDist = stats.regionDistribution as { name: string; value: number }[];

    const regions = useMemo(
        () => ['all', ...Array.from(new Set(countries.flatMap((c) => c.timezones.map((tz) => tz.split('/')[0])))).sort()],
        [countries],
    );

    const filtered = useMemo(() => {
        let result = countries;
        if (regionFilter !== 'all') {
            result = result.filter((c) => c.timezones.some((tz) => tz.startsWith(regionFilter + '/')));
        }
        if (search.trim()) {
            const q = search.toLowerCase();
            result = result.filter(
                (c) =>
                    c.name.toLowerCase().includes(q) ||
                    c.code.toLowerCase().includes(q) ||
                    c.timezones.some((tz) => tz.toLowerCase().includes(q)),
            );
        }
        return result;
    }, [countries, regionFilter, search]);

    const counts = useMemo(() => {
        const base = search.trim()
            ? countries.filter(
                  (c) =>
                      c.name.toLowerCase().includes(search.toLowerCase()) ||
                      c.code.toLowerCase().includes(search.toLowerCase()) ||
                      c.timezones.some((tz) => tz.toLowerCase().includes(search.toLowerCase())),
              )
            : countries;
        const result: Record<string, number> = { all: base.length };
        for (const c of base) {
            for (const tz of c.timezones) {
                const region = tz.split('/')[0];
                if (!result[region]) result[region] = 0;
                if (!result[region + '_counted']) {
                    result[region]!++;
                    result[region + '_counted'] = 1;
                }
            }
            for (const key of Object.keys(result)) {
                if (key.endsWith('_counted')) delete result[key];
            }
        }
        for (const r of regions) {
            if (r !== 'all' && !(r in result)) {
                result[r] = 0;
            }
        }
        return result;
    }, [countries, search, regions]);

    const paged = filtered.slice(0, (page + 1) * PAGE_SIZE);
    const hasMore = filtered.length > (page + 1) * PAGE_SIZE;

    const handleCopy = useCallback(
        async (text: string, idx: number) => {
            await copy(text);
            setCopiedIdx(idx);
            setTimeout(() => setCopiedIdx(null), 1500);
        },
        [copy],
    );

    const toggleExpand = useCallback((code: string) => {
        setExpanded((prev) => {
            const next = new Set(prev);
            if (next.has(code)) next.delete(code);
            else next.add(code);
            return next;
        });
    }, []);

    return (
        <ToolTabWrapper>
            <div className="flex flex-col gap-4 py-4">
                <div className="flex items-center gap-2">
                    <Globe2 className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">World Timezone Database</span>
                    <Badge variant="outline" className="text-[10px] font-mono">
                        {stats.totalCountries} countries &middot; {stats.totalTimezones} timezones
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
                            placeholder="Search country, code, or timezone..."
                            className="h-8 pl-8 text-xs"
                            spellCheck={false}
                            readOnly={readOnly}
                        />
                    </div>
                    <div className="flex gap-1 shrink-0 flex-wrap max-h-24 overflow-y-auto">
                        {regions.slice(0, 11).map((region) => {
                            const isActive = regionFilter === region;
                            const label = region === 'all' ? 'All' : region;
                            return (
                                <Button
                                    key={region}
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                        setRegionFilter(region);
                                        setPage(0);
                                    }}
                                    className={`h-auto px-2 py-1 text-[11px] font-medium ${
                                        isActive
                                            ? 'border-primary/50 bg-primary/10 text-primary hover:bg-primary/15'
                                            : 'text-muted-foreground hover:bg-muted/50'
                                    }`}
                                >
                                    {label}
                                </Button>
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
                                        <Map className="h-3 w-3" />
                                        Regions
                                    </h4>
                                    <MiniBarChart data={regionDist.slice(0, 10)} colors={colors} />
                                </div>
                                <div>
                                    <h4 className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                                        <Clock className="h-3 w-3" />
                                        Top Countries
                                    </h4>
                                    <MiniBarChart
                                        data={[...countries]
                                            .sort((a, b) => b.timezones.length - a.timezones.length)
                                            .slice(0, 8)
                                            .map((c) => ({ name: c.code, value: c.timezones.length }))}
                                        colors={colors}
                                    />
                                </div>
                                <div>
                                    <h4 className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                                        <Map className="h-3 w-3" />
                                        Region Split
                                    </h4>
                                    <MiniDonut data={regionDist.slice(0, 8)} colors={colors} />
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {filtered.length > 0 ? (
                    <div className="flex flex-col gap-1">
                        <div className="grid grid-cols-[48px_1fr_80px_48px] gap-2 px-3 py-1.5 text-[10px] font-mono uppercase tracking-wider text-muted-foreground border-b">
                            <span>#</span>
                            <span>Country</span>
                            <span>Code</span>
                            <span className="text-center">TZs</span>
                        </div>
                        <div className="flex flex-col">
                            {paged.map((country, idx) => {
                                const isExpanded = expanded.has(country.code);
                                return (
                                    <div key={country.code}>
                                        <div
                                            className="grid grid-cols-[48px_1fr_80px_48px] gap-2 items-center px-3 py-1.5 border-b last:border-0 hover:bg-muted/30 transition-colors cursor-pointer"
                                            onClick={() => toggleExpand(country.code)}
                                        >
                                            <span className="text-[11px] text-muted-foreground tabular-nums">
                                                {idx + 1}
                                            </span>
                                            <span className="text-sm truncate">{country.name}</span>
                                            <code className="font-mono text-xs text-muted-foreground">
                                                {country.code}
                                            </code>
                                            <div className="flex items-center justify-center">
                                                <Badge
                                                    variant="outline"
                                                    className="text-[10px] px-1.5 py-0 font-mono"
                                                >
                                                    {country.timezones.length}
                                                </Badge>
                                            </div>
                                        </div>
                                        {isExpanded && (
                                            <div className="bg-muted/20 border-b px-3 py-2">
                                                <div className="flex flex-col gap-1">
                                                    {country.timezones.map((tz) => (
                                                        <div
                                                            key={tz}
                                                            className="flex items-center gap-2 text-xs"
                                                        >
                                                            <Clock className="h-3 w-3 text-muted-foreground shrink-0" />
                                                            <code className="font-mono text-muted-foreground flex-1 truncate">
                                                                {tz}
                                                            </code>
                                                            <Button
                                                                variant="ghost"
                                                                size="icon-xs"
                                                                className="shrink-0"
                                                                onClick={() => handleCopy(tz, idx)}
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
                                            </div>
                                        )}
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
                        <Globe2 className="h-10 w-10 text-muted-foreground/40 mb-3" />
                        <p className="text-sm font-medium text-muted-foreground">
                            No matching countries
                        </p>
                        <p className="text-xs text-muted-foreground/60 mt-1">
                            Try a different search term or region filter
                        </p>
                    </div>
                )}
            </div>
        </ToolTabWrapper>
    );
}
