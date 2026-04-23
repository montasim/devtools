'use client';

import { useState, useCallback } from 'react';
import { useToolActions } from '../../core/hooks/use-tool-actions';
import { ToolTabWrapper } from '../../core/components/tool-tab-wrapper';
import { ShareSidebarModal } from '../../core/plugins/share-sidebar';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useClipboard } from '@/lib/hooks/use-clipboard';
import {
    Copy,
    Check,
    Loader2,
    ShieldCheck,
    ShieldAlert,
    FileSearch,
    AlertCircle,
    Fingerprint,
} from 'lucide-react';
import {
    decodeCertificate,
    isLikelyPem,
    type DecodedCert,
    type CertField,
    type CertExtension,
} from '../utils/cert-parser';
import type { TabComponentProps } from '../../core/types/tool';

function FieldRow({ field }: { field: CertField }) {
    const { copy } = useClipboard();
    const [copied, setCopied] = useState(false);
    const handleCopy = useCallback(async () => {
        await copy(field.value);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
    }, [copy, field.value]);

    return (
        <div className="group flex items-start gap-3 rounded-md px-3 py-2 hover:bg-muted/30 transition-colors">
            <span className="shrink-0 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground min-w-[140px] pt-0.5">
                {field.label}
            </span>
            <span className={`flex-1 text-sm break-all ${field.mono ? 'font-mono text-xs' : ''}`}>
                {field.value}
            </span>
            <button
                onClick={handleCopy}
                className="shrink-0 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity mt-0.5"
            >
                {copied ? (
                    <Check className="h-3 w-3 text-green-500" />
                ) : (
                    <Copy className="h-3 w-3" />
                )}
            </button>
        </div>
    );
}

function ExtensionRow({ ext }: { ext: CertExtension }) {
    const { copy } = useClipboard();
    const [copied, setCopied] = useState(false);
    const handleCopy = useCallback(async () => {
        await copy(ext.value);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
    }, [copy, ext.value]);

    return (
        <div className="group flex flex-col gap-1 rounded-md border px-3 py-2.5 hover:bg-muted/30 transition-colors">
            <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                    <span className="text-sm font-medium truncate">{ext.name}</span>
                    {ext.critical && (
                        <Badge variant="destructive" className="text-[9px] px-1.5 py-0">
                            CRITICAL
                        </Badge>
                    )}
                    <span className="text-[10px] text-muted-foreground font-mono">{ext.oid}</span>
                </div>
                <button
                    onClick={handleCopy}
                    className="shrink-0 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity"
                >
                    {copied ? (
                        <Check className="h-3 w-3 text-green-500" />
                    ) : (
                        <Copy className="h-3 w-3" />
                    )}
                </button>
            </div>
            {ext.value && (
                <code className="text-xs font-mono text-muted-foreground break-all leading-relaxed">
                    {ext.value}
                </code>
            )}
        </div>
    );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
    return (
        <div className="flex flex-col gap-2">
            <h3 className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground border-b pb-1.5">
                {title}
            </h3>
            {children}
        </div>
    );
}

export default function DecodeTab({ readOnly }: TabComponentProps) {
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<DecodedCert | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [shareOpen, setShareOpen] = useState(false);
    const { copy } = useClipboard();

    const handleDecode = useCallback(async () => {
        if (!input.trim()) return;
        setLoading(true);
        setResult(null);
        setError(null);
        try {
            if (!isLikelyPem(input)) {
                throw new Error(
                    'Input does not appear to be a PEM-encoded certificate. Expected "-----BEGIN CERTIFICATE-----" header.',
                );
            }
            const cert = await decodeCertificate(input);
            setResult(cert);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to decode certificate');
        } finally {
            setLoading(false);
        }
    }, [input]);

    const { actions } = useToolActions({
        pageName: 'cert-decoder',
        tabId: 'decode',
        getContent: () => input,
        onClear: () => {
            setInput('');
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
                <div className="flex flex-col gap-2">
                    <Textarea
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="-----BEGIN CERTIFICATE-----&#10;Paste your PEM-encoded SSL/TLS certificate here...&#10;-----END CERTIFICATE-----"
                        className="min-h-[140px] font-mono text-xs resize-none"
                        spellCheck={false}
                    />
                    <Button
                        onClick={handleDecode}
                        disabled={loading || !input.trim()}
                        size="sm"
                        className="h-9 px-4 gap-1.5 self-start"
                    >
                        {loading ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                            <FileSearch className="h-4 w-4" />
                        )}
                        Decode Certificate
                    </Button>
                </div>

                {error && (
                    <div className="flex items-start gap-3 rounded-lg border border-destructive/50 bg-destructive/5 p-4">
                        <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-destructive" />
                        <div>
                            <p className="text-sm font-medium text-destructive">Decode Error</p>
                            <p className="mt-1 text-xs text-muted-foreground">{error}</p>
                        </div>
                    </div>
                )}

                {result && (
                    <div className="flex flex-col gap-5">
                        <div className="flex items-center justify-between rounded-lg border p-4">
                            <div className="flex items-center gap-3">
                                {result.isExpired ? (
                                    <ShieldAlert className="h-6 w-6 text-red-600 dark:text-red-400" />
                                ) : (
                                    <ShieldCheck className="h-6 w-6 text-green-600 dark:text-green-400" />
                                )}
                                <div>
                                    <p
                                        className={`text-sm font-semibold ${result.isExpired ? 'text-red-700 dark:text-red-300' : 'text-green-700 dark:text-green-300'}`}
                                    >
                                        {result.isExpired
                                            ? 'Certificate Expired'
                                            : 'Certificate Valid'}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        {result.notBefore} → {result.notAfter} (
                                        {result.validityDays} days)
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <Badge variant="secondary" className="text-[10px] font-mono">
                                    v{result.version}
                                </Badge>
                                <Badge variant="outline" className="text-[10px] font-mono">
                                    {result.signatureAlgorithm}
                                </Badge>
                            </div>
                        </div>

                        <Section title="Subject">
                            {result.subject.map((f, i) => (
                                <FieldRow key={i} field={f} />
                            ))}
                        </Section>

                        <Section title="Issuer">
                            {result.issuer.map((f, i) => (
                                <FieldRow key={i} field={f} />
                            ))}
                        </Section>

                        <Section title="Public Key">
                            <FieldRow
                                field={{ label: 'Algorithm', value: result.publicKeyAlgorithm }}
                            />
                            <FieldRow field={{ label: 'Key Size', value: result.publicKeySize }} />
                        </Section>

                        <Section title="Serial Number">
                            <FieldRow
                                field={{ label: 'Serial', value: result.serialNumber, mono: true }}
                            />
                        </Section>

                        {result.extensions.length > 0 && (
                            <Section title={`Extensions (${result.extensions.length})`}>
                                <div className="flex flex-col gap-1.5">
                                    {result.extensions.map((ext, i) => (
                                        <ExtensionRow key={i} ext={ext} />
                                    ))}
                                </div>
                            </Section>
                        )}

                        <Section title="Fingerprints">
                            <FieldRow
                                field={{
                                    label: 'SHA-256',
                                    value: result.fingerprintSHA256,
                                    mono: true,
                                }}
                            />
                            <FieldRow
                                field={{
                                    label: 'SHA-1',
                                    value: result.fingerprintSHA1,
                                    mono: true,
                                }}
                            />
                        </Section>

                        <Section title="Raw PEM">
                            <div className="flex flex-col gap-1.5">
                                <div className="flex justify-end">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="h-7 gap-1.5 text-xs"
                                        onClick={() => copy(result.rawPem)}
                                    >
                                        <Copy className="h-3 w-3" />
                                        Copy PEM
                                    </Button>
                                </div>
                                <pre className="whitespace-pre-wrap break-all rounded-lg border bg-muted/30 p-3 font-mono text-[11px] leading-relaxed select-all max-h-[200px] overflow-y-auto">
                                    {result.rawPem}
                                </pre>
                            </div>
                        </Section>
                    </div>
                )}

                {!result && !error && !loading && (
                    <div className="flex h-48 flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center">
                        <Fingerprint className="mb-3 h-10 w-10 text-muted-foreground/40" />
                        <p className="text-sm font-medium text-muted-foreground">
                            Paste an SSL/TLS certificate to decode
                        </p>
                        <p className="mt-1 text-xs text-muted-foreground/60">
                            Supports PEM-encoded X.509 certificates. All parsing happens locally in
                            your browser.
                        </p>
                    </div>
                )}
            </div>
            <ShareSidebarModal
                open={shareOpen}
                onOpenChange={setShareOpen}
                config={{
                    pageName: 'cert-decoder',
                    tabName: 'decode',
                    getState: () => ({}),
                    extraActions: result
                        ? [
                              {
                                  id: 'copy-pem',
                                  label: 'Copy PEM',
                                  icon: Copy,
                                  handler: () => copy(result.rawPem),
                              },
                          ]
                        : [],
                }}
            />
        </ToolTabWrapper>
    );
}
