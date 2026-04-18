'use client';

import { useState } from 'react';
import { useToolState } from '../../core/hooks/use-tool-state';
import { useToolActions } from '../../core/hooks/use-tool-actions';
import { ToolTabWrapper } from '../../core/components/tool-tab-wrapper';
import { ShareSidebarModal } from '../../core/plugins/share-sidebar';
import { STORAGE_KEYS } from '@/lib/utils/constants';
import { useJsonParser } from '../hooks/use-json-parser';
import { JsonEditor } from '../components/json-editor';
import { Badge } from '@/components/ui/badge';
import { EditorPaneHeader } from '../../core/components/editor-pane-header';
import { EmptyEditorPrompt } from '@/components/ui/empty-editor-prompt';
import { Braces, SearchCode } from 'lucide-react';
import type { TabComponentProps } from '../../core/types/tool';

export default function ParserTab({ sharedData }: TabComponentProps) {
    const { content, setContent, isReady } = useToolState({
        storageKey: STORAGE_KEYS.JSON_PARSER_CONTENT,
        sharedData,
        tabId: 'parser',
    });
    const [shareOpen, setShareOpen] = useState(false);
    const { parsed, type, keys, error } = useJsonParser(content);

    const { actions } = useToolActions({
        pageName: 'json',
        tabId: 'parser',
        getContent: () => content,
        onClear: () => setContent(''),
        shareDialogOpen: shareOpen,
        setShareDialogOpen: setShareOpen,
    });

    if (!isReady) return null;

    return (
        <ToolTabWrapper actions={actions}>
            <div className="flex flex-col gap-4 md:flex-row">
                <div className="min-w-0 w-full md:w-1/2">
                    <div className="flex flex-col gap-2">
                        <EditorPaneHeader
                            label="JSON Input"
                            content={content}
                            onContentChange={setContent}
                            onClear={() => setContent('')}
                        />
                        <JsonEditor
                            value={content}
                            onChange={setContent}
                            emptyIcon={Braces}
                            emptyTitle="Add JSON to parse"
                            emptyDescription="Paste JSON data to inspect its structure and properties"
                        />
                    </div>
                </div>
                <div className="min-w-0 w-full md:w-1/2">
                    <div className="flex flex-col gap-2">
                        <EditorPaneHeader
                            label="Parse Results"
                            content={
                                parsed !== null && !error
                                    ? String(JSON.stringify(parsed, null, 2))
                                    : ''
                            }
                            onContentChange={() => {}}
                            downloadFilename="parsed.json"
                            hideInputActions
                        />
                        <div className="relative min-h-[250px] md:min-h-[400px] lg:min-h-[500px] rounded-lg border p-3 sm:p-4">
                            {error && <p className="text-sm text-destructive">{error}</p>}
                            {parsed !== null && !error && (
                                <div className="flex flex-col gap-3">
                                    <div className="flex items-center gap-2">
                                        <Badge>{type}</Badge>
                                        {keys && (
                                            <span className="text-sm text-muted-foreground">
                                                {keys.length} keys
                                            </span>
                                        )}
                                    </div>
                                    <pre className="max-h-[400px] overflow-auto font-mono text-sm">
                                        {String(JSON.stringify(parsed, null, 2))}
                                    </pre>
                                </div>
                            )}
                            {parsed === null && !error && (
                                <EmptyEditorPrompt
                                    icon={SearchCode}
                                    title="Parse results"
                                    description="Parsed JSON structure will appear here once you add input"
                                    showActions={false}
                                    overlay
                                />
                            )}
                        </div>
                    </div>
                </div>
            </div>
            <ShareSidebarModal
                open={shareOpen}
                onOpenChange={setShareOpen}
                config={{
                    pageName: 'json',
                    tabName: 'parser',
                    getState: () => ({ content }),
                }}
            />
        </ToolTabWrapper>
    );
}
