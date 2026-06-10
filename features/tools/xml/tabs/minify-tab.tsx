'use client';

import { useState } from 'react';
import { useToolState } from '../../core/hooks/use-tool-state';
import { useToolActions } from '../../core/hooks/use-tool-actions';
import { ToolTabWrapper } from '../../core/components/tool-tab-wrapper';
import { ShareSidebarModal } from '../../core/plugins/share-sidebar';
import { STORAGE_KEYS } from '@/lib/utils/constants';
import { useXmlMinify } from '../hooks/use-xml-minify';
import { XmlEditor } from '../components/xml-editor';
import { useClipboard } from '@/lib/hooks/use-clipboard';
import { Copy, Code, Minimize2 } from 'lucide-react';
import { EditorPaneHeader } from '../../core/components/editor-pane-header';
import type { TabComponentProps } from '../../core/types/tool';

export default function MinifyTab({ sharedData, readOnly }: TabComponentProps) {
    const { content, setContent, isReady } = useToolState({
        storageKey: STORAGE_KEYS.XML_MINIFY_LEFT_CONTENT,
        sharedData,
        tabId: 'minify',
        readOnly,
    });
    const [shareOpen, setShareOpen] = useState(false);
    const { minified, error } = useXmlMinify(content);
    const { copy } = useClipboard();

    const { actions } = useToolActions({
        pageName: 'xml',
        tabId: 'minify',
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
                            label="Input XML"
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
                            emptyTitle="Add XML to minify"
                            emptyDescription="Paste XML or start typing to see minified output"
                        />
                    </div>
                </div>
                <div className="min-w-0 w-full md:w-1/2">
                    <div className="flex flex-col gap-2">
                        <EditorPaneHeader
                            label="Minified Output"
                            content={error ? '' : minified}
                            onContentChange={() => {}}
                            downloadFilename="minified.xml"
                            hideInputActions
                        />
                        <XmlEditor
                            value={error ? '' : minified}
                            onChange={() => {}}
                            readOnly
                            emptyIcon={Minimize2}
                            emptyTitle="Minified output"
                            emptyDescription="Minified XML will appear here once you add input"
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
                    pageName: 'xml',
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
