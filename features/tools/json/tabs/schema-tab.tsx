'use client';

import { useState } from 'react';
import { useToolState } from '../../core/hooks/use-tool-state';
import { useToolActions } from '../../core/hooks/use-tool-actions';
import { ToolTabWrapper } from '../../core/components/tool-tab-wrapper';
import { ShareSidebarModal } from '../../core/plugins/share-sidebar';
import { STORAGE_KEYS } from '@/lib/utils/constants';
import { useJsonSchema } from '../hooks/use-json-schema';
import { JsonEditor } from '../components/json-editor';
import { ValidationResults } from '../components/validation-results';
import { Button } from '@/components/ui/button';
import { useLocalStorage } from '@/lib/hooks/use-local-storage';
import { Braces, Shield } from 'lucide-react';
import { EditorPaneHeader } from '../../core/components/editor-pane-header';
import type { TabComponentProps } from '../../core/types/tool';

export default function SchemaTab({ sharedData }: TabComponentProps) {
    const {
        content: jsonContent,
        setContent: setJsonContent,
        isReady,
    } = useToolState({
        storageKey: STORAGE_KEYS.JSON_SCHEMA_JSON_CONTENT,
        sharedData,
        tabId: 'schema',
    });
    const [schemaContent, setSchemaContent] = useLocalStorage(
        STORAGE_KEYS.JSON_SCHEMA_SCHEMA_CONTENT,
        '',
    );
    const [mode, setMode] = useState<'validate' | 'generate'>('validate');
    const [shareOpen, setShareOpen] = useState(false);
    const { result, error } = useJsonSchema(jsonContent, schemaContent, mode);

    const { actions } = useToolActions({
        pageName: 'json',
        tabId: 'schema',
        getContent: () => jsonContent,
        onClear: () => {
            setJsonContent('');
            setSchemaContent('');
        },
        shareDialogOpen: shareOpen,
        setShareDialogOpen: setShareOpen,
    });

    if (!isReady) return null;

    return (
        <ToolTabWrapper
            actions={actions}
            leadingContent={
                <div className="flex items-center gap-2">
                    <Button
                        variant={mode === 'validate' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setMode('validate')}
                    >
                        Validate
                    </Button>
                    <Button
                        variant={mode === 'generate' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setMode('generate')}
                    >
                        Generate Schema
                    </Button>
                </div>
            }
        >
            <div className="flex flex-col gap-4 md:flex-row">
                <div className="min-w-0 w-full md:w-1/2">
                    <div className="flex flex-col gap-2">
                        <EditorPaneHeader
                            label="JSON Data"
                            content={jsonContent}
                            onContentChange={setJsonContent}
                            onClear={() => setJsonContent('')}
                        />
                        <JsonEditor
                            value={jsonContent}
                            onChange={setJsonContent}
                            emptyIcon={Braces}
                            emptyTitle="Add JSON data"
                            emptyDescription="Paste JSON data to validate against a schema or generate one"
                        />
                    </div>
                </div>
                <div className="min-w-0 w-full md:w-1/2">
                    <div className="flex flex-col gap-2">
                        {mode === 'validate' ? (
                            <>
                                <EditorPaneHeader
                                    label="JSON Schema"
                                    content={schemaContent}
                                    onContentChange={setSchemaContent}
                                    onClear={() => setSchemaContent('')}
                                    downloadFilename="schema.json"
                                />
                                <JsonEditor
                                    value={schemaContent}
                                    onChange={setSchemaContent}
                                    emptyIcon={Shield}
                                    emptyTitle="Add JSON Schema"
                                    emptyDescription="Paste a JSON Schema to validate your data against"
                                />
                            </>
                        ) : (
                            <>
                                <EditorPaneHeader
                                    label="Generated Schema"
                                    content={typeof result === 'string' ? result : ''}
                                    onContentChange={() => {}}
                                    downloadFilename="generated-schema.json"
                                    hideInputActions
                                />
                                <JsonEditor
                                    value={typeof result === 'string' ? result : ''}
                                    onChange={() => {}}
                                    readOnly
                                    emptyIcon={Shield}
                                    emptyTitle="Generated schema"
                                    emptyDescription="A JSON Schema will be generated from your data"
                                    showEmptyPrompt
                                />
                            </>
                        )}
                    </div>
                </div>
            </div>
            {mode === 'validate' && result && typeof result !== 'string' && (
                <ValidationResults valid={result.valid} errors={result.errors} />
            )}
            {error && <p className="text-sm text-destructive">{error}</p>}
            <ShareSidebarModal
                open={shareOpen}
                onOpenChange={setShareOpen}
                config={{
                    pageName: 'json',
                    tabName: 'schema',
                    getState: () => ({ jsonContent, schemaContent, mode }),
                }}
            />
        </ToolTabWrapper>
    );
}
