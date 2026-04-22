'use client';

import { useState, useCallback, useRef } from 'react';
import { useToolState } from '../../core/hooks/use-tool-state';
import { useToolActions } from '../../core/hooks/use-tool-actions';
import { ToolTabWrapper } from '../../core/components/tool-tab-wrapper';
import { ShareSidebarModal } from '../../core/plugins/share-sidebar';
import { STORAGE_KEYS } from '@/lib/utils/constants';
import { TextEditor } from '../../text/components/text-editor';
import { useClipboard } from '@/lib/hooks/use-clipboard';
import { useLocalStorage } from '@/lib/hooks/use-local-storage';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Copy, KeyRound, Check, Eye, EyeOff } from 'lucide-react';
import { EditorPaneHeader } from '../../core/components/editor-pane-header';
import { EmptyEditorPrompt } from '@/components/ui/empty-editor-prompt';
import { computeAllHmacs, HMAC_ALGORITHMS, type HmacAlgorithm } from '../utils/hash-operations';
import type { TabComponentProps } from '../../core/types/tool';

export default function HmacTab({ sharedData, readOnly }: TabComponentProps) {
    const { content, setContent, isReady } = useToolState({
        storageKey: STORAGE_KEYS.HASH_HMAC_INPUT,
        sharedData,
        tabId: 'hmac',
        readOnly,
    });
    const [secretKey, setSecretKey] = useLocalStorage(STORAGE_KEYS.HASH_HMAC_KEY, '');
    const [showKey, setShowKey] = useState(false);
    const [selectedAlgo, setSelectedAlgo] = useState<HmacAlgorithm>('sha-256');
    const [shareOpen, setShareOpen] = useState(false);
    const [allHmacs, setAllHmacs] = useState<Record<HmacAlgorithm, string> | null>(null);
    const { copy } = useClipboard();
    const [copiedAlgo, setCopiedAlgo] = useState<HmacAlgorithm | null>(null);
    const abortRef = useRef<AbortController | null>(null);

    const computeHmacs = useCallback((message: string, key: string) => {
        if (abortRef.current) {
            abortRef.current.abort();
        }

        if (!message.trim() || !key.trim()) {
            setAllHmacs(null);
            return;
        }

        const controller = new AbortController();
        abortRef.current = controller;

        computeAllHmacs(message, key).then((hmacs) => {
            if (!controller.signal.aborted) {
                setAllHmacs(hmacs);
            }
        });
    }, []);

    const handleContentChange = useCallback(
        (value: string) => {
            setContent(value);
            computeHmacs(value, secretKey);
        },
        [setContent, secretKey, computeHmacs],
    );

    const handleKeyChange = useCallback(
        (value: string) => {
            setSecretKey(value);
            computeHmacs(content, value);
        },
        [content, setSecretKey, computeHmacs],
    );

    const handleClear = useCallback(() => {
        setContent('');
        setSecretKey('');
        setAllHmacs(null);
    }, [setContent, setSecretKey]);

    const { actions } = useToolActions({
        pageName: 'hash',
        tabId: 'hmac',
        getContent: () => content,
        onClear: handleClear,
        shareDialogOpen: shareOpen,
        setShareDialogOpen: setShareOpen,
        readOnly,
    });

    const handleCopy = useCallback(
        async (hmac: string, algo: HmacAlgorithm) => {
            await copy(hmac, `${HMAC_ALGORITHMS.find((a) => a.value === algo)?.label} copied`);
            setCopiedAlgo(algo);
            setTimeout(() => setCopiedAlgo(null), 1500);
        },
        [copy],
    );

    if (!isReady) return null;

    const hasInput = content.trim().length > 0 && secretKey.trim().length > 0;

    return (
        <ToolTabWrapper actions={actions}>
            <div className="flex flex-col gap-4 md:flex-row">
                <div className="min-w-0 w-full md:w-1/2">
                    <div className="flex flex-col gap-4">
                        <div className="flex flex-col gap-2">
                            <EditorPaneHeader
                                label="Message"
                                content={content}
                                onContentChange={handleContentChange}
                                onClear={() => handleContentChange('')}
                                hideInputActions={readOnly}
                            />
                            <TextEditor
                                value={content}
                                onChange={handleContentChange}
                                readOnly={readOnly}
                                emptyIcon={KeyRound}
                                emptyTitle="Enter message"
                                emptyDescription="Type or paste the message to authenticate"
                            />
                        </div>
                        <div className="flex flex-col gap-1.5">
                            <label className="text-sm font-medium text-muted-foreground">
                                Secret Key
                            </label>
                            <div className="relative">
                                <Input
                                    type={showKey ? 'text' : 'password'}
                                    value={secretKey}
                                    onChange={(e) => handleKeyChange(e.target.value)}
                                    placeholder="Enter secret key"
                                    className="pr-10 font-mono text-sm"
                                    readOnly={readOnly}
                                />
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="absolute right-1 top-1/2 h-7 w-7 -translate-y-1/2"
                                    onClick={() => setShowKey(!showKey)}
                                    type="button"
                                >
                                    {showKey ? (
                                        <EyeOff className="h-3.5 w-3.5" />
                                    ) : (
                                        <Eye className="h-3.5 w-3.5" />
                                    )}
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="min-w-0 w-full md:w-1/2">
                    <div className="flex flex-col gap-2">
                        <EditorPaneHeader
                            label="HMAC Output"
                            content={allHmacs ? Object.values(allHmacs).join('\n') : ''}
                            onContentChange={() => {}}
                            hideInputActions
                        />
                        {allHmacs && hasInput ? (
                            <div className="flex flex-col gap-2 min-h-[350px] md:min-h-[400px] lg:min-h-[500px] border rounded-lg p-2">
                                {HMAC_ALGORITHMS.map((algo) => (
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
                                                {allHmacs[algo.value]}
                                            </code>
                                        </div>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-7 w-7 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleCopy(allHmacs[algo.value], algo.value);
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
                                    icon={KeyRound}
                                    title="HMAC output"
                                    description={
                                        !content.trim()
                                            ? 'Enter a message and secret key to generate HMACs'
                                            : 'Enter a secret key to generate HMACs'
                                    }
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
                    tabName: 'hmac',
                    getState: () => ({ content, secretKey, selectedAlgo }),
                    extraActions: allHmacs
                        ? HMAC_ALGORITHMS.map((algo) => ({
                              id: `copy-${algo.value}`,
                              label: `Copy ${algo.label}`,
                              icon: Copy,
                              handler: () => copy(allHmacs[algo.value]),
                          }))
                        : [],
                }}
            />
        </ToolTabWrapper>
    );
}
