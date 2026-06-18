'use client';

import { ToolContentSkeleton } from '@/app/(tools)/loading';
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
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Calculator, Copy, AlertCircle } from 'lucide-react';
import { EmptyStateCard } from '@/components/ui/empty-state-card';
import { parseCidr } from '../utils/ip-operations';
import type { CidrInfo } from '../utils/ip-operations';
import type { TabComponentProps } from '../../core/types/tool';

void ToolContentSkeleton;

const SUBNET_PRESETS = [
    { label: '/8', value: '/8', description: '16.7M hosts' },
    { label: '/16', value: '/16', description: '65K hosts' },
    { label: '/24', value: '/24', description: '254 hosts' },
    { label: '/30', value: '/30', description: '2 hosts' },
];

interface CopyRowProps {
    label: string;
    value: string;
    mono?: boolean;
    highlight?: boolean;
}

function CopyRow({ label, value, mono, highlight }: CopyRowProps) {
    const { copy } = useClipboard();
    return (
        <tr
            className={`border-b last:border-0 transition-colors ${highlight ? 'bg-muted/20' : 'hover:bg-muted/30'}`}
        >
            <td className="px-4 py-2.5 text-xs font-medium text-muted-foreground w-44 align-top">
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

export default function CalculatorTab({ readOnly }: TabComponentProps) {
    const [cidrInput, setCidrInput] = useLocalStorage(STORAGE_KEYS.IP_CIDR_INPUT, '');
    const [result, setResult] = useState<CidrInfo | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [shareOpen, setShareOpen] = useState(false);

    const handleCalculate = useCallback(() => {
        const trimmed = cidrInput.trim();
        if (!trimmed) return;
        setError(null);
        const info = parseCidr(trimmed);
        if (!info.isValid) {
            setError(info.error ?? 'Invalid CIDR notation');
            setResult(null);
        } else {
            setResult(info);
        }
    }, [cidrInput]);

    const handleClear = useCallback(() => {
        setCidrInput('');
        setResult(null);
        setError(null);
    }, [setCidrInput]);

    const handleKeyDown = useCallback(
        (e: React.KeyboardEvent) => {
            if (e.key === 'Enter' && !readOnly) handleCalculate();
        },
        [handleCalculate, readOnly],
    );

    const applyPreset = useCallback(
        (preset: string) => {
            const current = cidrInput.trim();
            // If there's already an IP, replace/append the prefix
            const slashIdx = current.lastIndexOf('/');
            const base = slashIdx !== -1 ? current.slice(0, slashIdx) : current;
            const ip = base || '192.168.1.0';
            setCidrInput(ip + preset);
            setResult(null);
            setError(null);
        },
        [cidrInput, setCidrInput],
    );

    const { actions } = useToolActions({
        pageName: 'ip',
        tabId: 'calculator',
        getContent: () => cidrInput,
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
                    icon={Calculator}
                    title="Enter a CIDR block to calculate"
                    description="e.g. 192.168.1.0/24 — get network details, host ranges, and binary representations"
                />
            );
        }

        return (
            <div className="flex flex-col gap-4">
                {/* Summary badges */}
                <div className="flex flex-wrap gap-2">
                    <Badge variant="secondary" className="font-mono text-xs">
                        {result.cidr}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                        Class {result.ipClass}
                    </Badge>
                    <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                            result.isPrivate
                                ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
                                : 'bg-sky-100 text-sky-700 dark:bg-sky-900 dark:text-sky-300'
                        }`}
                    >
                        {result.isPrivate ? 'Private' : 'Public'}
                    </span>
                    <Badge variant="outline" className="text-xs">
                        /{result.prefixLength}
                    </Badge>
                </div>

                {/* Main results table */}
                <div className="overflow-hidden rounded-lg border">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b bg-muted/40">
                                <th
                                    colSpan={3}
                                    className="px-4 py-2 text-left text-xs font-semibold text-muted-foreground"
                                >
                                    Network Information
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            <CopyRow label="CIDR Notation" value={result.cidr} mono highlight />
                            <CopyRow label="Network Address" value={result.network} mono />
                            <CopyRow label="Broadcast Address" value={result.broadcast} mono />
                            <CopyRow label="First Host" value={result.firstHost} mono />
                            <CopyRow label="Last Host" value={result.lastHost} mono />
                            <CopyRow
                                label="Total Hosts"
                                value={result.totalHosts.toLocaleString()}
                            />
                            <CopyRow
                                label="Usable Hosts"
                                value={result.usableHosts.toLocaleString()}
                            />
                        </tbody>
                    </table>
                </div>

                <div className="overflow-hidden rounded-lg border">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b bg-muted/40">
                                <th
                                    colSpan={3}
                                    className="px-4 py-2 text-left text-xs font-semibold text-muted-foreground"
                                >
                                    Mask & Class
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            <CopyRow label="Subnet Mask" value={result.subnetMask} mono />
                            <CopyRow label="Wildcard Mask" value={result.wildcardMask} mono />
                            <CopyRow label="Prefix Length" value={`/${result.prefixLength}`} mono />
                            <CopyRow label="IP Class" value={result.ipClass} />
                            <CopyRow
                                label="Network (decimal)"
                                value={String(result.networkDecimal)}
                                mono
                            />
                            <CopyRow
                                label="Broadcast (decimal)"
                                value={String(result.broadcastDecimal)}
                                mono
                            />
                        </tbody>
                    </table>
                </div>

                <div className="overflow-hidden rounded-lg border">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b bg-muted/40">
                                <th
                                    colSpan={3}
                                    className="px-4 py-2 text-left text-xs font-semibold text-muted-foreground"
                                >
                                    Binary Representation
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            <CopyRow label="Network (binary)" value={result.binary.network} mono />
                            <CopyRow label="Mask (binary)" value={result.binary.mask} mono />
                        </tbody>
                    </table>
                </div>
            </div>
        );
    };

    return (
        <ToolTabWrapper actions={actions}>
            <div className="flex flex-col gap-4 mt-4">
                {/* Input row */}
                <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
                    <div className="flex flex-1 flex-col gap-1.5">
                        <label className="text-xs font-medium text-muted-foreground">
                            CIDR Notation
                        </label>
                        <Input
                            value={cidrInput}
                            onChange={(e) => {
                                setCidrInput(e.target.value);
                                setResult(null);
                                setError(null);
                            }}
                            onKeyDown={handleKeyDown}
                            placeholder="e.g. 192.168.1.0/24"
                            readOnly={readOnly}
                            className="h-9 font-mono text-sm"
                        />
                    </div>
                    <Button
                        onClick={handleCalculate}
                        disabled={!cidrInput.trim() || readOnly}
                        className="h-9 gap-1.5 px-6"
                    >
                        <Calculator className="h-4 w-4" />
                        Calculate
                    </Button>
                </div>

                {/* Subnet presets */}
                <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs text-muted-foreground">Quick presets:</span>
                    {SUBNET_PRESETS.map((preset) => (
                        <Tooltip key={preset.value}>
                            <TooltipTrigger asChild>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="h-7 px-2.5 text-xs font-mono"
                                    onClick={() => applyPreset(preset.value)}
                                    disabled={readOnly}
                                >
                                    {preset.label}
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>{preset.description}</TooltipContent>
                        </Tooltip>
                    ))}
                </div>

                {renderResult()}
            </div>

            <ShareSidebarModal
                open={shareOpen}
                onOpenChange={setShareOpen}
                config={{
                    pageName: 'ip',
                    tabName: 'calculator',
                    getState: () => ({ cidr: cidrInput, result }),
                    extraActions: result
                        ? [
                              {
                                  id: 'copy-cidr',
                                  label: 'Copy CIDR',
                                  icon: Copy,
                                  handler: () => {
                                      navigator.clipboard.writeText(result.cidr);
                                  },
                              },
                          ]
                        : [],
                }}
            />
        </ToolTabWrapper>
    );
}
