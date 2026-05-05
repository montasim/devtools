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
    Globe,
    Hash,
} from 'lucide-react';
import { MiniBarChart, MiniDonut, useChartColors } from '../charts';
import { DownloadButton } from '../../core/components/download-button';
import { DataTablePagination } from '../../core/components/data-table-pagination';
import type { DomainListProps, DomainListStats } from './types';

type TldFilter = 'all' | 'com' | 'net' | 'other';

const TLD_FILTERS: { id: TldFilter; label: string; desc: string }[] = [
    { id: 'all', label: 'All', desc: 'Show all domains' },
    { id: 'com', label: '.com', desc: 'Only .com domains' },
    { id: 'net', label: '.net', desc: 'Only .net domains' },
    { id: 'other', label: 'Other', desc: 'All other TLDs' },
];

function OverviewSection({ stats, colors }: { stats: DomainListStats; colors: string[] }) {
    const [open, setOpen] = useState(false);

    return (
        <div className="rounded-lg border">
            <Button
                variant="ghost"
                className="flex items-center justify-between w-full px-4 py-2.5 h-auto"
                onClick={() => setOpen(!open)}
            >
                <span className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                    <BarChart3 className="h-3.5 w-3.5" />
                    Overview
                </span>
                {open ? (
                    <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
                ) : (
                    <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
                )}
            </Button>
            {open && (
                <div className="border-t px-4 py-3">
                    <div className="grid gap-4 sm:grid-cols-3">
                        <div>
                            <h4 className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                                <Globe className="h-3 w-3" />
                                Top TLDs
                            </h4>
                            <MiniBarChart
                                data={stats.tldDistribution.slice(0, 10)}
                                colors={colors}
                                xLabel="Domains"
                            />
                        </div>
                        <div>
                            <h4 className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                                <Hash className="h-3 w-3" />
                                Keyword Clusters
                            </h4>
                            <MiniBarChart
                                data={stats.keywordClusters}
                                colors={colors}
                                xLabel="Domains"
                            />
                        </div>
                        <div>
                            <h4 className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                                <Globe className="h-3 w-3" />
                                TLD Distribution
                            </h4>
                            <MiniDonut
                                data={stats.tldDistribution.slice(0, 8)}
                                colors={colors}
                                xLabel="Domains"
                            />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export function DomainListTab({
    readOnly,
    domains,
    stats,
    title,
    downloadFilename,
}: DomainListProps) {
    const { resolvedTheme } = useTheme();
    const colors = useChartColors(resolvedTheme === 'dark');
    const [search, setSearch] = useState('');
    const [tldFilter, setTldFilter] = useState<TldFilter>('all');
    const [copiedIdx, setCopiedIdx] = useState<number | null>(null);
    const [page, setPage] = useState(0);
    const [pageSize, setPageSize] = useState(50);
    const { copy } = useClipboard();

    const allDomains = domains;

    const filtered = useMemo(() => {
        let result = allDomains;
        if (tldFilter === 'com') {
            result = result.filter((d) => d.endsWith('.com'));
        } else if (tldFilter === 'net') {
            result = result.filter((d) => d.endsWith('.net'));
        } else if (tldFilter === 'other') {
            result = result.filter((d) => !d.endsWith('.com') && !d.endsWith('.net'));
        }
        if (search.trim()) {
            const q = search.toLowerCase();
            result = result.filter((d) => d.includes(q));
        }
        return result;
    }, [allDomains, tldFilter, search]);

    const counts = useMemo(() => {
        const base = search.trim()
            ? allDomains.filter((d) => d.includes(search.toLowerCase()))
            : allDomains;
        return {
            all: base.length,
            com: base.filter((d) => d.endsWith('.com')).length,
            net: base.filter((d) => d.endsWith('.net')).length,
            other: base.filter((d) => !d.endsWith('.com') && !d.endsWith('.net')).length,
        };
    }, [allDomains, search]);

    const paged = filtered.slice(page * pageSize, (page + 1) * pageSize);

    const handleCopy = useCallback(
        async (domain: string, idx: number) => {
            await copy(domain);
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
                    <span className="text-sm font-medium">{title}</span>
                    <Badge variant="outline" className="text-[10px] font-mono">
                        {stats.total.toLocaleString()} domains
                    </Badge>
                </div>

                <div className="flex flex-col gap-2 sm:flex-row sm:items-start">
                    <div className="flex gap-1.5">
                        <div className="relative flex-1">
                            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                            <Input
                                value={search}
                                onChange={(e) => {
                                    setSearch(e.target.value);
                                    setPage(0);
                                }}
                                placeholder="Search domains..."
                                className="h-8 pl-8 text-xs"
                                spellCheck={false}
                                readOnly={readOnly}
                            />
                        </div>
                        <DownloadButton
                            data={filtered}
                            columns={[
                                { key: 'domain', label: 'Domain', render: (d) => d },
                                {
                                    key: 'tld',
                                    label: 'TLD',
                                    render: (d) => '.' + d.split('.').pop(),
                                },
                            ]}
                            filename={downloadFilename}
                        />
                    </div>
                    <div className="flex gap-1 shrink-0 flex-wrap">
                        {TLD_FILTERS.map((f) => {
                            const isActive = tldFilter === f.id;
                            return (
                                <Tooltip key={f.id}>
                                    <TooltipTrigger asChild>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => {
                                                setTldFilter(f.id);
                                                setPage(0);
                                            }}
                                            className={`h-auto px-2 py-1.5 text-[11px] font-medium ${
                                                isActive
                                                    ? 'border-primary/50 bg-primary/10 text-primary hover:bg-primary/15'
                                                    : 'text-muted-foreground hover:bg-muted/50'
                                            }`}
                                        >
                                            {f.label} ({counts[f.id] ?? 0})
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>{f.desc}</TooltipContent>
                                </Tooltip>
                            );
                        })}
                    </div>
                </div>

                <OverviewSection stats={stats} colors={colors} />

                {filtered.length > 0 ? (
                    <div className="flex flex-col gap-1">
                        <div className="grid grid-cols-[48px_1fr_80px_32px] gap-2 px-3 py-1.5 text-[10px] font-mono uppercase tracking-wider text-muted-foreground border-b">
                            <span>#</span>
                            <span>Domain</span>
                            <span>TLD</span>
                            <span />
                        </div>
                        <div className="flex flex-col">
                            {paged.map((domain, idx) => {
                                const tld = '.' + domain.split('.').pop();
                                const globalIdx = page * pageSize + idx;
                                return (
                                    <div
                                        key={globalIdx}
                                        className="grid grid-cols-[48px_1fr_80px_32px] gap-2 items-center px-3 py-1.5 border-b last:border-0 hover:bg-muted/30 transition-colors"
                                    >
                                        <span className="text-[11px] text-muted-foreground tabular-nums">
                                            {globalIdx + 1}
                                        </span>
                                        <code className="font-mono text-xs truncate">{domain}</code>
                                        <Badge
                                            variant="outline"
                                            className="text-[10px] px-1.5 py-0 w-fit font-mono"
                                        >
                                            {tld}
                                        </Badge>
                                        <Button
                                            variant="ghost"
                                            size="icon-xs"
                                            className="shrink-0"
                                            onClick={() => handleCopy(domain, idx)}
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
                        <DataTablePagination
                            page={page}
                            total={filtered.length}
                            pageSize={pageSize}
                            onPageChange={setPage}
                            onPageSizeChange={(size) => {
                                setPageSize(size);
                                setPage(0);
                            }}
                        />
                    </div>
                ) : (
                    <div className="h-48 flex flex-col items-center justify-center rounded-lg border p-8 text-center">
                        <Database className="h-10 w-10 text-muted-foreground/40 mb-3" />
                        <p className="text-sm font-medium text-muted-foreground">
                            No matching domains
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
