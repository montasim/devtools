'use client';

import { useState, useCallback, useRef } from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import { useToolActions } from '../../core/hooks/use-tool-actions';
import { ToolTabWrapper } from '../../core/components/tool-tab-wrapper';
import { ShareSidebarModal } from '../../core/plugins/share-sidebar';
import { STORAGE_KEYS } from '@/lib/utils/constants';
import { useLocalStorage } from '@/lib/hooks/use-local-storage';
import { useClipboard } from '@/lib/hooks/use-clipboard';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { QrCode, Download, Copy, Image } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { EmptyEditorPrompt } from '@/components/ui/empty-editor-prompt';
import { EditorPaneHeader } from '../../core/components/editor-pane-header';
import type { TabComponentProps } from '../../core/types/tool';

type ErrorCorrectionLevel = 'L' | 'M' | 'Q' | 'H';

interface QRSettings {
    size: number;
    level: ErrorCorrectionLevel;
    bgColor: string;
    fgColor: string;
    marginSize: number;
}

const DEFAULT_SETTINGS: QRSettings = {
    size: 256,
    level: 'M',
    bgColor: '#FFFFFF',
    fgColor: '#000000',
    marginSize: 2,
};

const ERROR_LEVELS: { value: ErrorCorrectionLevel; label: string }[] = [
    { value: 'L', label: 'Low (7%)' },
    { value: 'M', label: 'Medium (15%)' },
    { value: 'Q', label: 'Quartile (25%)' },
    { value: 'H', label: 'High (30%)' },
];

function ColorPicker({
    label,
    value,
    onChange,
}: {
    label: string;
    value: string;
    onChange: (v: string) => void;
}) {
    return (
        <div className="flex items-center gap-1.5">
            <Label className="text-xs whitespace-nowrap">{label}</Label>
            <input
                type="color"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="h-8 w-16 cursor-pointer"
            />
        </div>
    );
}

export default function CreateTab({ readOnly }: TabComponentProps) {
    const [input, setInput] = useLocalStorage(STORAGE_KEYS.QR_CREATE_INPUT, '');
    const [settings, setSettings] = useLocalStorage<QRSettings>(
        STORAGE_KEYS.QR_CREATE_SETTINGS,
        DEFAULT_SETTINGS,
    );
    const [shareOpen, setShareOpen] = useState(false);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const { copy } = useClipboard();

    const handleClear = useCallback(() => {
        setInput('');
    }, [setInput]);

    const patch = useCallback(
        (partial: Partial<QRSettings>) => {
            setSettings((prev) => ({ ...prev, ...partial }));
        },
        [setSettings],
    );

    const { actions } = useToolActions({
        pageName: 'qrcode',
        tabId: 'create',
        getContent: () => input,
        onClear: handleClear,
        shareDialogOpen: shareOpen,
        setShareDialogOpen: setShareOpen,
        readOnly,
    });

    const handleDownload = useCallback(() => {
        const src = canvasRef.current;
        if (!src) return;
        const out = document.createElement('canvas');
        out.width = src.width;
        out.height = src.height;
        const ctx = out.getContext('2d');
        if (!ctx) return;
        ctx.fillStyle = settings.bgColor;
        ctx.fillRect(0, 0, out.width, out.height);
        ctx.drawImage(src, 0, 0);
        const a = document.createElement('a');
        a.download = 'qrcode.png';
        a.href = out.toDataURL('image/png');
        a.click();
    }, [settings.bgColor]);

    return (
        <ToolTabWrapper
            actions={actions}
            leadingContent={
                <>
                    <div className="flex items-center gap-1.5">
                        <Label className="text-xs whitespace-nowrap">Size</Label>
                        <Input
                            type="number"
                            min={64}
                            max={1024}
                            value={settings.size}
                            onChange={(e) => patch({ size: Number(e.target.value) || 256 })}
                            className="h-7 w-16 text-xs"
                        />
                    </div>
                    <div className="flex items-center gap-1.5">
                        <Label className="text-xs whitespace-nowrap">Correction</Label>
                        <Select
                            value={settings.level}
                            onValueChange={(v) => patch({ level: v as ErrorCorrectionLevel })}
                        >
                            <SelectTrigger className="h-7 w-auto text-xs" size="sm">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {ERROR_LEVELS.map((l) => (
                                    <SelectItem key={l.value} value={l.value}>
                                        {l.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <ColorPicker
                        label="FG"
                        value={settings.fgColor}
                        onChange={(v) => patch({ fgColor: v })}
                    />
                    <ColorPicker
                        label="BG"
                        value={settings.bgColor}
                        onChange={(v) => patch({ bgColor: v })}
                    />
                    <div className="flex items-center gap-1.5">
                        <Label className="text-xs whitespace-nowrap">Margin</Label>
                        <Input
                            type="number"
                            min={0}
                            max={10}
                            value={settings.marginSize}
                            onChange={(e) => patch({ marginSize: Number(e.target.value) || 0 })}
                            className="h-7 w-14 text-xs"
                        />
                    </div>
                </>
            }
        >
            <div className="flex flex-col gap-4 md:flex-row">
                <div className="min-w-0 w-full md:w-1/2">
                    <div className="flex flex-col gap-2">
                        <EditorPaneHeader
                            label="Content to Encode"
                            content={input}
                            onContentChange={setInput}
                            onClear={handleClear}
                        />
                        {input ? (
                            <Textarea
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                placeholder="Enter text, URL, email, phone number..."
                                className="min-h-[250px] resize-none font-mono text-sm md:min-h-[400px] lg:min-h-[500px]"
                                readOnly={readOnly}
                            />
                        ) : (
                            <div className="relative min-h-[250px] rounded-lg border md:min-h-[400px] lg:min-h-[500px]">
                                <EmptyEditorPrompt
                                    icon={QrCode}
                                    title="Enter content"
                                    description="Type or paste text, a URL, or any data to generate a QR code"
                                    showActions={false}
                                    overlay
                                />
                                <textarea
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    placeholder="Enter text, URL, email, phone number..."
                                    className="absolute inset-0 h-full w-full resize-none bg-transparent p-4 font-mono text-sm opacity-0 focus:opacity-100"
                                    readOnly={readOnly}
                                />
                            </div>
                        )}
                    </div>
                </div>
                <div className="min-w-0 w-full md:w-1/2">
                    <div className="flex flex-col gap-2">
                        <EditorPaneHeader
                            label="QR Code Preview"
                            content={input}
                            hideInputActions
                            actions={
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button
                                            variant="outline"
                                            size="icon"
                                            className="h-7 w-7"
                                            onClick={handleDownload}
                                            disabled={!input.trim()}
                                        >
                                            <Download className="h-3.5 w-3.5" />
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>Download PNG</TooltipContent>
                                </Tooltip>
                            }
                        />
                        {input.trim() ? (
                            <div className="flex items-center justify-center rounded-lg border p-6 min-h-[250px] md:min-h-[400px] lg:min-h-[500px]">
                                <QRCodeCanvas
                                    ref={canvasRef}
                                    value={input}
                                    size={settings.size}
                                    level={settings.level}
                                    bgColor={settings.bgColor}
                                    fgColor={settings.fgColor}
                                    marginSize={settings.marginSize}
                                />
                            </div>
                        ) : (
                            <div className="relative min-h-[250px] rounded-lg border md:min-h-[400px] lg:min-h-[500px]">
                                <EmptyEditorPrompt
                                    icon={Image}
                                    title="QR code preview"
                                    description="Enter content on the left to generate a QR code"
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
                    pageName: 'qrcode',
                    tabName: 'create',
                    getState: () => ({ input, settings }),
                    extraActions: input
                        ? [
                              {
                                  id: 'copy-text',
                                  label: 'Copy Text',
                                  icon: Copy,
                                  handler: () => copy(input),
                              },
                          ]
                        : [],
                }}
            />
        </ToolTabWrapper>
    );
}
