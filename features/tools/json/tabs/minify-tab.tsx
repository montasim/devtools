'use client';

import { useState } from 'react';
import { useToolState } from '../../core/hooks/use-tool-state';
import { useToolActions } from '../../core/hooks/use-tool-actions';
import { ToolTabWrapper } from '../../core/components/tool-tab-wrapper';
import { EditorPaneHeader } from '../../core/components/editor-pane-header';
import { ShareSidebarModal } from '../../core/plugins/share-sidebar';
import { STORAGE_KEYS } from '@/lib/utils/constants';
import { useJsonMinify } from '../hooks/use-json-minify';
import { JsonEditor } from '../components/json-editor';
import { useClipboard } from '@/lib/hooks/use-clipboard';
import { Copy, Braces, Minimize2 } from 'lucide-react';
import type { TabComponentProps } from '../../core/types/tool';

export default function MinifyTab({ sharedData }: TabComponentProps) {
    const { content, setContent, isReady } = useToolState({
        storageKey: STORAGE_KEYS.JSON_MINIFY_LEFT_CONTENT,
        sharedData,
        tabId: 'minify',
    });
    const [shareOpen, setShareOpen] = useState(false);
    const { minified, error } = useJsonMinify(content);
    const { copy } = useClipboard();

    const { actions } = useToolActions({
        pageName: 'json',
        tabId: 'minify',
        getContent: () => content,
        onClear: () => setContent(''),
        shareDialogOpen: shareOpen,
        setShareDialogOpen: setShareOpen,
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
                        />
                        <JsonEditor
                            value={content}
                            onChange={setContent}
                            emptyIcon={Braces}
                            emptyTitle="Add JSON to minify"
                            emptyDescription="Paste formatted JSON or start typing to see minified output"
                        />
                    </div>
                </div>
                <div className="min-w-0 w-full md:w-1/2">
                    <div className="flex flex-col gap-2">
                        <EditorPaneHeader
                            label="Minified Output"
                            content={error ? '' : minified}
                            onContentChange={() => {}}
                            downloadFilename="minified.json"
                            hideInputActions
                        />
                        <JsonEditor
                            value={error ? '' : minified}
                            onChange={() => {}}
                            readOnly
                            emptyIcon={Minimize2}
                            emptyTitle="Minified output"
                            emptyDescription="Minified JSON will appear here once you add input"
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
