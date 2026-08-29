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
import { useToonToJson } from '../hooks/use-toon-conversion';

export default function ToonToJsonTab({ sharedData, readOnly }: TabComponentProps) {
    const { content, setContent, isReady } = useToolState({
        storageKey: STORAGE_KEYS.TOON_TO_JSON_CONTENT,
        sharedData,
        tabId: 'toon-to-json',
        readOnly,
    });
    const [shareOpen, setShareOpen] = useState(false);
    const { output, error } = useToonToJson(content);
    const { copy } = useClipboard();

    const { actions } = useToolActions({
        pageName: 'json',
        tabId: 'toon-to-json',
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
                            label="Input TOON"
                            content={content}
                            onContentChange={setContent}
                            onClear={() => setContent('')}
                            accept=".toon,.txt"
                            hideInputActions={readOnly}
                        />
                        <TextEditor
                            value={content}
                            onChange={setContent}
                            readOnly={readOnly}
                            emptyIcon={Rows3}
                            emptyTitle="Add TOON to convert"
                            emptyDescription="Paste TOON on the left to see formatted JSON on the right"
                        />
                    </div>
                </div>
                <div className="min-w-0 w-full md:w-1/2">
                    <div className="flex flex-col gap-2">
                        <EditorPaneHeader
                            label="JSON Output"
                            content={error ? '' : output}
                            onContentChange={() => {}}
                            downloadFilename="output.json"
                            hideInputActions
                        />
                        <TextEditor
                            value={error ? '' : output}
                            onChange={() => {}}
                            readOnly
                            emptyIcon={Braces}
                            emptyTitle="JSON output"
                            emptyDescription="Formatted JSON will appear here once you add valid TOON"
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
                    tabName: 'toon-to-json',
                    getState: () => ({ content }),
                    extraActions: output
                        ? [
                              {
                                  id: 'copy-json',
                                  label: 'Copy JSON',
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
