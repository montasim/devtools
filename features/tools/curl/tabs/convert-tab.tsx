'use client';

import { useState, useMemo } from 'react';
import { useToolState } from '../../core/hooks/use-tool-state';
import { useToolActions } from '../../core/hooks/use-tool-actions';
import { ToolTabWrapper } from '../../core/components/tool-tab-wrapper';
import { ShareSidebarModal } from '../../core/plugins/share-sidebar';
import { STORAGE_KEYS } from '@/lib/utils/constants';
import { TextEditor } from '../../text/components/text-editor';
import { useClipboard } from '@/lib/hooks/use-clipboard';
import { Button } from '@/components/ui/button';
import { Copy, Terminal, AlertCircle } from 'lucide-react';
import { EditorPaneHeader } from '../../core/components/editor-pane-header';
import { parseCurl } from '../utils/curl-parser';
import { generateCode, type TargetLanguage } from '../utils/code-generators';
import type { TabComponentProps } from '../../core/types/tool';

const LANGUAGES: { value: TargetLanguage; label: string }[] = [
    { value: 'fetch', label: 'fetch' },
    { value: 'axios', label: 'axios' },
    { value: 'python', label: 'Python' },
    { value: 'httpie', label: 'HTTPie' },
];

export default function ConvertTab({ sharedData, readOnly }: TabComponentProps) {
    const { content, setContent, isReady } = useToolState({
        storageKey: STORAGE_KEYS.CURL_CONVERT_INPUT,
        sharedData,
        tabId: 'convert',
        readOnly,
    });
    const [language, setLanguage] = useState<TargetLanguage>('fetch');
    const [shareOpen, setShareOpen] = useState(false);
    const { copy } = useClipboard();

    const { output, error } = useMemo(() => {
        if (!content.trim()) return { output: '', error: null };
        try {
            const parsed = parseCurl(content);
            if (!parsed.url) {
                return { output: '', error: 'Could not detect a URL from the cURL command' };
            }
            const code = generateCode(parsed, language);
            return { output: code, error: null };
        } catch (e) {
            return {
                output: '',
                error: e instanceof Error ? e.message : 'Failed to parse cURL command',
            };
        }
    }, [content, language]);

    const { actions } = useToolActions({
        pageName: 'curl',
        tabId: 'convert',
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
                <div className="flex flex-wrap items-center gap-1.5">
                    {LANGUAGES.map((lang) => (
                        <Button
                            key={lang.value}
                            variant={language === lang.value ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setLanguage(lang.value)}
                            className="h-7 text-xs font-mono"
                        >
                            {lang.label}
                        </Button>
                    ))}
                </div>
            }
        >
            <div className="flex flex-col gap-4 md:flex-row">
                <div className="min-w-0 w-full md:w-1/2">
                    <div className="flex flex-col gap-2">
                        <EditorPaneHeader
                            label="cURL Command"
                            content={content}
                            onContentChange={setContent}
                            onClear={() => setContent('')}
                            hideInputActions={readOnly}
                        />
                        <TextEditor
                            value={content}
                            onChange={setContent}
                            readOnly={readOnly}
                            placeholder="Paste your cURL command here..."
                            emptyIcon={Terminal}
                            emptyTitle="Paste a cURL command"
                            emptyDescription="Paste a cURL command to convert it to code"
                        />
                    </div>
                </div>
                <div className="min-w-0 w-full md:w-1/2">
                    <div className="flex flex-col gap-2">
                        <EditorPaneHeader
                            label={`${LANGUAGES.find((l) => l.value === language)?.label ?? ''} Output`}
                            content={output}
                            onContentChange={() => {}}
                            downloadFilename={`curl-converted.${language === 'python' ? 'py' : language === 'httpie' ? 'txt' : 'js'}`}
                            hideInputActions
                        />
                        {error ? (
                            <div className="flex min-h-[350px] items-center justify-center rounded-lg border md:min-h-[400px] lg:min-h-[500px]">
                                <div className="flex flex-col items-center gap-3 text-center">
                                    <AlertCircle className="h-10 w-10 text-destructive/60" />
                                    <p className="text-sm font-medium text-destructive">{error}</p>
                                    <p className="text-xs text-muted-foreground">
                                        Make sure you pasted a valid cURL command
                                    </p>
                                </div>
                            </div>
                        ) : (
                            <TextEditor
                                value={output}
                                onChange={() => {}}
                                readOnly
                                emptyTitle="Converted code"
                                emptyDescription="Converted code will appear here once you paste a cURL command"
                                showEmptyPrompt
                            />
                        )}
                    </div>
                </div>
            </div>
            <ShareSidebarModal
                open={shareOpen}
                onOpenChange={setShareOpen}
                config={{
                    pageName: 'curl',
                    tabName: 'convert',
                    getState: () => ({ content, language }),
                    extraActions: output
                        ? [
                              {
                                  id: 'copy-output',
                                  label: 'Copy Output',
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
