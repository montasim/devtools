'use client';

import { useState, useCallback } from 'react';
import { useToolActions } from '../../core/hooks/use-tool-actions';
import { ToolTabWrapper } from '../../core/components/tool-tab-wrapper';
import { ShareSidebarModal } from '../../core/plugins/share-sidebar';
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
import { Copy, Check, Loader2, KeyRound, ShieldCheck, Clock, FileKey2 } from 'lucide-react';
import {
    generateRsaKeyPair,
    RSA_KEY_SIZES,
    type RsaKeySize,
    type RsaKeyPair,
    type KeyFormat,
} from '../utils/rsa-operations';
import type { TabComponentProps } from '../../core/types/tool';

function KeyBlock({ label, value, badge }: { label: string; value: string; badge?: string }) {
    const { copy } = useClipboard();
    const [copied, setCopied] = useState(false);

    const handleCopy = useCallback(async () => {
        await copy(value);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
    }, [copy, value]);

    return (
        <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <span className="text-xs font-medium text-muted-foreground">{label}</span>
                    {badge && (
                        <Badge variant="outline" className="text-[10px] font-mono">
                            {badge}
                        </Badge>
                    )}
                </div>
                <Button variant="ghost" size="icon-xs" onClick={handleCopy}>
                    {copied ? (
                        <Check className="h-3 w-3 text-green-500" />
                    ) : (
                        <Copy className="h-3 w-3" />
                    )}
                </Button>
            </div>
            <div className="rounded-lg border bg-muted/30 p-3 max-h-[200px] overflow-y-auto">
                <pre className="whitespace-pre-wrap break-all font-mono text-[11px] leading-relaxed select-all">
                    {value}
                </pre>
            </div>
        </div>
    );
}

export default function GenerateTab({ readOnly }: TabComponentProps) {
    const [keySize, setKeySize] = useState<RsaKeySize>(2048);
    const [format, setFormat] = useState<KeyFormat>('pem');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<RsaKeyPair | null>(null);
    const [timeMs, setTimeMs] = useState<number | null>(null);
    const [shareOpen, setShareOpen] = useState(false);
    const { copy } = useClipboard();
    const [copiedAll, setCopiedAll] = useState(false);

    const handleGenerate = useCallback(async () => {
        setLoading(true);
        setResult(null);
        setTimeMs(null);
        const start = performance.now();
        try {
            const keyPair = await generateRsaKeyPair(keySize);
            setResult(keyPair);
            setTimeMs(Math.round(performance.now() - start));
        } catch (err) {
            console.error('Key generation failed:', err);
        } finally {
            setLoading(false);
        }
    }, [keySize]);

    const handleCopyAll = useCallback(async () => {
        if (!result) return;
        const text = `# RSA ${result.keySize}-bit Key Pair\n# Fingerprint (SHA-256): ${result.fingerprint}\n\n# Public Key\n${result.publicKeyPem}\n\n# Private Key\n${result.privateKeyPem}`;
        await copy(text);
        setCopiedAll(true);
        setTimeout(() => setCopiedAll(false), 1500);
    }, [result, copy]);

    const { actions } = useToolActions({
        pageName: 'rsa-key',
        tabId: 'generate',
        getContent: () => (result ? `${result.publicKeyPem}\n${result.privateKeyPem}` : ''),
        onClear: () => setResult(null),
        shareDialogOpen: shareOpen,
        setShareDialogOpen: setShareOpen,
        readOnly,
    });

    const getPublicKey = () =>
        format === 'pem' ? result!.publicKeyPem : result!.publicKeyDerBase64;
    const getPrivateKey = () =>
        format === 'pem' ? result!.privateKeyPem : result!.privateKeyDerBase64;

    return (
        <ToolTabWrapper actions={actions}>
            <div className="flex flex-col gap-4 py-4">
                <div className="flex flex-col gap-3 rounded-lg border p-4">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
                        <div className="flex flex-col gap-1.5">
                            <Label className="text-xs">Key Size</Label>
                            <Select
                                value={String(keySize)}
                                onValueChange={(v) => setKeySize(Number(v) as RsaKeySize)}
                            >
                                <SelectTrigger className="h-9 w-[160px] text-xs" size="sm">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {RSA_KEY_SIZES.map((s) => (
                                        <SelectItem key={s.value} value={String(s.value)}>
                                            {s.label} — {s.description}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="flex flex-col gap-1.5">
                            <Label className="text-xs">Format</Label>
                            <Select value={format} onValueChange={(v) => setFormat(v as KeyFormat)}>
                                <SelectTrigger className="h-9 w-[130px] text-xs" size="sm">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="pem">PEM</SelectItem>
                                    <SelectItem value="der-base64">DER (Base64)</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="flex flex-col gap-1.5">
                            <Label className="text-xs">&nbsp;</Label>
                            <Button
                                onClick={handleGenerate}
                                disabled={loading}
                                size="sm"
                                className="h-9 px-4 gap-1.5"
                            >
                                {loading ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                    <KeyRound className="h-4 w-4" />
                                )}
                                Generate
                            </Button>
                        </div>
                    </div>
                </div>

                {result && (
                    <div className="flex flex-col gap-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Badge variant="secondary" className="text-[10px] font-mono">
                                    {result.keySize}-bit RSA
                                </Badge>
                                <Badge variant="outline" className="text-[10px] font-mono">
                                    SHA-256
                                </Badge>
                                {timeMs !== null && (
                                    <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                                        <Clock className="h-3 w-3" />
                                        {timeMs}ms
                                    </span>
                                )}
                            </div>
                            <Button
                                variant="outline"
                                size="sm"
                                className="h-7 gap-1.5 text-xs"
                                onClick={handleCopyAll}
                            >
                                {copiedAll ? (
                                    <Check className="h-3 w-3 text-green-500" />
                                ) : (
                                    <Copy className="h-3 w-3" />
                                )}
                                Copy Both Keys
                            </Button>
                        </div>

                        <div className="flex flex-col gap-1.5 rounded-lg border bg-muted/20 px-3 py-2">
                            <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                                Fingerprint (SHA-256)
                            </span>
                            <code className="font-mono text-[11px] text-muted-foreground select-all">
                                {result.fingerprint}
                            </code>
                        </div>

                        <KeyBlock
                            label="Public Key"
                            value={getPublicKey()}
                            badge={format === 'pem' ? 'SPKI / PEM' : 'SPKI / DER'}
                        />
                        <KeyBlock
                            label="Private Key"
                            value={getPrivateKey()}
                            badge={format === 'pem' ? 'PKCS#8 / PEM' : 'PKCS#8 / DER'}
                        />
                    </div>
                )}

                {!result && !loading && (
                    <div className="flex h-48 flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center">
                        <FileKey2 className="mb-3 h-10 w-10 text-muted-foreground/40" />
                        <p className="text-sm font-medium text-muted-foreground">
                            Generate an RSA key pair
                        </p>
                        <p className="mt-1 text-xs text-muted-foreground/60">
                            Select a key size and format, then click Generate. Keys are created
                            locally in your browser.
                        </p>
                    </div>
                )}
            </div>
            <ShareSidebarModal
                open={shareOpen}
                onOpenChange={setShareOpen}
                config={{
                    pageName: 'rsa-key',
                    tabName: 'generate',
                    getState: () => ({ keySize, format }),
                    extraActions: result
                        ? [
                              {
                                  id: 'copy-public',
                                  label: 'Copy Public Key',
                                  icon: ShieldCheck,
                                  handler: () => copy(getPublicKey()),
                              },
                              {
                                  id: 'copy-private',
                                  label: 'Copy Private Key',
                                  icon: KeyRound,
                                  handler: () => copy(getPrivateKey()),
                              },
                              {
                                  id: 'copy-all',
                                  label: 'Copy Both Keys',
                                  icon: Copy,
                                  handler: () =>
                                      copy(
                                          `# RSA ${result.keySize}-bit Key Pair\n\n# Public Key\n${result.publicKeyPem}\n\n# Private Key\n${result.privateKeyPem}`,
                                      ),
                              },
                          ]
                        : [],
                }}
            />
        </ToolTabWrapper>
    );
}
