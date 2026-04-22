'use client';

import { useState, useCallback, useMemo, useEffect } from 'react';
import { useToolActions } from '../../core/hooks/use-tool-actions';
import { ToolTabWrapper } from '../../core/components/tool-tab-wrapper';
import { ShareSidebarModal } from '../../core/plugins/share-sidebar';
import { STORAGE_KEYS } from '@/lib/utils/constants';
import { useLocalStorage } from '@/lib/hooks/use-local-storage';
import { useClipboard } from '@/lib/hooks/use-clipboard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Copy, Check, Binary } from 'lucide-react';
import type { TabComponentProps } from '../../core/types/tool';
import {
    STANDARD_BASES,
    BIT_WIDTHS,
    DEFAULT_STATE,
    isValidForRadix,
    convertAll,
    convertCustomRadix,
    getAsciiRepresentation,
    getBitRepresentation,
    type NumberBaseState,
} from '../utils/number-base-operations';

export default function ConvertTab({ readOnly }: TabComponentProps) {
    const [savedState, setSavedState] = useLocalStorage<NumberBaseState>(
        STORAGE_KEYS.NUMBER_BASE_STATE,
        DEFAULT_STATE,
    );
    const [state, setState] = useState<NumberBaseState>(savedState);
    const [customRadix, setCustomRadix] = useState(36);
    const [shareOpen, setShareOpen] = useState(false);
    const [copiedField, setCopiedField] = useState<string | null>(null);
    const { copy } = useClipboard();

    useEffect(() => {
        setSavedState(state);
    }, [state, setSavedState]);

    const results = useMemo(() => convertAll(state), [state]);
    const customResult = useMemo(
        () => convertCustomRadix(state, customRadix),
        [state, customRadix],
    );
    const asciiChar = useMemo(() => getAsciiRepresentation(state), [state]);
    const bitStr = useMemo(() => getBitRepresentation(state), [state]);
    const hasInput = state.inputValue.trim().length > 0;
    const inputValid = isValidForRadix(state.inputValue, state.inputRadix);

    const handleInputChange = useCallback((value: string) => {
        setState((prev) => ({ ...prev, inputValue: value }));
    }, []);

    const handleRadixChange = useCallback((radix: number) => {
        setState((prev) => ({ ...prev, inputRadix: radix }));
    }, []);

    const handleSignedToggle = useCallback(() => {
        setState((prev) => ({ ...prev, isSigned: !prev.isSigned }));
    }, []);

    const handleBitWidthChange = useCallback((bitWidth: 8 | 16 | 32 | 64) => {
        setState((prev) => ({ ...prev, bitWidth }));
    }, []);

    const handleCopy = useCallback(
        async (value: string, field: string) => {
            if (!value) return;
            await copy(value);
            setCopiedField(field);
            setTimeout(() => setCopiedField(null), 1500);
        },
        [copy],
    );

    const handleClear = useCallback(() => {
        setState(DEFAULT_STATE);
    }, []);

    const contentStr = useMemo(() => {
        if (!inputValid) return '';
        return results.map((r) => `${r.label}: ${r.prefix}${r.value}`).join('\n');
    }, [results, inputValid]);

    const { actions } = useToolActions({
        pageName: 'number-base',
        tabId: 'convert',
        getContent: () => contentStr,
        onClear: handleClear,
        shareDialogOpen: shareOpen,
        setShareDialogOpen: setShareOpen,
        readOnly,
    });

    return (
        <ToolTabWrapper actions={actions}>
            <div className="flex flex-col gap-6 py-4 md:flex-row">
                <div className="min-w-0 w-full md:w-1/2 flex flex-col gap-4">
                    <div className="flex flex-col gap-2">
                        <Label className="text-sm font-medium text-muted-foreground">Input</Label>
                        <div className="flex items-center gap-2">
                            <div className="flex gap-1">
                                {STANDARD_BASES.map((b) => (
                                    <button
                                        key={b.id}
                                        onClick={() => handleRadixChange(b.radix)}
                                        disabled={readOnly}
                                        className={`rounded-md border px-2.5 py-1.5 text-[11px] font-mono font-medium transition-colors ${
                                            state.inputRadix === b.radix
                                                ? 'border-primary/50 bg-primary/10 text-primary'
                                                : 'text-muted-foreground hover:bg-muted/50'
                                        }`}
                                    >
                                        {b.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div className="relative">
                            <Input
                                value={state.inputValue}
                                onChange={(e) => handleInputChange(e.target.value)}
                                placeholder={`Enter a ${STANDARD_BASES.find((b) => b.radix === state.inputRadix)?.label.toLowerCase() ?? ''} number...`}
                                className="h-10 font-mono text-sm pr-10"
                                spellCheck={false}
                                disabled={readOnly}
                            />
                            {hasInput && (
                                <span
                                    className={`absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-mono ${
                                        inputValid ? 'text-green-500' : 'text-destructive'
                                    }`}
                                >
                                    {inputValid ? 'VALID' : 'INVALID'}
                                </span>
                            )}
                        </div>
                    </div>

                    <div className="flex flex-col gap-3 rounded-lg border p-3">
                        <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                            Options
                        </Label>

                        <div className="flex items-center gap-3">
                            <Label className="text-xs text-muted-foreground w-16">Bit Width</Label>
                            <div className="flex gap-1">
                                {BIT_WIDTHS.map((bw) => (
                                    <button
                                        key={bw}
                                        onClick={() => handleBitWidthChange(bw)}
                                        disabled={readOnly}
                                        className={`rounded-md border px-2 py-1 text-[11px] font-mono transition-colors ${
                                            state.bitWidth === bw
                                                ? 'border-primary/50 bg-primary/10 text-primary'
                                                : 'text-muted-foreground hover:bg-muted/50'
                                        }`}
                                    >
                                        {bw}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <Label className="text-xs text-muted-foreground w-16">Signed</Label>
                            <button
                                onClick={handleSignedToggle}
                                disabled={readOnly}
                                className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors ${
                                    state.isSigned ? 'bg-primary' : 'bg-input'
                                }`}
                            >
                                <span
                                    className={`pointer-events-none block h-4 w-4 rounded-full bg-background shadow-lg ring-0 transition-transform ${
                                        state.isSigned ? 'translate-x-4' : 'translate-x-0'
                                    }`}
                                />
                            </button>
                        </div>
                    </div>

                    {bitStr && (
                        <div className="flex flex-col gap-2 rounded-lg border p-3">
                            <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                Bit View ({state.bitWidth}-bit)
                            </Label>
                            <div className="flex items-center gap-2 rounded-md bg-muted/50 px-3 py-2">
                                <code className="flex-1 font-mono text-[11px] break-all select-all">
                                    {bitStr}
                                </code>
                                <Button
                                    variant="ghost"
                                    size="icon-sm"
                                    className="shrink-0"
                                    onClick={() => handleCopy(bitStr.replace(/\s/g, ''), 'bits')}
                                >
                                    {copiedField === 'bits' ? (
                                        <Check className="h-3.5 w-3.5 text-green-500" />
                                    ) : (
                                        <Copy className="h-3.5 w-3.5" />
                                    )}
                                </Button>
                            </div>
                            {asciiChar && (
                                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                    <span className="font-medium">ASCII:</span>
                                    <code className="rounded bg-muted/50 px-1.5 py-0.5 font-mono">
                                        {asciiChar === ' ' ? '(space)' : asciiChar}
                                    </code>
                                    <span className="text-muted-foreground/60">
                                        U+
                                        {asciiChar
                                            .charCodeAt(0)
                                            .toString(16)
                                            .toUpperCase()
                                            .padStart(4, '0')}
                                    </span>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                <div className="min-w-0 w-full md:w-1/2 flex flex-col gap-4">
                    <div className="flex flex-col gap-2">
                        <Label className="text-sm font-medium text-muted-foreground">
                            Conversions
                        </Label>
                        <div className="flex flex-col gap-2">
                            {results.map((r) => (
                                <div
                                    key={r.radix}
                                    className="flex items-center gap-2 rounded-lg border px-3 py-2.5"
                                >
                                    <span className="w-14 shrink-0 text-[11px] font-mono uppercase tracking-wider text-muted-foreground">
                                        {r.label}
                                    </span>
                                    <code className="flex-1 font-mono text-sm select-all break-all">
                                        {r.isValid ? (
                                            <>
                                                {r.prefix && (
                                                    <span className="text-muted-foreground">
                                                        {r.prefix}
                                                    </span>
                                                )}
                                                {r.value}
                                            </>
                                        ) : (
                                            <span className="text-muted-foreground/40">—</span>
                                        )}
                                    </code>
                                    <Button
                                        variant="ghost"
                                        size="icon-sm"
                                        className="shrink-0"
                                        disabled={!r.isValid}
                                        onClick={() =>
                                            handleCopy(`${r.prefix}${r.value}`, `${r.label}`)
                                        }
                                    >
                                        {copiedField === r.label ? (
                                            <Check className="h-3.5 w-3.5 text-green-500" />
                                        ) : (
                                            <Copy className="h-3.5 w-3.5" />
                                        )}
                                    </Button>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="flex flex-col gap-2 rounded-lg border p-3">
                        <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                            Custom Radix (2–36)
                        </Label>
                        <div className="flex items-center gap-2">
                            <Input
                                type="number"
                                min={2}
                                max={36}
                                value={customRadix}
                                onChange={(e) =>
                                    setCustomRadix(
                                        Math.min(36, Math.max(2, Number(e.target.value) || 2)),
                                    )
                                }
                                className="h-8 w-20 font-mono text-xs"
                                disabled={readOnly}
                            />
                            <div className="flex-1 flex items-center gap-2 rounded-md bg-muted/50 px-3 py-2 min-h-[32px]">
                                <code className="flex-1 font-mono text-xs select-all break-all">
                                    {customResult.isValid ? (
                                        customResult.value || (
                                            <span className="text-muted-foreground/40">—</span>
                                        )
                                    ) : (
                                        <span className="text-muted-foreground/40">—</span>
                                    )}
                                </code>
                                <Button
                                    variant="ghost"
                                    size="icon-sm"
                                    className="shrink-0"
                                    disabled={!customResult.isValid}
                                    onClick={() =>
                                        handleCopy(customResult.value, `base-${customRadix}`)
                                    }
                                >
                                    {copiedField === `base-${customRadix}` ? (
                                        <Check className="h-3.5 w-3.5 text-green-500" />
                                    ) : (
                                        <Copy className="h-3.5 w-3.5" />
                                    )}
                                </Button>
                            </div>
                        </div>
                    </div>

                    {!hasInput && (
                        <div className="h-48 flex flex-col items-center justify-center rounded-lg border p-8 text-center">
                            <Binary className="h-10 w-10 text-muted-foreground/40 mb-3" />
                            <p className="text-sm font-medium text-muted-foreground">
                                Enter a number to convert
                            </p>
                            <p className="text-xs text-muted-foreground/60 mt-1">
                                Supports binary, octal, decimal, hex, and custom radix (2–36)
                            </p>
                        </div>
                    )}
                </div>
            </div>
            <ShareSidebarModal
                open={shareOpen}
                onOpenChange={setShareOpen}
                config={{
                    pageName: 'number-base',
                    tabName: 'convert',
                    getState: () => state as unknown as Record<string, unknown>,
                    extraActions: results
                        .filter((r) => r.isValid)
                        .map((r) => ({
                            id: `copy-${r.label.toLowerCase()}`,
                            label: `Copy ${r.label}`,
                            icon: Copy,
                            handler: () => copy(`${r.prefix}${r.value}`),
                        })),
                }}
            />
        </ToolTabWrapper>
    );
}
