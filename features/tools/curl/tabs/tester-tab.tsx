'use client';

import { ToolContentSkeleton } from '@/app/(tools)/loading';

import { useState, useCallback, useMemo } from 'react';
import { useToolState } from '../../core/hooks/use-tool-state';
import { useToolActions } from '../../core/hooks/use-tool-actions';
import { ToolTabWrapper } from '../../core/components/tool-tab-wrapper';
import { ShareSidebarModal } from '../../core/plugins/share-sidebar';
import { STORAGE_KEYS } from '@/lib/utils/constants';
import { TextEditor } from '../../text/components/text-editor';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
    CheckCircle2,
    Terminal,
} from 'lucide-react';
import type { TabComponentProps } from '../../core/types/tool';
import type { ParsedCurl } from '../utils/curl-parser';

interface RequestState {
    method: string;
    url: string;
    headers: Record<string, string>;
    body: string | null;
}

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
            const request: RequestState = {
                method: parsedRequest.method || 'GET',
                url: parsedRequest.url,
                headers: parsedRequest.headers || {},
                body: parsedRequest.data || null,
            };

            const result = await executeRequest(request);
            setResponse(result);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Request failed');
        } finally {
            setIsLoading(false);
        }
    }, [parsedRequest]);

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

    if (!isReady) return <ToolContentSkeleton />;

    const prettyBody = response ? prettifyBody(response.body, response.contentType) : '';

    const statusVariant = response ? (response.success ? 'default' : 'destructive') : 'outline';

    const leadingContent = (
        <Button
            onClick={handleExecute}
            disabled={!parsedRequest || isLoading || readOnly}
            className="gap-1.5 px-4"
            size="sm"
        >
            {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
                <Play className="h-4 w-4" />
            )}
            {isLoading ? 'Executing...' : 'Execute'}
        </Button>
    );

    return (
        <ToolTabWrapper actions={actions} leadingContent={leadingContent}>
            <div className="flex flex-col gap-4 md:flex-row">
                {/* Input Panel */}
                <div className="min-w-0 w-full md:w-1/2 flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                        <h3 className="text-sm font-semibold text-foreground">cURL Command</h3>
                        {parsedRequest && (
                            <Badge variant="outline" className="text-[10px]">
                                Parsed ✓
                            </Badge>
                        )}
                    </div>
                    <TextEditor
                        value={content}
                        onChange={setContent}
                        readOnly={readOnly}
                        emptyIcon={Terminal}
                        emptyTitle="Paste curl command"
                        emptyDescription="Paste a curl command to execute and see the response"
                    />
                </div>

                {/* Response Panel */}
                <div className="min-w-0 w-full md:w-1/2 flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                        <h3 className="text-sm font-semibold text-foreground">Response</h3>
                        {response && (
                            <div className="flex items-center gap-2">
                                <Badge variant={statusVariant} className="text-[10px]">
                                    {response.status}
                                </Badge>
                                <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
                                    <Clock className="h-3 w-3" />
                                    {formatTime(response.time)}
                                </span>
                                <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
                                    <Database className="h-3 w-3" />
                                    {formatSize(response.size)}
                                </span>
                            </div>
                        )}
                    </div>

                    {isLoading && (
                        <div className="flex items-center justify-center gap-3 py-16">
                            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                            <p className="text-sm text-muted-foreground">Executing request...</p>
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

                    {!isLoading && !error && !response && (
                        <div className="flex flex-col items-center justify-center gap-3 py-16">
                            <Terminal className="h-12 w-12 text-muted-foreground/30" />
                            <p className="text-sm text-muted-foreground">No response yet</p>
                            <p className="text-xs text-muted-foreground/60">
                                Execute a curl command to see the response
                            </p>
                        </div>
                    )}

                    {response && !isLoading && !error && (
                        <div className="flex flex-col gap-3">
                            {/* Status Bar */}
                            <div className="flex items-center gap-3 rounded-lg border bg-muted/30 px-4 py-2">
                                <div className="flex items-center gap-2">
                                    {response.success ? (
                                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                                    ) : (
                                        <AlertCircle className="h-4 w-4 text-red-600" />
                                    )}
                                    <span className="text-xs font-medium">
                                        {response.statusText}
                                    </span>
                                </div>
                                <div className="h-4 w-px bg-border" />
                                <span className="text-[11px] text-muted-foreground">
                                    {response.contentType || 'No content type'}
                                </span>
                            </div>

                            {/* Response Body */}
                            <div className="relative">
                                <button
                                    onClick={() => copy(prettyBody)}
                                    className="absolute right-2 top-2 z-10 rounded border bg-background px-2 py-1 text-[10px] text-muted-foreground hover:text-foreground transition-colors"
                                >
                                    <Copy className="h-3 w-3" />
                                </button>
                                <TextEditor
                                    value={prettyBody}
                                    onChange={() => {}}
                                    readOnly
                                    emptyTitle="Response body"
                                    showEmptyPrompt
                                />
                            </div>
                        </div>
                    )}
                </div>
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
