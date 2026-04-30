'use client';

import { useState, useMemo, useCallback } from 'react';
import { ToolTabWrapper } from '../../core/components/tool-tab-wrapper';
import { useClipboard } from '@/lib/hooks/use-clipboard';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import {
    ShieldAlert,
    Copy,
    Check,
    AlertTriangle,
    Info,
    ShieldCheck,
    X,
} from 'lucide-react';
import type { TabComponentProps } from '../../core/types/tool';
import rawWords from '../data/words.json';

type SpamWord = { word: string; category: string; length: number };

export default function CheckerTab({ readOnly }: TabComponentProps) {
    const [input, setInput] = useState('');
    const [copied, setCopied] = useState(false);
    const { copy } = useClipboard();

    const spamWords = rawWords as SpamWord[];

    const matches = useMemo(() => {
        if (!input.trim()) return [];
        const inputLower = input.toLowerCase();
        const found: { word: string; category: string; count: number }[] = [];
        for (const sw of spamWords) {
            const regex = new RegExp('\\b' + sw.word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replace(/%/g, '\\d*%?') + '\\b', 'gi');
            const matchCount = (inputLower.match(regex) || []).length;
            if (matchCount > 0) {
                found.push({ word: sw.word, category: sw.category, count: matchCount });
            }
        }
        return found.sort((a, b) => b.count - a.count);
    }, [input, spamWords]);

    const totalHits = useMemo(() => matches.reduce((sum, m) => sum + m.count, 0), [matches]);

    const riskLevel = useMemo(() => {
        if (matches.length === 0) return 'none';
        if (matches.length >= 10 || totalHits >= 15) return 'high';
        if (matches.length >= 5 || totalHits >= 8) return 'medium';
        return 'low';
    }, [matches.length, totalHits]);

    const handleCopy = useCallback(async () => {
        if (!input) return;
        await copy(input);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
    }, [copy, input]);

    const handleClear = useCallback(() => setInput(''), []);

    const categoryCounts = useMemo(() => {
        const counts: Record<string, number> = {};
        for (const m of matches) {
            counts[m.category] = (counts[m.category] || 0) + m.count;
        }
        return Object.entries(counts).sort((a, b) => b[1] - a[1]);
    }, [matches]);

    const hasInput = input.trim().length > 0;

    const riskConfig = {
        none: { label: 'Clean', color: 'text-green-600 dark:text-green-400', bg: 'border-green-500/30 bg-green-500/5', icon: ShieldCheck },
        low: { label: 'Low Risk', color: 'text-blue-600 dark:text-blue-400', bg: 'border-blue-500/30 bg-blue-500/5', icon: Info },
        medium: { label: 'Medium Risk', color: 'text-amber-600 dark:text-amber-400', bg: 'border-amber-500/30 bg-amber-500/5', icon: AlertTriangle },
        high: { label: 'High Risk', color: 'text-destructive', bg: 'border-destructive/30 bg-destructive/5', icon: ShieldAlert },
    };

    const currentRisk = riskConfig[riskLevel];
    const RiskIcon = currentRisk.icon;

    return (
        <ToolTabWrapper>
            <div className="flex flex-col gap-4 py-4">
                <div className="relative">
                    <Textarea
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Paste your email content, subject line, or marketing copy to check for spam trigger words..."
                        className="min-h-[160px] font-mono text-sm resize-y pr-20"
                        spellCheck={false}
                        readOnly={readOnly}
                        autoComplete="off"
                    />
                    <div className="absolute right-2 top-2 flex flex-col gap-1">
                        {input && (
                            <>
                                <Button variant="ghost" size="icon-xs" onClick={handleCopy}>
                                    {copied ? (
                                        <Check className="h-3.5 w-3.5 text-green-500" />
                                    ) : (
                                        <Copy className="h-3.5 w-3.5" />
                                    )}
                                </Button>
                                <Button variant="ghost" size="icon-xs" onClick={handleClear}>
                                    <X className="h-3.5 w-3.5" />
                                </Button>
                            </>
                        )}
                    </div>
                </div>

                {hasInput ? (
                    <div className="flex flex-col gap-4">
                        <div className={`rounded-lg border p-4 ${currentRisk.bg}`}>
                            <div className="flex items-start gap-3">
                                <RiskIcon className={`h-5 w-5 shrink-0 mt-0.5 ${currentRisk.color}`} />
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <span className="text-sm font-semibold">
                                            {currentRisk.label}
                                        </span>
                                        <Badge
                                            className={`text-[10px] ${
                                                riskLevel === 'high'
                                                    ? 'bg-destructive/10 text-destructive'
                                                    : riskLevel === 'medium'
                                                      ? 'bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300'
                                                      : riskLevel === 'low'
                                                        ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
                                                        : 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
                                            }`}
                                        >
                                            {matches.length} word{matches.length !== 1 ? 's' : ''} found
                                        </Badge>
                                    </div>
                                    <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                                        <span>
                                            Unique triggers:{' '}
                                            <span className="font-mono font-medium text-foreground">
                                                {matches.length}
                                            </span>
                                        </span>
                                        <span>
                                            Total occurrences:{' '}
                                            <span className="font-mono font-medium text-foreground">
                                                {totalHits}
                                            </span>
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {matches.length > 0 && (
                            <>
                                <div className="flex items-start gap-2.5 rounded-lg border border-amber-200 bg-amber-50 dark:border-amber-900 dark:bg-amber-950/30 p-3">
                                    <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                                    <div className="text-xs text-amber-700 dark:text-amber-300 leading-relaxed">
                                        <span className="font-medium">
                                            Your content contains common spam trigger words.
                                        </span>{' '}
                                        Email filters often penalize messages with these terms.
                                        Consider rephrasing to improve deliverability.
                                    </div>
                                </div>

                                {categoryCounts.length > 0 && (
                                    <div className="flex flex-col gap-2">
                                        <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                                            By category
                                        </span>
                                        <div className="flex flex-wrap gap-1.5">
                                            {categoryCounts.map(([cat, count]) => (
                                                <Badge
                                                    key={cat}
                                                    variant="outline"
                                                    className="text-[11px] px-2 py-0.5"
                                                >
                                                    {cat}{' '}
                                                    <span className="ml-1 font-mono text-muted-foreground">
                                                        ({count})
                                                    </span>
                                                </Badge>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                <div className="flex flex-col gap-1">
                                    <div className="grid grid-cols-[1fr_100px_64px] gap-2 px-3 py-1.5 text-[10px] font-mono uppercase tracking-wider text-muted-foreground border-b">
                                        <span>Trigger Word</span>
                                        <span>Category</span>
                                        <span>Hits</span>
                                    </div>
                                    {matches.map((m) => (
                                        <div
                                            key={m.word}
                                            className="grid grid-cols-[1fr_100px_64px] gap-2 items-center px-3 py-1.5 border-b last:border-0 hover:bg-muted/30 transition-colors"
                                        >
                                            <code className="font-mono text-xs font-medium text-destructive">
                                                {m.word}
                                            </code>
                                            <Badge
                                                variant="outline"
                                                className="text-[10px] px-1.5 py-0 w-fit"
                                            >
                                                {m.category}
                                            </Badge>
                                            <span className="text-[11px] text-muted-foreground tabular-nums font-mono">
                                                {m.count}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </>
                        )}

                        {matches.length === 0 && (
                            <div className="flex items-start gap-2.5 rounded-lg border border-green-200 bg-green-50 dark:border-green-900 dark:bg-green-950/30 p-3">
                                <ShieldCheck className="h-4 w-4 text-green-600 dark:text-green-400 shrink-0 mt-0.5" />
                                <div className="text-xs text-green-700 dark:text-green-300 leading-relaxed">
                                    <span className="font-medium">
                                        No spam trigger words detected.
                                    </span>{' '}
                                    Your content appears clean of common spam triggers. Keep in mind
                                    this checks against a fixed list and does not guarantee inbox
                                    placement.
                                </div>
                            </div>
                        )}

                        <div className="flex items-start gap-2.5 rounded-lg border bg-muted/30 p-3">
                            <Info className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                            <div className="text-xs text-muted-foreground leading-relaxed">
                                Database contains{' '}
                                <span className="font-mono font-medium">{spamWords.length}</span>{' '}
                                known spam trigger words across{' '}
                                <span className="font-mono font-medium">
                                    {new Set(spamWords.map((w) => w.category)).size}
                                </span>{' '}
                                categories. The check is performed entirely in your browser.
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="h-48 flex flex-col items-center justify-center rounded-lg border p-8 text-center">
                        <ShieldAlert className="h-10 w-10 text-muted-foreground/40 mb-3" />
                        <p className="text-sm font-medium text-muted-foreground">
                            Check your content for spam trigger words
                        </p>
                        <p className="text-xs text-muted-foreground/60 mt-1">
                            Paste email content, subject lines, or marketing copy to find words that
                            may trigger spam filters
                        </p>
                    </div>
                )}
            </div>
        </ToolTabWrapper>
    );
}
