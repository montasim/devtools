'use client';
import { ToolContentSkeleton } from '@/app/(tools)/loading';

import { useState, useMemo } from 'react';
import { useToolState } from '../../core/hooks/use-tool-state';
import { useToolActions } from '../../core/hooks/use-tool-actions';
import { ToolTabWrapper } from '../../core/components/tool-tab-wrapper';
import { EditorPaneHeader } from '../../core/components/editor-pane-header';
import { ShareSidebarModal } from '../../core/plugins/share-sidebar';
import { STORAGE_KEYS } from '@/lib/utils/constants';
import { TextEditor } from '../../text/components/text-editor';
import { csvToJson, jsonToCsv, detectDelimiter } from '../utils/csv-operations';
import { useClipboard } from '@/lib/hooks/use-clipboard';
import { Copy, Table2, Braces } from 'lucide-react';
import type { TabComponentProps } from '../../core/types/tool';

type Direction = 'csv-to-json' | 'json-to-csv';
type DelimiterOption = 'auto' | ',' | ';' | '\t' | '|';

const DIRECTIONS: { value: Direction; label: string }[] = [
    { value: 'csv-to-json', label: 'CSV → JSON' },
    { value: 'json-to-csv', label: 'JSON → CSV' },
];

const DELIMITER_OPTIONS: { value: DelimiterOption; label: string }[] = [
    { value: 'auto', label: 'Auto' },
    { value: ',', label: 'Comma' },
    { value: ';', label: 'Semicolon' },
    { value: '\t', label: 'Tab' },
    { value: '|', label: 'Pipe' },
];

export default function ConvertTab({ sharedData, readOnly }: TabComponentProps) {
    const { content, setContent, isReady } = useToolState({
        storageKey: STORAGE_KEYS.CSV_CONVERT_CONTENT,
        sharedData,
        tabId: 'convert',
        readOnly,
    });

    const [direction, setDirection] = useState<Direction>('csv-to-json');
    const [delimiterOption, setDelimiterOption] = useState<DelimiterOption>('auto');
    const [shareOpen, setShareOpen] = useState(false);
    const { copy } = useClipboard();

    const output = useMemo(() => {
        if (!content.trim()) return '';
        try {
            if (direction === 'csv-to-json') {
                const delimiter =
                    delimiterOption === 'auto' ? detectDelimiter(content) : delimiterOption;
                return csvToJson(content, { delimiter });
            } else {
                const delimiter = delimiterOption === 'auto' ? ',' : delimiterOption;
                return jsonToCsv(content, delimiter);
            }
        } catch (e) {
            return e instanceof Error ? e.message : String(e);
        }
    }, [content, direction, delimiterOption]);

    const { actions } = useToolActions({
        pageName: 'csv',
        tabId: 'convert',
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

    const delimiterSelector = (
        <div className="flex gap-0.5 bg-muted p-0.5 rounded-lg border">
            {DELIMITER_OPTIONS.map((d) => (
                <button
                    key={d.value}
                    type="button"
                    onClick={() => setDelimiterOption(d.value)}
                    className={`px-3 py-0.5 text-[9px] uppercase font-bold rounded transition-all ${
                        delimiterOption === d.value
                            ? 'bg-card text-foreground shadow-sm'
                            : 'text-muted-foreground hover:text-foreground'
                    }`}
                >
                    {d.label}
                </button>
            ))}
        </div>
    );

    const leadingContent = (
        <div className="flex flex-wrap items-center gap-2">
            {directionSelector}
            {delimiterSelector}
        </div>
    );

    return (
        <ToolTabWrapper actions={actions} leadingContent={leadingContent}>
            <div className="flex flex-col gap-4 md:flex-row">
                <div className="min-w-0 w-full md:w-1/2 flex flex-col gap-2">
                    <EditorPaneHeader
                        label={direction === 'csv-to-json' ? 'CSV Input' : 'JSON Input'}
                        content={content}
                        onContentChange={setContent}
                        onClear={() => setContent('')}
                        hideInputActions={readOnly}
                    />
                    <TextEditor
                        value={content}
                        onChange={setContent}
                        readOnly={readOnly}
                        emptyIcon={direction === 'csv-to-json' ? Table2 : Braces}
                        emptyTitle={
                            direction === 'csv-to-json' ? 'Paste CSV data' : 'Paste JSON array'
                        }
                        emptyDescription={
                            direction === 'csv-to-json'
                                ? 'Paste CSV to convert to JSON'
                                : 'Paste a JSON array of objects to convert to CSV'
                        }
                    />
                </div>
                <div className="min-w-0 w-full md:w-1/2 flex flex-col gap-2">
                    <EditorPaneHeader
                        label={direction === 'csv-to-json' ? 'JSON Output' : 'CSV Output'}
                        content={output}
                        onContentChange={() => {}}
                        downloadFilename={
                            direction === 'csv-to-json' ? 'output.json' : 'output.csv'
                        }
                        hideInputActions
                    />
                    <TextEditor
                        value={output}
                        onChange={() => {}}
                        readOnly
                        emptyIcon={direction === 'csv-to-json' ? Braces : Table2}
                        emptyTitle={direction === 'csv-to-json' ? 'JSON output' : 'CSV output'}
                        emptyDescription="Result will appear here"
                        showEmptyPrompt
                    />
                </div>
            </div>
            <ShareSidebarModal
                open={shareOpen}
                onOpenChange={setShareOpen}
                config={{
                    pageName: 'csv',
                    tabName: 'convert',
                    getState: () => ({ content, direction, delimiterOption }),
                    extraActions: output
                        ? [
                              {
                                  id: 'copy-output',
                                  label: direction === 'csv-to-json' ? 'Copy JSON' : 'Copy CSV',
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
