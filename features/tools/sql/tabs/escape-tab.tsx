'use client';

import { ToolContentSkeleton } from '@/app/(tools)/loading';
import { useState, useMemo } from 'react';
import { useToolState } from '../../core/hooks/use-tool-state';
import { useToolActions } from '../../core/hooks/use-tool-actions';
import { ToolTabWrapper } from '../../core/components/tool-tab-wrapper';
import { EditorPaneHeader } from '../../core/components/editor-pane-header';
import { ShareSidebarModal } from '../../core/plugins/share-sidebar';
import { TextEditor } from '../../text/components/text-editor';
import { escapeSqlString, unescapeSqlString } from '../utils/sql-operations';
import { useClipboard } from '@/lib/hooks/use-clipboard';
import { Copy, Database, ShieldCheck } from 'lucide-react';
import type { TabComponentProps } from '../../core/types/tool';

type Direction = 'escape' | 'unescape';

const DIRECTIONS: { value: Direction; label: string }[] = [
    { value: 'escape', label: 'Escape' },
    { value: 'unescape', label: 'Unescape' },
];

export default function EscapeTab({ sharedData, readOnly }: TabComponentProps) {
    const { content, setContent, isReady } = useToolState({
        storageKey: 'sql-escape-content',
        sharedData,
        tabId: 'escape',
        readOnly,
    });

    const [direction, setDirection] = useState<Direction>('escape');
    const [shareOpen, setShareOpen] = useState(false);
    const { copy } = useClipboard();

    const output = useMemo(() => {
        if (!content.trim()) return '';
        try {
            return direction === 'escape' ? escapeSqlString(content) : unescapeSqlString(content);
        } catch (e) {
            return e instanceof Error ? e.message : String(e);
        }
    }, [content, direction]);

    const { actions } = useToolActions({
        pageName: 'sql',
        tabId: 'escape',
        getContent: () => content,
        onClear: () => setContent(''),
        shareDialogOpen: shareOpen,
        setShareDialogOpen: setShareOpen,
        readOnly,
    });

    if (!isReady) return <ToolContentSkeleton />;

    const directionSelector = (
        <div className="flex gap-0.5 bg-muted p-0.5 rounded-lg border">
            {DIRECTIONS.map((d) => (
                <button
                    key={d.value}
                    type="button"
                    onClick={() => setDirection(d.value)}
                    className={`px-3 py-0.5 text-[9px] uppercase font-bold rounded transition-all ${
                        direction === d.value
                            ? 'bg-card text-foreground shadow-sm'
                            : 'text-muted-foreground hover:text-foreground'
                    }`}
                >
                    {d.label}
                </button>
            ))}
        </div>
    );

    return (
        <ToolTabWrapper actions={actions} leadingContent={directionSelector}>
            <div className="flex flex-col gap-4 md:flex-row">
                <div className="min-w-0 w-full md:w-1/2 flex flex-col gap-2">
                    <EditorPaneHeader
                        label={direction === 'escape' ? 'Raw String' : 'Escaped SQL String'}
                        content={content}
                        onContentChange={setContent}
                        onClear={() => setContent('')}
                        hideInputActions={readOnly}
                    />
                    <TextEditor
                        value={content}
                        onChange={setContent}
                        readOnly={readOnly}
                        emptyIcon={Database}
                        emptyTitle={
                            direction === 'escape' ? 'Enter raw string' : 'Enter escaped SQL string'
                        }
                        emptyDescription={
                            direction === 'escape'
                                ? "Paste a string value to escape for safe use in SQL literals (doubles ' quotes)"
                                : 'Paste an escaped SQL string to recover the original value'
                        }
                    />
                </div>
                <div className="min-w-0 w-full md:w-1/2 flex flex-col gap-2">
                    <EditorPaneHeader
                        label={direction === 'escape' ? 'Escaped Output' : 'Unescaped Output'}
                        content={output}
                        onContentChange={() => {}}
                        downloadFilename={direction === 'escape' ? 'escaped.txt' : 'unescaped.txt'}
                        hideInputActions
                    />
                    <TextEditor
                        value={output}
                        onChange={() => {}}
                        readOnly
                        emptyIcon={ShieldCheck}
                        emptyTitle={direction === 'escape' ? 'Escaped output' : 'Unescaped output'}
                        emptyDescription="Result will appear here"
                        showEmptyPrompt
                    />
                </div>
            </div>
            <ShareSidebarModal
                open={shareOpen}
                onOpenChange={setShareOpen}
                config={{
                    pageName: 'sql',
                    tabName: 'escape',
                    getState: () => ({ content, direction }),
                    extraActions: output
                        ? [
                              {
                                  id: 'copy-output',
                                  label: direction === 'escape' ? 'Copy Escaped' : 'Copy Unescaped',
                                  icon: Copy,
                                  handler: () => copy(output),
                              },
                          ]
                        : [],
                }}
            />
        </ToolTabWrapper>
    );
}
