'use client';

import { useState, useCallback, useMemo } from 'react';
import { useToolActions } from '../../core/hooks/use-tool-actions';
import { ToolTabWrapper } from '../../core/components/tool-tab-wrapper';
import { ShareSidebarModal } from '../../core/plugins/share-sidebar';
import { STORAGE_KEYS } from '@/lib/utils/constants';
import { useLocalStorage } from '@/lib/hooks/use-local-storage';
import { useClipboard } from '@/lib/hooks/use-clipboard';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Copy, KeyRound, Check, Shuffle, RefreshCw } from 'lucide-react';
import {
    generatePasswords,
    evaluateStrength,
    calculateEntropy,
    CHARSETS,
    DEFAULT_CONFIG,
    type PasswordConfig,
} from '../utils/password-operations';
import type { TabComponentProps } from '../../core/types/tool';

export default function GenerateTab({ readOnly }: TabComponentProps) {
    const [config, setConfig] = useLocalStorage<PasswordConfig>(
        STORAGE_KEYS.PASSWORD_CONFIG,
        DEFAULT_CONFIG,
    );
    const [rawResults, setResults] = useLocalStorage<string[]>(STORAGE_KEYS.PASSWORD_RESULTS, []);
    const results = useMemo(() => (Array.isArray(rawResults) ? rawResults : []), [rawResults]);
    const [shareOpen, setShareOpen] = useState(false);
    const [copiedIdx, setCopiedIdx] = useState<number | null>(null);
    const [copiedPrimary, setCopiedPrimary] = useState(false);
    const { copy } = useClipboard();

    const strength = useMemo(
        () => (results.length > 0 ? evaluateStrength(results[0]) : null),
        [results],
    );

    const entropy = useMemo(
        () => (results.length > 0 ? calculateEntropy(results[0]) : 0),
        [results],
    );

    const handleGenerate = useCallback(() => {
        const passwords = generatePasswords(config, 5);
        setResults(passwords);
    }, [config, setResults]);

    const handleClear = useCallback(() => {
        setResults([]);
    }, [setResults]);

    const { actions } = useToolActions({
        pageName: 'password',
        tabId: 'generate',
        getContent: () => results.join('\n'),
        onClear: handleClear,
        shareDialogOpen: shareOpen,
        setShareDialogOpen: setShareOpen,
        readOnly,
    });

    const toggleCharset = useCallback(
        (id: string) => {
            setConfig((prev) => ({
                ...prev,
                charsets: { ...prev.charsets, [id]: !prev.charsets[id] },
            }));
        },
        [setConfig],
    );

    const handleCopyPrimary = useCallback(async () => {
        if (results.length === 0) return;
        await copy(results[0], 'Password copied');
        setCopiedPrimary(true);
        setTimeout(() => setCopiedPrimary(false), 1500);
    }, [results, copy]);

    const handleCopySingle = useCallback(
        async (pw: string, idx: number) => {
            await copy(pw);
            setCopiedIdx(idx);
            setTimeout(() => setCopiedIdx(null), 1500);
        },
        [copy],
    );

    const hasActiveCharset = Object.values(config.charsets).some(Boolean);
    const primary = results[0] ?? '';

    return (
        <ToolTabWrapper
            actions={actions}
            leadingContent={
                <>
                    <Button
                        onClick={handleGenerate}
                        disabled={readOnly || !hasActiveCharset}
                        size="sm"
                        className="h-7 gap-1.5 text-xs"
                    >
                        <Shuffle className="h-3.5 w-3.5" />
                        Generate
                    </Button>
                    {results.length > 0 && (
                        <Button
                            variant="outline"
                            size="sm"
                            className="h-7 gap-1.5 text-xs"
                            onClick={handleGenerate}
                            disabled={readOnly || !hasActiveCharset}
                        >
                            <RefreshCw className="h-3.5 w-3.5" />
                            Refresh
                        </Button>
                    )}
                </>
            }
        >
            <div className="flex flex-col gap-6 md:flex-row">
                <div className="min-w-0 w-full md:w-1/2">
                    <div className="flex flex-col gap-3 mt-2">
                        <Label className="text-sm font-medium text-muted-foreground">
                            Configuration
                        </Label>
                        <div className="flex flex-col gap-3 rounded-lg border p-4">
                            <div className="flex items-center justify-between">
                                <Label className="text-sm font-medium">
                                    Length: {config.length}
                                </Label>
                            </div>
                            <div className="flex items-center gap-3">
                                <input
                                    type="range"
                                    min={4}
                                    max={128}
                                    value={config.length}
                                    onChange={(e) =>
                                        setConfig((prev) => ({
                                            ...prev,
                                            length: Number(e.target.value),
                                        }))
                                    }
                                    className="flex-1 accent-primary"
                                />
                                <span className="w-8 text-right text-xs font-mono text-muted-foreground">
                                    {config.length}
                                </span>
                            </div>
                        </div>

                        <div className="flex flex-col gap-3 rounded-lg border p-4">
                            <Label className="text-sm font-medium">Character Set</Label>
                            <div className="grid grid-cols-2 gap-2">
                                {CHARSETS.map((cs) => (
                                    <label
                                        key={cs.id}
                                        className={`flex items-center gap-2 rounded-md border px-3 py-2 cursor-pointer text-xs transition-colors ${
                                            config.charsets[cs.id]
                                                ? 'border-primary/50 bg-primary/5'
                                                : 'hover:bg-muted/50'
                                        }`}
                                    >
                                        <input
                                            type="checkbox"
                                            checked={config.charsets[cs.id]}
                                            onChange={() => toggleCharset(cs.id)}
                                            className="rounded border-input accent-primary"
                                        />
                                        <span>{cs.label}</span>
                                    </label>
                                ))}
                            </div>
                            {!hasActiveCharset && (
                                <p className="text-xs text-destructive">
                                    Select at least one character set
                                </p>
                            )}
                        </div>
                    </div>
                </div>

                <div className="min-w-0 w-full md:w-1/2">
                    <div className="flex flex-col gap-3">
                        <div className="flex items-center justify-between mt-2">
                            <Label className="text-sm font-medium text-muted-foreground">
                                Generated Password
                            </Label>
                        </div>

                        {primary ? (
                            <div className="flex flex-col gap-3 rounded-lg border p-4">
                                <div className="flex items-center gap-2 rounded-md bg-muted/50 px-3 py-3">
                                    <code className="flex-1 font-mono text-sm break-all select-all">
                                        {primary}
                                    </code>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8 shrink-0"
                                        onClick={handleCopyPrimary}
                                    >
                                        {copiedPrimary ? (
                                            <Check className="h-4 w-4 text-green-500" />
                                        ) : (
                                            <Copy className="h-4 w-4" />
                                        )}
                                    </Button>
                                </div>

                                {strength && (
                                    <div className="flex flex-col gap-1.5">
                                        <div className="flex items-center gap-3">
                                            <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
                                                <div
                                                    className={`h-full rounded-full transition-all duration-300 ${strength.color}`}
                                                    style={{
                                                        width: `${((strength.score + 1) / 5) * 100}%`,
                                                    }}
                                                />
                                            </div>
                                            <span className="text-xs font-medium whitespace-nowrap">
                                                {strength.label}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-x-3 text-[11px] text-muted-foreground">
                                            <span>{entropy} bits entropy</span>
                                            <span>{primary.length} chars</span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="h-[237px] flex flex-col items-center justify-center rounded-lg border p-8 text-center">
                                <KeyRound className="h-10 w-10 text-muted-foreground/40 mb-3" />
                                <p className="text-sm font-medium text-muted-foreground">
                                    No password generated
                                </p>
                                <p className="text-xs text-muted-foreground/60 mt-1">
                                    Configure settings and click Generate
                                </p>
                            </div>
                        )}

                        {results.length > 1 && (
                            <div className="flex flex-col gap-2 mt-1">
                                <div className="flex items-center justify-between">
                                    <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                        Alternatives
                                    </span>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-6 gap-1 text-[11px]"
                                        onClick={() =>
                                            copy(
                                                results.join('\n'),
                                                `${results.length} passwords copied`,
                                            )
                                        }
                                    >
                                        <Copy className="h-3 w-3" />
                                        Copy All
                                    </Button>
                                </div>
                                <div className="flex flex-col gap-1">
                                    {results.slice(1).map((pw, i) => {
                                        const idx = i + 1;
                                        return (
                                            <div
                                                key={`${pw}-${idx}`}
                                                className="group flex items-center gap-2 rounded-md border px-3 py-1.5 transition-colors hover:bg-muted/50"
                                            >
                                                <code className="flex-1 font-mono text-[11px] select-all truncate">
                                                    {pw}
                                                </code>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-5 w-5 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                                                    onClick={() => handleCopySingle(pw, idx)}
                                                >
                                                    {copiedIdx === idx ? (
                                                        <Check className="h-2.5 w-2.5 text-green-500" />
                                                    ) : (
                                                        <Copy className="h-2.5 w-2.5" />
                                                    )}
                                                </Button>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
            <ShareSidebarModal
                open={shareOpen}
                onOpenChange={setShareOpen}
                config={{
                    pageName: 'password',
                    tabName: 'generate',
                    getState: () => ({ results, config }),
                    extraActions:
                        results.length > 0
                            ? [
                                  {
                                      id: 'copy-all',
                                      label: 'Copy All Passwords',
                                      icon: Copy,
                                      handler: () => copy(results.join('\n')),
                                  },
                              ]
                            : [],
                }}
            />
        </ToolTabWrapper>
    );
}
