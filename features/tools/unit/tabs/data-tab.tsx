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
import { Copy, Check, HardDrive } from 'lucide-react';
import type { TabComponentProps } from '../../core/types/tool';
import {
    BINARY_UNITS,
    DECIMAL_UNITS,
    type UnitSystem,
    convertToAllDataSizes,
} from '../utils/unit-operations';

interface DataSizeState {
    value: string;
    unitId: string;
    system: UnitSystem;
}

const DEFAULT_DATA_STATE: DataSizeState = {
    value: '1',
    unitId: 'gb',
    system: 'decimal',
};

export default function DataTab({ readOnly }: TabComponentProps) {
    const [savedState, setSavedState] = useLocalStorage<DataSizeState>(
        STORAGE_KEYS.UNIT_DATA_STATE,
        DEFAULT_DATA_STATE,
    );
    const [state, setState] = useState<DataSizeState>(savedState);
    const [shareOpen, setShareOpen] = useState(false);
    const [copiedIdx, setCopiedIdx] = useState<string | null>(null);
    const { copy } = useClipboard();

    useEffect(() => {
        setSavedState(state);
    }, [state, setSavedState]);

    const units = state.system === 'binary' ? BINARY_UNITS : DECIMAL_UNITS;
    const numericValue = parseFloat(state.value);
    const isValid = !isNaN(numericValue);

    const results = useMemo(() => {
        if (!isValid) return [];
        return convertToAllDataSizes(numericValue, state.unitId, state.system);
    }, [numericValue, state.unitId, state.system, isValid]);

    const handleCopy = useCallback(
        async (text: string, id: string) => {
            await copy(text);
            setCopiedIdx(id);
            setTimeout(() => setCopiedIdx(null), 1500);
        },
        [copy],
    );

    const handleClear = useCallback(() => {
        setState(DEFAULT_DATA_STATE);
    }, []);

    const contentStr = useMemo(() => {
        if (!isValid || results.length === 0) return '';
        return results.map((r) => `${r.formatted} ${r.unit.shortLabel}`).join('\n');
    }, [results, isValid]);

    const { actions } = useToolActions({
        pageName: 'unit',
        tabId: 'data',
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
                            placeholder="Enter a number..."
                            className="h-10 font-mono text-sm"
                            spellCheck={false}
                            disabled={readOnly}
                        />
                    </div>

                    <div className="flex flex-col gap-2">
                        <Label className="text-sm font-medium text-muted-foreground">Unit</Label>
                        <div className="grid grid-cols-4 gap-1.5">
                            {units.map((u) => (
                                <button
                                    key={u.id}
                                    onClick={() => setState((prev) => ({ ...prev, unitId: u.id }))}
                                    disabled={readOnly}
                                    className={`rounded-md border px-2 py-1.5 text-[11px] font-mono font-medium transition-colors ${
                                        state.unitId === u.id
                                            ? 'border-primary/50 bg-primary/10 text-primary'
                                            : 'text-muted-foreground hover:bg-muted/50'
                                    }`}
                                >
                                    {u.shortLabel}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="flex flex-col gap-2 rounded-lg border p-3">
                        <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                            System
                        </Label>
                        <div className="flex gap-1">
                            {(['decimal', 'binary'] as UnitSystem[]).map((sys) => (
                                <button
                                    key={sys}
                                    onClick={() => setState((prev) => ({ ...prev, system: sys }))}
                                    disabled={readOnly}
                                    className={`rounded-md border px-3 py-1.5 text-xs font-medium transition-colors flex-1 ${
                                        state.system === sys
                                            ? 'border-primary/50 bg-primary/10 text-primary'
                                            : 'text-muted-foreground hover:bg-muted/50'
                                    }`}
                                >
                                    {sys === 'decimal' ? 'Decimal (KB, MB…)' : 'Binary (KiB, MiB…)'}
                                </button>
                            ))}
                        </div>
                    </div>
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
                                            <span className="w-20 shrink-0 text-[11px] font-mono uppercase tracking-wider text-muted-foreground">
                                                {r.unit.shortLabel}
                                            </span>
                                            <code className="flex-1 font-mono text-sm select-all break-all">
                                                {r.formatted}
                                            </code>
                                            <Button
                                                variant="ghost"
                                                size="icon-sm"
                                                className="shrink-0"
                                                onClick={() =>
                                                    handleCopy(
                                                        `${r.formatted} ${r.unit.shortLabel}`,
                                                        r.unit.id,
                                                    )
                                                }
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
                        </div>
                    ) : (
                        <div className="h-48 flex flex-col items-center justify-center rounded-lg border p-8 text-center">
                            <HardDrive className="h-10 w-10 text-muted-foreground/40 mb-3" />
                            <p className="text-sm font-medium text-muted-foreground">
                                Enter a value to convert
                            </p>
                            <p className="text-xs text-muted-foreground/60 mt-1">
                                Converts between bytes, KB, MB, GB, TB and more
                            </p>
                        </div>
                    )}
                </div>
            </div>
            <ShareSidebarModal
                open={shareOpen}
                onOpenChange={setShareOpen}
                config={{
                    pageName: 'unit',
                    tabName: 'data',
                    getState: () => state as unknown as Record<string, unknown>,
                    extraActions: results.map((r) => ({
                        id: `copy-${r.unit.id}`,
                        label: `Copy ${r.unit.label}`,
                        icon: Copy,
                        handler: () => copy(`${r.formatted} ${r.unit.shortLabel}`),
                    })),
                }}
            />
        </ToolTabWrapper>
    );
}
