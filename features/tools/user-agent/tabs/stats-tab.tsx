'use client';

import { useMemo, useState, useCallback } from 'react';
import { useTheme } from 'next-themes';
import { ToolTabWrapper } from '../../core/components/tool-tab-wrapper';
import { useClipboard } from '@/lib/hooks/use-clipboard';
import { parseUserAgent, type UserAgentInfo } from '../utils/user-agent-parser';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Input } from '@/components/ui/input';
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
    Globe,
    Monitor,
    Smartphone,
    Tablet,
    Bot,
    Search,
    BarChart3,
    Layers,
    Copy,
    Check,
    ChevronDown,
    ChevronRight,
    Database,
} from 'lucide-react';
import type { TabComponentProps } from '../../core/types/tool';
import rawUserAgents from '../data/userAgents.json';

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

type DeviceFilter = 'all' | 'Desktop' | 'Mobile' | 'Tablet';

interface ParsedEntry {
    ua: string;
    info: UserAgentInfo;
}

function countBy(
    entries: ParsedEntry[],
    getter: (e: ParsedEntry) => string,
): Record<string, number> {
    const map: Record<string, number> = {};
    for (const e of entries) {
        const key = getter(e) || 'Unknown';
        map[key] = (map[key] || 0) + 1;
    }
    return map;
}

function toChartData(counts: Record<string, number>, sort = true) {
    const data = Object.entries(counts).map(([name, value]) => ({ name, value }));
    if (sort) data.sort((a, b) => b.value - a.value);
    return data;
}

const DEVICE_FILTERS: { id: DeviceFilter; label: string; icon: React.ReactNode; desc: string }[] = [
    { id: 'all', label: 'All', icon: <Database className="h-3 w-3" />, desc: 'Show all devices' },
    {
        id: 'Desktop',
        label: 'Desktop',
        icon: <Monitor className="h-3 w-3" />,
        desc: 'Desktop user agents',
    },
    {
        id: 'Mobile',
        label: 'Mobile',
        icon: <Smartphone className="h-3 w-3" />,
        desc: 'Mobile user agents',
    },
    {
        id: 'Tablet',
        label: 'Tablet',
        icon: <Tablet className="h-3 w-3" />,
        desc: 'Tablet user agents',
    },
];

const DEVICE_BADGE_STYLES: Record<string, string> = {
    Desktop: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300',
    Mobile: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
    Tablet: 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300',
};

function UACard({
    entry,
    idx,
    copied,
    onCopy,
    expanded,
    onToggle,
}: {
    entry: ParsedEntry;
    idx: number;
    copied: boolean;
    onCopy: () => void;
    expanded: boolean;
    onToggle: () => void;
}) {
    const { info, ua } = entry;
    const deviceStyle = DEVICE_BADGE_STYLES[info.device.type] || '';

    return (
        <div className="rounded-lg border transition-colors hover:border-border/80">
            <Button
                variant="ghost"
                onClick={onToggle}
                className="flex items-start gap-3 w-full px-3 py-2.5 h-auto text-left justify-start"
            >
                <span className="shrink-0 mt-0.5 text-muted-foreground">
                    {expanded ? (
                        <ChevronDown className="h-3.5 w-3.5" />
                    ) : (
                        <ChevronRight className="h-3.5 w-3.5" />
                    )}
                </span>
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                        <Badge variant="outline" className="text-[10px] font-mono px-1.5">
                            #{idx + 1}
                        </Badge>
                        <Badge className={`text-[10px] gap-0.5 px-1.5 ${deviceStyle}`}>
                            {info.device.type === 'Desktop' && <Monitor className="h-2.5 w-2.5" />}
                            {info.device.type === 'Mobile' && (
                                <Smartphone className="h-2.5 w-2.5" />
                            )}
                            {info.device.type === 'Tablet' && <Tablet className="h-2.5 w-2.5" />}
                            {info.device.type}
                        </Badge>
                        <span className="text-xs font-medium">{info.browser.name}</span>
                        {info.browser.version && (
                            <span className="text-[11px] text-muted-foreground">
                                {info.browser.version.split('.')[0]}
                            </span>
                        )}
                        <span className="text-[11px] text-muted-foreground">·</span>
                        <span className="text-[11px] text-muted-foreground">
                            {info.os.name}
                            {info.os.version ? ` ${info.os.version.split(' ')[0]}` : ''}
                        </span>
                        {info.isBot && (
                            <Badge variant="destructive" className="text-[10px] gap-0.5 px-1.5">
                                <Bot className="h-2.5 w-2.5" />
                                Bot
                            </Badge>
                        )}
                    </div>
                    <p className="font-mono text-[11px] text-muted-foreground truncate">{ua}</p>
                </div>
                <Button
                    variant="ghost"
                    size="icon-xs"
                    className="shrink-0 mt-0.5"
                    onClick={(e) => {
                        e.stopPropagation();
                        onCopy();
                    }}
                >
                    {copied ? (
                        <Check className="h-3 w-3 text-green-500" />
                    ) : (
                        <Copy className="h-3 w-3" />
                    )}
                </Button>
            </Button>

            {expanded && (
                <div className="px-3 pb-3 pl-9">
                    <div className="rounded-md border bg-muted/20 p-3">
                        <div className="grid gap-2 sm:grid-cols-3">
                            <div>
                                <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                                    Browser
                                </span>
                                <p className="text-xs font-medium mt-0.5">{info.browser.name}</p>
                                <p className="text-[11px] text-muted-foreground">
                                    v{info.browser.version || 'Unknown'} · {info.browser.engine}
                                </p>
                            </div>
                            <div>
                                <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                                    Operating System
                                </span>
                                <p className="text-xs font-medium mt-0.5">{info.os.name}</p>
                                <p className="text-[11px] text-muted-foreground">
                                    {info.os.version || 'Unknown'}
                                    {info.os.architecture && info.os.architecture !== 'Unknown'
                                        ? ` · ${info.os.architecture}`
                                        : ''}
                                </p>
                            </div>
                            <div>
                                <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                                    Device
                                </span>
                                <p className="text-xs font-medium mt-0.5">{info.device.type}</p>
                                <p className="text-[11px] text-muted-foreground">
                                    {[info.device.brand, info.device.model]
                                        .filter(Boolean)
                                        .join(' · ') || 'Unknown'}
                                </p>
                            </div>
                        </div>
                        <div className="mt-2 pt-2 border-t">
                            <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                                Full User Agent
                            </span>
                            <p className="font-mono text-[11px] text-muted-foreground mt-0.5 break-all leading-relaxed">
                                {ua}
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

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
                    <RechartsTooltip
                        contentStyle={{
                            fontSize: 11,
                            borderRadius: 8,
                            border: '1px solid hsl(var(--border))',
                            backgroundColor: 'hsl(var(--popover))',
                            color: 'hsl(var(--popover-foreground))',
                        }}
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
                            {d.value}
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

export default function StatsTab({ readOnly }: TabComponentProps) {
    const { resolvedTheme } = useTheme();
    const isDark = resolvedTheme === 'dark';
    const colors = isDark ? CHART_COLORS_DARK : CHART_COLORS;
    const [search, setSearch] = useState('');
    const [deviceFilter, setDeviceFilter] = useState<DeviceFilter>('all');
    const [copiedIdx, setCopiedIdx] = useState<number | null>(null);
    const [expandedIdx, setExpandedIdx] = useState<number | null>(null);
    const [overviewOpen, setOverviewOpen] = useState(false);
    const [page, setPage] = useState(0);
    const { copy } = useClipboard();

    const parsed: ParsedEntry[] = useMemo(
        () => (rawUserAgents as string[]).map((ua) => ({ ua, info: parseUserAgent(ua) })),
        [],
    );

    const filtered = useMemo(() => {
        let result = parsed;
        if (deviceFilter !== 'all') {
            result = result.filter((e) => e.info.device.type === deviceFilter);
        }
        if (search.trim()) {
            const q = search.toLowerCase();
            result = result.filter(
                (e) =>
                    e.ua.toLowerCase().includes(q) ||
                    e.info.browser.name.toLowerCase().includes(q) ||
                    e.info.os.name.toLowerCase().includes(q) ||
                    e.info.device.brand.toLowerCase().includes(q) ||
                    e.info.device.model.toLowerCase().includes(q) ||
                    e.info.browser.engine.toLowerCase().includes(q),
            );
        }
        return result;
    }, [parsed, deviceFilter, search]);

    const counts = useMemo(() => {
        const all = search.trim()
            ? parsed.filter((e) => {
                  const q = search.toLowerCase();
                  return (
                      e.ua.toLowerCase().includes(q) ||
                      e.info.browser.name.toLowerCase().includes(q)
                  );
              })
            : parsed;
        const map: Record<string, number> = { all: all.length };
        for (const e of all) {
            const t = e.info.device.type;
            map[t] = (map[t] || 0) + 1;
        }
        return map;
    }, [parsed, search]);

    const browserData = useMemo(
        () => toChartData(countBy(parsed, (e) => e.info.browser.name)),
        [parsed],
    );
    const osData = useMemo(() => toChartData(countBy(parsed, (e) => e.info.os.name)), [parsed]);
    const deviceData = useMemo(
        () => toChartData(countBy(parsed, (e) => e.info.device.type)),
        [parsed],
    );

    const handleCopy = useCallback(
        async (ua: string, idx: number) => {
            await copy(ua);
            setCopiedIdx(idx);
            setTimeout(() => setCopiedIdx(null), 1500);
        },
        [copy],
    );

    const paged = filtered.slice(0, (page + 1) * PAGE_SIZE);
    const hasMore = filtered.length > (page + 1) * PAGE_SIZE;

    return (
        <ToolTabWrapper>
            <div className="flex flex-col gap-4 py-4">
                <div className="flex items-center gap-2">
                    <Database className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Sample Data</span>
                    <Badge variant="outline" className="text-[10px] font-mono">
                        {parsed.length} user agents
                    </Badge>
                    <span className="text-[11px] text-muted-foreground ml-1">from BrowserDNA</span>
                </div>

                <div className="flex flex-col gap-3">
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-start">
                        <div className="relative flex-1">
                            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                            <Input
                                value={search}
                                onChange={(e) => {
                                    setSearch(e.target.value);
                                    setPage(0);
                                }}
                                placeholder="Search by browser, OS, device, engine, or UA string..."
                                className="h-8 pl-8 text-xs"
                                spellCheck={false}
                                readOnly={readOnly}
                            />
                        </div>
                        <div className="flex gap-1 shrink-0 flex-wrap">
                            {DEVICE_FILTERS.map((f) => {
                                const isActive = deviceFilter === f.id;
                                return (
                                    <Tooltip key={f.id}>
                                        <TooltipTrigger asChild>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => {
                                                    setDeviceFilter(f.id);
                                                    setPage(0);
                                                }}
                                                className={`h-auto px-2 py-1 text-[11px] font-medium gap-1 ${
                                                    isActive
                                                        ? 'border-primary/50 bg-primary/10 text-primary hover:bg-primary/15'
                                                        : 'text-muted-foreground hover:bg-muted/50'
                                                }`}
                                            >
                                                {f.icon}
                                                {f.id === 'all'
                                                    ? `All (${counts.all ?? 0})`
                                                    : `${f.label} (${counts[f.id] ?? 0})`}
                                            </Button>
                                        </TooltipTrigger>
                                        <TooltipContent>{f.desc}</TooltipContent>
                                    </Tooltip>
                                );
                            })}
                        </div>
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
                                        <Globe className="h-3 w-3" />
                                        Browsers
                                    </h4>
                                    <MiniBarChart data={browserData.slice(0, 8)} colors={colors} />
                                </div>
                                <div>
                                    <h4 className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                                        <Layers className="h-3 w-3" />
                                        Operating Systems
                                    </h4>
                                    <MiniBarChart data={osData.slice(0, 8)} colors={colors} />
                                </div>
                                <div>
                                    <h4 className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                                        <Monitor className="h-3 w-3" />
                                        Device Types
                                    </h4>
                                    <MiniDonut data={deviceData} colors={colors} />
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {filtered.length > 0 ? (
                    <div className="flex flex-col gap-1.5">
                        {paged.map((entry, idx) => (
                            <UACard
                                key={idx}
                                entry={entry}
                                idx={idx}
                                copied={copiedIdx === idx}
                                onCopy={() => handleCopy(entry.ua, idx)}
                                expanded={expandedIdx === idx}
                                onToggle={() => setExpandedIdx(expandedIdx === idx ? null : idx)}
                            />
                        ))}
                        {hasMore && (
                            <Button
                                variant="outline"
                                className="w-full py-2 h-auto text-xs font-medium text-muted-foreground"
                                onClick={() => setPage(page + 1)}
                            >
                                Load more ({filtered.length - (page + 1) * PAGE_SIZE} remaining)
                            </Button>
                        )}
                        <div className="mt-1 text-[11px] text-muted-foreground text-right">
                            Showing {Math.min((page + 1) * PAGE_SIZE, filtered.length)} of{' '}
                            {filtered.length} user agents
                        </div>
                    </div>
                ) : (
                    <div className="h-48 flex flex-col items-center justify-center rounded-lg border p-8 text-center">
                        <Search className="h-10 w-10 text-muted-foreground/40 mb-3" />
                        <p className="text-sm font-medium text-muted-foreground">
                            No matching user agents
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
