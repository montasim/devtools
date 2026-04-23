'use client';

import { useState, useCallback } from 'react';
import { useToolActions } from '../../core/hooks/use-tool-actions';
import { ToolTabWrapper } from '../../core/components/tool-tab-wrapper';
import { ShareSidebarModal } from '../../core/plugins/share-sidebar';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { CheckCircle2, XCircle, Loader2, ShieldQuestion, Clock } from 'lucide-react';
import { verifyPassword, detectHashType, type PasswordAlgorithm } from '../utils/password-hash';
import type { TabComponentProps } from '../../core/types/tool';

export default function VerifyTab({ readOnly }: TabComponentProps) {
    const [password, setPassword] = useState('');
    const [hash, setHash] = useState('');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<{ match: boolean; timeMs: number } | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [shareOpen, setShareOpen] = useState(false);

    const detectedType: PasswordAlgorithm | null = hash ? detectHashType(hash) : null;

    const handleVerify = useCallback(async () => {
        if (!password || !hash) return;
        setLoading(true);
        setResult(null);
        setError(null);
        try {
            const res = await verifyPassword(password, hash);
            setResult(res);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Verification failed');
        } finally {
            setLoading(false);
        }
    }, [password, hash]);

    const { actions } = useToolActions({
        pageName: 'password-hash',
        tabId: 'verify',
        getContent: () => `${password}\n${hash}`,
        onClear: () => {
            setPassword('');
            setHash('');
            setResult(null);
            setError(null);
        },
        shareDialogOpen: shareOpen,
        setShareDialogOpen: setShareOpen,
        readOnly,
    });

    return (
        <ToolTabWrapper actions={actions}>
            <div className="flex flex-col gap-4 py-4">
                <div className="flex flex-col gap-3 rounded-lg border p-4">
                    <div className="flex flex-col gap-1.5">
                        <Label className="text-xs">Password</Label>
                        <Input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Enter password to verify..."
                            className="h-9 font-mono text-sm"
                        />
                    </div>
                    <div className="flex flex-col gap-1.5">
                        <div className="flex items-center justify-between">
                            <Label className="text-xs">Hash</Label>
                            {detectedType && (
                                <Badge variant="outline" className="text-[10px] font-mono">
                                    {detectedType}
                                </Badge>
                            )}
                        </div>
                        <Textarea
                            value={hash}
                            onChange={(e) => setHash(e.target.value)}
                            placeholder="$2b$10$... or $argon2id$..."
                            className="min-h-16 font-mono text-xs resize-none"
                            spellCheck={false}
                        />
                    </div>
                    <Button
                        onClick={handleVerify}
                        disabled={loading || !password || !hash}
                        size="sm"
                        className="h-9 px-4 gap-1.5 self-start"
                    >
                        {loading ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                            <ShieldQuestion className="h-4 w-4" />
                        )}
                        Verify
                    </Button>
                </div>

                {error && (
                    <div className="flex items-start gap-3 rounded-lg border border-destructive/50 bg-destructive/5 p-4">
                        <XCircle className="mt-0.5 h-5 w-5 shrink-0 text-destructive" />
                        <div>
                            <p className="text-sm font-medium text-destructive">
                                Verification Error
                            </p>
                            <p className="mt-1 text-xs text-muted-foreground">{error}</p>
                        </div>
                    </div>
                )}

                {result && (
                    <div
                        className={`flex items-center justify-between rounded-lg border p-4 ${
                            result.match
                                ? 'border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950'
                                : 'border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950'
                        }`}
                    >
                        <div className="flex items-center gap-3">
                            {result.match ? (
                                <CheckCircle2 className="h-6 w-6 text-green-600 dark:text-green-400" />
                            ) : (
                                <XCircle className="h-6 w-6 text-red-600 dark:text-red-400" />
                            )}
                            <div>
                                <p
                                    className={`text-sm font-semibold ${
                                        result.match
                                            ? 'text-green-700 dark:text-green-300'
                                            : 'text-red-700 dark:text-red-300'
                                    }`}
                                >
                                    {result.match ? 'Password matches' : 'Password does not match'}
                                </p>
                                <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                                    <Clock className="h-3 w-3" />
                                    Verified in {result.timeMs}ms
                                </span>
                            </div>
                        </div>
                    </div>
                )}

                {!result && !error && !loading && (
                    <div className="flex h-40 flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center">
                        <ShieldQuestion className="mb-3 h-10 w-10 text-muted-foreground/40" />
                        <p className="text-sm font-medium text-muted-foreground">
                            Enter a password and hash to verify
                        </p>
                        <p className="mt-1 text-xs text-muted-foreground/60">
                            Paste a bcrypt or Argon2 hash and the password to check
                        </p>
                    </div>
                )}
            </div>
            <ShareSidebarModal
                open={shareOpen}
                onOpenChange={setShareOpen}
                config={{
                    pageName: 'password-hash',
                    tabName: 'verify',
                    getState: () => ({}),
                    extraActions: [],
                }}
            />
        </ToolTabWrapper>
    );
}
