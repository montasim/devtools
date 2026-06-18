'use client';
import { ToolContentSkeleton } from '@/app/(tools)/loading';

import { useState } from 'react';
import { useToolState } from '../../core/hooks/use-tool-state';
import { useToolActions } from '../../core/hooks/use-tool-actions';
import { ToolTabWrapper } from '../../core/components/tool-tab-wrapper';
import { EditorPaneHeader } from '../../core/components/editor-pane-header';
import { ShareSidebarModal } from '../../core/plugins/share-sidebar';
import { useJsonToYaml } from '../hooks/use-json-to-yaml';
import { TextEditor } from '../../text/components/text-editor';
import { useClipboard } from '@/lib/hooks/use-clipboard';
import { Copy, Braces, Layers } from 'lucide-react';
import type { TabComponentProps } from '../../core/types/tool';

export default function JsonToYamlTab({ sharedData, readOnly }: TabComponentProps) {
    const { content, setContent, isReady } = useToolState({
        storageKey: 'json-to-yaml-json-content',
        sharedData,
        tabId: 'json-to-yaml',
        readOnly,
    });
    const [shareOpen, setShareOpen] = useState(false);
    const { yamlOutput, error } = useJsonToYaml(content);
    const { copy } = useClipboard();

    const { actions } = useToolActions({
        pageName: 'yaml',
        tabId: 'json-to-yaml',
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
                            hideInputActions={readOnly}
                        />
                        <TextEditor
                            value={content}
                            onChange={setContent}
                            readOnly={readOnly}
                            emptyIcon={Braces}
                            emptyTitle="Add JSON to convert"
                            emptyDescription="Paste JSON on the left to see the YAML output on the right"
                        />
                    </div>
                </div>
                <div className="min-w-0 w-full md:w-1/2">
                    <div className="flex flex-col gap-2">
                        <EditorPaneHeader
                            label="YAML Output"
                            content={error ? '' : yamlOutput}
                            onContentChange={() => {}}
                            downloadFilename="output.yaml"
                            hideInputActions
                        />
                        <TextEditor
                            value={error ? '' : yamlOutput}
                            onChange={() => {}}
                            readOnly
                            emptyIcon={Layers}
                            emptyTitle="YAML output"
                            emptyDescription="Converted YAML will appear here once you add JSON input"
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
                    tabName: 'json-to-yaml',
                    getState: () => ({ content }),
                    extraActions: yamlOutput
                        ? [
                              {
                                  id: 'copy-yaml',
                                  label: 'Copy YAML',
                                  icon: Copy,
                                  handler: () => copy(yamlOutput),
                              },
                          ]
                        : [],
                }}
            />
        </ToolTabWrapper>
    );
}
