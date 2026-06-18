'use client';

import { ToolContentSkeleton } from '@/app/(tools)/loading';

import { useState } from 'react';
import { useToolState } from '../../core/hooks/use-tool-state';
import { useToolActions } from '../../core/hooks/use-tool-actions';
import { ToolTabWrapper } from '../../core/components/tool-tab-wrapper';
import { ShareSidebarModal } from '../../core/plugins/share-sidebar';
import { STORAGE_KEYS } from '@/lib/utils/constants';
import { validateHtml } from '../utils/html-operations';
import { TextEditor } from '../../text/components/text-editor';
import { Code2, AlertTriangle, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { EditorPaneHeader } from '../../core/components/editor-pane-header';
import type { TabComponentProps } from '../../core/types/tool';
import { useMemo } from 'react';

export default function ValidateTab({ sharedData, readOnly }: TabComponentProps) {
    const { content, setContent, isReady } = useToolState({
        storageKey: STORAGE_KEYS.HTML_VALIDATE_CONTENT,
        sharedData,
        tabId: 'validate',
        readOnly,
    });
    const [shareOpen, setShareOpen] = useState(false);

    const result = useMemo(() => {
        if (!content.trim()) return null;
        try {
            return validateHtml(content);
        } catch (error) {
            return {
                valid: false,
                errors: [error instanceof Error ? error.message : String(error)],
                stats: { elements: 0, comments: 0 },
            };
        }
    }, [content]);

    const { actions } = useToolActions({
        pageName: 'html',
        tabId: 'validate',
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
                            label="Input HTML"
                            content={content}
                            onContentChange={setContent}
                            onClear={() => setContent('')}
                            hideInputActions={readOnly}
                            accept=".html,.htm,.txt"
                        />
                        <TextEditor
                            value={content}
                            onChange={setContent}
                            readOnly={readOnly}
                            emptyIcon={Code2}
                            emptyTitle="Add HTML to validate"
                            emptyDescription="Paste HTML markup on the left to validate it"
                        />
                    </div>
                </div>
                <div className="min-w-0 w-full md:w-1/2">
                    <div className="flex flex-col gap-2">
                        <div className="flex items-center justify-between mt-4">
                            <label className="text-sm font-medium text-muted-foreground">
                                Validation Results
                            </label>
                        </div>
                        {!result ? (
                            <div className="flex min-h-[350px] flex-col items-center justify-center rounded-lg border border-dashed md:min-h-[400px] lg:min-h-[500px]">
                                <div className="flex flex-col items-center gap-2 px-4 text-center">
                                    <ShieldCheck className="h-8 w-8 text-muted-foreground/40" />
                                    <p className="text-sm font-medium text-muted-foreground">
                                        No HTML to validate
                                    </p>
                                    <p className="text-xs text-muted-foreground/60">
                                        Paste HTML markup on the left
                                    </p>
                                </div>
                            </div>
                        ) : (
                            <div className="flex min-h-[350px] flex-col gap-4 rounded-lg border p-4 md:min-h-[400px] lg:min-h-[500px]">
                                <div className="flex items-center gap-2">
                                    {result.valid ? (
                                        <CheckCircle2 className="h-5 w-5 text-green-500" />
                                    ) : (
                                        <AlertTriangle className="h-5 w-5 text-yellow-500" />
                                    )}
                                    <span className="text-sm font-semibold">
                                        {result.valid
                                            ? 'Valid HTML'
                                            : `${result.errors.length} warning${result.errors.length === 1 ? '' : 's'} found`}
                                    </span>
                                </div>

                                {result.errors.length > 0 && (
                                    <ul className="flex flex-col gap-2">
                                        {result.errors.map((err, i) => (
                                            <li
                                                key={i}
                                                className="flex items-start gap-2 rounded-md bg-yellow-50 px-3 py-2 dark:bg-yellow-950/30"
                                            >
                                                <AlertTriangle className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-yellow-500" />
                                                <span className="text-xs font-mono text-yellow-800 dark:text-yellow-200">
                                                    {err}
                                                </span>
                                            </li>
                                        ))}
                                    </ul>
                                )}

                                <div className="mt-auto border-t pt-3">
                                    <p className="text-xs text-muted-foreground">
                                        {result.stats.elements} element
                                        {result.stats.elements === 1 ? '' : 's'} &middot;{' '}
                                        {result.stats.comments} comment
                                        {result.stats.comments === 1 ? '' : 's'}
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
            <ShareSidebarModal
                open={shareOpen}
                onOpenChange={setShareOpen}
                config={{
                    pageName: 'html',
                    tabName: 'validate',
                    getState: () => ({ content }),
                    extraActions: [],
                }}
            />
        </ToolTabWrapper>
    );
}
