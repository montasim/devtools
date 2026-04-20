'use client';

import { useState } from 'react';
import { useToolState } from '../../core/hooks/use-tool-state';
import { useToolActions } from '../../core/hooks/use-tool-actions';
import { ToolTabWrapper } from '../../core/components/tool-tab-wrapper';
import { ShareSidebarModal } from '../../core/plugins/share-sidebar';
import { STORAGE_KEYS } from '@/lib/utils/constants';
import { useJsonExport } from '../hooks/use-json-export';
import { JsonEditor } from '../components/json-editor';
import { EditorPaneHeader } from '../../core/components/editor-pane-header';
import { useClipboard } from '@/lib/hooks/use-clipboard';
import { useDownload } from '@/lib/hooks/use-download';
import { Button } from '@/components/ui/button';
import { Copy, Download, Braces, FileOutput } from 'lucide-react';
import type { TabComponentProps } from '../../core/types/tool';

export default function ExportTab({ sharedData, readOnly }: TabComponentProps) {
    const { content, setContent, isReady } = useToolState({
        storageKey: STORAGE_KEYS.JSON_EXPORT_CONTENT,
        sharedData,
        tabId: 'export',
        readOnly,
    });
    const [format, setFormat] = useState<'csv' | 'xml' | 'yaml'>('csv');
    const [shareOpen, setShareOpen] = useState(false);
    const { exported, error } = useJsonExport(content, format);
    const { copy } = useClipboard();
    const { download } = useDownload();

    const { actions } = useToolActions({
        pageName: 'json',
        tabId: 'export',
        getContent: () => content,
        onClear: () => setContent(''),
        shareDialogOpen: shareOpen,
        setShareDialogOpen: setShareOpen,
        readOnly,
    });

    if (!isReady) return null;

    return (
        <ToolTabWrapper
            actions={actions}
            leadingContent={
                <div className="flex items-center gap-1.5">
                    {(['csv', 'xml', 'yaml'] as const).map((f) => (
                        <Button
                            key={f}
                            variant={format === f ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setFormat(f)}
                            className="h-7 text-xs uppercase"
                        >
                            {f}
                        </Button>
                    ))}
                </div>
            }
        >
            <div className="flex flex-col gap-4 md:flex-row">
                <div className="min-w-0 w-full md:w-1/2">
                    <div className="flex flex-col gap-2">
                        <EditorPaneHeader
                            label="JSON Input"
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
                            emptyTitle="Add JSON to export"
                            emptyDescription="Paste JSON data to convert it to CSV, XML, or YAML"
                        />
                    </div>
                </div>
                <div className="min-w-0 w-full md:w-1/2">
                    <div className="flex flex-col gap-2">
                        <EditorPaneHeader
                            label="Exported Output"
                            content={error ? '' : exported}
                            onContentChange={() => {}}
                            downloadFilename="exported.json"
                            hideInputActions
                        />
                        <JsonEditor
                            value={error ? '' : exported}
                            onChange={() => {}}
                            readOnly
                            emptyIcon={FileOutput}
                            emptyTitle="Exported output"
                            emptyDescription="Converted content will appear here once you add input"
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
                    pageName: 'json',
                    tabName: 'export',
                    getState: () => ({ content, format }),
                    extraActions: exported
                        ? [
                              {
                                  id: 'copy-exported',
                                  label: 'Copy Exported',
                                  icon: Copy,
                                  handler: () => copy(exported),
                              },
                              {
                                  id: 'download-exported',
                                  label: 'Download',
                                  icon: Download,
                                  handler: () => download(exported, `export.${format}`),
                              },
                          ]
                        : [],
                }}
            />
        </ToolTabWrapper>
    );
}
