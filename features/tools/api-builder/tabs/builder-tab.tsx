'use client';

import { useState, useMemo, useCallback } from 'react';
import { ToolTabWrapper } from '../../core/components/tool-tab-wrapper';
import { useToolActions } from '../../core/hooks/use-tool-actions';
import { useToolState } from '../../core/hooks/use-tool-state';
import { STORAGE_KEYS } from '@/lib/utils/constants';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { KeyValueEditor } from '../components/key-value-editor';
import {
    HTTP_METHODS,
    METHOD_COLORS,
    createDefaultRequest,
    executeRequest,
    formatBody,
    formatSize,
    formatTime,
    getStatusColor,
    getResponseBodyType,
    type ApiRequest,
    type ApiResponse,
    type HttpMethod,
} from '../utils/http-client';
import {
    Send,
    Loader2,
    Clock,
    Database,
    Globe,
    Lock,
    AlertCircle,
    Copy,
    Check,
} from 'lucide-react';
import { useClipboard } from '@/lib/hooks/use-clipboard';
import { ShareSidebarModal } from '../../core/plugins/share-sidebar';
import type { TabComponentProps } from '../../core/types/tool';

function RequestConfigTabs({
    activeSection,
    onSectionChange,
    hasBody,
}: {
    activeSection: string;
    onSectionChange: (s: string) => void;
    hasBody: boolean;
}) {
    const sections = [
        { id: 'params', label: 'Params', icon: Globe },
        { id: 'headers', label: 'Headers', icon: Globe },
        { id: 'body', label: 'Body', icon: Database },
        { id: 'auth', label: 'Auth', icon: Lock },
    ].filter((s) => s.id !== 'body' || hasBody);

    return (
        <div className="flex gap-1">
            {sections.map((section) => (
                <button
                    key={section.id}
                    onClick={() => onSectionChange(section.id)}
                    className={`rounded-md px-2.5 py-1.5 text-[11px] font-medium transition-colors ${
                        activeSection === section.id
                            ? 'bg-primary/10 text-primary'
                            : 'text-muted-foreground hover:bg-muted/50'
                    }`}
                >
                    {section.label}
                </button>
            ))}
        </div>
    );
}

export default function BuilderTab({ sharedData, readOnly }: TabComponentProps) {
    const { content, setContent, isReady } = useToolState({
        storageKey: STORAGE_KEYS.API_BUILDER_STATE,
        sharedData,
        tabId: 'builder',
        readOnly,
    });

    const [shareOpen, setShareOpen] = useState(false);
    const [response, setResponse] = useState<ApiResponse | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [activeSection, setActiveSection] = useState('params');
    const [copied, setCopied] = useState(false);
    const { copy } = useClipboard();

    const request: ApiRequest = useMemo(() => {
        if (!content) return createDefaultRequest();
        try {
            return { ...createDefaultRequest(), ...JSON.parse(content) };
        } catch {
            return createDefaultRequest();
        }
    }, [content]);

    const updateRequest = useCallback(
        (updates: Partial<ApiRequest>) => {
            const updated = { ...request, ...updates };
            setContent(JSON.stringify(updated));
        },
        [request, setContent],
    );

    const hasBody = !['GET', 'HEAD'].includes(request.method);

    const handleSend = useCallback(async () => {
        if (!request.url.trim()) return;
        setLoading(true);
        setError(null);
        setResponse(null);
        try {
            const result = await executeRequest(request);
            setResponse(result);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Request failed');
        } finally {
            setLoading(false);
        }
    }, [request]);

    const handleCopyResponse = useCallback(async () => {
        if (!response?.body) return;
        await copy(response.body);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
    }, [copy, response]);

    const { actions } = useToolActions({
        pageName: 'api-builder',
        tabId: 'builder',
        getContent: () => content,
        onClear: () => {
            setContent('');
            setResponse(null);
            setError(null);
        },
        shareDialogOpen: shareOpen,
        setShareDialogOpen: setShareOpen,
        readOnly,
    });

    if (!isReady) return null;

    const responseBodyType = response
        ? getResponseBodyType(response.headers['content-type'] || '')
        : 'text';
    const formattedBody = response
        ? formatBody(response.body, response.headers['content-type'] || '')
        : '';

    return (
        <ToolTabWrapper actions={actions}>
            <div className="flex flex-col gap-4 py-4">
                <div className="flex gap-2">
                    <select
                        value={request.method}
                        onChange={(e) => updateRequest({ method: e.target.value as HttpMethod })}
                        className={`h-9 rounded-lg border border-input bg-transparent px-2 text-sm font-bold font-mono cursor-pointer focus:outline-none focus:ring-2 focus:ring-ring/50 ${
                            METHOD_COLORS[request.method]
                        }`}
                    >
                        {HTTP_METHODS.map((method) => (
                            <option key={method} value={method}>
                                {method}
                            </option>
                        ))}
                    </select>
                    <div className="flex-1 relative">
                        <Input
                            value={request.url}
                            onChange={(e) => updateRequest({ url: e.target.value })}
                            placeholder="https://api.example.com/endpoint"
                            className="h-9 font-mono text-sm pr-20"
                            spellCheck={false}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') handleSend();
                            }}
                        />
                        {request.queryParams.some((p) => p.enabled && p.key.trim()) && (
                            <span className="absolute right-2 top-1/2 -translate-y-1/2">
                                <Badge variant="secondary" className="text-[10px] h-5">
                                    {
                                        request.queryParams.filter((p) => p.enabled && p.key.trim())
                                            .length
                                    }{' '}
                                    params
                                </Badge>
                            </span>
                        )}
                    </div>
                    <Button
                        onClick={handleSend}
                        disabled={loading || !request.url.trim()}
                        size="sm"
                        className="h-9 px-4 gap-1.5"
                    >
                        {loading ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                            <Send className="h-4 w-4" />
                        )}
                        Send
                    </Button>
                </div>

                <div className="flex flex-col gap-2">
                    <RequestConfigTabs
                        activeSection={activeSection}
                        onSectionChange={setActiveSection}
                        hasBody={hasBody}
                    />

                    <div className="rounded-lg border p-3">
                        {activeSection === 'params' && (
                            <KeyValueEditor
                                items={request.queryParams}
                                onChange={(queryParams) => updateRequest({ queryParams })}
                                keyPlaceholder="Parameter name"
                                valuePlaceholder="Value"
                            />
                        )}

                        {activeSection === 'headers' && (
                            <KeyValueEditor
                                items={request.headers}
                                onChange={(headers) => updateRequest({ headers })}
                                keyPlaceholder="Header name"
                                valuePlaceholder="Value"
                            />
                        )}

                        {activeSection === 'body' && hasBody && (
                            <div className="flex flex-col gap-2">
                                <div className="flex gap-1.5">
                                    {(['json', 'text', 'urlencoded'] as const).map((type) => (
                                        <button
                                            key={type}
                                            onClick={() => updateRequest({ bodyType: type })}
                                            className={`rounded-md px-2 py-1 text-[11px] font-medium transition-colors ${
                                                request.bodyType === type
                                                    ? 'bg-primary/10 text-primary'
                                                    : 'text-muted-foreground hover:bg-muted/50'
                                            }`}
                                        >
                                            {type === 'urlencoded'
                                                ? 'x-www-form'
                                                : type.toUpperCase()}
                                        </button>
                                    ))}
                                </div>
                                <Textarea
                                    value={request.body}
                                    onChange={(e) => updateRequest({ body: e.target.value })}
                                    placeholder={
                                        request.bodyType === 'json'
                                            ? '{\n  "key": "value"\n}'
                                            : 'Request body...'
                                    }
                                    className="min-h-32 font-mono text-sm resize-none"
                                    spellCheck={false}
                                />
                            </div>
                        )}

                        {activeSection === 'auth' && (
                            <div className="flex flex-col gap-3">
                                <div className="flex gap-1.5">
                                    {(['none', 'bearer', 'basic'] as const).map((type) => (
                                        <button
                                            key={type}
                                            onClick={() => updateRequest({ authType: type })}
                                            className={`rounded-md px-2.5 py-1.5 text-[11px] font-medium transition-colors ${
                                                request.authType === type
                                                    ? 'bg-primary/10 text-primary'
                                                    : 'text-muted-foreground hover:bg-muted/50'
                                            }`}
                                        >
                                            {type === 'none'
                                                ? 'None'
                                                : type.charAt(0).toUpperCase() + type.slice(1)}
                                        </button>
                                    ))}
                                </div>
                                {request.authType === 'bearer' && (
                                    <Input
                                        value={request.authToken}
                                        onChange={(e) =>
                                            updateRequest({ authToken: e.target.value })
                                        }
                                        placeholder="Bearer token"
                                        className="h-8 font-mono text-sm"
                                        type="password"
                                        spellCheck={false}
                                    />
                                )}
                                {request.authType === 'basic' && (
                                    <div className="flex gap-2">
                                        <Input
                                            value={request.authUsername}
                                            onChange={(e) =>
                                                updateRequest({ authUsername: e.target.value })
                                            }
                                            placeholder="Username"
                                            className="h-8 font-mono text-sm"
                                            spellCheck={false}
                                        />
                                        <Input
                                            value={request.authPassword}
                                            onChange={(e) =>
                                                updateRequest({ authPassword: e.target.value })
                                            }
                                            placeholder="Password"
                                            className="h-8 font-mono text-sm"
                                            type="password"
                                            spellCheck={false}
                                        />
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {(response || error) && (
                    <div className="flex flex-col gap-2">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                Response
                            </span>
                            {response && (
                                <div className="flex items-center gap-2">
                                    <span
                                        className={`text-sm font-bold font-mono ${getStatusColor(response.status)}`}
                                    >
                                        {response.status} {response.statusText}
                                    </span>
                                    <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                                        <Clock className="h-3 w-3" />
                                        {formatTime(response.time)}
                                    </span>
                                    <span className="text-[11px] text-muted-foreground">
                                        {formatSize(response.size)}
                                    </span>
                                </div>
                            )}
                        </div>

                        {error && (
                            <div className="flex items-start gap-3 rounded-lg border border-destructive/50 bg-destructive/5 p-4">
                                <AlertCircle className="h-5 w-5 shrink-0 text-destructive mt-0.5" />
                                <div>
                                    <p className="text-sm font-medium text-destructive">
                                        Request Failed
                                    </p>
                                    <p className="text-xs text-muted-foreground mt-1">{error}</p>
                                </div>
                            </div>
                        )}

                        {response && (
                            <div className="rounded-lg border">
                                <div className="flex items-center justify-between border-b px-3 py-2">
                                    <div className="flex items-center gap-2">
                                        <Badge variant="outline" className="text-[10px] font-mono">
                                            {responseBodyType.toUpperCase()}
                                        </Badge>
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="icon-xs"
                                        onClick={handleCopyResponse}
                                        disabled={!response.body}
                                    >
                                        {copied ? (
                                            <Check className="h-3 w-3 text-green-500" />
                                        ) : (
                                            <Copy className="h-3 w-3" />
                                        )}
                                    </Button>
                                </div>
                                <pre className="max-h-96 overflow-auto p-3 font-mono text-xs leading-relaxed whitespace-pre-wrap break-all">
                                    {formattedBody || response.body || '(empty response)'}
                                </pre>
                            </div>
                        )}
                    </div>
                )}

                {!response && !error && !loading && (
                    <div className="h-40 flex flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center">
                        <Send className="h-10 w-10 text-muted-foreground/40 mb-3" />
                        <p className="text-sm font-medium text-muted-foreground">
                            Enter a URL and hit Send
                        </p>
                        <p className="text-xs text-muted-foreground/60 mt-1">
                            Configure headers, params, body, and auth as needed
                        </p>
                    </div>
                )}
            </div>
            <ShareSidebarModal
                open={shareOpen}
                onOpenChange={setShareOpen}
                config={{
                    pageName: 'api-builder',
                    tabName: 'builder',
                    getState: () => JSON.parse(content || '{}'),
                    extraActions: response
                        ? [
                              {
                                  id: 'copy-response',
                                  label: 'Copy Response',
                                  icon: Copy,
                                  handler: () => copy(response.body),
                              },
                          ]
                        : [],
                }}
            />
        </ToolTabWrapper>
    );
}
