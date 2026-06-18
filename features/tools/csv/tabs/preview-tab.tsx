'use client';
import { ToolContentSkeleton } from '@/app/(tools)/loading';

import { useMemo, useState } from 'react';
import { useToolState } from '../../core/hooks/use-tool-state';
import { useToolActions } from '../../core/hooks/use-tool-actions';
import { ToolTabWrapper } from '../../core/components/tool-tab-wrapper';
import { EditorPaneHeader } from '../../core/components/editor-pane-header';
import { ShareSidebarModal } from '../../core/plugins/share-sidebar';
import { STORAGE_KEYS } from '@/lib/utils/constants';
import { TextEditor } from '../../text/components/text-editor';
import { parseCsv, getCsvStats } from '../utils/csv-operations';
import { useClipboard } from '@/lib/hooks/use-clipboard';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Copy, Table2 } from 'lucide-react';
import type { TabComponentProps } from '../../core/types/tool';

const MAX_PREVIEW_ROWS = 500;

const DELIMITER_LABELS: Record<string, string> = {
    ',': 'comma',
    ';': 'semicolon',
    '\t': 'tab',
    '|': 'pipe',
};

export default function PreviewTab({ sharedData, readOnly }: TabComponentProps) {
    const { content, setContent, isReady } = useToolState({
        storageKey: STORAGE_KEYS.CSV_PREVIEW_CONTENT,
        sharedData,
        tabId: 'preview',
        readOnly,
    });

    const [shareOpen, setShareOpen] = useState(false);
    const { copy } = useClipboard();

    const { actions } = useToolActions({
        pageName: 'csv',
        tabId: 'preview',
        getContent: () => content,
        onClear: () => setContent(''),
        shareDialogOpen: shareOpen,
        setShareDialogOpen: setShareOpen,
        readOnly,
    });

    const parsed = useMemo(() => {
        if (!content.trim()) return null;
        return parseCsv(content);
    }, [content]);

    const stats = useMemo(() => {
        if (!content.trim()) return null;
        return getCsvStats(content);
    }, [content]);

    const displayRows = parsed?.rows.slice(0, MAX_PREVIEW_ROWS) ?? [];
    const isTruncated = (parsed?.rowCount ?? 0) > MAX_PREVIEW_ROWS;

    const tsvContent = useMemo(() => {
        if (!parsed || !parsed.isValid) return '';
        const headerLine = parsed.headers.join('\t');
        const dataLines = parsed.rows.map((row) => row.join('\t'));
        return [headerLine, ...dataLines].join('\n');
    }, [parsed]);

    if (!isReady) return <ToolContentSkeleton />;

    return (
        <ToolTabWrapper actions={actions}>
            <div className="flex flex-col gap-4">
                {/* Input area */}
                <div className="flex flex-col gap-2">
                    <EditorPaneHeader
                        label="CSV Input"
                        content={content}
                        onContentChange={setContent}
                        onClear={() => setContent('')}
                        hideInputActions={readOnly}
                    />
                    <div className="[&_textarea]:min-h-[200px] [&_textarea]:md:min-h-[200px] [&_textarea]:lg:min-h-[200px]">
                        <TextEditor
                            value={content}
                            onChange={setContent}
                            readOnly={readOnly}
                            emptyIcon={Table2}
                            emptyTitle="Paste CSV data"
                            emptyDescription="Paste CSV content to preview it as a table"
                        />
                    </div>
                </div>

                {/* Stats bar */}
                {stats && content.trim() && (
                    <div className="flex flex-wrap items-center gap-2">
                        <Badge variant="secondary" className="font-mono text-xs">
                            {stats.rowCount} rows
                        </Badge>
                        <Badge variant="secondary" className="font-mono text-xs">
                            {stats.colCount} columns
                        </Badge>
                        {stats.emptyCount > 0 && (
                            <Badge
                                variant="outline"
                                className="font-mono text-xs text-muted-foreground"
                            >
                                {stats.emptyCount} empty cells
                            </Badge>
                        )}
                        <Badge variant="outline" className="font-mono text-xs">
                            delimiter: {DELIMITER_LABELS[stats.delimiter] ?? stats.delimiter}
                        </Badge>
                        {tsvContent && (
                            <Button
                                variant="outline"
                                size="sm"
                                className="h-6 text-xs ml-auto"
                                onClick={() => copy(tsvContent)}
                            >
                                <Copy className="size-3 mr-1" />
                                Copy as TSV
                            </Button>
                        )}
                    </div>
                )}

                {/* Error state */}
                {parsed && !parsed.isValid && (
                    <div className="rounded-md border border-destructive/40 bg-destructive/5 px-4 py-3 text-sm text-destructive">
                        {parsed.error ?? 'Failed to parse CSV'}
                    </div>
                )}

                {/* Table preview */}
                {parsed && parsed.isValid && displayRows.length > 0 && (
                    <div className="flex flex-col gap-2">
                        {isTruncated && (
                            <div className="rounded-md border border-amber-400/40 bg-amber-50 px-4 py-2 text-sm text-amber-700 dark:bg-amber-900/20 dark:text-amber-400">
                                Showing first {MAX_PREVIEW_ROWS} of {parsed.rowCount} rows
                            </div>
                        )}
                        <div className="overflow-x-auto rounded-md border">
                            <table className="min-w-full text-sm">
                                <thead>
                                    <tr className="border-b bg-muted">
                                        <th className="px-3 py-2 text-left font-mono text-xs text-muted-foreground w-10 shrink-0">
                                            #
                                        </th>
                                        {parsed.headers.map((header, idx) => (
                                            <th
                                                key={idx}
                                                className="px-3 py-2 text-left font-semibold text-xs whitespace-nowrap"
                                            >
                                                {header || (
                                                    <span className="text-muted-foreground italic">
                                                        (empty)
                                                    </span>
                                                )}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {displayRows.map((row, rowIdx) => (
                                        <tr
                                            key={rowIdx}
                                            className="border-b last:border-0 hover:bg-muted/40 transition-colors"
                                        >
                                            <td className="px-3 py-2 font-mono text-xs text-muted-foreground w-10 shrink-0 select-none">
                                                {rowIdx + 1}
                                            </td>
                                            {parsed.headers.map((_, colIdx) => (
                                                <td
                                                    key={colIdx}
                                                    className="px-3 py-2 font-mono text-xs whitespace-nowrap max-w-[240px] truncate"
                                                    title={row[colIdx] ?? ''}
                                                >
                                                    {row[colIdx] !== undefined &&
                                                    row[colIdx] !== '' ? (
                                                        row[colIdx]
                                                    ) : (
                                                        <span className="text-muted-foreground/50 italic">
                                                            —
                                                        </span>
                                                    )}
                                                </td>
                                            ))}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* Empty state when no valid data */}
                {(!parsed || (parsed.isValid && parsed.rowCount === 0)) && content.trim() && (
                    <div className="rounded-md border border-border bg-muted/30 px-4 py-8 text-center text-sm text-muted-foreground">
                        No data rows found
                    </div>
                )}
            </div>
            <ShareSidebarModal
                open={shareOpen}
                onOpenChange={setShareOpen}
                config={{
                    pageName: 'csv',
                    tabName: 'preview',
                    getState: () => ({ content }),
                    extraActions: tsvContent
                        ? [
                              {
                                  id: 'copy-tsv',
                                  label: 'Copy as TSV',
                                  icon: Copy,
                                  handler: () => copy(tsvContent),
                              },
                          ]
                        : [],
                }}
            />
        </ToolTabWrapper>
    );
}
