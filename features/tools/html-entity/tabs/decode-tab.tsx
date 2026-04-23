'use client';

import { useState, useMemo } from 'react';
import { useToolState } from '../../core/hooks/use-tool-state';
import { useToolActions } from '../../core/hooks/use-tool-actions';
import { ToolTabWrapper } from '../../core/components/tool-tab-wrapper';
import { ShareSidebarModal } from '../../core/plugins/share-sidebar';
import { STORAGE_KEYS } from '@/lib/utils/constants';
import { TextEditor } from '../../text/components/text-editor';
import { useClipboard } from '@/lib/hooks/use-clipboard';
import { Copy, FileCode, AlertCircle } from 'lucide-react';
import { EditorPaneHeader } from '../../core/components/editor-pane-header';
import { htmlDecode } from '../utils/html-operations';
import type { TabComponentProps } from '../../core/types/tool';

export default function DecodeTab({ sharedData, readOnly }: TabComponentProps) {
    const { content, setContent, isReady } = useToolState({
        storageKey: STORAGE_KEYS.HTML_ENTITY_DECODE_INPUT,
        sharedData,
        tabId: 'decode',
        readOnly,
    });
    const [shareOpen, setShareOpen] = useState(false);
    const { copy } = useClipboard();

    const { decoded, error } = useMemo(() => {
        if (!content) return { decoded: '', error: null };
        try {
            return { decoded: htmlDecode(content), error: null };
        } catch (e) {
            return { decoded: '', error: e instanceof Error ? e.message : 'Decode failed' };
        }
    }, [content]);

    const { actions } = useToolActions({
        pageName: 'html-entity',
        tabId: 'decode',
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
                            label="HTML Entities"
                            content={content}
                            onContentChange={setContent}
                            onClear={() => setContent('')}
                            hideInputActions={readOnly}
                        />
                        <TextEditor
                            value={content}
                            onChange={setContent}
                            readOnly={readOnly}
                            emptyIcon={FileCode}
                            emptyTitle="Enter encoded text"
                            emptyDescription="Paste HTML entities like &amp; &lt; &#x27; to decode"
                        />
                    </div>
                </div>
                <div className="min-w-0 w-full md:w-1/2">
                    <div className="flex flex-col gap-2">
                        <EditorPaneHeader
                            label="Decoded Output"
                            content={decoded}
                            onContentChange={() => {}}
                            downloadFilename="decoded.txt"
                            hideInputActions
                        />
                        {error ? (
                            <div className="flex min-h-[350px] items-center justify-center rounded-lg border md:min-h-[400px] lg:min-h-[500px]">
                                <div className="flex flex-col items-center gap-3 text-center">
                                    <AlertCircle className="h-10 w-10 text-destructive/60" />
                                    <p className="text-sm font-medium text-destructive">{error}</p>
                                    <p className="text-xs text-muted-foreground">
                                        Check that the input contains valid HTML entities
                                    </p>
                                </div>
                            </div>
                        ) : (
                            <TextEditor
                                value={decoded}
                                onChange={() => {}}
                                readOnly
                                emptyTitle="Decoded output"
                                emptyDescription="Decoded text will appear here once you add input"
                                showEmptyPrompt
                            />
                        )}
                    </div>
                </div>
            </div>
            <ShareSidebarModal
                open={shareOpen}
                onOpenChange={setShareOpen}
                config={{
                    pageName: 'html-entity',
                    tabName: 'decode',
                    getState: () => ({ content }),
                    extraActions: decoded
                        ? [
                              {
                                  id: 'copy-decoded',
                                  label: 'Copy Decoded',
                                  icon: Copy,
                                  handler: () => copy(decoded),
                              },
                          ]
                        : [],
                }}
            />
        </ToolTabWrapper>
    );
}
