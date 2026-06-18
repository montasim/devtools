'use client';
import { ToolContentSkeleton } from '@/app/(tools)/loading';

import { useState } from 'react';
import yaml from 'js-yaml';
import { useToolState } from '../../core/hooks/use-tool-state';
import { useToolActions } from '../../core/hooks/use-tool-actions';
import { ToolTabWrapper } from '../../core/components/tool-tab-wrapper';
import { EditorPaneHeader } from '../../core/components/editor-pane-header';
import { ShareSidebarModal } from '../../core/plugins/share-sidebar';
import { validateYaml } from '../utils/yaml-operations';
import { TextEditor } from '../../text/components/text-editor';
import { ShieldCheck, ShieldAlert, Layers } from 'lucide-react';
import type { TabComponentProps } from '../../core/types/tool';

export default function ValidateTab({ sharedData, readOnly }: TabComponentProps) {
    const { content, setContent, isReady } = useToolState({
        storageKey: 'yaml-validate-content',
        sharedData,
        tabId: 'validate',
        readOnly,
    });
    const [shareOpen, setShareOpen] = useState(false);

    const { actions } = useToolActions({
        pageName: 'yaml',
        tabId: 'validate',
        getContent: () => content,
        onClear: () => setContent(''),
        shareDialogOpen: shareOpen,
        setShareDialogOpen: setShareOpen,
        readOnly,
    });

    const validation = content ? validateYaml(content) : null;

    let keyCount: number | null = null;
    if (validation?.valid && content) {
        try {
            const parsed = yaml.load(content);
            keyCount =
                parsed && typeof parsed === 'object' && !Array.isArray(parsed)
                    ? Object.keys(parsed as object).length
                    : null;
        } catch {
            keyCount = null;
        }
    }

    if (!isReady) return <ToolContentSkeleton />;

    return (
        <ToolTabWrapper actions={actions}>
            <div className="flex flex-col gap-4 md:flex-row">
                <div className="min-w-0 w-full md:w-1/2">
                    <div className="flex flex-col gap-2">
                        <EditorPaneHeader
                            label="Input YAML"
                            content={content}
                            onContentChange={setContent}
                            onClear={() => setContent('')}
                            hideInputActions={readOnly}
                        />
                        <TextEditor
                            value={content}
                            onChange={setContent}
                            readOnly={readOnly}
                            emptyIcon={Layers}
                            emptyTitle="Add YAML to validate"
                            emptyDescription="Paste YAML on the left to validate its syntax"
                        />
                    </div>
                </div>
                <div className="min-w-0 w-full md:w-1/2">
                    <div className="flex flex-col gap-2">
                        <div className="flex items-center justify-between mt-2">
                            <label className="text-sm font-medium text-muted-foreground">
                                Validation Result
                            </label>
                        </div>
                        <div className="min-h-[350px] md:min-h-[400px] lg:min-h-[500px] flex items-center justify-center rounded-md border bg-muted/5 p-6">
                            {!validation ? (
                                <div className="flex flex-col items-center gap-3 text-center">
                                    <ShieldCheck className="h-12 w-12 text-muted-foreground/40" />
                                    <p className="text-base font-medium text-muted-foreground">
                                        No YAML to validate
                                    </p>
                                    <p className="text-sm text-muted-foreground/70">
                                        Paste YAML on the left
                                    </p>
                                </div>
                            ) : validation.valid ? (
                                <div className="flex flex-col items-center gap-3 text-center">
                                    <ShieldCheck className="h-12 w-12 text-green-500 dark:text-green-400" />
                                    <p className="text-lg font-semibold text-green-600 dark:text-green-400">
                                        Valid YAML
                                    </p>
                                    {keyCount !== null && (
                                        <p className="text-sm text-muted-foreground">
                                            {keyCount} root {keyCount === 1 ? 'key' : 'keys'} found
                                        </p>
                                    )}
                                </div>
                            ) : (
                                <div className="flex flex-col items-center gap-3 text-center max-w-sm">
                                    <ShieldAlert className="h-12 w-12 text-destructive" />
                                    <p className="text-lg font-semibold text-destructive">
                                        Invalid YAML
                                    </p>
                                    {validation.error && (
                                        <p className="text-sm text-muted-foreground break-words">
                                            {validation.error}
                                        </p>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
            <ShareSidebarModal
                open={shareOpen}
                onOpenChange={setShareOpen}
                config={{
                    pageName: 'yaml',
                    tabName: 'validate',
                    getState: () => ({ content }),
                    extraActions: [],
                }}
            />
        </ToolTabWrapper>
    );
}
