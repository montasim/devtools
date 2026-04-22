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
import { Copy, Check, Ruler } from 'lucide-react';
import type { TabComponentProps } from '../../core/types/tool';
import {
    CSS_UNITS,
    GROUP_LABELS,
    DEFAULT_CONFIG,
    type ConverterConfig,
    convertToAll,
} from '../utils/css-unit-operations';

interface CssUnitState {
    value: string;
    unitId: string;
    config: ConverterConfig;
}

const DEFAULT_UNIT_STATE: CssUnitState = {
    value: '16',
    unitId: 'px',
    config: DEFAULT_CONFIG,
};

export default function ConvertTab({ readOnly }: TabComponentProps) {
    const [savedState, setSavedState] = useLocalStorage<CssUnitState>(
        STORAGE_KEYS.CSS_UNIT_STATE,
        DEFAULT_UNIT_STATE,
    );
    const [state, setState] = useState<CssUnitState>(savedState);
    const [shareOpen, setShareOpen] = useState(false);
    const [copiedIdx, setCopiedIdx] = useState<string | null>(null);
    const { copy } = useClipboard();

    useEffect(() => {
        setSavedState(state);
    }, [state, setSavedState]);

    const numericValue = parseFloat(state.value);
    const isValid = !isNaN(numericValue);

    const results = useMemo(() => {
        if (!isValid) return [];
        return convertToAll(numericValue, state.unitId, state.config);
    }, [numericValue, state.unitId, state.config, isValid]);

    const grouped = useMemo(() => {
        const map = new Map<string, typeof results>();
        for (const r of results) {
            const list = map.get(r.unit.group) ?? [];
            list.push(r);
            map.set(r.unit.group, list);
        }
        return map;
    }, [results]);

    const handleCopy = useCallback(
        async (text: string, id: string) => {
            await copy(text);
            setCopiedIdx(id);
            setTimeout(() => setCopiedIdx(null), 1500);
        },
        [copy],
    );

    const handleClear = useCallback(() => {
        setState(DEFAULT_UNIT_STATE);
    }, []);

    const contentStr = useMemo(() => {
        if (!isValid || results.length === 0) return '';
        return results.map((r) => r.formatted).join('\n');
    }, [results, isValid]);

    const { actions } = useToolActions({
        pageName: 'css-unit',
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
                <div className="min-w-0 w-full md:w-[340px] shrink-0 flex flex-col gap-4">
                    <div className="flex flex-col gap-2">
                        <Label className="text-sm font-medium text-muted-foreground">Value</Label>
                        <Input
                            type="text"
                            inputMode="decimal"
                            value={state.value}
                            onChange={(e) =>
                                setState((prev) => ({ ...prev, value: e.target.value }))
                            }
                            placeholder="Enter a value..."
                            className="h-10 font-mono text-sm"
                            spellCheck={false}
                            disabled={readOnly}
                        />
                    </div>

                    <div className="flex flex-col gap-2">
                        <Label className="text-sm font-medium text-muted-foreground">Unit</Label>
                        <div className="flex flex-col gap-3">
                            {[...grouped.entries()].map(([group, items]) => (
                                <div key={group} className="flex flex-col gap-1.5">
                                    <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
                                        {GROUP_LABELS[group] ?? group}
                                    </span>
                                    <div className="flex flex-wrap gap-1">
                                        {items.map(({ unit }) => (
                                            <button
                                                key={unit.id}
                                                onClick={() =>
                                                    setState((prev) => ({
                                                        ...prev,
                                                        unitId: unit.id,
                                                    }))
                                                }
                                                disabled={readOnly}
                                                className={`rounded-md border px-2.5 py-1.5 text-[11px] font-mono font-medium transition-colors ${
                                                    state.unitId === unit.id
                                                        ? 'border-primary/50 bg-primary/10 text-primary'
                                                        : 'text-muted-foreground hover:bg-muted/50'
                                                }`}
                                            >
                                                {unit.shortLabel}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="flex flex-col gap-3 rounded-lg border p-3">
                        <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                            Context
                        </Label>
                        <div className="flex flex-col gap-2.5">
                            <div className="flex items-center gap-2">
                                <Label className="text-xs text-muted-foreground w-32 shrink-0">
                                    Root Font Size
                                </Label>
                                <Input
                                    type="number"
                                    min={1}
                                    value={state.config.rootFontSize}
                                    onChange={(e) =>
                                        setState((prev) => ({
                                            ...prev,
                                            config: {
                                                ...prev.config,
                                                rootFontSize: Number(e.target.value) || 16,
                                            },
                                        }))
                                    }
                                    className="h-7 w-20 font-mono text-xs"
                                    disabled={readOnly}
                                />
                                <span className="text-[11px] text-muted-foreground">px</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Label className="text-xs text-muted-foreground w-32 shrink-0">
                                    Viewport Width
                                </Label>
                                <Input
                                    type="number"
                                    min={1}
                                    value={state.config.viewportWidth}
                                    onChange={(e) =>
                                        setState((prev) => ({
                                            ...prev,
                                            config: {
                                                ...prev.config,
                                                viewportWidth: Number(e.target.value) || 1920,
                                            },
                                        }))
                                    }
                                    className="h-7 w-20 font-mono text-xs"
                                    disabled={readOnly}
                                />
                                <span className="text-[11px] text-muted-foreground">px</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Label className="text-xs text-muted-foreground w-32 shrink-0">
                                    Viewport Height
                                </Label>
                                <Input
                                    type="number"
                                    min={1}
                                    value={state.config.viewportHeight}
                                    onChange={(e) =>
                                        setState((prev) => ({
                                            ...prev,
                                            config: {
                                                ...prev.config,
                                                viewportHeight: Number(e.target.value) || 1080,
                                            },
                                        }))
                                    }
                                    className="h-7 w-20 font-mono text-xs"
                                    disabled={readOnly}
                                />
                                <span className="text-[11px] text-muted-foreground">px</span>
                            </div>
                        </div>
                    </div>

                    {isValid && state.unitId === 'px' && (
                        <div className="flex flex-col gap-2 rounded-lg border p-3">
                            <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                Common Presets
                            </Label>
                            <div className="flex flex-wrap gap-1">
                                {[4, 8, 10, 12, 14, 16, 18, 20, 24, 32, 40, 48, 64, 80, 96].map(
                                    (v) => (
                                        <button
                                            key={v}
                                            onClick={() =>
                                                setState((prev) => ({ ...prev, value: String(v) }))
                                            }
                                            disabled={readOnly}
                                            className={`rounded-md border px-2 py-1 text-[11px] font-mono transition-colors ${
                                                state.value === String(v)
                                                    ? 'border-primary/50 bg-primary/10 text-primary'
                                                    : 'text-muted-foreground hover:bg-muted/50'
                                            }`}
                                        >
                                            {v}px
                                        </button>
                                    ),
                                )}
                            </div>
                        </div>
                    )}
                </div>

                <div className="min-w-0 flex-1 flex flex-col gap-4">
                    {isValid && results.length > 0 ? (
                        <div className="flex flex-col gap-2">
                            <Label className="text-sm font-medium text-muted-foreground">
                                Conversions
                            </Label>
                            <div className="flex flex-col gap-1.5">
                                {results.map((r) => {
                                    const isSource = r.unit.id === state.unitId;
                                    return (
                                        <div
                                            key={r.unit.id}
                                            className={`flex items-center gap-2 rounded-lg border px-3 py-2.5 ${
                                                isSource ? 'border-primary/30 bg-primary/5' : ''
                                            }`}
                                        >
                                            <span className="w-12 shrink-0 text-[11px] font-mono uppercase tracking-wider text-muted-foreground">
                                                {r.unit.shortLabel}
                                            </span>
                                            <code className="flex-1 font-mono text-sm select-all break-all">
                                                {r.formatted}
                                            </code>
                                            <Button
                                                variant="ghost"
                                                size="icon-sm"
                                                className="shrink-0"
                                                onClick={() => handleCopy(r.formatted, r.unit.id)}
                                            >
                                                {copiedIdx === r.unit.id ? (
                                                    <Check className="h-3.5 w-3.5 text-green-500" />
                                                ) : (
                                                    <Copy className="h-3.5 w-3.5" />
                                                )}
                                            </Button>
                                        </div>
                                    );
                                })}
                            </div>

                            {state.unitId !== 'px' && (
                                <div className="mt-2 flex flex-col gap-1.5 rounded-lg border bg-muted/30 p-3">
                                    <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
                                        CSS Snippet
                                    </span>
                                    <code className="text-xs font-mono text-foreground select-all">
                                        {`font-size: ${results.find((r) => r.unit.id === 'rem')?.formatted ?? state.value}${state.unitId};`}
                                    </code>
                                    <code className="text-xs font-mono text-foreground select-all">
                                        {`padding: ${results.find((r) => r.unit.id === 'px')?.formatted ?? state.value};`}
                                    </code>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="h-48 flex flex-col items-center justify-center rounded-lg border p-8 text-center">
                            <Ruler className="h-10 w-10 text-muted-foreground/40 mb-3" />
                            <p className="text-sm font-medium text-muted-foreground">
                                Enter a value to convert
                            </p>
                            <p className="text-xs text-muted-foreground/60 mt-1">
                                Converts between px, rem, em, vw, vh, pt, cm and more
                            </p>
                        </div>
                    )}
                </div>
            </div>
            <ShareSidebarModal
                open={shareOpen}
                onOpenChange={setShareOpen}
                config={{
                    pageName: 'css-unit',
                    tabName: 'convert',
                    getState: () => state as unknown as Record<string, unknown>,
                    extraActions: results.map((r) => ({
                        id: `copy-${r.unit.id}`,
                        label: `Copy ${r.unit.label}`,
                        icon: Copy,
                        handler: () => copy(r.formatted),
                    })),
                }}
            />
        </ToolTabWrapper>
    );
}
