'use client';

import { ToolContentSkeleton } from '@/app/(tools)/loading';
import { useState, useMemo, useEffect } from 'react';
import { useToolState } from '../../core/hooks/use-tool-state';
import { useToolActions } from '../../core/hooks/use-tool-actions';
import { ToolTabWrapper } from '../../core/components/tool-tab-wrapper';
import { EditorPaneHeader } from '../../core/components/editor-pane-header';
import { ShareSidebarModal } from '../../core/plugins/share-sidebar';
import { STORAGE_KEYS } from '@/lib/utils/constants';
import { jsonToTypeScript } from '../utils/json-to-typescript';
import { JsonEditor } from '../components/json-editor';
import { TextEditor } from '../../text/components/text-editor';
import { Input } from '@/components/ui/input';
import { Braces, FileCode, Copy } from 'lucide-react';
import { useClipboard } from '@/lib/hooks/use-clipboard';
import type { TabComponentProps } from '../../core/types/tool';

export default function TypeScriptTab({ sharedData, readOnly }: TabComponentProps) {
    const { content, setContent, isReady } = useToolState({
        storageKey: STORAGE_KEYS.JSON_TO_TS_INPUT_CONTENT,
        sharedData,
        tabId: 'typescript',
        readOnly,
    });

    const [rootName, setRootName] = useState(() => {
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem(STORAGE_KEYS.JSON_TO_TS_ROOT_NAME);
            if (saved) {
                try {
                    return JSON.parse(saved);
                } catch {
                    return saved;
                }
            }
        }
        return 'RootObject';
    });

    useEffect(() => {
        if (typeof window !== 'undefined') {
            localStorage.setItem(STORAGE_KEYS.JSON_TO_TS_ROOT_NAME, JSON.stringify(rootName));
        }
    }, [rootName]);

    const [shareOpen, setShareOpen] = useState(false);
    const { copy } = useClipboard();

    const { output, error } = useMemo(() => {
        if (!content.trim()) {
            return { output: '', error: null };
        }
        try {
            const result = jsonToTypeScript(content, rootName || 'RootObject');
            return { output: result, error: null };
        } catch (e: any) {
            return { output: '', error: e.message };
        }
    }, [content, rootName]);

    const { actions } = useToolActions({
        pageName: 'json',
        tabId: 'typescript',
        getContent: () => content,
        onClear: () => setContent(''),
        shareDialogOpen: shareOpen,
        setShareDialogOpen: setShareOpen,
        readOnly,
    });

    if (!isReady) return <ToolContentSkeleton />;

    return (
        <ToolTabWrapper
            actions={actions}
            leadingContent={
                <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider shrink-0">
                        Root Name:
                    </span>
                    <Input
                        value={rootName}
                        onChange={(e) => setRootName(e.target.value)}
                        placeholder="RootObject"
                        className="h-8 w-44 text-xs font-mono"
                        spellCheck={false}
                    />
                </div>
            }
        >
            <div className="flex flex-col gap-4 md:flex-row">
                <div className="min-w-0 w-full md:w-1/2">
                    <div className="flex flex-col gap-2">
                        <EditorPaneHeader
                            label="Input JSON"
                            content={content}
                            onContentChange={setContent}
                            onClear={() => setContent('')}
                            hideInputActions={readOnly}
                        />
                        <JsonEditor
                            value={content}
                            onChange={setContent}
                            readOnly={readOnly}
                            emptyIcon={Braces}
                            emptyTitle="Add JSON to convert"
                            emptyDescription="Paste JSON structure or start typing to see TypeScript interface definitions"
                        />
                    </div>
                </div>
                <div className="min-w-0 w-full md:w-1/2">
                    <div className="flex flex-col gap-2">
                        <EditorPaneHeader
                            label="TypeScript Interfaces"
                            content={error ? '' : output}
                            onContentChange={() => {}}
                            downloadFilename={`${rootName || 'interfaces'}.ts`}
                            hideInputActions
                        />
                        <TextEditor
                            value={error ? '' : output}
                            onChange={() => {}}
                            readOnly
                            emptyIcon={FileCode}
                            emptyTitle="TypeScript interfaces"
                            emptyDescription="TypeScript interface definitions will appear here once you add valid JSON input"
                            showEmptyPrompt
                        />
                        {error && <p className="text-xs text-destructive mt-1 leading-normal">{error}</p>}
                    </div>
                </div>
            </div>
            <ShareSidebarModal
                open={shareOpen}
                onOpenChange={setShareOpen}
                config={{
                    pageName: 'json',
                    tabName: 'typescript',
                    getState: () => ({ content, rootName }),
                    extraActions: output
                        ? [
                              {
                                  id: 'copy-typescript',
                                  label: 'Copy TypeScript',
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
