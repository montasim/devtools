'use client';

import { useState, useCallback } from 'react';
import { useToolActions } from '../../core/hooks/use-tool-actions';
import { ToolTabWrapper } from '../../core/components/tool-tab-wrapper';
import { ShareSidebarModal } from '../../core/plugins/share-sidebar';
import { STORAGE_KEYS } from '@/lib/utils/constants';
import { useLocalStorage } from '@/lib/hooks/use-local-storage';
import { useClipboard } from '@/lib/hooks/use-clipboard';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Copy, Fingerprint, Check, ShieldCheck, ShieldX, Shuffle } from 'lucide-react';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { EmptyEditorPrompt } from '@/components/ui/empty-editor-prompt';
import {
    generateUuids,
    validateUuid,
    UUID_VERSIONS,
    UUID_QUANTITY_OPTIONS,
    type UuidVersion,
    type UuidQuantity,
} from '../utils/id-operations';
import type { TabComponentProps } from '../../core/types/tool';

export default function UuidTab({ readOnly }: TabComponentProps) {
    const [version, setVersion] = useLocalStorage<UuidVersion>(STORAGE_KEYS.UUID_VERSION, 'v4');
    const [quantity, setQuantity] = useLocalStorage<UuidQuantity>(STORAGE_KEYS.UUID_QUANTITY, 5);
    const [results, setResults] = useLocalStorage<string[]>(STORAGE_KEYS.UUID_RESULTS, []);
    const [shareOpen, setShareOpen] = useState(false);
    const [validateInput, setValidateInput] = useState('');
    const [copiedIdx, setCopiedIdx] = useState<number | null>(null);
    const { copy } = useClipboard();

    const validation = validateInput.trim() ? validateUuid(validateInput) : null;

    const handleGenerate = useCallback(() => {
        const ids = generateUuids(version, quantity);
        setResults(ids);
    }, [version, quantity, setResults]);

    const handleClear = useCallback(() => {
        setResults([]);
        setValidateInput('');
    }, [setResults]);

    const { actions } = useToolActions({
        pageName: 'id',
        tabId: 'uuid',
        getContent: () => results.join('\n'),
        onClear: handleClear,
        shareDialogOpen: shareOpen,
        setShareDialogOpen: setShareOpen,
        readOnly,
    });

    const handleCopySingle = useCallback(
        async (id: string, idx: number) => {
            await copy(id);
            setCopiedIdx(idx);
            setTimeout(() => setCopiedIdx(null), 1500);
        },
        [copy],
    );

    const handleCopyAll = useCallback(async () => {
        if (results.length === 0) return;
        await copy(results.join('\n'), `${results.length} UUIDs copied`);
    }, [results, copy]);

    return (
        <ToolTabWrapper
            actions={actions}
            leadingContent={
                <>
                    <div className="flex items-center gap-1.5">
                        <Label className="text-xs whitespace-nowrap">Version</Label>
                        <Select value={version} onValueChange={(v) => setVersion(v as UuidVersion)}>
                            <SelectTrigger className="h-7 w-auto text-xs" size="sm">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {UUID_VERSIONS.map((v) => (
                                    <SelectItem key={v.value} value={v.value}>
                                        {v.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <Label className="text-xs whitespace-nowrap">Qty</Label>
                        <Select
                            value={String(quantity)}
                            onValueChange={(v) => setQuantity(Number(v) as UuidQuantity)}
                        >
                            <SelectTrigger className="h-7 w-[60px] text-xs" size="sm">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {UUID_QUANTITY_OPTIONS.map((n) => (
                                    <SelectItem key={n} value={String(n)}>
                                        {n}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <Button
                        onClick={handleGenerate}
                        disabled={readOnly}
                        size="sm"
                        className="h-7 gap-1.5 text-xs"
                    >
                        <Shuffle className="h-3.5 w-3.5" />
                        Generate
                    </Button>
                </>
            }
        >
            <div className="flex flex-col gap-4 md:flex-row">
                <div className="min-w-0 w-full md:w-1/2">
                    <div className="flex flex-col gap-2 mt-4">
                        <label className="text-sm font-medium text-muted-foreground">
                            Validate UUID
                        </label>
                        <div className="flex flex-col gap-2 rounded-lg border p-4">
                            <Input
                                value={validateInput}
                                onChange={(e) => setValidateInput(e.target.value)}
                                placeholder="Paste a UUID to validate..."
                                className="font-mono text-sm"
                            />
                            {validation && (
                                <div
                                    className={`flex items-start gap-2 rounded-md border p-3 text-sm ${
                                        validation.valid
                                            ? 'border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950'
                                            : 'border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950'
                                    }`}
                                >
                                    {validation.valid ? (
                                        <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-green-600 dark:text-green-400" />
                                    ) : (
                                        <ShieldX className="mt-0.5 h-4 w-4 shrink-0 text-red-600 dark:text-red-400" />
                                    )}
                                    {validation.valid ? (
                                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs">
                                            <span className="font-medium text-green-700 dark:text-green-300">
                                                Valid UUID
                                            </span>
                                            {validation.version && (
                                                <span className="text-green-600 dark:text-green-400">
                                                    Version: {validation.version}
                                                </span>
                                            )}
                                            <span className="text-green-600 dark:text-green-400">
                                                Variant: {validation.variant}
                                            </span>
                                            {validation.format && (
                                                <span className="text-green-600 dark:text-green-400">
                                                    Format: {validation.format}
                                                </span>
                                            )}
                                        </div>
                                    ) : (
                                        <span className="font-medium text-red-700 dark:text-red-300">
                                            Invalid UUID format
                                        </span>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
                <div className="min-w-0 w-full md:w-1/2">
                    <div className="flex flex-col gap-2">
                        <div className="flex items-center justify-between mt-2">
                            <label className="text-sm font-medium text-muted-foreground">
                                Generated UUIDs
                                {results.length > 0 && (
                                    <span className="ml-1.5 text-xs text-muted-foreground/60">
                                        ({results.length})
                                    </span>
                                )}
                            </label>
                            {results.length > 0 && (
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="h-7 gap-1.5 text-xs"
                                    onClick={handleCopyAll}
                                >
                                    <Copy className="h-3 w-3" />
                                    Copy All
                                </Button>
                            )}
                        </div>
                        {results.length > 0 ? (
                            <div className="flex flex-col gap-1.5 min-h-[350px] overflow-y-auto rounded-lg border p-3 md:min-h-[400px] lg:min-h-[500px]">
                                {results.map((id, idx) => (
                                    <div
                                        key={`${id}-${idx}`}
                                        className="group flex items-center gap-2 rounded-md border px-3 py-2 transition-colors hover:bg-muted/50"
                                    >
                                        <Fingerprint className="h-3.5 w-3.5 shrink-0 text-muted-foreground/40" />
                                        <code className="flex-1 font-mono text-xs select-all">
                                            {id}
                                        </code>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-6 w-6 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                                            onClick={() => handleCopySingle(id, idx)}
                                        >
                                            {copiedIdx === idx ? (
                                                <Check className="h-3 w-3 text-green-500" />
                                            ) : (
                                                <Copy className="h-3 w-3" />
                                            )}
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="relative min-h-[350px] rounded-lg border md:min-h-[400px] lg:min-h-[500px]">
                                <EmptyEditorPrompt
                                    icon={Fingerprint}
                                    title="No UUIDs generated"
                                    description="Select a version and quantity, then click Generate"
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
                    pageName: 'id',
                    tabName: 'uuid',
                    getState: () => ({
                        results,
                        version,
                        quantity: String(quantity),
                    }),
                    extraActions:
                        results.length > 0
                            ? [
                                  {
                                      id: 'copy-all',
                                      label: 'Copy All UUIDs',
                                      icon: Copy,
                                      handler: () => copy(results.join('\n')),
                                  },
                              ]
                            : [],
                }}
            />
        </ToolTabWrapper>
    );
}
