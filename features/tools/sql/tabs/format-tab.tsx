'use client';
import { ToolContentSkeleton } from '@/app/(tools)/loading';

import { useState, useEffect } from 'react';
import { useToolState } from '../../core/hooks/use-tool-state';
import { useToolActions } from '../../core/hooks/use-tool-actions';
import { ToolTabWrapper } from '../../core/components/tool-tab-wrapper';
import { ShareSidebarModal } from '../../core/plugins/share-sidebar';
import { EditorPaneHeader } from '../../core/components/editor-pane-header';
import { TextEditor } from '../../text/components/text-editor';
import { useSqlFormat } from '../hooks/use-sql-format';
import { SQL_DIALECTS, type SqlDialect } from '../utils/sql-operations';
import { useClipboard } from '@/lib/hooks/use-clipboard';
import { Copy, Database, FileCode } from 'lucide-react';
import type { TabComponentProps } from '../../core/types/tool';

export default function FormatTab({ sharedData, readOnly }: TabComponentProps) {
    const { content, setContent, isReady } = useToolState({
        storageKey: 'sql-format-content',
        sharedData,
        tabId: 'format',
        readOnly,
    });

    const [dialect, setDialect] = useState<SqlDialect>(() => {
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem('sql-format-dialect');
            if (saved && SQL_DIALECTS.some((d) => d.value === saved)) {
                return saved as SqlDialect;
            }
        }
        return 'sql';
    });

    useEffect(() => {
        if (typeof window !== 'undefined') {
            localStorage.setItem('sql-format-dialect', dialect);
        }
    }, [dialect]);

    const [shareOpen, setShareOpen] = useState(false);
    const { formatted, error } = useSqlFormat(content, dialect);
    const { copy } = useClipboard();

    const { actions } = useToolActions({
        pageName: 'sql',
        tabId: 'format',
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
                            label="Input SQL"
                            content={content}
                            onContentChange={setContent}
                            onClear={() => setContent('')}
                            accept=".sql,.txt"
                            hideInputActions={readOnly}
                        />
                        <TextEditor
                            value={content}
                            onChange={setContent}
                            readOnly={readOnly}
                            emptyIcon={Database}
                            emptyTitle="Add SQL to format"
                            emptyDescription="Paste unformatted SQL or start typing to see formatted output"
                        />
                    </div>
                </div>
                <div className="min-w-0 w-full md:w-1/2">
                    <div className="flex flex-col gap-2">
                        <EditorPaneHeader
                            label="Formatted Output"
                            content={error ? '' : formatted}
                            onContentChange={() => {}}
                            downloadFilename="formatted.sql"
                            hideInputActions
                            actions={
                                <div className="flex gap-0.5 bg-muted p-0.5 rounded-lg border">
                                    {SQL_DIALECTS.map((d) => (
                                        <button
                                            key={d.value}
                                            type="button"
                                            onClick={() => setDialect(d.value)}
                                            className={`px-2 py-0.5 text-[9px] uppercase font-bold rounded transition-all ${
                                                dialect === d.value
                                                    ? 'bg-card text-foreground shadow-sm'
                                                    : 'text-muted-foreground hover:text-foreground'
                                            }`}
                                        >
                                            {d.label}
                                        </button>
                                    ))}
                                </div>
                            }
                        />
                        <TextEditor
                            value={error ? '' : formatted}
                            onChange={() => {}}
                            readOnly
                            emptyIcon={FileCode}
                            emptyTitle="Formatted output"
                            emptyDescription="Formatted SQL will appear here once you add input"
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
                    pageName: 'sql',
                    tabName: 'format',
                    getState: () => ({ content }),
                    extraActions: formatted
                        ? [
                              {
                                  id: 'copy-formatted',
                                  label: 'Copy Formatted',
                                  icon: Copy,
                                  handler: () => copy(formatted),
                              },
                          ]
                        : [],
                }}
            />
        </ToolTabWrapper>
    );
}
