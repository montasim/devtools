'use client';

import { useState, useMemo, useCallback } from 'react';
import { ToolTabWrapper } from '../../core/components/tool-tab-wrapper';
import { useClipboard } from '@/lib/hooks/use-clipboard';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Search, Copy, Check, Info } from 'lucide-react';
import type { DomainCheckerProps } from './types';

export function DomainCheckerTab({
    readOnly,
    domains,
    checkDomain,
    getDomainFromEmail,
    theme,
}: DomainCheckerProps) {
    const [input, setInput] = useState('');
    const [copied, setCopied] = useState(false);
    const [history, setHistory] = useState<
        { email: string; domain: string; matched: boolean; timestamp: number }[]
    >([]);
    const { copy } = useClipboard();

    const domainSet = useMemo(() => new Set(domains), [domains]);

    const result = useMemo(() => {
        if (!input.trim()) return null;
        const domain = getDomainFromEmail(input);
        if (!domain) return null;
        return checkDomain(domain, domainSet);
    }, [input, domainSet, checkDomain, getDomainFromEmail]);

    const isEmail = useMemo(() => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.trim()), [input]);

    const handleCheck = useCallback(() => {
        if (!input.trim() || !result) return;
        const domain = getDomainFromEmail(input);
        if (!domain) return;
        setHistory((prev) => {
            const next = [
                {
                    email: input.trim(),
                    domain: result.domain,
                    matched: result.matched,
                    timestamp: Date.now(),
                },
                ...prev,
            ];
            return next.slice(0, 20);
        });
    }, [input, result, getDomainFromEmail]);

    const handleCopy = useCallback(async () => {
        if (!input) return;
        await copy(input);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
    }, [copy, input]);

    const handleInputChange = useCallback(
        (val: string) => {
            setInput(val);
            if (history.length === 0 && val.trim()) {
                const domain = getDomainFromEmail(val);
                if (domain) {
                    const r = checkDomain(domain, domainSet);
                    setHistory([
                        {
                            email: val.trim(),
                            domain: r.domain,
                            matched: r.matched,
                            timestamp: Date.now(),
                        },
                    ]);
                }
            }
        },
        [domainSet, history.length, checkDomain, getDomainFromEmail],
    );

    const hasInput = input.trim().length > 0;

    const MatchedIcon = theme.matchedIcon;
    const UnmatchedIcon = theme.unmatchedIcon;
    const MatchedWarningIcon = theme.matchedWarningIcon;
    const UnmatchedInfoIcon = theme.unmatchedInfoIcon;
    const EmptyStateIcon = theme.emptyStateIcon;
    const HistoryMatchedIcon = theme.historyMatchedIcon;
    const HistoryUnmatchedIcon = theme.historyUnmatchedIcon;

    return (
        <ToolTabWrapper>
            <div className="flex flex-col gap-4 py-4">
                <div className="relative">
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        type="text"
                        value={input}
                        onChange={(e) => handleInputChange(e.target.value)}
                        placeholder="Enter an email address or domain to check..."
                        className="h-10 pl-9 pr-20 font-mono text-sm"
                        spellCheck={false}
                        readOnly={readOnly}
                        autoComplete="off"
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') handleCheck();
                        }}
                    />
                    <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-0.5">
                        {input && (
                            <Button variant="ghost" size="icon-xs" onClick={handleCopy}>
                                {copied ? (
                                    <Check className="h-3.5 w-3.5 text-green-500" />
                                ) : (
                                    <Copy className="h-3.5 w-3.5" />
                                )}
                            </Button>
                        )}
                    </div>
                </div>

                {hasInput && result ? (
                    <div className="flex flex-col gap-4">
                        <div
                            className={`rounded-lg border p-4 ${
                                result.matched
                                    ? theme.matchedBorder + ' ' + theme.matchedBg
                                    : theme.unmatchedBorder + ' ' + theme.unmatchedBg
                            }`}
                        >
                            <div className="flex items-start gap-3">
                                {result.matched ? (
                                    <MatchedIcon
                                        className={`h-5 w-5 shrink-0 mt-0.5 ${theme.matchedIconClass}`}
                                    />
                                ) : (
                                    <UnmatchedIcon
                                        className={`h-5 w-5 shrink-0 mt-0.5 ${theme.unmatchedIconClass}`}
                                    />
                                )}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <span className="text-sm font-semibold">
                                            {result.matched
                                                ? theme.matchedTitle
                                                : theme.unmatchedTitle}
                                        </span>
                                        <Badge
                                            className={`text-[10px] ${
                                                result.matched
                                                    ? theme.matchedBadgeClass
                                                    : theme.unmatchedBadgeClass
                                            }`}
                                        >
                                            {result.matched
                                                ? theme.matchedBadge
                                                : theme.unmatchedBadge}
                                        </Badge>
                                    </div>
                                    <div className="flex flex-col gap-1 mt-2">
                                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                            <span className="font-medium text-foreground">
                                                {isEmail ? 'Email' : 'Domain'}
                                            </span>
                                            <code className="font-mono">{input.trim()}</code>
                                        </div>
                                        {isEmail && (
                                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                                <span className="font-medium text-foreground">
                                                    Domain
                                                </span>
                                                <code className="font-mono">{result.domain}</code>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {result.matched && (
                            <div
                                className={`flex items-start gap-2.5 rounded-lg border p-3 ${theme.matchedWarningBorder} ${theme.matchedWarningBg}`}
                            >
                                <MatchedWarningIcon
                                    className={`h-4 w-4 shrink-0 mt-0.5 ${theme.matchedWarningIconClass}`}
                                />
                                <div
                                    className={`text-xs leading-relaxed ${theme.matchedWarningTextClass}`}
                                >
                                    <span className="font-medium">{theme.matchedWarningTitle}</span>{' '}
                                    {theme.matchedWarningText}
                                </div>
                            </div>
                        )}

                        {!result.matched && (
                            <div
                                className={`flex items-start gap-2.5 rounded-lg border p-3 ${theme.unmatchedInfoBorder} ${theme.unmatchedInfoBg}`}
                            >
                                <UnmatchedInfoIcon
                                    className={`h-4 w-4 shrink-0 mt-0.5 ${theme.unmatchedInfoIconClass}`}
                                />
                                <div
                                    className={`text-xs leading-relaxed ${theme.unmatchedInfoTextClass}`}
                                >
                                    <span className="font-medium">{theme.unmatchedInfoTitle}</span>{' '}
                                    {theme.unmatchedInfoText}
                                </div>
                            </div>
                        )}

                        <div className="flex items-start gap-2.5 rounded-lg border bg-muted/30 p-3">
                            <Info className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                            <div className="text-xs text-muted-foreground leading-relaxed">
                                Database contains{' '}
                                <span className="font-mono font-medium">
                                    {domainSet.size.toLocaleString()}
                                </span>{' '}
                                {theme.dbLabel}. The check is performed entirely in your browser.
                            </div>
                        </div>
                    </div>
                ) : hasInput && !isEmail && !input.includes('.') ? (
                    <div className="h-48 flex flex-col items-center justify-center rounded-lg border p-8 text-center">
                        <Search className="h-10 w-10 text-muted-foreground/40 mb-3" />
                        <p className="text-sm font-medium text-muted-foreground">
                            Enter a valid email or domain
                        </p>
                        <p className="text-xs text-muted-foreground/60 mt-1">
                            Type an email like user@example.com or a domain like example.com
                        </p>
                    </div>
                ) : (
                    <div className="h-48 flex flex-col items-center justify-center rounded-lg border p-8 text-center">
                        <EmptyStateIcon className="h-10 w-10 text-muted-foreground/40 mb-3" />
                        <p className="text-sm font-medium text-muted-foreground">
                            {theme.emptyStateTitle}
                        </p>
                        <p className="text-xs text-muted-foreground/60 mt-1">
                            {theme.emptyStateDesc}
                        </p>
                    </div>
                )}

                {history.length > 1 && (
                    <div className="flex flex-col gap-2 mt-2">
                        <div className="flex items-center justify-between">
                            <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                                Recent checks
                            </span>
                            <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 gap-1 text-[11px]"
                                onClick={() => setHistory([])}
                            >
                                Clear
                            </Button>
                        </div>
                        <div className="flex flex-col gap-1">
                            {history.slice(1).map((entry) => (
                                <div
                                    key={entry.timestamp}
                                    className="flex items-center gap-2 rounded-md border px-3 py-1.5 hover:bg-muted/30 transition-colors"
                                >
                                    {entry.matched ? (
                                        <HistoryMatchedIcon
                                            className={`h-3.5 w-3.5 shrink-0 ${theme.historyMatchedIconClass}`}
                                        />
                                    ) : (
                                        <HistoryUnmatchedIcon
                                            className={`h-3.5 w-3.5 shrink-0 ${theme.historyUnmatchedIconClass}`}
                                        />
                                    )}
                                    <code className="flex-1 font-mono text-[11px] truncate">
                                        {entry.email}
                                    </code>
                                    <Badge
                                        variant="outline"
                                        className={`text-[10px] px-1.5 py-0 ${
                                            entry.matched
                                                ? theme.historyMatchedBadgeClass
                                                : theme.historyUnmatchedBadgeClass
                                        }`}
                                    >
                                        {entry.matched
                                            ? theme.historyMatchedLabel
                                            : theme.historyUnmatchedLabel}
                                    </Badge>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </ToolTabWrapper>
    );
}
