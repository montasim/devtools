'use client';
import { ToolContentSkeleton } from '@/app/(tools)/loading';

import { useState } from 'react';
import { useToolState } from '../../core/hooks/use-tool-state';
import { useToolActions } from '../../core/hooks/use-tool-actions';
import { ToolTabWrapper } from '../../core/components/tool-tab-wrapper';
import { ShareSidebarModal } from '../../core/plugins/share-sidebar';
import { STORAGE_KEYS } from '@/lib/utils/constants';
import { useXmlParser } from '../hooks/use-xml-parser';
import { XmlEditor } from '../components/xml-editor';
import { Badge } from '@/components/ui/badge';
import { EditorPaneHeader } from '../../core/components/editor-pane-header';
import { EmptyEditorPrompt } from '@/components/ui/empty-editor-prompt';
import { Code, SearchCode } from 'lucide-react';
import type { TabComponentProps } from '../../core/types/tool';

export default function ParserTab({ sharedData, readOnly }: TabComponentProps) {
    const { content, setContent, isReady } = useToolState({
        storageKey: STORAGE_KEYS.XML_PARSER_CONTENT,
        sharedData,
        tabId: 'parser',
        readOnly,
    });
    const [shareOpen, setShareOpen] = useState(false);
    const { parsed, type, keys, error } = useXmlParser(content);

    const { actions } = useToolActions({
        pageName: 'xml',
        tabId: 'parser',
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
                            label="XML Input"
                            content={content}
                            onContentChange={setContent}
                            onClear={() => setContent('')}
                            hideInputActions={readOnly}
                        />
                        <XmlEditor
                            value={content}
                            onChange={setContent}
                            readOnly={readOnly}
                            emptyIcon={Code}
                            emptyTitle="Add XML to parse"
                            emptyDescription="Paste XML data to inspect its structure and properties"
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
                        <div className="relative min-h-[350px] md:min-h-[400px] lg:min-h-[500px] overflow-auto rounded-lg border p-4">
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
                                    description="Parsed XML structure will appear here once you add input"
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
                    pageName: 'xml',
                    tabName: 'parser',
                    getState: () => ({ content }),
                }}
            />
        </ToolTabWrapper>
    );
}
