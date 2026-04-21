'use client';

import { useState, useMemo } from 'react';
import { useToolState } from '../../core/hooks/use-tool-state';
import { useToolActions } from '../../core/hooks/use-tool-actions';
import { ToolTabWrapper } from '../../core/components/tool-tab-wrapper';
import { ShareSidebarModal } from '../../core/plugins/share-sidebar';
import { STORAGE_KEYS } from '@/lib/utils/constants';
import { cleanText } from '../utils/text-operations';
import { TextEditor } from '../components/text-editor';
import { useClipboard } from '@/lib/hooks/use-clipboard';
import { Button } from '@/components/ui/button';
import { Copy, Sparkles } from 'lucide-react';
import { EditorPaneHeader } from '../../core/components/editor-pane-header';
import type { TabComponentProps } from '../../core/types/tool';

const CLEAN_OPERATIONS = [
    { id: 'trim', label: 'Trim whitespace' },
    { id: 'trimLines', label: 'Trim each line' },
    { id: 'removeEmptyLines', label: 'Remove empty lines' },
    { id: 'removeDuplicateLines', label: 'Remove duplicate lines' },
    { id: 'removeExtraSpaces', label: 'Remove extra spaces' },
    { id: 'removeLineNumbers', label: 'Remove line numbers' },
    { id: 'sortLines', label: 'Sort lines' },
    { id: 'removeHtmlTags', label: 'Remove HTML tags' },
];

export default function CleanTab({ sharedData, readOnly }: TabComponentProps) {
    const { content, setContent, isReady } = useToolState({
        storageKey: STORAGE_KEYS.TEXT_CLEAN_INPUT_CONTENT,
        sharedData,
        tabId: 'clean',
        readOnly,
    });
    const [selectedOps, setSelectedOps] = useState<string[]>(['trim', 'removeEmptyLines']);
    const [shareOpen, setShareOpen] = useState(false);
    const { copy } = useClipboard();

    const cleaned = useMemo(() => {
        if (!content) return '';
        return cleanText(content, selectedOps);
    }, [content, selectedOps]);

    const toggleOp = (opId: string) => {
        setSelectedOps((prev) =>
            prev.includes(opId) ? prev.filter((o) => o !== opId) : [...prev, opId],
        );
    };

    const { actions } = useToolActions({
        pageName: 'text',
        tabId: 'clean',
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
                    {CLEAN_OPERATIONS.map((op) => (
                        <Button
                            key={op.id}
                            variant={selectedOps.includes(op.id) ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => toggleOp(op.id)}
                            className="h-7 text-xs"
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
                            label="Input"
                            content={content}
                            onContentChange={setContent}
                            onClear={() => setContent('')}
                            hideInputActions={readOnly}
                        />
                        <TextEditor
                            value={content}
                            onChange={setContent}
                            readOnly={readOnly}
                            emptyIcon={Sparkles}
                            emptyTitle="Add text to clean"
                            emptyDescription="Paste or type text, then select cleaning operations above"
                        />
                    </div>
                </div>
                <div className="min-w-0 w-full md:w-1/2">
                    <div className="flex flex-col gap-2">
                        <EditorPaneHeader
                            label="Cleaned Output"
                            content={cleaned}
                            onContentChange={() => {}}
                            downloadFilename="cleaned.txt"
                            hideInputActions
                        />
                        <TextEditor
                            value={cleaned}
                            onChange={() => {}}
                            readOnly
                            emptyTitle="Cleaned output"
                            emptyDescription="Cleaned text will appear here once you add input"
                            showEmptyPrompt
                        />
                    </div>
                </div>
            </div>
            <ShareSidebarModal
                open={shareOpen}
                onOpenChange={setShareOpen}
                config={{
                    pageName: 'text',
                    tabName: 'clean',
                    getState: () => ({ content, operations: selectedOps }),
                    extraActions: cleaned
                        ? [
                              {
                                  id: 'copy-cleaned',
                                  label: 'Copy Cleaned',
                                  icon: Copy,
                                  handler: () => copy(cleaned),
                              },
                          ]
                        : [],
                }}
            />
        </ToolTabWrapper>
    );
}
