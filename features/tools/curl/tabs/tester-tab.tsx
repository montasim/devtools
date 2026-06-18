'use client';

import { ToolContentSkeleton } from '@/app/(tools)/loading';

import { useState, useCallback, useMemo } from 'react';
import { useToolState } from '../../core/hooks/use-tool-state';
import { useToolActions } from '../../core/hooks/use-tool-actions';
import { ToolTabWrapper } from '../../core/components/tool-tab-wrapper';
import { ShareSidebarModal } from '../../core/plugins/share-sidebar';
import { STORAGE_KEYS } from '@/lib/utils/constants';
import { TextEditor } from '../../text/components/text-editor';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { parseCurl } from '../utils/curl-parser';
import { executeRequest } from '../utils/request-executor';
import { formatTime, formatSize, prettifyBody } from '../utils/response-formatter';
import { useClipboard } from '@/lib/hooks/use-clipboard';
import {
    Play,
    Loader2,
    Copy,
    Clock,
    Database,
    AlertCircle,
    Terminal,
    Globe,
    FileText,
    ChevronDown,
    ChevronUp,
    Check,
} from 'lucide-react';
import type { TabComponentProps } from '../../core/types/tool';
import { METHOD_COLORS } from '../../api-builder/utils/http-client';

interface ResponseState {
    status: number;
    statusText: string;
    headers: Record<string, string>;
    body: string;
    size: number;
    time: number;
    success: boolean;
    contentType: string;
}

export default function TesterTab({ sharedData, readOnly }: TabComponentProps) {
    const { content, setContent, isReady } = useToolState({
        storageKey: STORAGE_KEYS.CURL_TESTER_REQUEST,
        sharedData,
        tabId: 'tester',
        readOnly,
    });

    const [response, setResponse] = useState<ResponseState | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [shareOpen, setShareOpen] = useState(false);
    const [copied, setCopied] = useState(false);
    const [expandedSection, setExpandedSection] = useState<'headers' | 'body' | 'auth' | null>(
        null,
    );
    const { copy } = useClipboard();

    const parsedRequest = useMemo(() => {
        if (!content.trim()) return null;
        try {
            return parseCurl(content);
        } catch {
            return null;
        }
    }, [content]);

    const handleExecute = useCallback(async () => {
        if (!parsedRequest || !parsedRequest.url) {
            setError('Invalid curl command or missing URL');
            return;
        }

        setIsLoading(true);
        setError(null);
        setResponse(null);

        try {
            const result = await executeRequest({
                method: parsedRequest.method || 'GET',
                url: parsedRequest.url,
                headers: parsedRequest.headers || {},
                body: parsedRequest.data || null,
            });
            setResponse(result);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Request failed');
        } finally {
            setIsLoading(false);
        }
    }, [parsedRequest]);

    const handleCopyResponse = useCallback(async () => {
        if (!response?.body) return;
        await copy(prettifyBody(response.body, response.contentType));
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
    }, [copy, response]);

    const { actions } = useToolActions({
        pageName: 'curl',
        tabId: 'tester',
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

    const toggleSection = useCallback((section: 'headers' | 'body' | 'auth') => {
        setExpandedSection((prev) => (prev === section ? null : section));
    }, []);

    if (!isReady) return <ToolContentSkeleton />;

    const prettyBody = response ? prettifyBody(response.body, response.contentType) : '';
    const methodColor = parsedRequest?.method
        ? METHOD_COLORS[parsedRequest.method as keyof typeof METHOD_COLORS]
        : '';

    const getStatusColor = (status: number): string => {
        if (status >= 200 && status < 300) return 'text-green-600 dark:text-green-400';
        if (status >= 300 && status < 400) return 'text-blue-600 dark:text-blue-400';
        if (status >= 400 && status < 500) return 'text-amber-600 dark:text-amber-400';
        return 'text-red-600 dark:text-red-400';
    };

    const responseBodyType = response
        ? response.contentType.includes('json')
            ? 'json'
            : response.contentType.includes('xml')
              ? 'xml'
              : response.contentType.includes('html')
                ? 'html'
                : 'text'
        : 'text';

    return (
        <ToolTabWrapper actions={actions}>
            <div className="flex flex-col gap-4 py-4">
                {/* cURL Input */}
                <div className="flex flex-col gap-2 mb-8">
                    <div className="flex items-center justify-between">
                        <h3 className="text-sm font-semibold text-foreground">cURL Command</h3>
                        {parsedRequest && (
                            <Badge variant="outline" className="text-[10px]">
                                Parsed ✓
                            </Badge>
                        )}
                    </div>
                    <div style={{ height: '245px' }}>
                        <style>{`
                            .curl-tester-textarea textarea {
                                min-height: 245px !important;
                            }
                        `}</style>
                        <div className="curl-tester-textarea h-full">
                            <TextEditor
                                value={content}
                                onChange={setContent}
                                readOnly={readOnly}
                                emptyIcon={Terminal}
                                emptyTitle="Paste curl command"
                                emptyDescription="Paste a curl command to execute and see the response"
                            />
                        </div>
                    </div>
                </div>

                {/* Parsed Request Preview - inspired by API builder */}
                {parsedRequest && (
                    <div className="flex flex-col gap-2">
                        {/* Method + URL bar */}
                        <div className="flex gap-2 items-center">
                            <Badge
                                className={`h-8 px-3 font-mono font-bold text-sm ${methodColor}`}
                            >
                                {parsedRequest.method || 'GET'}
                            </Badge>
                            <div className="flex-1 rounded-lg border bg-muted/30 px-3 py-2">
                                <code className="text-xs text-muted-foreground break-all">
                                    {parsedRequest.url}
                                </code>
                            </div>
                            <Button
                                onClick={handleExecute}
                                disabled={isLoading || readOnly}
                                className="h-10 px-3 gap-1.5"
                                size="sm"
                            >
                                {isLoading ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                    <Play className="h-4 w-4" />
                                )}
                                Execute
                            </Button>
                        </div>

                        {/* Expandable sections */}
                        <div className="flex flex-col gap-1">
                            {/* Headers */}
                            <button
                                onClick={() => toggleSection('headers')}
                                className="flex items-center gap-2 text-left text-xs font-medium text-muted-foreground hover:text-foreground transition-colors px-2 py-1"
                                disabled={readOnly}
                            >
                                {expandedSection === 'headers' ? (
                                    <ChevronUp className="h-3 w-3" />
                                ) : (
                                    <ChevronDown className="h-3 w-3" />
                                )}
                                <Globe className="h-3 w-3" />
                                Headers ({Object.keys(parsedRequest.headers || {}).length})
                            </button>
                            {expandedSection === 'headers' && (
                                <div className="rounded-lg border bg-muted/30 p-3">
                                    {Object.keys(parsedRequest.headers || {}).length > 0 ? (
                                        <div className="flex flex-col gap-1">
                                            {Object.entries(parsedRequest.headers || {}).map(
                                                ([key, value]) => (
                                                    <div key={key} className="flex gap-2 text-xs">
                                                        <span className="font-mono font-medium text-foreground min-w-32">
                                                            {key}:
                                                        </span>
                                                        <span className="font-mono text-muted-foreground break-all">
                                                            {value}
                                                        </span>
                                                    </div>
                                                ),
                                            )}
                                        </div>
                                    ) : (
                                        <span className="text-xs text-muted-foreground">
                                            No headers
                                        </span>
                                    )}
                                </div>
                            )}

                            {/* Body */}
                            {parsedRequest.data && (
                                <>
                                    <button
                                        onClick={() => toggleSection('body')}
                                        className="flex items-center gap-2 text-left text-xs font-medium text-muted-foreground hover:text-foreground transition-colors px-2 py-1"
                                        disabled={readOnly}
                                    >
                                        {expandedSection === 'body' ? (
                                            <ChevronUp className="h-3 w-3" />
                                        ) : (
                                            <ChevronDown className="h-3 w-3" />
                                        )}
                                        <FileText className="h-3 w-3" />
                                        Body ({parsedRequest.data.length} chars)
                                    </button>
                                    {expandedSection === 'body' && (
                                        <div className="rounded-lg border bg-muted/30 p-3">
                                            <pre className="text-xs font-mono text-foreground whitespace-pre-wrap break-all max-h-32 overflow-auto">
                                                {parsedRequest.data}
                                            </pre>
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    </div>
                )}

                {/* Response - inspired by API builder */}
                {(response || error || isLoading) && (
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
                                    <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                                        <Database className="h-3 w-3" />
                                        {formatSize(response.size)}
                                    </span>
                                </div>
                            )}
                        </div>

                        {isLoading && (
                            <div className="flex items-center justify-center gap-3 py-16">
                                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                                <p className="text-sm text-muted-foreground">
                                    Executing request...
                                </p>
                            </div>
                        )}

                        {error && (
                            <div className="flex items-start gap-3 rounded-lg border border-destructive/50 bg-destructive/5 p-4">
                                <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-destructive" />
                                <div className="flex-1">
                                    <p className="text-sm font-medium text-destructive">
                                        Request Failed
                                    </p>
                                    <p className="mt-1 text-xs text-muted-foreground">{error}</p>
                                </div>
                            </div>
                        )}

                        {response && !isLoading && !error && (
                            <div className="rounded-lg border">
                                <div className="flex items-center justify-between border-b px-3 py-2">
                                    <Badge variant="outline" className="text-[10px] font-mono">
                                        {responseBodyType.toUpperCase()}
                                    </Badge>
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
                                    {prettyBody || response.body || '(empty response)'}
                                </pre>
                            </div>
                        )}
                    </div>
                )}

                {/* Empty state */}
                {!parsedRequest && !response && !error && !isLoading && (
                    <div className="h-40 flex flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center">
                        <Terminal className="h-10 w-10 text-muted-foreground/40 mb-3" />
                        <p className="text-sm font-medium text-muted-foreground">
                            Paste a cURL command to test
                        </p>
                        <p className="text-xs text-muted-foreground/60 mt-1">
                            The command will be parsed and executed
                        </p>
                    </div>
                )}
            </div>

            <ShareSidebarModal
                open={shareOpen}
                onOpenChange={setShareOpen}
                config={{
                    pageName: 'curl',
                    tabName: 'tester',
                    getState: () => ({ content }),
                    extraActions: response
                        ? [
                              {
                                  id: 'copy-response',
                                  label: 'Copy Response',
                                  icon: Copy,
                                  handler: () => copy(prettyBody),
                              },
                          ]
                        : [],
                }}
            />
        </ToolTabWrapper>
    );
}
