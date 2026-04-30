'use client';

import { useState, useMemo, useCallback } from 'react';
import { ToolTabWrapper } from '../../core/components/tool-tab-wrapper';
import { useClipboard } from '@/lib/hooks/use-clipboard';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    MailCheck,
    MailX,
    Search,
    Copy,
    Check,
    AlertTriangle,
    ShieldCheck,
    Info,
} from 'lucide-react';
import type { TabComponentProps } from '../../core/types/tool';
import { getDomainFromEmail, checkDomain } from '../utils/email-checker';
import rawDomains from '../data/domains.json';

export default function CheckerTab({ readOnly }: TabComponentProps) {
    const [input, setInput] = useState('');
    const [copied, setCopied] = useState(false);
    const [history, setHistory] = useState<
        { email: string; domain: string; isDisposable: boolean; timestamp: number }[]
    >([]);
    const { copy } = useClipboard();

    const domainSet = useMemo(() => new Set(rawDomains as string[]), []);

    const result = useMemo(() => {
        if (!input.trim()) return null;
        const domain = getDomainFromEmail(input);
        if (!domain) return null;
        return checkDomain(domain, domainSet);
    }, [input, domainSet]);

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
                    isDisposable: result.isDisposable,
                    timestamp: Date.now(),
                },
                ...prev,
            ];
            return next.slice(0, 20);
        });
    }, [input, result]);

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
                            isDisposable: r.isDisposable,
                            timestamp: Date.now(),
                        },
                    ]);
                }
            }
        },
        [domainSet, history.length],
    );

    const hasInput = input.trim().length > 0;

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
                                result.isDisposable
                                    ? 'border-destructive/30 bg-destructive/5'
                                    : 'border-green-500/30 bg-green-500/5'
                            }`}
                        >
                            <div className="flex items-start gap-3">
                                {result.isDisposable ? (
                                    <MailX className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
                                ) : (
                                    <MailCheck className="h-5 w-5 text-green-600 dark:text-green-400 shrink-0 mt-0.5" />
                                )}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <span className="text-sm font-semibold">
                                            {result.isDisposable
                                                ? 'Disposable / Temporary Email'
                                                : 'Not Disposable'}
                                        </span>
                                        <Badge
                                            className={`text-[10px] ${
                                                result.isDisposable
                                                    ? 'bg-destructive/10 text-destructive'
                                                    : 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
                                            }`}
                                        >
                                            {result.isDisposable ? 'HIGH RISK' : 'LOW RISK'}
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

                        {result.isDisposable && (
                            <div className="flex items-start gap-2.5 rounded-lg border border-amber-200 bg-amber-50 dark:border-amber-900 dark:bg-amber-950/30 p-3">
                                <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                                <div className="text-xs text-amber-700 dark:text-amber-300 leading-relaxed">
                                    <span className="font-medium">
                                        This domain is a known disposable email provider.
                                    </span>{' '}
                                    Emails from this domain are typically used for temporary
                                    sign-ups and may indicate fraudulent activity. Consider blocking
                                    or flagging this domain in your registration flow.
                                </div>
                            </div>
                        )}

                        {!result.isDisposable && (
                            <div className="flex items-start gap-2.5 rounded-lg border border-green-200 bg-green-50 dark:border-green-900 dark:bg-green-950/30 p-3">
                                <ShieldCheck className="h-4 w-4 text-green-600 dark:text-green-400 shrink-0 mt-0.5" />
                                <div className="text-xs text-green-700 dark:text-green-300 leading-relaxed">
                                    <span className="font-medium">
                                        This domain is not in the disposable email list.
                                    </span>{' '}
                                    However, this does not guarantee it is a legitimate provider.
                                    Always use additional verification methods for critical
                                    operations.
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
                                known disposable email domains. The check is performed entirely in
                                your browser.
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
                        <MailCheck className="h-10 w-10 text-muted-foreground/40 mb-3" />
                        <p className="text-sm font-medium text-muted-foreground">
                            Check if an email is disposable
                        </p>
                        <p className="text-xs text-muted-foreground/60 mt-1">
                            Enter an email address or domain name to check against our database
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
                                    {entry.isDisposable ? (
                                        <MailX className="h-3.5 w-3.5 text-destructive shrink-0" />
                                    ) : (
                                        <MailCheck className="h-3.5 w-3.5 text-green-500 shrink-0" />
                                    )}
                                    <code className="flex-1 font-mono text-[11px] truncate">
                                        {entry.email}
                                    </code>
                                    <Badge
                                        variant="outline"
                                        className={`text-[10px] px-1.5 py-0 ${
                                            entry.isDisposable
                                                ? 'text-destructive'
                                                : 'text-green-600 dark:text-green-400'
                                        }`}
                                    >
                                        {entry.isDisposable ? 'Disposable' : 'Safe'}
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
