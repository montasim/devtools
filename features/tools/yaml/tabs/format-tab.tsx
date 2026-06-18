'use client';
import { ToolContentSkeleton } from '@/app/(tools)/loading';

import { useState } from 'react';
import { useToolState } from '../../core/hooks/use-tool-state';
import { useToolActions } from '../../core/hooks/use-tool-actions';
import { ToolTabWrapper } from '../../core/components/tool-tab-wrapper';
import { EditorPaneHeader } from '../../core/components/editor-pane-header';
import { ShareSidebarModal } from '../../core/plugins/share-sidebar';
import { useYamlFormat } from '../hooks/use-yaml-format';
import { TextEditor } from '../../text/components/text-editor';
import { useClipboard } from '@/lib/hooks/use-clipboard';
import { Copy, Layers, FileCode } from 'lucide-react';
import type { TabComponentProps } from '../../core/types/tool';

export default function FormatTab({ sharedData, readOnly }: TabComponentProps) {
    const { content, setContent, isReady } = useToolState({
        storageKey: 'yaml-format-content',
        sharedData,
        tabId: 'format',
        readOnly,
    });
    const [shareOpen, setShareOpen] = useState(false);
    const { formatted, error } = useYamlFormat(content);
    const { copy } = useClipboard();

    const { actions } = useToolActions({
        pageName: 'yaml',
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
                            label="Input YAML"
                            content={content}
                            onContentChange={setContent}
                            onClear={() => setContent('')}
                            hideInputActions={readOnly}
                        />
                        <TextEditor
                            value={content}
                            onChange={setContent}
                            readOnly={readOnly}
                            emptyIcon={Layers}
                            emptyTitle="Add YAML to format"
                            emptyDescription="Paste unformatted YAML or start typing to see formatted output"
                        />
                    </div>
                </div>
                <div className="min-w-0 w-full md:w-1/2">
                    <div className="flex flex-col gap-2">
                        <EditorPaneHeader
                            label="Formatted YAML"
                            content={error ? '' : formatted}
                            onContentChange={() => {}}
                            downloadFilename="formatted.yaml"
                            hideInputActions
                        />
                        <TextEditor
                            value={error ? '' : formatted}
                            onChange={() => {}}
                            readOnly
                            emptyIcon={FileCode}
                            emptyTitle="Formatted output"
                            emptyDescription="Formatted YAML will appear here once you add input"
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
                    pageName: 'yaml',
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
