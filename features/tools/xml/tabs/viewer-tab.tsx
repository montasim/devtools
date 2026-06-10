'use client';

import { useState } from 'react';
import { useToolState } from '../../core/hooks/use-tool-state';
import { useToolActions } from '../../core/hooks/use-tool-actions';
import { ToolTabWrapper } from '../../core/components/tool-tab-wrapper';
import { ShareSidebarModal } from '../../core/plugins/share-sidebar';
import { STORAGE_KEYS } from '@/lib/utils/constants';
import { useXmlTree } from '../hooks/use-xml-tree';
import { XmlEditor } from '../components/xml-editor';
import { JsonTreeView } from '../../json/components/json-tree-view';
import { Code, GitBranch } from 'lucide-react';
import { EmptyEditorPrompt } from '@/components/ui/empty-editor-prompt';
import { EditorPaneHeader } from '../../core/components/editor-pane-header';
import type { TabComponentProps } from '../../core/types/tool';

export default function ViewerTab({ sharedData, readOnly }: TabComponentProps) {
    const { content, setContent, isReady } = useToolState({
        storageKey: STORAGE_KEYS.XML_VIEWER_CONTENT,
        sharedData,
        tabId: 'viewer',
        readOnly,
    });
    const [shareOpen, setShareOpen] = useState(false);
    const { tree } = useXmlTree(content);

    const { actions } = useToolActions({
        pageName: 'xml',
        tabId: 'viewer',
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
                            label="XML Input"
                            content={content}
                            onContentChange={setContent}
                            onClear={() => setContent('')}
                            hideInputActions={readOnly}
                        />
                        <XmlEditor
                            value={content}
                            onChange={setContent}
                            readOnly={readOnly}
                            emptyIcon={Code}
                            emptyTitle="Add XML to visualize"
                            emptyDescription="Paste XML data to see an interactive tree view"
                        />
                    </div>
                </div>
                <div className="min-w-0 w-full md:w-1/2">
                    <div className="flex flex-col gap-2">
                        <EditorPaneHeader
                            label="Tree View"
                            content={tree ? JSON.stringify(tree) : ''}
                            onContentChange={() => {}}
                            downloadFilename="tree-view.json"
                            hideInputActions
                        />
                        <div className="relative min-h-[250px] md:min-h-[400px] lg:min-h-[500px] overflow-auto rounded-lg border p-3 sm:p-4">
                            {tree ? (
                                <JsonTreeView tree={tree} />
                            ) : (
                                <EmptyEditorPrompt
                                    icon={GitBranch}
                                    title="Tree view"
                                    description="An interactive tree view will appear here once you add XML"
                                    showActions={false}
                                    overlay
                                />
                            )}
                        </div>
                    </div>
                </div>
            </div>
            <ShareSidebarModal
                open={shareOpen}
                onOpenChange={setShareOpen}
                config={{
                    pageName: 'xml',
                    tabName: 'viewer',
                    getState: () => ({ content }),
                }}
            />
        </ToolTabWrapper>
    );
}
