'use client';

import { useState, useMemo } from 'react';
import { useToolState } from '../../core/hooks/use-tool-state';
import { useToolActions } from '../../core/hooks/use-tool-actions';
import { ToolTabWrapper } from '../../core/components/tool-tab-wrapper';
import { ShareSidebarModal } from '../../core/plugins/share-sidebar';
import { STORAGE_KEYS } from '@/lib/utils/constants';
import { convertCase } from '../utils/text-operations';
import { TextEditor } from '../components/text-editor';
import { useClipboard } from '@/lib/hooks/use-clipboard';
import { Button } from '@/components/ui/button';
import { Copy, ArrowLeftRight } from 'lucide-react';
import { EditorPaneHeader } from '../../core/components/editor-pane-header';
import type { TabComponentProps } from '../../core/types/tool';

const CASE_OPERATIONS = [
    { value: 'uppercase', label: 'UPPERCASE' },
    { value: 'lowercase', label: 'lowercase' },
    { value: 'titlecase', label: 'Title Case' },
    { value: 'camelcase', label: 'camelCase' },
    { value: 'pascalcase', label: 'PascalCase' },
    { value: 'snakecase', label: 'snake_case' },
    { value: 'kebabcase', label: 'kebab-case' },
    { value: 'sentencecase', label: 'Sentence case' },
    { value: 'reverse', label: 'Reverse' },
];

export default function ConvertTab({ sharedData }: TabComponentProps) {
    const { content, setContent, isReady } = useToolState({
        storageKey: STORAGE_KEYS.TEXT_CONVERT_INPUT_CONTENT,
        sharedData,
        tabId: 'convert',
    });
    const [operation, setOperation] = useState('uppercase');
    const [shareOpen, setShareOpen] = useState(false);
    const { copy } = useClipboard();

    const converted = useMemo(() => {
        if (!content) return '';
        return convertCase(content, operation);
    }, [content, operation]);

    const { actions } = useToolActions({
        pageName: 'text',
        tabId: 'convert',
        getContent: () => content,
        onClear: () => setContent(''),
        shareDialogOpen: shareOpen,
        setShareDialogOpen: setShareOpen,
    });

    if (!isReady) return null;

    return (
        <ToolTabWrapper
            actions={actions}
            leadingContent={
                <div className="flex flex-wrap items-center gap-1.5">
                    {CASE_OPERATIONS.map((op) => (
                        <Button
                            key={op.value}
                            variant={operation === op.value ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setOperation(op.value)}
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
                        />
                        <TextEditor
                            value={content}
                            onChange={setContent}
                            emptyIcon={ArrowLeftRight}
                            emptyTitle="Add text to convert"
                            emptyDescription="Type or paste text, then choose a case conversion above"
                        />
                    </div>
                </div>
                <div className="min-w-0 w-full md:w-1/2">
                    <div className="flex flex-col gap-2">
                        <EditorPaneHeader
                            label="Converted Output"
                            content={converted}
                            onContentChange={() => {}}
                            downloadFilename="converted.txt"
                            hideInputActions
                        />
                        <TextEditor
                            value={converted}
                            onChange={() => {}}
                            readOnly
                            emptyTitle="Converted output"
                            emptyDescription="Converted text will appear here once you add input"
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
                    tabName: 'convert',
                    getState: () => ({ content, operation }),
                    extraActions: converted
                        ? [
                              {
                                  id: 'copy-converted',
                                  label: 'Copy Converted',
                                  icon: Copy,
                                  handler: () => copy(converted),
                              },
                          ]
                        : [],
                }}
            />
        </ToolTabWrapper>
    );
}
