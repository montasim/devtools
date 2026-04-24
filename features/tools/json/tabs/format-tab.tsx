'use client';

import { useState } from 'react';
import { useToolState } from '../../core/hooks/use-tool-state';
import { useToolActions } from '../../core/hooks/use-tool-actions';
import { ToolTabWrapper } from '../../core/components/tool-tab-wrapper';
import { ShareSidebarModal } from '../../core/plugins/share-sidebar';
import { STORAGE_KEYS } from '@/lib/utils/constants';
import { useJsonFormat } from '../hooks/use-json-format';
import { JsonEditor } from '../components/json-editor';
import { useClipboard } from '@/lib/hooks/use-clipboard';
import { Copy, Braces, FileCode } from 'lucide-react';
import { EditorPaneHeader } from '../../core/components/editor-pane-header';
import type { TabComponentProps } from '../../core/types/tool';

export default function FormatTab({ sharedData, readOnly }: TabComponentProps) {
    const { content, setContent, isReady } = useToolState({
        storageKey: STORAGE_KEYS.JSON_FORMAT_LEFT_CONTENT,
        sharedData,
        tabId: 'format',
        readOnly,
    });
    const [shareOpen, setShareOpen] = useState(false);
    const { formatted, error } = useJsonFormat(content);
    const { copy } = useClipboard();

    const { actions } = useToolActions({
        pageName: 'json',
        tabId: 'format',
        getContent: () => content,
        onClear: () => setContent(''),
        shareDialogOpen: shareOpen,
        setShareDialogOpen: setShareOpen,
        readOnly,
    });

    if (!isReady) return null;

    return (
        <ToolTabWrapper actions={actions}>
            <div className="flex flex-col gap-4 md:flex-row">
                <div className="min-w-0 w-full md:w-1/2">
                    <div className="flex flex-col gap-2">
                        <EditorPaneHeader
                            label="Input JSON"
                            content={content}
                            onContentChange={setContent}
                            onClear={() => setContent('')}
                            hideInputActions={readOnly}
                        />
                        <JsonEditor
                            value={content}
                            onChange={setContent}
                            readOnly={readOnly}
                            emptyIcon={Braces}
                            emptyTitle="Add JSON to format"
                            emptyDescription="Paste unformatted JSON or start typing to see formatted output"
                        />
                    </div>
                </div>
                <div className="min-w-0 w-full md:w-1/2">
                    <div className="flex flex-col gap-2">
                        <EditorPaneHeader
                            label="Formatted Output"
                            content={error ? '' : formatted}
                            onContentChange={() => {}}
                            downloadFilename="formatted.json"
                            hideInputActions
                        />
                        <JsonEditor
                            value={error ? '' : formatted}
                            onChange={() => {}}
                            readOnly
                            emptyIcon={FileCode}
                            emptyTitle="Formatted output"
                            emptyDescription="Formatted JSON will appear here once you add input"
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
                    pageName: 'json',
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
