'use client';

import { useState, useCallback } from 'react';
import { useToolActions } from '../../core/hooks/use-tool-actions';
import { ToolTabWrapper } from '../../core/components/tool-tab-wrapper';
import { ShareSidebarModal } from '../../core/plugins/share-sidebar';
import { STORAGE_KEYS } from '@/lib/utils/constants';
import { useLocalStorage } from '@/lib/hooks/use-local-storage';
import { useClipboard } from '@/lib/hooks/use-clipboard';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Search, Globe, Copy, Loader2, Server, Clock, AlertCircle, Download } from 'lucide-react';
import { EmptyStateCard } from '@/components/ui/empty-state-card';
import { apiClient } from '@/lib/api/client';
import type { TabComponentProps } from '../../core/types/tool';

const RECORD_TYPES = [
    { value: 'NS', label: 'NS', description: 'Nameserver' },
    { value: 'A', label: 'A', description: 'IPv4 Address' },
    { value: 'AAAA', label: 'AAAA', description: 'IPv6 Address' },
    { value: 'MX', label: 'MX', description: 'Mail Exchange' },
    { value: 'TXT', label: 'TXT', description: 'Text Record' },
    { value: 'CNAME', label: 'CNAME', description: 'Canonical Name' },
    { value: 'SOA', label: 'SOA', description: 'Start of Authority' },
    { value: 'PTR', label: 'PTR', description: 'Pointer (Reverse DNS)' },
];

interface NormalizedRecord {
    value: string;
    priority?: number;
    additional?: Record<string, string | number>;
}

interface DnsResult {
    domain: string;
    type: string;
    records: NormalizedRecord[];
    dnsServer: string;
    queryTime: number;
}

export default function LookupTab({ readOnly }: TabComponentProps) {
    const [domain, setDomain] = useLocalStorage(STORAGE_KEYS.NSLOOKUP_DOMAIN, '');
    const [recordType, setRecordType] = useLocalStorage(STORAGE_KEYS.NSLOOKUP_TYPE, 'NS');
    const [results, setResults] = useState<DnsResult | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [shareOpen, setShareOpen] = useState(false);
    const { copy } = useClipboard();

    const handleLookup = useCallback(async () => {
        const trimmed = domain.trim();
        if (!trimmed) return;
        setIsLoading(true);
        setError(null);
        setResults(null);

        try {
            const res = await apiClient.get<DnsResult>(
                `/api/dns/lookup?domain=${encodeURIComponent(trimmed)}&type=${recordType}`,
            );
            if (!res.ok || !res.data) {
                setError(res.error?.message ?? 'Lookup failed');
                return;
            }
            setResults(res.data);
        } catch {
            setError('Failed to perform DNS lookup');
        } finally {
            setIsLoading(false);
        }
    }, [domain, recordType]);

    const handleClear = useCallback(() => {
        setDomain('');
        setRecordType('NS');
        setResults(null);
        setError(null);
    }, [setDomain, setRecordType]);

    const handleKeyDown = useCallback(
        (e: React.KeyboardEvent) => {
            if (e.key === 'Enter' && !readOnly) handleLookup();
        },
        [handleLookup, readOnly],
    );

    const handleCopyAll = useCallback(() => {
        if (!results) return;
        const lines = results.records.map((r) => {
            let line = r.value;
            if (r.priority !== undefined) line = `${r.priority} ${r.value}`;
            return line;
        });
        copy(lines.join('\n'), 'Records copied');
    }, [results, copy]);

    const handleExportJson = useCallback(() => {
        if (!results) return;
        const blob = new Blob([JSON.stringify(results, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `dns-${results.type}-${results.domain}.json`;
        a.click();
        URL.revokeObjectURL(url);
    }, [results]);

    const { actions } = useToolActions({
        pageName: 'nslookup',
        tabId: 'lookup',
        getContent: () => domain,
        onClear: handleClear,
        shareDialogOpen: shareOpen,
        setShareDialogOpen: setShareOpen,
        readOnly,
    });

    const renderResults = () => {
        if (isLoading) {
            return (
                <div className="flex flex-col items-center justify-center gap-3 py-16">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">
                        Resolving {recordType} records for {domain}...
                    </p>
                </div>
            );
        }

        if (error) {
            return (
                <div className="flex flex-col items-center justify-center gap-3 rounded-lg border border-destructive/20 bg-destructive/5 py-12">
                    <AlertCircle className="h-8 w-8 text-destructive" />
                    <p className="text-sm font-medium text-destructive">{error}</p>
                </div>
            );
        }

        if (!results) {
            return (
                <EmptyStateCard
                    icon={Globe}
                    title="DNS Lookup Results"
                    description="Enter a domain name and click Lookup to query DNS records"
                />
            );
        }

        if (results.records.length === 0) {
            return (
                <EmptyStateCard
                    icon={Globe}
                    title="No records found"
                    description={`No ${results.type} records found for ${results.domain}`}
                />
            );
        }

        const typeInfo = RECORD_TYPES.find((t) => t.value === results.type);

        return (
            <div className="flex flex-col gap-3">
                <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                        <Globe className="h-3.5 w-3.5" />
                        {results.domain}
                    </span>
                    <Badge variant="secondary" className="text-[10px]">
                        {results.type}
                        {typeInfo && ` — ${typeInfo.description}`}
                    </Badge>
                    <span className="flex items-center gap-1">
                        <Server className="h-3.5 w-3.5" />
                        {results.dnsServer}
                    </span>
                    <span className="flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5" />
                        {results.queryTime}ms
                    </span>
                    <span className="ml-auto text-[10px]">{results.records.length} record(s)</span>
                </div>

                <div className="overflow-hidden rounded-lg border">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b bg-muted/40">
                                <th className="px-4 py-2.5 text-left text-xs font-semibold text-muted-foreground">
                                    #
                                </th>
                                {results.type === 'MX' && (
                                    <th className="px-4 py-2.5 text-left text-xs font-semibold text-muted-foreground">
                                        Priority
                                    </th>
                                )}
                                <th className="px-4 py-2.5 text-left text-xs font-semibold text-muted-foreground">
                                    Value
                                </th>
                                {results.type === 'SOA' && (
                                    <th className="px-4 py-2.5 text-left text-xs font-semibold text-muted-foreground">
                                        Details
                                    </th>
                                )}
                                <th className="w-10 px-2 py-2.5" />
                            </tr>
                        </thead>
                        <tbody>
                            {results.records.map((record, i) => (
                                <tr
                                    key={i}
                                    className="border-b last:border-0 hover:bg-muted/30 transition-colors"
                                >
                                    <td className="px-4 py-3 font-mono text-xs text-muted-foreground">
                                        {i + 1}
                                    </td>
                                    {record.priority !== undefined && (
                                        <td className="px-4 py-3 font-mono text-xs">
                                            {record.priority}
                                        </td>
                                    )}
                                    <td className="px-4 py-3 font-mono text-xs break-all">
                                        {record.value}
                                    </td>
                                    {results.type === 'SOA' && record.additional && (
                                        <td className="px-4 py-3 text-xs text-muted-foreground">
                                            <div className="flex flex-wrap gap-x-4 gap-y-1">
                                                {Object.entries(record.additional).map(
                                                    ([key, val]) => (
                                                        <span key={key}>
                                                            <span className="text-muted-foreground">
                                                                {key}:
                                                            </span>{' '}
                                                            <span className="font-mono">{val}</span>
                                                        </span>
                                                    ),
                                                )}
                                            </div>
                                        </td>
                                    )}
                                    <td className="px-2 py-3">
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-7 w-7"
                                                    onClick={() => copy(record.value)}
                                                >
                                                    <Copy className="h-3 w-3" />
                                                </Button>
                                            </TooltipTrigger>
                                            <TooltipContent>Copy value</TooltipContent>
                                        </Tooltip>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className="flex justify-end gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        className="gap-1.5 text-xs"
                        onClick={handleCopyAll}
                    >
                        <Copy className="h-3.5 w-3.5" />
                        Copy All
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        className="gap-1.5 text-xs"
                        onClick={handleExportJson}
                    >
                        <Download className="h-3.5 w-3.5" />
                        Export JSON
                    </Button>
                </div>
            </div>
        );
    };

    return (
        <ToolTabWrapper actions={actions}>
            <div className="flex flex-col gap-4 mt-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
                    <div className="flex flex-1 flex-col gap-1.5">
                        <label className="text-xs font-medium text-muted-foreground">Domain</label>
                        <Input
                            value={domain}
                            onChange={(e) => setDomain(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="e.g. example.com"
                            readOnly={readOnly}
                            className="h-9 font-mono text-sm"
                        />
                    </div>
                    <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-medium text-muted-foreground">
                            Record Type
                        </label>
                        <Select
                            value={recordType}
                            onValueChange={setRecordType}
                            disabled={readOnly}
                        >
                            <SelectTrigger className="h-11 w-full font-mono text-sm sm:w-[140px]">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {RECORD_TYPES.map((t) => (
                                    <SelectItem key={t.value} value={t.value}>
                                        <span className="font-mono">{t.label}</span>
                                        <span className="ml-2 text-xs text-muted-foreground">
                                            {t.description}
                                        </span>
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <Button
                        onClick={handleLookup}
                        disabled={isLoading || !domain.trim() || readOnly}
                        className="h-9 gap-1.5 px-6"
                    >
                        {isLoading ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                            <Search className="h-4 w-4" />
                        )}
                        Lookup
                    </Button>
                </div>

                {renderResults()}
            </div>

            <ShareSidebarModal
                open={shareOpen}
                onOpenChange={setShareOpen}
                config={{
                    pageName: 'nslookup',
                    tabName: 'lookup',
                    getState: () => ({ domain, recordType, results }),
                    extraActions: results
                        ? [
                              {
                                  id: 'copy-domain',
                                  label: 'Copy Domain',
                                  icon: Copy,
                                  handler: () => copy(domain),
                              },
                              {
                                  id: 'export-json',
                                  label: 'Export JSON',
                                  icon: Download,
                                  handler: handleExportJson,
                              },
                          ]
                        : [],
                }}
            />
        </ToolTabWrapper>
    );
}
