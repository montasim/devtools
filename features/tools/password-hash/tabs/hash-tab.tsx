'use client';

import { useState, useCallback } from 'react';
import { useToolActions } from '../../core/hooks/use-tool-actions';
import { ToolTabWrapper } from '../../core/components/tool-tab-wrapper';
import { ShareSidebarModal } from '../../core/plugins/share-sidebar';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { useClipboard } from '@/lib/hooks/use-clipboard';
import { Copy, Check, Loader2, ShieldCheck, Lock, Clock } from 'lucide-react';
import {
    hashPassword,
    ALGORITHM_OPTIONS,
    BCRYPT_ROUNDS,
    DEFAULT_BCRYPT_OPTIONS,
    DEFAULT_ARGON2_OPTIONS,
    type PasswordAlgorithm,
    type HashResult,
    type BcryptOptions,
    type Argon2Options,
} from '../utils/password-hash';
import type { TabComponentProps } from '../../core/types/tool';

export default function HashTab({ readOnly }: TabComponentProps) {
    const [password, setPassword] = useState('');
    const [algorithm, setAlgorithm] = useState<PasswordAlgorithm>('bcrypt');
    const [bcryptRounds, setBcryptRounds] = useState(DEFAULT_BCRYPT_OPTIONS.rounds);
    const [argon2Iterations, setArgon2Iterations] = useState(DEFAULT_ARGON2_OPTIONS.iterations);
    const [argon2Mem, setArgon2Mem] = useState(DEFAULT_ARGON2_OPTIONS.memorySize);
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<HashResult | null>(null);
    const [copied, setCopied] = useState(false);
    const [shareOpen, setShareOpen] = useState(false);
    const { copy } = useClipboard();

    const handleHash = useCallback(async () => {
        if (!password) return;
        setLoading(true);
        setResult(null);
        try {
            const bcryptOpts: BcryptOptions = { rounds: bcryptRounds };
            const argon2Opts: Argon2Options = {
                iterations: argon2Iterations,
                memorySize: argon2Mem,
                parallelism: DEFAULT_ARGON2_OPTIONS.parallelism,
                hashLength: DEFAULT_ARGON2_OPTIONS.hashLength,
            };
            const res = await hashPassword(password, algorithm, bcryptOpts, argon2Opts);
            setResult(res);
        } catch (err) {
            setResult({
                algorithm,
                hash: `Error: ${err instanceof Error ? err.message : 'Hashing failed'}`,
                timeMs: 0,
            });
        } finally {
            setLoading(false);
        }
    }, [password, algorithm, bcryptRounds, argon2Iterations, argon2Mem]);

    const handleCopy = useCallback(async () => {
        if (!result) return;
        await copy(result.hash);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
    }, [copy, result]);

    const { actions } = useToolActions({
        pageName: 'password-hash',
        tabId: 'hash',
        getContent: () => password,
        onClear: () => {
            setPassword('');
            setResult(null);
        },
        shareDialogOpen: shareOpen,
        setShareDialogOpen: setShareOpen,
        readOnly,
    });

    const isBcrypt = algorithm === 'bcrypt';

    return (
        <ToolTabWrapper actions={actions}>
            <div className="flex flex-col gap-4 py-4">
                <div className="flex flex-col gap-3 rounded-lg border p-4">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
                        <div className="flex-1 flex flex-col gap-1.5">
                            <Label className="text-xs">Password</Label>
                            <Input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Enter password to hash..."
                                className="h-9 font-mono text-sm"
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') handleHash();
                                }}
                            />
                        </div>
                        <div className="flex flex-col gap-1.5">
                            <Label className="text-xs">Algorithm</Label>
                            <Select
                                value={algorithm}
                                onValueChange={(v) => setAlgorithm(v as PasswordAlgorithm)}
                            >
                                <SelectTrigger className="h-9 w-[140px] text-xs" size="sm">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {ALGORITHM_OPTIONS.map((opt) => (
                                        <SelectItem key={opt.value} value={opt.value}>
                                            {opt.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="flex flex-col gap-1.5">
                            <Label className="text-xs">&nbsp;</Label>
                            <Button
                                onClick={handleHash}
                                disabled={loading || !password}
                                size="sm"
                                className="h-9 px-4 gap-1.5"
                            >
                                {loading ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                    <Lock className="h-4 w-4" />
                                )}
                                Hash
                            </Button>
                        </div>
                    </div>

                    {isBcrypt ? (
                        <div className="flex items-center gap-2">
                            <Label className="text-xs whitespace-nowrap">Rounds</Label>
                            <Select
                                value={String(bcryptRounds)}
                                onValueChange={(v) => setBcryptRounds(Number(v))}
                            >
                                <SelectTrigger className="h-7 w-[70px] text-xs" size="sm">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {BCRYPT_ROUNDS.map((r) => (
                                        <SelectItem key={r} value={String(r)}>
                                            {r}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <span className="text-[10px] text-muted-foreground">
                                Higher = more secure but slower
                            </span>
                        </div>
                    ) : (
                        <div className="flex flex-wrap items-center gap-3">
                            <div className="flex items-center gap-1.5">
                                <Label className="text-xs whitespace-nowrap">Iterations</Label>
                                <Input
                                    type="number"
                                    value={argon2Iterations}
                                    onChange={(e) =>
                                        setArgon2Iterations(Number(e.target.value) || 1)
                                    }
                                    className="h-7 w-[70px] text-xs font-mono"
                                    min={1}
                                    max={100}
                                />
                            </div>
                            <div className="flex items-center gap-1.5">
                                <Label className="text-xs whitespace-nowrap">Memory (KB)</Label>
                                <Input
                                    type="number"
                                    value={argon2Mem}
                                    onChange={(e) => setArgon2Mem(Number(e.target.value) || 1024)}
                                    className="h-7 w-[90px] text-xs font-mono"
                                    min={1024}
                                    step={1024}
                                />
                            </div>
                        </div>
                    )}
                </div>

                {result && (
                    <div className="flex flex-col gap-2">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Badge variant="secondary" className="text-[10px] font-mono">
                                    {
                                        ALGORITHM_OPTIONS.find((a) => a.value === result.algorithm)
                                            ?.label
                                    }
                                </Badge>
                                <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                                    <Clock className="h-3 w-3" />
                                    {result.timeMs}ms
                                </span>
                            </div>
                            <Button
                                variant="outline"
                                size="sm"
                                className="h-7 gap-1.5 text-xs"
                                onClick={handleCopy}
                            >
                                {copied ? (
                                    <Check className="h-3 w-3 text-green-500" />
                                ) : (
                                    <Copy className="h-3 w-3" />
                                )}
                                Copy Hash
                            </Button>
                        </div>
                        <div className="rounded-lg border bg-muted/30 p-4">
                            <code className="block break-all font-mono text-xs leading-relaxed select-all">
                                {result.hash}
                            </code>
                        </div>
                    </div>
                )}

                {!result && !loading && (
                    <div className="flex h-48 flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center">
                        <ShieldCheck className="mb-3 h-10 w-10 text-muted-foreground/40" />
                        <p className="text-sm font-medium text-muted-foreground">
                            Enter a password and click Hash
                        </p>
                        <p className="mt-1 text-xs text-muted-foreground/60">
                            Supports bcrypt and Argon2 (id/i/d) password hashing
                        </p>
                    </div>
                )}
            </div>
            <ShareSidebarModal
                open={shareOpen}
                onOpenChange={setShareOpen}
                config={{
                    pageName: 'password-hash',
                    tabName: 'hash',
                    getState: () => ({ algorithm }),
                    extraActions: result
                        ? [
                              {
                                  id: 'copy-hash',
                                  label: 'Copy Hash',
                                  icon: Copy,
                                  handler: () => copy(result.hash),
                              },
                          ]
                        : [],
                }}
            />
        </ToolTabWrapper>
    );
}
