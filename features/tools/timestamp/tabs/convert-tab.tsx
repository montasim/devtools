'use client';

import { ToolContentSkeleton } from '@/app/(tools)/loading';

import { useState, useMemo, useEffect } from 'react';
import { Clock, Copy } from 'lucide-react';
import { useToolState } from '../../core/hooks/use-tool-state';
import { useToolActions } from '../../core/hooks/use-tool-actions';
import { ToolTabWrapper } from '../../core/components/tool-tab-wrapper';
import { ShareSidebarModal } from '../../core/plugins/share-sidebar';
import { TextEditor } from '../../text/components/text-editor';
import { useClipboard } from '@/lib/hooks/use-clipboard';
import { Button } from '@/components/ui/button';
import { parseInput, relativeTime } from '../utils/timestamp-operations';
import type { TabComponentProps } from '../../core/types/tool';

const STORAGE_KEY = 'timestamp-convert-content';

export default function ConvertTab({ sharedData, readOnly }: TabComponentProps) {
    const { content, setContent, isReady } = useToolState({
        storageKey: STORAGE_KEY,
        sharedData,
        tabId: 'convert',
        readOnly,
    });
    const [nowSeconds, setNowSeconds] = useState(() => Math.floor(Date.now() / 1000));
    const [shareOpen, setShareOpen] = useState(false);
    const { copy } = useClipboard();

    useEffect(() => {
        const id = setInterval(() => {
            setNowSeconds(Math.floor(Date.now() / 1000));
        }, 1000);
        return () => clearInterval(id);
    }, []);

    const parsed = useMemo(() => parseInput(content), [content]);

    const liveRelative = useMemo(() => {
        if (!parsed.isValid) return '';
        return relativeTime(parsed.unix, nowSeconds);
    }, [parsed.isValid, parsed.unix, nowSeconds]);

    const { actions } = useToolActions({
        pageName: 'timestamp',
        tabId: 'convert',
        getContent: () => content,
        onClear: () => setContent(''),
        shareDialogOpen: shareOpen,
        setShareDialogOpen: setShareOpen,
        readOnly,
    });

    if (!isReady) return <ToolContentSkeleton />;

    const rows: Array<{ label: string; value: string; primary?: boolean }> = parsed.isValid
        ? [
              { label: 'Unix (s)', value: String(parsed.unix) },
              { label: 'Unix (ms)', value: String(parsed.unixMs) },
              { label: 'ISO 8601', value: parsed.iso },
              { label: 'UTC String', value: parsed.utcString },
              { label: 'Relative', value: liveRelative, primary: true },
              { label: 'Year', value: String(parsed.year) },
              { label: 'Month', value: String(parsed.month) },
              { label: 'Day', value: String(parsed.day) },
              { label: 'Day of Week', value: parsed.dayOfWeek },
              { label: 'Hour', value: String(parsed.hour).padStart(2, '0') },
              { label: 'Minute', value: String(parsed.minute).padStart(2, '0') },
              { label: 'Second', value: String(parsed.second).padStart(2, '0') },
          ]
        : [];

    return (
        <ToolTabWrapper actions={actions}>
            <div className="flex flex-col gap-4 py-4 max-w-2xl mx-auto">
                {/* Input */}
                <div className="flex flex-col gap-2">
                    <TextEditor
                        value={content}
                        onChange={setContent}
                        readOnly={readOnly}
                        emptyIcon={Clock}
                        emptyTitle="Enter a timestamp or date string"
                        emptyDescription="Unix seconds, milliseconds, ISO 8601, or any date string"
                    />
                    {/* Error */}
                    {!parsed.isValid && content.trim() && parsed.error && (
                        <p className="text-destructive text-xs">{parsed.error}</p>
                    )}
                </div>

                {/* Quick-insert buttons */}
                {!readOnly && (
                    <div className="flex flex-wrap gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            className="h-7 text-xs"
                            onClick={() => setContent(Math.floor(Date.now() / 1000).toString())}
                        >
                            Now (seconds)
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            className="h-7 text-xs"
                            onClick={() => setContent(Date.now().toString())}
                        >
                            Now (ms)
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            className="h-7 text-xs"
                            onClick={() => setContent(new Date().toISOString())}
                        >
                            ISO Now
                        </Button>
                    </div>
                )}

                {/* Result grid */}
                {parsed.isValid && (
                    <div className="border rounded-xl divide-y bg-card">
                        {rows.map((row) => (
                            <div
                                key={row.label}
                                className="flex items-center justify-between px-4 py-2.5 gap-4"
                            >
                                <span className="text-xs text-muted-foreground font-medium w-28 shrink-0">
                                    {row.label}
                                </span>
                                <span
                                    className={
                                        row.primary
                                            ? 'font-mono text-sm flex-1 text-primary font-semibold'
                                            : 'font-mono text-sm flex-1 text-foreground'
                                    }
                                >
                                    {row.value}
                                </span>
                                <button
                                    type="button"
                                    onClick={() => copy(row.value)}
                                    className="h-7 w-7 rounded border flex items-center justify-center hover:bg-muted shrink-0"
                                    aria-label={`Copy ${row.label}`}
                                >
                                    <Copy className="h-3.5 w-3.5" />
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <ShareSidebarModal
                open={shareOpen}
                onOpenChange={setShareOpen}
                config={{
                    pageName: 'timestamp',
                    tabName: 'convert',
                    getState: () => ({ content }),
                    extraActions: parsed.isValid
                        ? [
                              {
                                  id: 'copy-iso',
                                  label: 'Copy ISO',
                                  icon: Copy,
                                  handler: () => copy(parsed.iso),
                              },
                              {
                                  id: 'copy-unix',
                                  label: 'Copy Unix',
                                  icon: Copy,
                                  handler: () => copy(String(parsed.unix)),
                              },
                          ]
                        : [],
                }}
            />
        </ToolTabWrapper>
    );
}
