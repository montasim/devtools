'use client';

import { ToolContentSkeleton } from '@/app/(tools)/loading';
import { useState, useMemo } from 'react';
import { useToolState } from '../../core/hooks/use-tool-state';
import { useToolActions } from '../../core/hooks/use-tool-actions';
import { ToolTabWrapper } from '../../core/components/tool-tab-wrapper';
import { EditorPaneHeader } from '../../core/components/editor-pane-header';
import { ShareSidebarModal } from '../../core/plugins/share-sidebar';
import { STORAGE_KEYS } from '@/lib/utils/constants';
import { parseHttpRequest, type HeaderEntry } from '../utils/parser';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Globe, FileText, Copy, Check, Play, List } from 'lucide-react';
import { useClipboard } from '@/lib/hooks/use-clipboard';
import type { TabComponentProps } from '../../core/types/tool';

function getMethodBadgeStyle(method: string) {
    const m = method.toUpperCase();
    if (m === 'GET') return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
    if (m === 'POST') return 'bg-amber-500/10 text-amber-500 border-amber-500/20';
    if (m === 'PUT' || m === 'PATCH') return 'bg-indigo-500/10 text-indigo-500 border-indigo-500/20';
    if (m === 'DELETE') return 'bg-rose-500/10 text-rose-500 border-rose-500/20';
    return 'bg-muted text-muted-foreground border-border';
}

export default function ParserTab({ sharedData, readOnly }: TabComponentProps) {
    const { content, setContent, isReady } = useToolState({
        storageKey: STORAGE_KEYS.HTTP_HEADER_INPUT_CONTENT,
        sharedData,
        tabId: 'parser',
        readOnly,
    });

    const [shareOpen, setShareOpen] = useState(false);
    const [copiedHeaderIdx, setCopiedHeaderIdx] = useState<number | null>(null);
    const [copiedCurl, setCopiedCurl] = useState(false);
    const [copiedUrl, setCopiedUrl] = useState(false);
    
    const { copy } = useClipboard();

    const parsed = useMemo(() => {
        if (!content.trim()) return null;
        return parseHttpRequest(content);
    }, [content]);

    const handleCopyHeader = async (header: HeaderEntry, idx: number) => {
        await copy(`${header.key}: ${header.value}`);
        setCopiedHeaderIdx(idx);
        setTimeout(() => setCopiedHeaderIdx(null), 1500);
    };

    const handleCopyCurl = async (curl: string) => {
        await copy(curl);
        setCopiedCurl(true);
        setTimeout(() => setCopiedCurl(false), 1500);
    };

    const handleCopyUrl = async (url: string) => {
        await copy(url);
        setCopiedUrl(true);
        setTimeout(() => setCopiedUrl(false), 1500);
    };

    const { actions } = useToolActions({
        pageName: 'http-header-parser',
        tabId: 'parser',
        getContent: () => content,
        onClear: () => setContent(''),
        shareDialogOpen: shareOpen,
        setShareDialogOpen: setShareOpen,
        readOnly,
    });

    if (!isReady) return <ToolContentSkeleton />;

    return (
        <ToolTabWrapper actions={actions}>
            <div className="flex flex-col gap-4 md:flex-row">
                <div className="min-w-0 w-full md:w-1/2 flex flex-col">
                    <div className="flex flex-col gap-2 h-full">
                        <EditorPaneHeader
                            label="Raw HTTP Request Headers"
                            content={content}
                            onContentChange={setContent}
                            onClear={() => setContent('')}
                            hideInputActions={readOnly}
                        />
                        <div className="relative flex-1">
                            <Textarea
                                value={content}
                                onChange={(e) => setContent(e.target.value)}
                                placeholder="Paste raw HTTP headers or devtools network trace here (e.g. GET /api/v1 HTTP/1.1\nHost: example.com...)"
                                className="min-h-[350px] resize-none font-mono text-sm md:min-h-[450px] lg:min-h-[550px] w-full"
                                style={{ fieldSizing: 'fixed', overflow: 'auto' }}
                                readOnly={readOnly}
                            />
                        </div>
                    </div>
                </div>

                <div className="min-w-0 w-full md:w-1/2 flex flex-col">
                    <div className="flex flex-col gap-2 h-full">
                        <EditorPaneHeader
                            label="Parsed Request Summary"
                            content=""
                            onContentChange={() => {}}
                            hideInputActions
                        />
                        <div className="flex-1 border rounded-lg bg-card text-card-foreground p-4 overflow-auto min-h-[350px] md:min-h-[450px] lg:min-h-[550px] flex flex-col">
                            {parsed ? (
                                <div className="space-y-4 flex-1 flex flex-col">
                                    {/* Badges Grid */}
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <span className={`px-2.5 py-0.5 rounded border text-xs font-semibold uppercase ${getMethodBadgeStyle(parsed.method)}`}>
                                            {parsed.method}
                                        </span>
                                        <span className="px-2.5 py-0.5 rounded border border-border bg-muted/50 text-muted-foreground text-xs font-mono">
                                            {parsed.protocol}
                                        </span>
                                    </div>

                                    {/* URL Input Copy Row */}
                                    <div className="flex flex-col gap-1.5">
                                        <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest">
                                            Resolved Request URL
                                        </span>
                                        <div className="flex gap-2">
                                            <input
                                                type="text"
                                                readOnly
                                                value={parsed.url}
                                                className="flex-1 h-8 rounded border px-2.5 text-xs font-mono bg-muted/30 outline-none truncate"
                                            />
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => handleCopyUrl(parsed.url)}
                                                className="h-8 shrink-0 text-xs px-3"
                                            >
                                                {copiedUrl ? (
                                                    <Check className="h-3.5 w-3.5 text-emerald-500" />
                                                ) : (
                                                    <Copy className="h-3.5 w-3.5" />
                                                )}
                                            </Button>
                                        </div>
                                    </div>

                                    {/* cURL Command Codeblock */}
                                    <div className="flex flex-col gap-1.5">
                                        <div className="flex items-center justify-between">
                                            <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest">
                                                Generated cURL Command
                                            </span>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleCopyCurl(parsed.curl)}
                                                className="h-6 gap-1 text-xs text-primary hover:text-primary hover:bg-primary/10 px-2"
                                            >
                                                {copiedCurl ? (
                                                    <>
                                                        <Check className="h-3 w-3 text-emerald-500" />
                                                        Copied
                                                    </>
                                                ) : (
                                                    <>
                                                        <Copy className="h-3 w-3" />
                                                        Copy Command
                                                    </>
                                                )}
                                            </Button>
                                        </div>
                                        <div className="relative bg-muted/40 rounded-md border p-3 max-h-48 overflow-auto font-mono text-xs text-muted-foreground leading-normal whitespace-pre">
                                            <code>{parsed.curl}</code>
                                        </div>
                                    </div>

                                    {/* Headers Table */}
                                    <div className="flex-1 flex flex-col gap-1.5">
                                        <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest">
                                            Header Key-Values ({parsed.headers.length})
                                        </span>
                                        {parsed.headers.length > 0 ? (
                                            <div className="border rounded-md divide-y divide-border overflow-hidden bg-muted/10">
                                                {parsed.headers.map((header, idx) => (
                                                    <div
                                                        key={idx}
                                                        className="group flex items-start justify-between gap-4 p-2.5 hover:bg-muted/30 transition-colors text-xs"
                                                    >
                                                        <div className="min-w-0 flex-1 flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-2">
                                                            <span className="font-semibold text-primary shrink-0 break-all">
                                                                {header.key}
                                                            </span>
                                                            <span className="text-muted-foreground break-all leading-normal font-mono">
                                                                {header.value}
                                                            </span>
                                                        </div>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => handleCopyHeader(header, idx)}
                                                            className="h-7 w-7 p-0 shrink-0 opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity"
                                                        >
                                                            {copiedHeaderIdx === idx ? (
                                                                <Check className="h-3.5 w-3.5 text-emerald-500" />
                                                            ) : (
                                                                <Copy className="h-3.5 w-3.5 text-muted-foreground" />
                                                            )}
                                                        </Button>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="flex-1 flex items-center justify-center border border-dashed rounded-md p-4 text-center text-muted-foreground text-xs">
                                                No key-value headers detected in input
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ) : (
                                <div className="flex-1 flex flex-col items-center justify-center text-center p-6 bg-slate-50/50 dark:bg-slate-900/10 rounded-md">
                                    <List className="h-10 w-10 text-muted-foreground/40 mb-2" />
                                    <h3 className="font-semibold text-sm text-muted-foreground">Request Details</h3>
                                    <p className="text-xs text-muted-foreground/60 max-w-xs mt-1">
                                        Paste copied request headers in the editor to inspect request details, headers table, and generated cURL commands
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
            <ShareSidebarModal
                open={shareOpen}
                onOpenChange={setShareOpen}
                config={{
                    pageName: 'http-header-parser',
                    tabName: 'parser',
                    getState: () => ({ content }),
                    extraActions: parsed
                        ? [
                              {
                                  id: 'copy-curl',
                                  label: 'Copy cURL Command',
                                  icon: Copy,
                                  handler: () => copy(parsed.curl),
                              },
                          ]
                        : [],
                }}
            />
        </ToolTabWrapper>
    );
}
