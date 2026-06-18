'use client';
import { ToolContentSkeleton } from '@/app/(tools)/loading';

import { useEffect, useState, useCallback, useRef } from 'react';
import { ToolTabWrapper } from '../../core/components/tool-tab-wrapper';
import { useToolActions } from '../../core/hooks/use-tool-actions';
import { useLocalStorage } from '@/lib/hooks/use-local-storage';
import { useClipboard } from '@/lib/hooks/use-clipboard';
import { ShareSidebarModal } from '../../core/plugins/share-sidebar';
import { STORAGE_KEYS } from '@/lib/utils/constants';
import type { TabComponentProps } from '../../core/types/tool';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    Copy,
    Trash2,
    RefreshCw,
    ChevronDown,
    ChevronUp,
    Webhook,
    Loader2,
    Clock,
    AlertCircle,
    Package,
} from 'lucide-react';

interface WebhookRequest {
    id: string;
    method: string;
    headers: Record<string, string>;
    body: string | null;
    query: Record<string, string>;
    timestamp: number;
    contentType: string;
    size: number;
}

function formatTime(ts: number): string {
    return new Date(ts).toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
    });
}

function formatSize(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function getMethodColors(method: string): string {
    switch (method.toUpperCase()) {
        case 'GET':
            return 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/40 dark:text-green-300 dark:border-green-700';
        case 'POST':
            return 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/40 dark:text-blue-300 dark:border-blue-700';
        case 'PUT':
            return 'bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/40 dark:text-amber-300 dark:border-amber-700';
        case 'PATCH':
            return 'bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900/40 dark:text-orange-300 dark:border-orange-700';
        case 'DELETE':
            return 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/40 dark:text-red-300 dark:border-red-700';
        default:
            return 'bg-gray-100 text-gray-700 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600';
    }
}

function MethodBadge({ method }: { method: string }) {
    return (
        <span
            className={`inline-flex items-center rounded border px-1.5 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-wider ${getMethodColors(method)}`}
        >
            {method}
        </span>
    );
}

function RequestRow({ request }: { request: WebhookRequest }) {
    const [expanded, setExpanded] = useState(false);
    const { copy } = useClipboard();

    const hasQuery = Object.keys(request.query).length > 0;
    const hasBody = Boolean(request.body);

    let prettyBody: string | null = null;
    if (hasBody && request.body) {
        try {
            prettyBody = JSON.stringify(JSON.parse(request.body), null, 2);
        } catch {
            prettyBody = request.body;
        }
    }

    const isJson =
        request.contentType.includes('application/json') || request.contentType.includes('+json');

    return (
        <div className="rounded-lg border bg-card transition-colors hover:bg-muted/20">
            <button
                onClick={() => setExpanded((prev) => !prev)}
                className="flex w-full items-center gap-3 px-4 py-3 text-left"
            >
                <MethodBadge method={request.method} />
                <div className="flex min-w-0 flex-1 items-center gap-2">
                    {request.contentType && (
                        <span className="truncate font-mono text-[11px] text-muted-foreground">
                            {request.contentType.split(';')[0]}
                        </span>
                    )}
                </div>
                <div className="flex shrink-0 items-center gap-3 text-[11px] text-muted-foreground">
                    <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {formatTime(request.timestamp)}
                    </span>
                    <span className="flex items-center gap-1">
                        <Package className="h-3 w-3" />
                        {formatSize(request.size)}
                    </span>
                    {expanded ? (
                        <ChevronUp className="h-3.5 w-3.5" />
                    ) : (
                        <ChevronDown className="h-3.5 w-3.5" />
                    )}
                </div>
            </button>

            {expanded && (
                <div className="border-t px-4 pb-4 pt-3">
                    <div className="flex flex-col gap-4">
                        {hasQuery && (
                            <div>
                                <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                                    Query Parameters
                                </p>
                                <div className="overflow-hidden rounded border">
                                    <table className="w-full text-xs">
                                        <thead className="bg-muted/50">
                                            <tr>
                                                <th className="px-3 py-1.5 text-left font-medium text-muted-foreground">
                                                    Key
                                                </th>
                                                <th className="px-3 py-1.5 text-left font-medium text-muted-foreground">
                                                    Value
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {Object.entries(request.query).map(([k, v]) => (
                                                <tr key={k} className="border-t">
                                                    <td className="px-3 py-1.5 font-mono font-medium">
                                                        {k}
                                                    </td>
                                                    <td className="px-3 py-1.5 font-mono text-muted-foreground">
                                                        {v}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}

                        <div>
                            <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                                Headers
                            </p>
                            <div className="overflow-hidden rounded border">
                                <table className="w-full text-xs">
                                    <thead className="bg-muted/50">
                                        <tr>
                                            <th className="px-3 py-1.5 text-left font-medium text-muted-foreground">
                                                Key
                                            </th>
                                            <th className="px-3 py-1.5 text-left font-medium text-muted-foreground">
                                                Value
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {Object.entries(request.headers).map(([k, v]) => (
                                            <tr key={k} className="border-t">
                                                <td className="px-3 py-1.5 font-mono font-medium">
                                                    {k}
                                                </td>
                                                <td className="max-w-[300px] truncate px-3 py-1.5 font-mono text-muted-foreground">
                                                    {v}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {hasBody && prettyBody && (
                            <div>
                                <div className="mb-1.5 flex items-center justify-between">
                                    <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                                        Body
                                        {isJson && (
                                            <span className="ml-1.5 rounded bg-blue-100 px-1 py-0.5 text-[9px] text-blue-700 dark:bg-blue-900/40 dark:text-blue-300">
                                                JSON
                                            </span>
                                        )}
                                    </p>
                                    <button
                                        onClick={() => copy(request.body ?? '')}
                                        className="flex items-center gap-1 text-[11px] text-muted-foreground hover:text-foreground transition-colors"
                                    >
                                        <Copy className="h-3 w-3" />
                                        Copy
                                    </button>
                                </div>
                                <pre className="max-h-[300px] overflow-auto rounded border bg-muted/30 p-3 font-mono text-xs leading-relaxed whitespace-pre-wrap break-all">
                                    {prettyBody}
                                </pre>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

export default function InboxTab({ readOnly }: TabComponentProps) {
    const [endpointId, setEndpointId] = useLocalStorage<string>(STORAGE_KEYS.WEBHOOK_INBOX_ID, '');
    const [requests, setRequests] = useState<WebhookRequest[]>([]);
    const [isPolling, setIsPolling] = useState(false);
    const [pollError, setPollError] = useState<string | null>(null);
    const [shareOpen, setShareOpen] = useState(false);
    const [isMounted, setIsMounted] = useState(false);
    const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

    // Ensure endpoint ID exists after mount (avoid SSR mismatch)
    useEffect(() => {
        setIsMounted(true);
        if (!endpointId) {
            setEndpointId(crypto.randomUUID());
        }
    }, [endpointId, setEndpointId]);

    const webhookUrl =
        isMounted && endpointId ? `${window.location.origin}/api/webhook/${endpointId}` : '';

    const fetchRequests = useCallback(async (id: string) => {
        if (!id) return;
        try {
            const res = await fetch(`/api/webhook/requests/${id}`);
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const json = (await res.json()) as { ok: boolean; data: WebhookRequest[] };
            if (json.ok) {
                setRequests(json.data);
                setPollError(null);
            }
        } catch (e) {
            setPollError(e instanceof Error ? e.message : String(e));
        }
    }, []);

    // Start / restart polling whenever endpointId changes
    useEffect(() => {
        if (!endpointId) return;

        setIsPolling(true);
        fetchRequests(endpointId);

        const id = setInterval(() => {
            fetchRequests(endpointId);
        }, 2500);
        intervalRef.current = id;

        return () => {
            clearInterval(id);
            intervalRef.current = null;
            setIsPolling(false);
        };
    }, [endpointId, fetchRequests]);

    const { copy } = useClipboard();

    const handleReset = useCallback(() => {
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
        }
        setRequests([]);
        setPollError(null);
        const newId = crypto.randomUUID();
        setEndpointId(newId);
    }, [setEndpointId]);

    const handleClear = useCallback(() => {
        setRequests([]);
    }, []);

    const { actions } = useToolActions({
        pageName: 'webhook',
        tabId: 'inbox',
        getContent: () => webhookUrl,
        onClear: handleReset,
        shareDialogOpen: shareOpen,
        setShareDialogOpen: setShareOpen,
        readOnly,
    });

    // Suppress hydration mismatch — render skeleton until mounted
    if (!isMounted) return <ToolContentSkeleton />;

    return (
        <ToolTabWrapper actions={actions}>
            <div className="flex flex-col gap-4 py-4">
                {/* Endpoint URL row */}
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                    <div className="flex min-w-0 flex-1 items-center gap-2">
                        <Input
                            value={webhookUrl}
                            readOnly
                            className="h-9 min-w-0 flex-1 font-mono text-xs"
                            spellCheck={false}
                        />
                        <Button
                            variant="outline"
                            size="sm"
                            className="h-9 shrink-0 gap-1.5 px-3"
                            onClick={() => copy(webhookUrl)}
                            disabled={!webhookUrl}
                        >
                            <Copy className="h-4 w-4" />
                            Copy
                        </Button>
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                        {requests.length > 0 && (
                            <Button
                                variant="outline"
                                size="sm"
                                className="h-9 gap-1.5 px-3"
                                onClick={handleClear}
                            >
                                <Trash2 className="h-4 w-4" />
                                Clear
                            </Button>
                        )}
                        <Button
                            variant="outline"
                            size="sm"
                            className="h-9 gap-1.5 px-3"
                            onClick={handleReset}
                        >
                            <RefreshCw className="h-4 w-4" />
                            Reset
                        </Button>
                    </div>
                </div>

                {/* Status bar */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        {isPolling ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin text-muted-foreground" />
                        ) : (
                            <span className="inline-block h-2 w-2 rounded-full bg-gray-400" />
                        )}
                        <Badge variant="outline" className="text-[10px]">
                            {isPolling ? 'Listening' : 'Idle'}
                        </Badge>
                    </div>
                    {requests.length > 0 && (
                        <span className="text-[11px] text-muted-foreground">
                            {requests.length} request{requests.length !== 1 ? 's' : ''} received
                        </span>
                    )}
                </div>

                {/* Poll error */}
                {pollError && (
                    <div className="flex items-start gap-3 rounded-lg border border-destructive/50 bg-destructive/5 p-3">
                        <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-destructive" />
                        <div>
                            <p className="text-xs font-medium text-destructive">Polling error</p>
                            <p className="mt-0.5 font-mono text-[11px] text-muted-foreground">
                                {pollError}
                            </p>
                        </div>
                    </div>
                )}

                {/* Requests list or empty state */}
                <div className="min-h-[300px] max-h-[500px] overflow-y-auto rounded-lg border bg-muted/10 md:min-h-[400px] lg:min-h-[500px]">
                    {requests.length === 0 ? (
                        <div className="flex h-full min-h-[280px] flex-col items-center justify-center gap-4 p-6 text-center md:min-h-[380px] lg:min-h-[460px]">
                            <Webhook className="h-12 w-12 text-muted-foreground/30" />
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">
                                    Waiting for requests
                                </p>
                                <p className="mt-1 text-xs text-muted-foreground/60">
                                    Send any HTTP request to this URL
                                </p>
                            </div>
                            <div className="w-full max-w-md rounded-lg border bg-muted/30 px-4 py-3">
                                <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                                    Your Webhook URL
                                </p>
                                <code className="block break-all font-mono text-xs text-foreground">
                                    {webhookUrl}
                                </code>
                            </div>
                            <div className="text-[11px] text-muted-foreground/60">
                                Supports GET, POST, PUT, PATCH, DELETE — any content type
                            </div>
                        </div>
                    ) : (
                        <div className="flex flex-col gap-2 p-3">
                            {requests.map((req) => (
                                <RequestRow key={req.id} request={req} />
                            ))}
                        </div>
                    )}
                </div>
            </div>

            <ShareSidebarModal
                open={shareOpen}
                onOpenChange={setShareOpen}
                config={{
                    pageName: 'webhook',
                    tabName: 'inbox',
                    getState: () => ({ url: webhookUrl }),
                    extraActions: webhookUrl
                        ? [
                              {
                                  id: 'copy-url',
                                  label: 'Copy Webhook URL',
                                  icon: Copy,
                                  handler: () => copy(webhookUrl),
                              },
                          ]
                        : [],
                }}
            />
        </ToolTabWrapper>
    );
}
