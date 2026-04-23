'use client';

import { useState, useCallback, useRef } from 'react';
import { ToolTabWrapper } from '../../core/components/tool-tab-wrapper';
import { useToolActions } from '../../core/hooks/use-tool-actions';
import { STORAGE_KEYS } from '@/lib/utils/constants';
import { useToolState } from '../../core/hooks/use-tool-state';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { checkCors, HTTP_METHODS, type CorsResult, type HttpMethod } from '../utils/cors-checker';
import { ShareSidebarModal } from '../../core/plugins/share-sidebar';
import type { TabComponentProps } from '../../core/types/tool';
import { useClipboard } from '@/lib/hooks/use-clipboard';
import {
    ShieldAlert,
    Loader2,
    Copy,
    Clock,
    Globe,
    CheckCircle2,
    XCircle,
    AlertTriangle,
} from 'lucide-react';

function HeaderRow({
    name,
    value,
    highlight,
}: {
    name: string;
    value: string;
    highlight?: boolean;
}) {
    const { copy } = useClipboard();
    return (
        <div
            className={`flex items-start gap-3 rounded-md px-3 py-2 text-sm ${
                highlight ? 'bg-primary/5 border border-primary/20' : 'bg-muted/30'
            }`}
        >
            <span className="shrink-0 font-mono text-xs font-medium text-muted-foreground min-w-[200px]">
                {name}
            </span>
            <span className="min-w-0 break-all font-mono text-xs">
                {value || <span className="text-muted-foreground italic">not set</span>}
            </span>
            {value && (
                <button
                    onClick={() => copy(value)}
                    className="shrink-0 text-muted-foreground opacity-0 transition-opacity hover:text-foreground group-hover:opacity-100 ml-auto"
                >
                    <Copy className="h-3 w-3" />
                </button>
            )}
        </div>
    );
}

function ResultView({ result }: { result: CorsResult }) {
    const { copy } = useClipboard();

    const corsHeaders = [
        {
            key: 'access-control-allow-origin',
            label: 'Access-Control-Allow-Origin',
            value: result.accessControlAllowOrigin,
        },
        {
            key: 'access-control-allow-methods',
            label: 'Access-Control-Allow-Methods',
            value: result.accessControlAllowMethods,
        },
        {
            key: 'access-control-allow-headers',
            label: 'Access-Control-Allow-Headers',
            value: result.accessControlAllowHeaders,
        },
        {
            key: 'access-control-allow-credentials',
            label: 'Access-Control-Allow-Credentials',
            value:
                result.accessControlAllowCredentials !== null
                    ? String(result.accessControlAllowCredentials)
                    : null,
        },
        {
            key: 'access-control-max-age',
            label: 'Access-Control-Max-Age',
            value: result.accessControlMaxAge,
        },
        {
            key: 'access-control-expose-headers',
            label: 'Access-Control-Expose-Headers',
            value: result.accessControlExposeHeaders,
        },
    ];

    const otherHeaders = Object.entries(result.allHeaders).filter(
        ([key]) => !key.startsWith('access-control'),
    );

    const statusIcon = result.isCorsEnabled ? CheckCircle2 : result.error ? AlertTriangle : XCircle;

    const statusColor = result.isCorsEnabled
        ? 'text-green-600 dark:text-green-400'
        : result.error
          ? 'text-yellow-600 dark:text-yellow-400'
          : 'text-red-600 dark:text-red-400';

    const statusText = result.isCorsEnabled
        ? 'CORS Enabled'
        : result.error
          ? 'CORS Check Failed'
          : 'CORS Not Enabled';

    const StatusIcon = statusIcon;

    return (
        <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between rounded-lg border p-4">
                <div className="flex items-center gap-3">
                    <StatusIcon className={`h-6 w-6 ${statusColor}`} />
                    <div>
                        <p className={`text-sm font-semibold ${statusColor}`}>{statusText}</p>
                        {result.accessControlAllowOrigin && (
                            <p className="text-xs text-muted-foreground mt-0.5">
                                Allowed origin:{' '}
                                <code className="rounded bg-muted px-1 py-0.5 font-mono">
                                    {result.accessControlAllowOrigin}
                                </code>
                            </p>
                        )}
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    {result.responseStatus && (
                        <Badge variant="outline" className="font-mono text-xs">
                            {result.responseStatus} {result.responseStatusText}
                        </Badge>
                    )}
                    <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {result.responseTime}ms
                    </span>
                </div>
            </div>

            {result.error && !result.isCorsEnabled && (
                <div className="flex items-start gap-3 rounded-lg border border-yellow-500/50 bg-yellow-500/5 p-4">
                    <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-yellow-600 dark:text-yellow-400" />
                    <div>
                        <p className="text-sm font-medium text-yellow-600 dark:text-yellow-400">
                            Could not verify CORS
                        </p>
                        <p className="mt-1 text-xs text-muted-foreground">{result.error}</p>
                        <p className="mt-2 text-xs text-muted-foreground">
                            This usually means the server does not include CORS headers, or the
                            request was blocked entirely by the browser.
                        </p>
                    </div>
                </div>
            )}

            {result.preflightSuccess !== null && (
                <div className="flex items-center gap-2">
                    <Badge
                        variant={result.preflightSuccess ? 'default' : 'destructive'}
                        className="text-[10px]"
                    >
                        {result.preflightSuccess ? 'Preflight OK' : 'Preflight Failed'}
                    </Badge>
                    <Badge variant="secondary" className="text-[10px]">
                        Method: {result.method}
                    </Badge>
                </div>
            )}

            <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        CORS Headers
                    </h3>
                </div>
                <div className="flex flex-col gap-1">
                    {corsHeaders.map((h) => (
                        <div key={h.key} className="group">
                            <HeaderRow name={h.label} value={h.value ?? ''} highlight={!!h.value} />
                        </div>
                    ))}
                </div>
            </div>

            {otherHeaders.length > 0 && (
                <div className="flex flex-col gap-2">
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        Response Headers
                    </h3>
                    <div className="max-h-48 overflow-y-auto flex flex-col gap-1">
                        {otherHeaders.map(([key, value]) => (
                            <div key={key} className="group">
                                <HeaderRow name={key} value={value} />
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <div className="flex justify-end">
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                        const lines = [
                            `CORS Check: ${statusText}`,
                            `URL: ${result.url}`,
                            `Method: ${result.method}`,
                            `Status: ${result.responseStatus ?? 'N/A'}`,
                            `Time: ${result.responseTime}ms`,
                            '',
                            '--- CORS Headers ---',
                            ...corsHeaders.map((h) => `${h.label}: ${h.value ?? '(not set)'}`),
                            '',
                            '--- Response Headers ---',
                            ...otherHeaders.map(([k, v]) => `${k}: ${v}`),
                        ];
                        copy(lines.join('\n'));
                    }}
                    className="gap-1.5"
                >
                    <Copy className="h-3.5 w-3.5" />
                    Copy Report
                </Button>
            </div>
        </div>
    );
}

export default function CheckerTab({ sharedData, readOnly }: TabComponentProps) {
    const { content, setContent, isReady } = useToolState({
        storageKey: STORAGE_KEYS.CORS_CHECKER_URL,
        sharedData,
        tabId: 'checker',
        readOnly,
    });

    const [method, setMethod] = useState<HttpMethod>('GET');
    const [result, setResult] = useState<CorsResult | null>(null);
    const [loading, setLoading] = useState(false);
    const [shareOpen, setShareOpen] = useState(false);
    const abortRef = useRef<AbortController | null>(null);

    const handleCheck = useCallback(async () => {
        if (!content.trim()) return;
        abortRef.current?.abort();
        const controller = new AbortController();
        abortRef.current = controller;

        setLoading(true);
        setResult(null);

        const res = await checkCors(content.trim(), method, controller.signal);
        setResult(res);
        setLoading(false);
    }, [content, method]);

    const { actions } = useToolActions({
        pageName: 'cors',
        tabId: 'checker',
        getContent: () => content,
        onClear: () => {
            setContent('');
            setResult(null);
        },
        shareDialogOpen: shareOpen,
        setShareDialogOpen: setShareOpen,
        readOnly,
    });

    if (!isReady) return null;

    return (
        <ToolTabWrapper actions={actions}>
            <div className="flex flex-col gap-4 py-4">
                <div className="flex gap-2">
                    <select
                        value={method}
                        onChange={(e) => setMethod(e.target.value as HttpMethod)}
                        className="h-9 rounded-lg border border-input bg-transparent px-2 text-sm font-bold font-mono cursor-pointer focus:outline-none focus:ring-2 focus:ring-ring/50 text-muted-foreground"
                    >
                        {HTTP_METHODS.map((m) => (
                            <option key={m} value={m}>
                                {m}
                            </option>
                        ))}
                    </select>
                    <Input
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        placeholder="https://api.example.com/endpoint"
                        className="h-9 font-mono text-sm"
                        spellCheck={false}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') handleCheck();
                        }}
                    />
                    <Button
                        onClick={handleCheck}
                        disabled={loading || !content.trim()}
                        size="sm"
                        className="h-9 px-4 gap-1.5"
                    >
                        {loading ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                            <Globe className="h-4 w-4" />
                        )}
                        Check
                    </Button>
                </div>

                {result && <ResultView result={result} />}

                {!result && !loading && (
                    <div className="flex h-56 flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center">
                        <ShieldAlert className="mb-3 h-10 w-10 text-muted-foreground/40" />
                        <p className="text-sm font-medium text-muted-foreground">
                            Enter a URL and click Check
                        </p>
                        <p className="mt-1 text-xs text-muted-foreground/60">
                            Test if the endpoint allows cross-origin requests and inspect CORS
                            headers
                        </p>
                    </div>
                )}

                {loading && (
                    <div className="flex h-56 flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center">
                        <Loader2 className="mb-3 h-10 w-10 animate-spin text-muted-foreground/40" />
                        <p className="text-sm font-medium text-muted-foreground">
                            Checking CORS headers...
                        </p>
                    </div>
                )}
            </div>
            <ShareSidebarModal
                open={shareOpen}
                onOpenChange={setShareOpen}
                config={{
                    pageName: 'cors',
                    tabName: 'checker',
                    getState: () => ({ content, method }),
                    extraActions: [],
                }}
            />
        </ToolTabWrapper>
    );
}
