'use client';
import { ToolContentSkeleton } from '@/app/(tools)/loading';

import { useState } from 'react';
import { useToolState } from '../../core/hooks/use-tool-state';
import { useToolActions } from '../../core/hooks/use-tool-actions';
import { ToolTabWrapper } from '../../core/components/tool-tab-wrapper';
import { EditorPaneHeader } from '../../core/components/editor-pane-header';
import { ShareSidebarModal } from '../../core/plugins/share-sidebar';
import { useYamlToJson } from '../hooks/use-yaml-to-json';
import { TextEditor } from '../../text/components/text-editor';
import { useClipboard } from '@/lib/hooks/use-clipboard';
import { Copy, Layers, Braces } from 'lucide-react';
import type { TabComponentProps } from '../../core/types/tool';

export default function YamlToJsonTab({ sharedData, readOnly }: TabComponentProps) {
    const { content, setContent, isReady } = useToolState({
        storageKey: 'yaml-to-json-yaml-content',
        sharedData,
        tabId: 'yaml-to-json',
        readOnly,
    });
    const [shareOpen, setShareOpen] = useState(false);
    const { json, error } = useYamlToJson(content);
    const { copy } = useClipboard();

    const { actions } = useToolActions({
        pageName: 'yaml',
        tabId: 'yaml-to-json',
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
                            emptyTitle="Add YAML to convert"
                            emptyDescription="Paste YAML on the left to see the JSON output on the right"
                        />
                    </div>
                </div>
                <div className="min-w-0 w-full md:w-1/2">
                    <div className="flex flex-col gap-2">
                        <EditorPaneHeader
                            label="JSON Output"
                            content={error ? '' : json}
                            onContentChange={() => {}}
                            downloadFilename="output.json"
                            hideInputActions
                        />
                        <TextEditor
                            value={error ? '' : json}
                            onChange={() => {}}
                            readOnly
                            emptyIcon={Braces}
                            emptyTitle="JSON output"
                            emptyDescription="Converted JSON will appear here once you add YAML input"
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
                    tabName: 'yaml-to-json',
                    getState: () => ({ content }),
                    extraActions: json
                        ? [
                              {
                                  id: 'copy-json',
                                  label: 'Copy JSON',
                                  icon: Copy,
                                  handler: () => copy(json),
                              },
                          ]
                        : [],
                }}
            />
        </ToolTabWrapper>
    );
}
