'use client';

import { useSyncExternalStore } from 'react';
import ReactDiffViewer from 'react-diff-viewer-continued';
import { GitCompare, Plus, Minus, RefreshCw, Percent } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { EmptyEditorPrompt } from '@/components/ui/empty-editor-prompt';
import { EditorFooter } from './editor-footer';
import { EditorPaneHeader } from './editor-pane-header';

interface DiffStats {
    added: number;
    removed: number;
    changed: number;
}

interface DiffPanelProps {
    leftContent: string;
    rightContent: string;
    leftLabel?: string;
    rightLabel?: string;
    onLeftChange?: (value: string) => void;
    onRightChange?: (value: string) => void;
    splitView?: boolean;
    showEditor?: boolean;
    mode?: 'text' | 'json' | 'base64';
    diffStats?: DiffStats | null;
    readOnly?: boolean;
}

const getServerSnapshot = () => true;
const getSnapshot = () => window.matchMedia('(min-width: 768px)').matches;
function subscribe(callback: () => void) {
    const mq = window.matchMedia('(min-width: 768px)');
    mq.addEventListener('change', callback);
    return () => mq.removeEventListener('change', callback);
}

export function DiffPanel({
    leftContent,
    rightContent,
    leftLabel = 'Original',
    rightLabel = 'Modified',
    onLeftChange,
    onRightChange,
    splitView = true,
    showEditor = true,
    mode = 'text',
    diffStats,
    readOnly,
}: DiffPanelProps) {
    const isLargeScreen = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

    const safeLeft = String(leftContent ?? '');
    const safeRight = String(rightContent ?? '');

    return (
        <div className="flex flex-col gap-4">
            {showEditor && (
                <div className="flex flex-col gap-4 md:flex-row">
                    <div className="min-w-0 w-full md:w-1/2">
                        <div className="relative flex flex-1 flex-col">
                            <EditorPaneHeader
                                label={leftLabel}
                                content={safeLeft}
                                onContentChange={onLeftChange}
                                onClear={() => onLeftChange?.('')}
                                hideInputActions={readOnly}
                            />
                            <div className="relative flex-1 mt-2">
                                <Textarea
                                    value={safeLeft}
                                    onChange={(e) => onLeftChange?.(e.target.value)}
                                    readOnly={readOnly}
                                    className="min-h-[250px] resize-none font-mono text-sm md:min-h-[400px]"
                                    style={{ fieldSizing: 'fixed', overflow: 'auto' }}
                                />
                                {(!safeLeft || safeLeft.trim() === '') && (
                                    <EmptyEditorPrompt
                                        icon={GitCompare}
                                        title={`No ${leftLabel.toLowerCase()} content`}
                                        description={`Paste or type ${leftLabel.toLowerCase()} content to compare`}
                                        overlay
                                    />
                                )}
                            </div>
                            <EditorFooter content={safeLeft} mode={mode} />
                        </div>
                    </div>
                    <div className="min-w-0 w-full md:w-1/2">
                        <div className="relative flex flex-1 flex-col">
                            <EditorPaneHeader
                                label={rightLabel}
                                content={safeRight}
                                onContentChange={onRightChange}
                                onClear={() => onRightChange?.('')}
                                hideInputActions={readOnly}
                            />
                            <div className="relative flex-1 mt-2">
                                <Textarea
                                    value={safeRight}
                                    onChange={(e) => onRightChange?.(e.target.value)}
                                    readOnly={readOnly}
                                    className="min-h-[250px] resize-none font-mono text-sm md:min-h-[400px]"
                                    style={{ fieldSizing: 'fixed', overflow: 'auto' }}
                                />
                                {(!safeRight || safeRight.trim() === '') && (
                                    <EmptyEditorPrompt
                                        icon={GitCompare}
                                        title={`No ${rightLabel.toLowerCase()} content`}
                                        description={`Paste or type ${rightLabel.toLowerCase()} content to compare`}
                                        overlay
                                    />
                                )}
                            </div>
                            <EditorFooter content={safeRight} mode={mode} />
                        </div>
                    </div>
                </div>
            )}
            {!safeLeft && !safeRight ? (
                <div className="relative flex items-center justify-center min-h-[250px] rounded-lg border md:min-h-[400px]">
                    <EmptyEditorPrompt
                        icon={GitCompare}
                        title="No diff to display"
                        description="Add content to both sides to see the comparison"
                    />
                </div>
            ) : (
                <div className="flex flex-col gap-0 overflow-x-auto rounded-lg border">
                    <div className="flex items-center justify-between border-b px-4 py-2">
                        <span className="text-sm font-medium text-muted-foreground">Diff</span>
                        {diffStats && (
                            <div className="flex items-center gap-4 text-sm">
                                <span className="flex items-center gap-1 text-primary">
                                    <Plus className="h-3.5 w-3.5" />
                                    {diffStats.added} added
                                </span>
                                <span className="flex items-center gap-1 text-destructive">
                                    <Minus className="h-3.5 w-3.5" />
                                    {diffStats.removed} removed
                                </span>
                                <span className="flex items-center gap-1 text-warning">
                                    <RefreshCw className="h-3.5 w-3.5" />
                                    {diffStats.changed} changed
                                </span>
                                {(() => {
                                    const total =
                                        diffStats.added + diffStats.removed + diffStats.changed;
                                    const baseLines = safeLeft ? safeLeft.split('\n').length : 0;
                                    const pct =
                                        baseLines > 0
                                            ? Math.min(100, Math.round((total / baseLines) * 100))
                                            : 0;
                                    return (
                                        <span className="flex items-center gap-1 font-medium text-muted-foreground">
                                            <Percent className="h-3.5 w-3.5" />
                                            {pct}% changed
                                        </span>
                                    );
                                })()}
                            </div>
                        )}
                    </div>
                    <div className="min-w-[600px]">
                        <ReactDiffViewer
                            oldValue={safeLeft}
                            newValue={safeRight}
                            splitView={splitView && isLargeScreen}
                            useDarkTheme={document?.documentElement?.classList?.contains('dark')}
                        />
                    </div>
                </div>
            )}
        </div>
    );
}
