'use client';

import { useState } from 'react';
import { Braces, Copy, Rows3 } from '@/components/icons';
import { ToolContentSkeleton } from '@/app/(tools)/loading';
import { STORAGE_KEYS } from '@/lib/utils/constants';
import { useClipboard } from '@/lib/hooks/use-clipboard';
import { EditorPaneHeader } from '../../core/components/editor-pane-header';
import { ToolTabWrapper } from '../../core/components/tool-tab-wrapper';
import { useToolActions } from '../../core/hooks/use-tool-actions';
import { useToolState } from '../../core/hooks/use-tool-state';
import { ShareSidebarModal } from '../../core/plugins/share-sidebar';
import type { TabComponentProps } from '../../core/types/tool';
import { TextEditor } from '../../text/components/text-editor';
import { useJsonToToon } from '../hooks/use-toon-conversion';

export default function JsonToToonTab({ sharedData, readOnly }: TabComponentProps) {
    const { content, setContent, isReady } = useToolState({
        storageKey: STORAGE_KEYS.JSON_TO_TOON_CONTENT,
        sharedData,
        tabId: 'json-to-toon',
        readOnly,
    });
    const [shareOpen, setShareOpen] = useState(false);
    const { output, error } = useJsonToToon(content);
    const { copy } = useClipboard();

    const { actions } = useToolActions({
        pageName: 'json',
        tabId: 'json-to-toon',
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
                            label="Input JSON"
                            content={content}
                            onContentChange={setContent}
                            onClear={() => setContent('')}
                            accept=".json,.txt"
                            hideInputActions={readOnly}
                        />
                        <TextEditor
                            value={content}
                            onChange={setContent}
                            readOnly={readOnly}
                            emptyIcon={Braces}
                            emptyTitle="Add JSON to convert"
                            emptyDescription="Paste JSON on the left to see compact TOON on the right"
                        />
                    </div>
                </div>
                <div className="min-w-0 w-full md:w-1/2">
                    <div className="flex flex-col gap-2">
                        <EditorPaneHeader
                            label="TOON Output"
                            content={error ? '' : output}
                            onContentChange={() => {}}
                            downloadFilename="output.toon"
                            hideInputActions
                        />
                        <TextEditor
                            value={error ? '' : output}
                            onChange={() => {}}
                            readOnly
                            emptyIcon={Rows3}
                            emptyTitle="TOON output"
                            emptyDescription="Converted TOON will appear here once you add valid JSON"
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
                    tabName: 'json-to-toon',
                    getState: () => ({ content }),
                    extraActions: output
                        ? [
                              {
                                  id: 'copy-toon',
                                  label: 'Copy TOON',
                                  icon: Copy,
                                  handler: () => copy(output),
                              },
                          ]
                        : [],
                }}
            />
        </ToolTabWrapper>
    );
}
