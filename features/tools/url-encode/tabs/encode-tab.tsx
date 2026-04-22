'use client';

import { useState, useMemo, useCallback } from 'react';
import { useToolState } from '../../core/hooks/use-tool-state';
import { useToolActions } from '../../core/hooks/use-tool-actions';
import { ToolTabWrapper } from '../../core/components/tool-tab-wrapper';
import { ShareSidebarModal } from '../../core/plugins/share-sidebar';
import { STORAGE_KEYS } from '@/lib/utils/constants';
import { TextEditor } from '../../text/components/text-editor';
import { useClipboard } from '@/lib/hooks/use-clipboard';
import { Button } from '@/components/ui/button';
import { Copy, Link } from 'lucide-react';
import { EditorPaneHeader } from '../../core/components/editor-pane-header';
import { urlEncode, urlEncodeURI, ENCODE_OPERATIONS } from '../utils/url-operations';
import type { TabComponentProps } from '../../core/types/tool';

export default function EncodeTab({ sharedData, readOnly }: TabComponentProps) {
    const { content, setContent, isReady } = useToolState({
        storageKey: STORAGE_KEYS.URL_ENCODE_INPUT,
        sharedData,
        tabId: 'encode',
        readOnly,
    });
    const [operation, setOperation] = useState('component');
    const [shareOpen, setShareOpen] = useState(false);
    const { copy } = useClipboard();

    const encoded = useMemo(() => {
        if (!content) return '';
        return operation === 'uri' ? urlEncodeURI(content) : urlEncode(content);
    }, [content, operation]);

    const { actions } = useToolActions({
        pageName: 'url-encode',
        tabId: 'encode',
        getContent: () => content,
        onClear: () => setContent(''),
        shareDialogOpen: shareOpen,
        setShareDialogOpen: setShareOpen,
        readOnly,
    });

    if (!isReady) return null;

    return (
        <ToolTabWrapper
            actions={actions}
            leadingContent={
                <div className="flex flex-wrap items-center gap-1.5">
                    {ENCODE_OPERATIONS.map((op) => (
                        <Button
                            key={op.value}
                            variant={operation === op.value ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setOperation(op.value)}
                            className="h-7 text-xs font-mono"
                        >
                            {op.label}
                        </Button>
                    ))}
                </div>
            }
        >
            <div className="flex flex-col gap-4 md:flex-row">
                <div className="min-w-0 w-full md:w-1/2">
                    <div className="flex flex-col gap-2">
                        <EditorPaneHeader
                            label="Plain Text"
                            content={content}
                            onContentChange={setContent}
                            onClear={() => setContent('')}
                            hideInputActions={readOnly}
                        />
                        <TextEditor
                            value={content}
                            onChange={setContent}
                            readOnly={readOnly}
                            emptyIcon={Link}
                            emptyTitle="Enter text to encode"
                            emptyDescription="Type or paste text to URL-encode"
                        />
                    </div>
                </div>
                <div className="min-w-0 w-full md:w-1/2">
                    <div className="flex flex-col gap-2">
                        <EditorPaneHeader
                            label="Encoded Output"
                            content={encoded}
                            onContentChange={() => {}}
                            downloadFilename="encoded.txt"
                            hideInputActions
                        />
                        <TextEditor
                            value={encoded}
                            onChange={() => {}}
                            readOnly
                            emptyTitle="Encoded output"
                            emptyDescription="URL-encoded text will appear here"
                            showEmptyPrompt
                        />
                    </div>
                </div>
            </div>
            <ShareSidebarModal
                open={shareOpen}
                onOpenChange={setShareOpen}
                config={{
                    pageName: 'url-encode',
                    tabName: 'encode',
                    getState: () => ({ content, operation }),
                    extraActions: encoded
                        ? [
                              {
                                  id: 'copy-encoded',
                                  label: 'Copy Encoded',
                                  icon: Copy,
                                  handler: () => copy(encoded),
                              },
                          ]
                        : [],
                }}
            />
        </ToolTabWrapper>
    );
}
