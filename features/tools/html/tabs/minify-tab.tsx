'use client';

import { ToolContentSkeleton } from '@/app/(tools)/loading';

import { useState } from 'react';
import { useToolState } from '../../core/hooks/use-tool-state';
import { useToolActions } from '../../core/hooks/use-tool-actions';
import { ToolTabWrapper } from '../../core/components/tool-tab-wrapper';
import { EditorPaneHeader } from '../../core/components/editor-pane-header';
import { ShareSidebarModal } from '../../core/plugins/share-sidebar';
import { STORAGE_KEYS } from '@/lib/utils/constants';
import { useHtmlMinify } from '../hooks/use-html-minify';
import { TextEditor } from '../../text/components/text-editor';
import { useClipboard } from '@/lib/hooks/use-clipboard';
import { Copy, Code2, Minimize2 } from 'lucide-react';
import type { TabComponentProps } from '../../core/types/tool';

export default function MinifyTab({ sharedData, readOnly }: TabComponentProps) {
    const { content, setContent, isReady } = useToolState({
        storageKey: STORAGE_KEYS.HTML_MINIFY_CONTENT,
        sharedData,
        tabId: 'minify',
        readOnly,
    });
    const [shareOpen, setShareOpen] = useState(false);
    const { minified, error } = useHtmlMinify(content);
    const { copy } = useClipboard();

    const { actions } = useToolActions({
        pageName: 'html',
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
                            label="Input HTML"
                            content={content}
                            onContentChange={setContent}
                            onClear={() => setContent('')}
                            hideInputActions={readOnly}
                            accept=".html,.htm,.txt"
                        />
                        <TextEditor
                            value={content}
                            onChange={setContent}
                            readOnly={readOnly}
                            emptyIcon={Code2}
                            emptyTitle="Add HTML to minify"
                            emptyDescription="Paste formatted HTML or start typing to see minified output"
                        />
                    </div>
                </div>
                <div className="min-w-0 w-full md:w-1/2">
                    <div className="flex flex-col gap-2">
                        <EditorPaneHeader
                            label="Minified Output"
                            content={error ? '' : minified}
                            onContentChange={() => {}}
                            downloadFilename="minified.html"
                            hideInputActions
                        />
                        <TextEditor
                            value={error ? '' : minified}
                            onChange={() => {}}
                            readOnly
                            emptyIcon={Minimize2}
                            emptyTitle="Minified output"
                            emptyDescription="Minified HTML will appear here once you add input"
                            showEmptyPrompt
                        />
                        {error && <p className="text-sm text-destructive">{error}</p>}
                    </div>
                </div>
            </div>
            <ShareSidebarModal
                open={shareOpen}
                onOpenChange={setShareOpen}
                config={{
                    pageName: 'html',
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
