'use client';
import { ToolContentSkeleton } from '@/app/(tools)/loading';

import { useMemo, useState } from 'react';
import { useToolState } from '../../core/hooks/use-tool-state';
import { useToolActions } from '../../core/hooks/use-tool-actions';
import { ToolTabWrapper } from '../../core/components/tool-tab-wrapper';
import { EditorPaneHeader } from '../../core/components/editor-pane-header';
import { ShareSidebarModal } from '../../core/plugins/share-sidebar';
import { useCssMinify } from '../hooks/use-css-minify';
import { TextEditor } from '../../text/components/text-editor';
import { useClipboard } from '@/lib/hooks/use-clipboard';
import { Copy, Paintbrush, Minimize2 } from 'lucide-react';
import type { TabComponentProps } from '../../core/types/tool';

function formatBytes(bytes: number): string {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

export default function MinifyTab({ sharedData, readOnly }: TabComponentProps) {
    const { content, setContent, isReady } = useToolState({
        storageKey: 'css-minify-content',
        sharedData,
        tabId: 'minify',
        readOnly,
    });
    const [shareOpen, setShareOpen] = useState(false);
    const { minified, error } = useCssMinify(content);
    const { copy } = useClipboard();

    const stats = useMemo(() => {
        if (!minified || error) return null;
        const originalSize = new Blob([content]).size;
        const minifiedSize = new Blob([minified]).size;
        const percentSaved =
            originalSize > 0
                ? Math.max(0, ((originalSize - minifiedSize) / originalSize) * 100)
                : 0;
        return { originalSize, minifiedSize, percentSaved };
    }, [content, minified, error]);

    const { actions } = useToolActions({
        pageName: 'css',
        tabId: 'minify',
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
                <div className="min-w-0 w-full md:w-1/2">
                    <div className="flex flex-col gap-2">
                        <EditorPaneHeader
                            label="Input CSS"
                            content={content}
                            onContentChange={setContent}
                            onClear={() => setContent('')}
                            hideInputActions={readOnly}
                        />
                        <TextEditor
                            value={content}
                            onChange={setContent}
                            readOnly={readOnly}
                            emptyIcon={Paintbrush}
                            emptyTitle="Add CSS to minify"
                            emptyDescription="Paste formatted CSS or start typing to see minified output"
                        />
                    </div>
                </div>
                <div className="min-w-0 w-full md:w-1/2">
                    <div className="flex flex-col gap-2">
                        <EditorPaneHeader
                            label="Minified Output"
                            content={error ? '' : minified}
                            onContentChange={() => {}}
                            downloadFilename="minified.css"
                            hideInputActions
                        />
                        <TextEditor
                            value={error ? '' : minified}
                            onChange={() => {}}
                            readOnly
                            emptyIcon={Minimize2}
                            emptyTitle="Minified output"
                            emptyDescription="Minified CSS will appear here once you add input"
                            showEmptyPrompt
                        />
                        {error && <p className="text-sm text-destructive">{error}</p>}
                        {stats && (
                            <div className="grid grid-cols-3 gap-1.5 border rounded-xl p-2.5 bg-muted/20 text-center">
                                <div className="flex flex-col">
                                    <span className="text-[9px] text-muted-foreground uppercase font-bold tracking-wider">
                                        Original
                                    </span>
                                    <span className="text-xs font-mono font-semibold text-foreground">
                                        {formatBytes(stats.originalSize)}
                                    </span>
                                </div>
                                <div className="flex flex-col border-x">
                                    <span className="text-[9px] text-muted-foreground uppercase font-bold tracking-wider">
                                        Minified
                                    </span>
                                    <span className="text-xs font-mono font-semibold text-foreground">
                                        {formatBytes(stats.minifiedSize)}
                                    </span>
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-[9px] text-muted-foreground uppercase font-bold tracking-wider">
                                        Saved
                                    </span>
                                    <span className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400">
                                        -{stats.percentSaved.toFixed(1)}%
                                    </span>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
            <ShareSidebarModal
                open={shareOpen}
                onOpenChange={setShareOpen}
                config={{
                    pageName: 'css',
                    tabName: 'minify',
                    getState: () => ({ content }),
                    extraActions: minified
                        ? [
                              {
                                  id: 'copy-minified',
                                  label: 'Copy Minified',
                                  icon: Copy,
                                  handler: () => copy(minified),
                              },
                          ]
                        : [],
                }}
            />
        </ToolTabWrapper>
    );
}
