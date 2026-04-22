'use client';

import { useState, useCallback, useRef } from 'react';
import { useToolState } from '../../core/hooks/use-tool-state';
import { useToolActions } from '../../core/hooks/use-tool-actions';
import { ToolTabWrapper } from '../../core/components/tool-tab-wrapper';
import { ShareSidebarModal } from '../../core/plugins/share-sidebar';
import { STORAGE_KEYS } from '@/lib/utils/constants';
import { TextEditor } from '../../text/components/text-editor';
import { useClipboard } from '@/lib/hooks/use-clipboard';
import { Button } from '@/components/ui/button';
import { Copy, Hash, Check } from 'lucide-react';
import { EditorPaneHeader } from '../../core/components/editor-pane-header';
import { EmptyEditorPrompt } from '@/components/ui/empty-editor-prompt';
import { computeAllHashes, HASH_ALGORITHMS, type HashAlgorithm } from '../utils/hash-operations';
import type { TabComponentProps } from '../../core/types/tool';

export default function GenerateTab({ sharedData, readOnly }: TabComponentProps) {
    const { content, setContent, isReady } = useToolState({
        storageKey: STORAGE_KEYS.HASH_GENERATE_INPUT,
        sharedData,
        tabId: 'generate',
        readOnly,
    });
    const [selectedAlgo, setSelectedAlgo] = useState<HashAlgorithm>('sha-256');
    const [shareOpen, setShareOpen] = useState(false);
    const [allHashes, setAllHashes] = useState<Record<HashAlgorithm, string> | null>(null);
    const { copy } = useClipboard();
    const [copiedAlgo, setCopiedAlgo] = useState<HashAlgorithm | null>(null);
    const abortRef = useRef<AbortController | null>(null);

    const handleContentChange = useCallback(
        (value: string) => {
            setContent(value);

            if (abortRef.current) {
                abortRef.current.abort();
            }

            if (!value.trim()) {
                setAllHashes(null);
                return;
            }

            const controller = new AbortController();
            abortRef.current = controller;

            computeAllHashes(value).then((hashes) => {
                if (!controller.signal.aborted) {
                    setAllHashes(hashes);
                }
            });
        },
        [setContent],
    );

    const { actions } = useToolActions({
        pageName: 'hash',
        tabId: 'generate',
        getContent: () => content,
        onClear: () => handleContentChange(''),
        shareDialogOpen: shareOpen,
        setShareDialogOpen: setShareOpen,
        readOnly,
    });

    const handleCopy = useCallback(
        async (hash: string, algo: HashAlgorithm) => {
            await copy(hash, `${HASH_ALGORITHMS.find((a) => a.value === algo)?.label} hash copied`);
            setCopiedAlgo(algo);
            setTimeout(() => setCopiedAlgo(null), 1500);
        },
        [copy],
    );

    if (!isReady) return null;

    return (
        <ToolTabWrapper actions={actions}>
            <div className="flex flex-col gap-4 md:flex-row">
                <div className="min-w-0 w-full md:w-1/2">
                    <div className="flex flex-col gap-2">
                        <EditorPaneHeader
                            label="Input Text"
                            content={content}
                            onContentChange={handleContentChange}
                            onClear={() => handleContentChange('')}
                            hideInputActions={readOnly}
                        />
                        <TextEditor
                            value={content}
                            onChange={handleContentChange}
                            readOnly={readOnly}
                            emptyIcon={Hash}
                            emptyTitle="Enter text to hash"
                            emptyDescription="Type or paste text to generate hash values"
                        />
                    </div>
                </div>
                <div className="min-w-0 w-full md:w-1/2">
                    <div className="flex flex-col gap-2">
                        <EditorPaneHeader
                            label="Hash Output"
                            content={allHashes ? Object.values(allHashes).join('\n') : ''}
                            onContentChange={() => {}}
                            hideInputActions
                        />
                        {allHashes ? (
                            <div className="flex flex-col gap-2 min-h-[350px] md:min-h-[400px] lg:min-h-[500px] border rounded-lg p-2">
                                {HASH_ALGORITHMS.map((algo) => (
                                    <div
                                        key={algo.value}
                                        className={`group flex items-center gap-3 rounded-lg border px-4 py-3 transition-colors cursor-pointer ${
                                            selectedAlgo === algo.value
                                                ? 'border-primary/50 bg-primary/5'
                                                : 'hover:bg-muted/50'
                                        }`}
                                        onClick={() => setSelectedAlgo(algo.value)}
                                    >
                                        <div className="flex flex-1 flex-col gap-0.5 min-w-0">
                                            <div className="flex items-center gap-2">
                                                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                                    {algo.label}
                                                </span>
                                                <span className="text-[10px] text-muted-foreground/60">
                                                    {algo.description}
                                                </span>
                                            </div>
                                            <code
                                                className="block truncate font-mono text-xs break-all"
                                                style={{ wordBreak: 'break-all' }}
                                            >
                                                {allHashes[algo.value]}
                                            </code>
                                        </div>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-7 w-7 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleCopy(allHashes[algo.value], algo.value);
                                            }}
                                        >
                                            {copiedAlgo === algo.value ? (
                                                <Check className="h-3.5 w-3.5 text-green-500" />
                                            ) : (
                                                <Copy className="h-3.5 w-3.5" />
                                            )}
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="relative min-h-[350px] rounded-lg border md:min-h-[400px] lg:min-h-[500px]">
                                <EmptyEditorPrompt
                                    icon={Hash}
                                    title="Hash output"
                                    description="Enter text on the left to generate hash values"
                                    showActions={false}
                                    overlay
                                />
                            </div>
                        )}
                    </div>
                </div>
            </div>
            <ShareSidebarModal
                open={shareOpen}
                onOpenChange={setShareOpen}
                config={{
                    pageName: 'hash',
                    tabName: 'generate',
                    getState: () => ({ content, selectedAlgo }),
                    extraActions: allHashes
                        ? HASH_ALGORITHMS.map((algo) => ({
                              id: `copy-${algo.value}`,
                              label: `Copy ${algo.label}`,
                              icon: Copy,
                              handler: () => copy(allHashes[algo.value]),
                          }))
                        : [],
                }}
            />
        </ToolTabWrapper>
    );
}
