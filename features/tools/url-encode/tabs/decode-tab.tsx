'use client';

import { useState, useMemo } from 'react';
import { useToolState } from '../../core/hooks/use-tool-state';
import { useToolActions } from '../../core/hooks/use-tool-actions';
import { ToolTabWrapper } from '../../core/components/tool-tab-wrapper';
import { ShareSidebarModal } from '../../core/plugins/share-sidebar';
import { STORAGE_KEYS } from '@/lib/utils/constants';
import { TextEditor } from '../../text/components/text-editor';
import { useClipboard } from '@/lib/hooks/use-clipboard';
import { Copy, Link2Off, AlertCircle } from 'lucide-react';
import { EditorPaneHeader } from '../../core/components/editor-pane-header';
import { urlDecode } from '../utils/url-operations';
import type { TabComponentProps } from '../../core/types/tool';

export default function DecodeTab({ sharedData, readOnly }: TabComponentProps) {
    const { content, setContent, isReady } = useToolState({
        storageKey: STORAGE_KEYS.URL_DECODE_INPUT,
        sharedData,
        tabId: 'decode',
        readOnly,
    });
    const [shareOpen, setShareOpen] = useState(false);
    const { copy } = useClipboard();

    const { decoded, error } = useMemo(() => {
        if (!content) return { decoded: '', error: null };
        try {
            return { decoded: urlDecode(content), error: null };
        } catch (e) {
            return { decoded: '', error: e instanceof Error ? e.message : 'Decode failed' };
        }
    }, [content]);

    const { actions } = useToolActions({
        pageName: 'url-encode',
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
                            label="Encoded Text"
                            content={content}
                            onContentChange={setContent}
                            onClear={() => setContent('')}
                            hideInputActions={readOnly}
                        />
                        <TextEditor
                            value={content}
                            onChange={setContent}
                            readOnly={readOnly}
                            emptyIcon={Link2Off}
                            emptyTitle="Enter encoded text"
                            emptyDescription="Paste URL-encoded (percent-encoded) text to decode"
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
                                        Check that the input is a valid percent-encoded string
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
                    pageName: 'url-encode',
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
