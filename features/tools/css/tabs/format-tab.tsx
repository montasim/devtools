'use client';
import { ToolContentSkeleton } from '@/app/(tools)/loading';

import { useState } from 'react';
import { useToolState } from '../../core/hooks/use-tool-state';
import { useToolActions } from '../../core/hooks/use-tool-actions';
import { ToolTabWrapper } from '../../core/components/tool-tab-wrapper';
import { ShareSidebarModal } from '../../core/plugins/share-sidebar';
import { useCssFormat } from '../hooks/use-css-format';
import { TextEditor } from '../../text/components/text-editor';
import { useClipboard } from '@/lib/hooks/use-clipboard';
import { Copy, Paintbrush, FileCode } from 'lucide-react';
import { EditorPaneHeader } from '../../core/components/editor-pane-header';
import type { TabComponentProps } from '../../core/types/tool';

export default function FormatTab({ sharedData, readOnly }: TabComponentProps) {
    const { content, setContent, isReady } = useToolState({
        storageKey: 'css-format-content',
        sharedData,
        tabId: 'format',
        readOnly,
    });
    const [shareOpen, setShareOpen] = useState(false);
    const { formatted, error } = useCssFormat(content);
    const { copy } = useClipboard();

    const { actions } = useToolActions({
        pageName: 'css',
        tabId: 'format',
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
                            emptyTitle="Add CSS to format"
                            emptyDescription="Paste unformatted CSS or start typing to see formatted output"
                        />
                    </div>
                </div>
                <div className="min-w-0 w-full md:w-1/2">
                    <div className="flex flex-col gap-2">
                        <EditorPaneHeader
                            label="Formatted Output"
                            content={error ? '' : formatted}
                            onContentChange={() => {}}
                            downloadFilename="formatted.css"
                            hideInputActions
                        />
                        <TextEditor
                            value={error ? '' : formatted}
                            onChange={() => {}}
                            readOnly
                            emptyIcon={FileCode}
                            emptyTitle="Formatted output"
                            emptyDescription="Formatted CSS will appear here once you add input"
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
                    pageName: 'css',
                    tabName: 'format',
                    getState: () => ({ content }),
                    extraActions: formatted
                        ? [
                              {
                                  id: 'copy-formatted',
                                  label: 'Copy Formatted',
                                  icon: Copy,
                                  handler: () => copy(formatted),
                              },
                          ]
                        : [],
                }}
            />
        </ToolTabWrapper>
    );
}
