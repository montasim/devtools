'use client';

import { ToolContentSkeleton } from '@/app/(tools)/loading';
import { useState, useCallback, useEffect } from 'react';
import { useToolActions } from '../../core/hooks/use-tool-actions';
import { ToolTabWrapper } from '../../core/components/tool-tab-wrapper';
import { ShareSidebarModal } from '../../core/plugins/share-sidebar';
import { STORAGE_KEYS } from '@/lib/utils/constants';
import { useLocalStorage } from '@/lib/hooks/use-local-storage';
import { useClipboard } from '@/lib/hooks/use-clipboard';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Network, Search, Copy, Loader2, AlertCircle } from 'lucide-react';
import { EmptyStateCard } from '@/components/ui/empty-state-card';
import { analyzeIp } from '../utils/ip-operations';
import type { IpInfo } from '../utils/ip-operations';
import type { TabComponentProps } from '../../core/types/tool';

void ToolContentSkeleton;

const TYPE_COLORS: Record<string, string> = {
    loopback: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
    private: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300',
    apipa: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300',
    multicast: 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300',
    broadcast: 'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300',
    documentation: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
    reserved: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300',
    public: 'bg-sky-100 text-sky-700 dark:bg-sky-900 dark:text-sky-300',
};

interface ResultRowProps {
    label: string;
    value: string;
    mono?: boolean;
}

function ResultRow({ label, value, mono }: ResultRowProps) {
    const { copy } = useClipboard();
    return (
        <tr className="border-b last:border-0 hover:bg-muted/30 transition-colors">
            <td className="px-4 py-2.5 text-xs font-medium text-muted-foreground w-40 align-top">
                {label}
            </td>
            <td className={`px-4 py-2.5 text-xs break-all ${mono ? 'font-mono' : ''}`}>{value}</td>
            <td className="px-2 py-2">
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7"
                            onClick={() => copy(value, 'Copied')}
                        >
                            <Copy className="h-3 w-3" />
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent>Copy value</TooltipContent>
                </Tooltip>
            </td>
        </tr>
    );
}

export default function AnalyzeTab({ readOnly }: TabComponentProps) {
    const [ipInput, setIpInput] = useLocalStorage(STORAGE_KEYS.IP_ANALYZE_INPUT, '');
    const [result, setResult] = useState<IpInfo | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [publicIp, setPublicIp] = useState<string | null>(null);
    const [ipLoading, setIpLoading] = useState(false);
    const [shareOpen, setShareOpen] = useState(false);

    // Fetch user's public IP on mount
    useEffect(() => {
        const controller = new AbortController();
        const signal = controller.signal;

        const fetchPublicIp = async () => {
            setIpLoading(true);
            try {
                const response = await fetch('https://api.ipify.org?format=json', { signal });
                const data = (await response.json()) as { ip: string };
                setPublicIp(data.ip);
            } catch {
                // Silently fail — not critical
            } finally {
                setIpLoading(false);
            }
        };

        fetchPublicIp();

        return () => {
            controller.abort();
        };
    }, []);

    const handleAnalyze = useCallback(() => {
        const trimmed = ipInput.trim();
        if (!trimmed) return;
        setError(null);
        const info = analyzeIp(trimmed);
        if (!info.isValid) {
            setError(info.error ?? 'Invalid IP address');
            setResult(null);
        } else {
            setResult(info);
        }
    }, [ipInput]);

    const handleClear = useCallback(() => {
        setIpInput('');
        setResult(null);
        setError(null);
    }, [setIpInput]);

    const handleKeyDown = useCallback(
        (e: React.KeyboardEvent) => {
            if (e.key === 'Enter' && !readOnly) handleAnalyze();
        },
        [handleAnalyze, readOnly],
    );

    const handleUsePublicIp = useCallback(() => {
        if (publicIp) {
            setIpInput(publicIp);
            setResult(null);
            setError(null);
        }
    }, [publicIp, setIpInput]);

    const { actions } = useToolActions({
        pageName: 'ip',
        tabId: 'analyze',
        getContent: () => ipInput,
        onClear: handleClear,
        shareDialogOpen: shareOpen,
        setShareDialogOpen: setShareOpen,
        readOnly,
    });

    const renderResult = () => {
        if (error) {
            return (
                <div className="flex flex-col items-center justify-center gap-3 rounded-lg border border-destructive/20 bg-destructive/5 py-12">
                    <AlertCircle className="h-8 w-8 text-destructive" />
                    <p className="text-sm font-medium text-destructive">{error}</p>
                </div>
            );
        }

        if (!result) {
            return (
                <EmptyStateCard
                    icon={Network}
                    title="Enter an IP address to analyze"
                    description="Supports IPv4 and IPv6 — paste any address and click Analyze"
                />
            );
        }

        const rows: { label: string; value: string; mono?: boolean }[] = [];

        rows.push({ label: 'IP Address', value: result.address, mono: true });
        rows.push({ label: 'Version', value: result.version === 'ipv4' ? 'IPv4' : 'IPv6' });
        rows.push({ label: 'Type', value: result.typeLabel });

        if (result.version === 'ipv4') {
            rows.push({ label: 'Binary', value: result.binary ?? '', mono: true });
            rows.push({ label: 'Hexadecimal', value: result.hex ?? '', mono: true });
            rows.push({
                label: 'Decimal',
                value: result.decimal !== undefined ? String(result.decimal) : '',
                mono: true,
            });
        }

        if (result.version === 'ipv6') {
            rows.push({ label: 'Expanded', value: result.expanded ?? '', mono: true });
            rows.push({ label: 'Compressed', value: result.compressed ?? '', mono: true });
        }

        const typeColor = TYPE_COLORS[result.type] ?? TYPE_COLORS.public;

        return (
            <div className="flex flex-col gap-3">
                <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="font-mono text-xs">
                        {result.version.toUpperCase()}
                    </Badge>
                    <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${typeColor}`}
                    >
                        {result.typeLabel}
                    </span>
                </div>

                <div className="overflow-hidden rounded-lg border">
                    <table className="w-full text-sm">
                        <tbody>
                            {rows.map((row) => (
                                <ResultRow
                                    key={row.label}
                                    label={row.label}
                                    value={row.value}
                                    mono={row.mono}
                                />
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        );
    };

    return (
        <ToolTabWrapper actions={actions}>
            <div className="flex flex-col gap-4 mt-4">
                {/* Public IP badge */}
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span>Your current public IP:</span>
                    {ipLoading ? (
                        <Loader2 className="h-3 w-3 animate-spin" />
                    ) : publicIp ? (
                        <button
                            type="button"
                            onClick={handleUsePublicIp}
                            disabled={readOnly}
                            className="font-mono font-medium text-foreground underline underline-offset-2 hover:text-primary disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            {publicIp}
                        </button>
                    ) : (
                        <span className="italic">unavailable</span>
                    )}
                </div>

                {/* Input row */}
                <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
                    <div className="flex flex-1 flex-col gap-1.5">
                        <label className="text-xs font-medium text-muted-foreground">
                            IP Address
                        </label>
                        <Input
                            value={ipInput}
                            onChange={(e) => {
                                setIpInput(e.target.value);
                                setResult(null);
                                setError(null);
                            }}
                            onKeyDown={handleKeyDown}
                            placeholder="e.g. 192.168.1.1 or 2001:db8::1"
                            readOnly={readOnly}
                            className="h-9 font-mono text-sm"
                        />
                    </div>
                    <Button
                        onClick={handleAnalyze}
                        disabled={!ipInput.trim() || readOnly}
                        className="h-9 gap-1.5 px-6"
                    >
                        <Search className="h-4 w-4" />
                        Analyze
                    </Button>
                </div>

                {renderResult()}
            </div>

            <ShareSidebarModal
                open={shareOpen}
                onOpenChange={setShareOpen}
                config={{
                    pageName: 'ip',
                    tabName: 'analyze',
                    getState: () => ({ ip: ipInput, result }),
                    extraActions: result
                        ? [
                              {
                                  id: 'copy-ip',
                                  label: 'Copy IP',
                                  icon: Copy,
                                  handler: () => {
                                      navigator.clipboard.writeText(result.address);
                                  },
                              },
                          ]
                        : [],
                }}
            />
        </ToolTabWrapper>
    );
}
