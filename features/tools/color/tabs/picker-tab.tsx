'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { useToolActions } from '../../core/hooks/use-tool-actions';
import { ToolTabWrapper } from '../../core/components/tool-tab-wrapper';
import { ShareSidebarModal } from '../../core/plugins/share-sidebar';
import { STORAGE_KEYS } from '@/lib/utils/constants';
import { useLocalStorage } from '@/lib/hooks/use-local-storage';
import { useClipboard } from '@/lib/hooks/use-clipboard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Copy, Check, Pipette } from 'lucide-react';
import type { TabComponentProps } from '../../core/types/tool';
import {
    type ColorState,
    type RGB,
    type HSL,
    type OKLCH,
    DEFAULT_COLOR,
    colorFromHex,
    colorFromRgb,
    colorFromHsl,
    colorFromOklch,
    isValidHex,
    formatRgb,
    formatHsl,
    formatOklch,
    formatHex,
} from '../utils/color-operations';

function ColorInputRow({
    label,
    value,
    onChange,
    onCopyValue,
    copied,
}: {
    label: string;
    value: string;
    onChange: (val: string) => void;
    onCopyValue: () => void;
    copied: boolean;
}) {
    return (
        <div className="flex items-center gap-2">
            <Label className="w-14 shrink-0 text-xs font-mono uppercase tracking-wider text-muted-foreground">
                {label}
            </Label>
            <Input
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="h-8 flex-1 font-mono text-xs"
                spellCheck={false}
            />
            <Button variant="ghost" size="icon-sm" className="shrink-0" onClick={onCopyValue}>
                {copied ? (
                    <Check className="h-3.5 w-3.5 text-green-500" />
                ) : (
                    <Copy className="h-3.5 w-3.5" />
                )}
            </Button>
        </div>
    );
}

function NumberSlider({
    label,
    value,
    min,
    max,
    step = 1,
    onChange,
    unit = '',
}: {
    label: string;
    value: number;
    min: number;
    max: number;
    step?: number;
    onChange: (val: number) => void;
    unit?: string;
}) {
    return (
        <div className="flex items-center gap-2">
            <Label className="w-5 shrink-0 text-[11px] font-mono uppercase text-muted-foreground">
                {label}
            </Label>
            <input
                type="range"
                min={min}
                max={max}
                step={step}
                value={value}
                onChange={(e) => onChange(Number(e.target.value))}
                className="flex-1 accent-primary h-1.5 cursor-pointer"
            />
            <span className="w-12 text-right text-[11px] font-mono text-muted-foreground">
                {Math.round(value * (step < 1 ? 1000 : 1)) / (step < 1 ? 1000 : 1)}
                {unit}
            </span>
        </div>
    );
}

export default function PickerTab({ readOnly }: TabComponentProps) {
    const [savedColor, setSavedColor] = useLocalStorage<string>(
        STORAGE_KEYS.COLOR_PICKER_HEX,
        DEFAULT_COLOR.hex,
    );
    const [color, setColor] = useState<ColorState>(() =>
        isValidHex(savedColor) ? colorFromHex(savedColor) : DEFAULT_COLOR,
    );
    const [hexInput, setHexInput] = useState(color.hex);
    const [rgbInput, setRgbInput] = useState(formatRgb(color));
    const [hslInput, setHslInput] = useState(formatHsl(color));
    const [oklchInput, setOklchInput] = useState(formatOklch(color));
    const [shareOpen, setShareOpen] = useState(false);
    const [copiedField, setCopiedField] = useState<string | null>(null);
    const { copy } = useClipboard();
    const pickerRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        setSavedColor(color.hex);
    }, [color.hex, setSavedColor]);

    const updateColor = useCallback((newColor: ColorState) => {
        setColor(newColor);
        setHexInput(newColor.hex);
        setRgbInput(formatRgb(newColor));
        setHslInput(formatHsl(newColor));
        setOklchInput(formatOklch(newColor));
    }, []);

    const handleHexChange = useCallback(
        (val: string) => {
            setHexInput(val);
            const cleaned = val.startsWith('#') ? val : `#${val}`;
            if (isValidHex(cleaned)) {
                updateColor(colorFromHex(cleaned));
            }
        },
        [updateColor],
    );

    const handleRgbChange = useCallback(
        (val: string) => {
            setRgbInput(val);
            const match = val.match(
                /rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*([\d.]+))?\s*\)/,
            );
            if (match) {
                const rgb: RGB = {
                    r: Number(match[1]),
                    g: Number(match[2]),
                    b: Number(match[3]),
                };
                const alpha = match[4] ? Number(match[4]) : 1;
                updateColor(colorFromRgb(rgb, alpha));
            }
        },
        [updateColor],
    );

    const handleHslChange = useCallback(
        (val: string) => {
            setHslInput(val);
            const match = val.match(
                /hsla?\(\s*(\d+)\s*,\s*(\d+)%?\s*,\s*(\d+)%?\s*(?:,\s*([\d.]+))?\s*\)/,
            );
            if (match) {
                const hsl: HSL = {
                    h: Number(match[1]),
                    s: Number(match[2]),
                    l: Number(match[3]),
                };
                const alpha = match[4] ? Number(match[4]) : 1;
                updateColor(colorFromHsl(hsl, alpha));
            }
        },
        [updateColor],
    );

    const handleOklchChange = useCallback(
        (val: string) => {
            setOklchInput(val);
            const match = val.match(
                /oklch\(\s*([\d.]+)\s+([\d.]+)\s+([\d.]+)\s*(?:\/\s*([\d.]+))?\s*\)/,
            );
            if (match) {
                const oklch: OKLCH = {
                    l: Number(match[1]),
                    c: Number(match[2]),
                    h: Number(match[3]),
                };
                const alpha = match[4] ? Number(match[4]) : 1;
                updateColor(colorFromOklch(oklch, alpha));
            }
        },
        [updateColor],
    );

    const handleSliderChange = useCallback(
        (channel: string, val: number) => {
            switch (channel) {
                case 'r':
                    updateColor(colorFromRgb({ ...color.rgb, r: val }, color.alpha));
                    break;
                case 'g':
                    updateColor(colorFromRgb({ ...color.rgb, g: val }, color.alpha));
                    break;
                case 'b':
                    updateColor(colorFromRgb({ ...color.rgb, b: val }, color.alpha));
                    break;
                case 'h':
                    updateColor(colorFromHsl({ ...color.hsl, h: val }, color.alpha));
                    break;
                case 's':
                    updateColor(colorFromHsl({ ...color.hsl, s: val }, color.alpha));
                    break;
                case 'l':
                    updateColor(colorFromHsl({ ...color.hsl, l: val }, color.alpha));
                    break;
                case 'a':
                    updateColor(colorFromRgb(color.rgb, val));
                    break;
            }
        },
        [color, updateColor],
    );

    const handleNativePicker = useCallback(
        (hex: string) => {
            if (isValidHex(hex)) {
                updateColor(colorFromHex(hex));
            }
        },
        [updateColor],
    );

    const handleCopy = useCallback(
        async (value: string, field: string) => {
            await copy(value);
            setCopiedField(field);
            setTimeout(() => setCopiedField(null), 1500);
        },
        [copy],
    );

    const handleClear = useCallback(() => {
        updateColor(DEFAULT_COLOR);
    }, [updateColor]);

    const handleEyeDrop = useCallback(async () => {
        if (!('EyeDropper' in window)) return;
        try {
            const eyeDropper = new (
                window as unknown as {
                    EyeDropper: new () => { open: () => Promise<{ sRGBHex: string }> };
                }
            ).EyeDropper();
            const result = await eyeDropper.open();
            updateColor(colorFromHex(result.sRGBHex));
        } catch {
            // user cancelled
        }
    }, [updateColor]);

    const { actions } = useToolActions({
        pageName: 'color',
        tabId: 'picker',
        getContent: () =>
            `${formatHex(color)} | ${formatRgb(color)} | ${formatHsl(color)} | ${formatOklch(color)}`,
        onClear: handleClear,
        shareDialogOpen: shareOpen,
        setShareDialogOpen: setShareOpen,
        readOnly,
    });

    const allFormats = [
        { label: 'HEX', value: formatHex(color) },
        { label: 'RGB', value: formatRgb(color) },
        { label: 'HSL', value: formatHsl(color) },
        { label: 'OKLCH', value: formatOklch(color) },
    ];

    return (
        <ToolTabWrapper
            actions={actions}
            leadingContent={
                <>
                    {'EyeDropper' in window && (
                        <Button
                            variant="outline"
                            size="sm"
                            className="h-7 gap-1.5 text-xs"
                            onClick={handleEyeDrop}
                            disabled={readOnly}
                        >
                            <Pipette className="h-3.5 w-3.5" />
                            Pick
                        </Button>
                    )}
                </>
            }
        >
            <div className="flex flex-col gap-6 py-4 md:flex-row">
                <div className="flex flex-col gap-4 md:w-[450px] lg:w-[550px] shrink-0">
                    <div className="relative">
                        <div
                            className="w-full aspect-square rounded-xl border shadow-inner cursor-crosshair"
                            style={{ backgroundColor: color.hex }}
                            onClick={() => pickerRef.current?.click()}
                        >
                            <input
                                ref={pickerRef}
                                type="color"
                                value={color.hex}
                                onChange={(e) => handleNativePicker(e.target.value)}
                                className="absolute inset-0 opacity-0 cursor-crosshair w-full h-full"
                                disabled={readOnly}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-4 gap-1.5">
                        {allFormats.map(({ label, value }) => (
                            <button
                                key={label}
                                onClick={() => handleCopy(value, label)}
                                className="flex flex-col items-center gap-1 rounded-lg border px-2 py-2 transition-colors hover:bg-muted/50"
                            >
                                <span className="text-[10px] font-mono uppercase text-muted-foreground">
                                    {label}
                                </span>
                                <span className="text-[11px] font-mono truncate w-full text-center">
                                    {copiedField === label ? (
                                        <Check className="h-3.5 w-3.5 mx-auto text-green-500" />
                                    ) : (
                                        value
                                    )}
                                </span>
                            </button>
                        ))}
                    </div>
                </div>

                <div className="flex-1 min-w-0 flex flex-col gap-5">
                    <div className="flex flex-col gap-3">
                        <Label className="text-sm font-medium text-muted-foreground">
                            Color Formats
                        </Label>
                        <div className="flex flex-col gap-2 rounded-lg border p-3">
                            <ColorInputRow
                                label="HEX"
                                value={hexInput}
                                onChange={handleHexChange}
                                onCopyValue={() => handleCopy(formatHex(color), 'hex')}
                                copied={copiedField === 'hex'}
                            />
                            <ColorInputRow
                                label="RGB"
                                value={rgbInput}
                                onChange={handleRgbChange}
                                onCopyValue={() => handleCopy(formatRgb(color), 'rgb-field')}
                                copied={copiedField === 'rgb-field'}
                            />
                            <ColorInputRow
                                label="HSL"
                                value={hslInput}
                                onChange={handleHslChange}
                                onCopyValue={() => handleCopy(formatHsl(color), 'hsl-field')}
                                copied={copiedField === 'hsl-field'}
                            />
                            <ColorInputRow
                                label="OKLCH"
                                value={oklchInput}
                                onChange={handleOklchChange}
                                onCopyValue={() => handleCopy(formatOklch(color), 'oklch-field')}
                                copied={copiedField === 'oklch-field'}
                            />
                        </div>
                    </div>

                    <div className="flex flex-col gap-3">
                        <Label className="text-sm font-medium text-muted-foreground">Sliders</Label>
                        <div className="flex flex-col gap-2.5 rounded-lg border p-3">
                            <NumberSlider
                                label="R"
                                value={color.rgb.r}
                                min={0}
                                max={255}
                                onChange={(v) => handleSliderChange('r', v)}
                            />
                            <NumberSlider
                                label="G"
                                value={color.rgb.g}
                                min={0}
                                max={255}
                                onChange={(v) => handleSliderChange('g', v)}
                            />
                            <NumberSlider
                                label="B"
                                value={color.rgb.b}
                                min={0}
                                max={255}
                                onChange={(v) => handleSliderChange('b', v)}
                            />
                            <div className="my-1 border-t" />
                            <NumberSlider
                                label="H"
                                value={color.hsl.h}
                                min={0}
                                max={360}
                                onChange={(v) => handleSliderChange('h', v)}
                                unit="°"
                            />
                            <NumberSlider
                                label="S"
                                value={color.hsl.s}
                                min={0}
                                max={100}
                                onChange={(v) => handleSliderChange('s', v)}
                                unit="%"
                            />
                            <NumberSlider
                                label="L"
                                value={color.hsl.l}
                                min={0}
                                max={100}
                                onChange={(v) => handleSliderChange('l', v)}
                                unit="%"
                            />
                            <div className="my-1 border-t" />
                            <NumberSlider
                                label="α"
                                value={color.alpha}
                                min={0}
                                max={1}
                                step={0.01}
                                onChange={(v) => handleSliderChange('a', v)}
                            />
                        </div>
                    </div>
                </div>
            </div>
            <ShareSidebarModal
                open={shareOpen}
                onOpenChange={setShareOpen}
                config={{
                    pageName: 'color',
                    tabName: 'picker',
                    getState: () => ({ hex: color.hex }),
                    extraActions: allFormats.map(({ label, value }) => ({
                        id: `copy-${label.toLowerCase()}`,
                        label: `Copy ${label}`,
                        icon: Copy,
                        handler: () => copy(value),
                    })),
                }}
            />
        </ToolTabWrapper>
    );
}
