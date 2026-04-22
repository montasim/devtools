'use client';

import { useMemo, useState, useCallback } from 'react';
import { useToolState } from '../../core/hooks/use-tool-state';
import { useToolActions } from '../../core/hooks/use-tool-actions';
import { ToolTabWrapper } from '../../core/components/tool-tab-wrapper';
import { ShareSidebarModal } from '../../core/plugins/share-sidebar';
import { STORAGE_KEYS } from '@/lib/utils/constants';
import { TextEditor } from '../../text/components/text-editor';
import { useClipboard } from '@/lib/hooks/use-clipboard';
import { Copy, FileText } from 'lucide-react';
import { EditorPaneHeader } from '../../core/components/editor-pane-header';
import { EmptyEditorPrompt } from '@/components/ui/empty-editor-prompt';
import { renderMarkdown, getMarkdownStats } from '../utils/markdown-operations';
import type { TabComponentProps } from '../../core/types/tool';

export default function PreviewTab({ sharedData, readOnly }: TabComponentProps) {
    const { content, setContent, isReady } = useToolState({
        storageKey: STORAGE_KEYS.MARKDOWN_PREVIEW_INPUT,
        sharedData,
        tabId: 'preview',
        readOnly,
    });
    const [shareOpen, setShareOpen] = useState(false);
    const { copy } = useClipboard();

    const html = useMemo(() => renderMarkdown(content), [content]);
    const stats = useMemo(() => getMarkdownStats(content), [content]);

    const { actions } = useToolActions({
        pageName: 'markdown',
        tabId: 'preview',
        getContent: () => content,
        onClear: () => setContent(''),
        shareDialogOpen: shareOpen,
        setShareDialogOpen: setShareOpen,
        readOnly,
    });

    const handleCopyHtml = useCallback(async () => {
        if (html) await copy(html, 'HTML copied to clipboard');
    }, [html, copy]);

    if (!isReady) return null;

    return (
        <ToolTabWrapper actions={actions}>
            <div className="flex flex-col gap-4 md:flex-row">
                <div className="min-w-0 w-full md:w-1/2">
                    <div className="flex flex-col gap-2">
                        <EditorPaneHeader
                            label="Markdown"
                            content={content}
                            onContentChange={setContent}
                            onClear={() => setContent('')}
                            hideInputActions={readOnly}
                        />
                        <TextEditor
                            value={content}
                            onChange={setContent}
                            readOnly={readOnly}
                            emptyIcon={FileText}
                            emptyTitle="Write Markdown"
                            emptyDescription="Type or paste Markdown on the left to see a live preview"
                        />
                    </div>
                </div>
                <div className="min-w-0 w-full md:w-1/2">
                    <div className="flex flex-col gap-2">
                        <EditorPaneHeader
                            label="Preview"
                            content={html}
                            onContentChange={() => {}}
                            hideInputActions
                            actions={
                                <button
                                    type="button"
                                    onClick={handleCopyHtml}
                                    disabled={!html}
                                    className="inline-flex items-center gap-1 rounded-md border px-2 py-1 text-xs text-muted-foreground transition-colors hover:bg-muted disabled:opacity-50"
                                >
                                    <Copy className="h-3 w-3" />
                                    Copy HTML
                                </button>
                            }
                        />
                        {html ? (
                            <div
                                className="markdown-preview min-h-[350px] overflow-y-auto rounded-lg border p-6 md:min-h-[400px] lg:min-h-[500px]"
                                dangerouslySetInnerHTML={{ __html: html }}
                            />
                        ) : (
                            <div className="relative min-h-[350px] rounded-lg border md:min-h-[400px] lg:min-h-[500px]">
                                <EmptyEditorPrompt
                                    icon={FileText}
                                    title="Markdown preview"
                                    description="Write Markdown on the left to see a live preview here"
                                    showActions={false}
                                    overlay
                                />
                            </div>
                        )}
                    </div>
                    <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                        <span>{stats.chars.toLocaleString()} chars</span>
                        <span>{stats.words.toLocaleString()} words</span>
                        <span>{stats.lines.toLocaleString()} lines</span>
                    </div>
                </div>
            </div>
            <ShareSidebarModal
                open={shareOpen}
                onOpenChange={setShareOpen}
                config={{
                    pageName: 'markdown',
                    tabName: 'preview',
                    getState: () => ({ content }),
                    extraActions: html
                        ? [
                              {
                                  id: 'copy-html',
                                  label: 'Copy HTML',
                                  icon: Copy,
                                  handler: () => copy(html, 'HTML copied to clipboard'),
                              },
                          ]
                        : [],
                }}
            />
        </ToolTabWrapper>
    );
}
