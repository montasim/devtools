'use client';

import { useState, useCallback, useMemo, useEffect } from 'react';
import { useToolActions } from '../../core/hooks/use-tool-actions';
import { ToolTabWrapper } from '../../core/components/tool-tab-wrapper';
import { ShareSidebarModal } from '../../core/plugins/share-sidebar';
import { STORAGE_KEYS } from '@/lib/utils/constants';
import { useLocalStorage } from '@/lib/hooks/use-local-storage';
import { useClipboard } from '@/lib/hooks/use-clipboard';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Copy, Check, Palette } from 'lucide-react';
import type { TabComponentProps } from '../../core/types/tool';
import {
    type ColorState,
    type PaletteMode,
    DEFAULT_COLOR,
    colorFromHex,
    isValidHex,
    generatePaletteByMode,
    formatHex,
    formatRgb,
    formatHsl,
    formatOklch,
} from '../utils/color-operations';

const PALETTE_MODES: { id: PaletteMode; label: string }[] = [
    { id: 'shades', label: 'Shades' },
    { id: 'analogous', label: 'Analogous' },
    { id: 'complementary', label: 'Complementary' },
    { id: 'triadic', label: 'Triadic' },
    { id: 'split-complementary', label: 'Split Comp.' },
    { id: 'tetradic', label: 'Tetradic' },
];

export default function PaletteTab({ readOnly }: TabComponentProps) {
    const [savedHex, setSavedHex] = useLocalStorage<string>(
        STORAGE_KEYS.COLOR_PALETTE_BASE,
        DEFAULT_COLOR.hex,
    );
    const [savedMode, setSavedMode] = useLocalStorage<PaletteMode>(
        STORAGE_KEYS.COLOR_PALETTE_MODE,
        'shades',
    );
    const [baseHex, setBaseHex] = useState(() =>
        isValidHex(savedHex) ? savedHex : DEFAULT_COLOR.hex,
    );
    const [mode, setMode] = useState<PaletteMode>(savedMode);
    const [copiedIdx, setCopiedIdx] = useState<number | null>(null);
    const [shareOpen, setShareOpen] = useState(false);
    const { copy } = useClipboard();

    const baseColor = useMemo<ColorState>(() => {
        if (!isValidHex(baseHex)) return DEFAULT_COLOR;
        return colorFromHex(baseHex);
    }, [baseHex]);

    useEffect(() => {
        if (isValidHex(baseHex)) setSavedHex(baseHex);
    }, [baseHex, setSavedHex]);

    useEffect(() => {
        setSavedMode(mode);
    }, [mode, setSavedMode]);

    const palette = useMemo(
        () => generatePaletteByMode(baseColor.hsl, mode),
        [baseColor.hsl, mode],
    );

    const handleCopy = useCallback(
        async (color: ColorState, idx: number) => {
            await copy(formatHex(color));
            setCopiedIdx(idx);
            setTimeout(() => setCopiedIdx(null), 1500);
        },
        [copy],
    );

    const handleCopyAll = useCallback(() => {
        const text = palette.map((c) => formatHex(c)).join('\n');
        copy(text, `${palette.length} colors copied`);
    }, [palette, copy]);

    const handleNativePicker = useCallback((hex: string) => {
        if (isValidHex(hex)) setBaseHex(hex);
    }, []);

    const paletteContent = palette
        .map((c) => `${formatHex(c)} | ${formatRgb(c)} | ${formatHsl(c)} | ${formatOklch(c)}`)
        .join('\n');

    const handleClear = useCallback(() => {
        setBaseHex(DEFAULT_COLOR.hex);
        setMode('shades');
    }, []);

    const { actions } = useToolActions({
        pageName: 'color',
        tabId: 'palette',
        getContent: () => paletteContent,
        onClear: handleClear,
        shareDialogOpen: shareOpen,
        setShareDialogOpen: setShareOpen,
        readOnly,
    });

    return (
        <ToolTabWrapper
            actions={actions}
            leadingContent={
                <>
                    <Button
                        variant="outline"
                        size="sm"
                        className="h-7 gap-1.5 text-xs"
                        onClick={handleCopyAll}
                    >
                        <Copy className="h-3.5 w-3.5" />
                        Copy All
                    </Button>
                </>
            }
        >
            <div className="flex flex-col gap-5 py-4">
                <div className="flex flex-col gap-3 md:flex-row md:items-start">
                    <div className="flex flex-col gap-2 shrink-0">
                        <Label className="text-sm font-medium text-muted-foreground">
                            Base Color
                        </Label>
                        <div className="flex items-center gap-2">
                            <div
                                className="relative h-10 w-16 rounded-lg border cursor-crosshair shrink-0"
                                style={{ backgroundColor: baseHex }}
                            >
                                <input
                                    type="color"
                                    value={baseHex}
                                    onChange={(e) => handleNativePicker(e.target.value)}
                                    className="absolute inset-0 opacity-0 cursor-crosshair w-full h-full"
                                    disabled={readOnly}
                                />
                            </div>
                            <input
                                type="text"
                                value={baseHex}
                                onChange={(e) => {
                                    const val = e.target.value;
                                    setBaseHex(val);
                                }}
                                className="h-10 w-28 rounded-lg border border-input bg-transparent px-2.5 font-mono text-sm outline-none focus-visible:border-ring"
                                spellCheck={false}
                                disabled={readOnly}
                            />
                        </div>
                    </div>

                    <div className="flex flex-col gap-2">
                        <Label className="text-sm font-medium text-muted-foreground">
                            Palette Mode
                        </Label>
                        <div className="flex flex-wrap gap-1.5">
                            {PALETTE_MODES.map((m) => (
                                <button
                                    key={m.id}
                                    onClick={() => setMode(m.id)}
                                    disabled={readOnly}
                                    className={`rounded-md border px-3 py-1.5 text-xs font-medium transition-colors ${
                                        mode === m.id
                                            ? 'border-primary/50 bg-primary/10 text-primary'
                                            : 'hover:bg-muted/50 text-muted-foreground'
                                    }`}
                                >
                                    {m.label}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {palette.length > 0 ? (
                    <div className="flex flex-col gap-2">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                Generated Palette
                            </span>
                        </div>

                        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-10">
                            {palette.map((c, i) => (
                                <button
                                    key={`${c.hex}-${i}`}
                                    onClick={() => handleCopy(c, i)}
                                    className="group flex flex-col items-center gap-1.5 rounded-lg border p-2 transition-colors hover:bg-muted/50"
                                >
                                    <div
                                        className="h-12 w-full rounded-md border shadow-sm"
                                        style={{ backgroundColor: c.hex }}
                                    />
                                    <span className="text-[10px] font-mono text-muted-foreground group-hover:text-foreground truncate w-full text-center">
                                        {copiedIdx === i ? (
                                            <Check className="h-3 w-3 mx-auto text-green-500" />
                                        ) : (
                                            c.hex
                                        )}
                                    </span>
                                </button>
                            ))}
                        </div>

                        <div className="mt-3 flex flex-col gap-2 rounded-lg border p-3">
                            <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                Palette Details
                            </Label>
                            <div className="flex flex-col gap-1">
                                {palette.map((c, i) => (
                                    <div
                                        key={`${c.hex}-detail-${i}`}
                                        className="flex items-center gap-2 rounded-md px-2 py-1 hover:bg-muted/50"
                                    >
                                        <div
                                            className="h-5 w-5 shrink-0 rounded border"
                                            style={{ backgroundColor: c.hex }}
                                        />
                                        <span className="text-[11px] font-mono text-muted-foreground w-16">
                                            {c.hex}
                                        </span>
                                        <span className="text-[11px] font-mono text-muted-foreground w-40">
                                            {formatRgb(c)}
                                        </span>
                                        <span className="text-[11px] font-mono text-muted-foreground w-40">
                                            {formatHsl(c)}
                                        </span>
                                        <span className="text-[11px] font-mono text-muted-foreground flex-1">
                                            {formatOklch(c)}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="h-48 flex flex-col items-center justify-center rounded-lg border p-8 text-center">
                        <Palette className="h-10 w-10 text-muted-foreground/40 mb-3" />
                        <p className="text-sm font-medium text-muted-foreground">
                            No palette generated
                        </p>
                        <p className="text-xs text-muted-foreground/60 mt-1">
                            Pick a base color and choose a mode
                        </p>
                    </div>
                )}
            </div>
            <ShareSidebarModal
                open={shareOpen}
                onOpenChange={setShareOpen}
                config={{
                    pageName: 'color',
                    tabName: 'palette',
                    getState: () => ({ baseHex, mode }),
                    extraActions: [
                        {
                            id: 'copy-all',
                            label: 'Copy All Colors',
                            icon: Copy,
                            handler: () => copy(palette.map((c) => formatHex(c)).join('\n')),
                        },
                    ],
                }}
            />
        </ToolTabWrapper>
    );
}
