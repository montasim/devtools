'use client';

import { ToolContentSkeleton } from '@/app/(tools)/loading';
import { useState, useMemo, useEffect } from 'react';
import { useToolState } from '../../core/hooks/use-tool-state';
import { useToolActions } from '../../core/hooks/use-tool-actions';
import { ToolTabWrapper } from '../../core/components/tool-tab-wrapper';
import { EditorPaneHeader } from '../../core/components/editor-pane-header';
import { ShareSidebarModal } from '../../core/plugins/share-sidebar';
import {
    optimizeSVG,
    DEFAULT_OPTIMIZER_OPTIONS,
    type SVGOptimizerOptions,
} from '../utils/optimizer';
import { TextEditor } from '../../text/components/text-editor';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from '@/components/ui/sheet';
import {
    FileCode,
    Settings,
    Copy,
    Sliders,
    Layers,
    RefreshCw,
    SlidersHorizontal,
    ShieldAlert,
} from 'lucide-react';
import { useClipboard } from '@/lib/hooks/use-clipboard';
import type { TabComponentProps } from '../../core/types/tool';

export default function OptimizerTab({ sharedData, readOnly }: TabComponentProps) {
    const { content, setContent, isReady } = useToolState({
        storageKey: 'svg-optimizer-input-content',
        sharedData,
        tabId: 'optimizer',
        readOnly,
    });

    const [options, setOptions] = useState<SVGOptimizerOptions>(() => {
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem('svg-optimizer-settings');
            if (saved) {
                try {
                    return JSON.parse(saved);
                } catch {
                    /* fallback */
                }
            }
        }
        return DEFAULT_OPTIMIZER_OPTIONS;
    });

    useEffect(() => {
        if (typeof window !== 'undefined') {
            localStorage.setItem('svg-optimizer-settings', JSON.stringify(options));
        }
    }, [options]);

    const [shareOpen, setShareOpen] = useState(false);
    const { copy } = useClipboard();

    const { output, error, originalSize, optimizedSize, percentSaved } = useMemo(() => {
        if (!content.trim()) {
            return { output: '', error: null, originalSize: 0, optimizedSize: 0, percentSaved: 0 };
        }
        try {
            const result = optimizeSVG(content, options);
            const orig = new Blob([content]).size;
            const opt = new Blob([result]).size;
            const saved = orig > 0 ? ((orig - opt) / orig) * 100 : 0;
            return {
                output: result,
                error: null,
                originalSize: orig,
                optimizedSize: opt,
                percentSaved: Math.max(0, saved),
            };
        } catch (e) {
            return {
                output: '',
                error: e instanceof Error ? e.message : String(e),
                originalSize: 0,
                optimizedSize: 0,
                percentSaved: 0,
            };
        }
    }, [content, options]);

    const formatBytes = (bytes: number) => {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    const resetSettings = () => setOptions(DEFAULT_OPTIMIZER_OPTIONS);

    const { actions } = useToolActions({
        pageName: 'svg',
        tabId: 'optimizer',
        getContent: () => content,
        onClear: () => setContent(''),
        shareDialogOpen: shareOpen,
        setShareDialogOpen: setShareOpen,
        readOnly,
    });

    if (!isReady) return <ToolContentSkeleton />;

    const settingsCount = [
        options.removeXmlInstruction,
        options.removeDocType,
        options.removeComments,
        options.removeMetadata,
        options.removeEditorData,
        options.removeEmptyContainers,
        options.precision !== -1,
    ].filter(Boolean).length;

    const leadingSettingsTrigger = (
        <Sheet>
            <SheetTrigger asChild>
                <button
                    type="button"
                    className="flex items-center gap-1.5 rounded-lg border border-input px-3 py-1.5 text-xs font-semibold hover:bg-muted text-muted-foreground hover:text-foreground transition-all cursor-pointer shadow-xs bg-card"
                >
                    <SlidersHorizontal className="h-3.5 w-3.5 text-primary" />
                    Configure Rules
                    <span className="ml-1 rounded-full bg-primary/10 px-1.5 py-0.2 text-[10px] font-bold text-primary">
                        {settingsCount} active
                    </span>
                </button>
            </SheetTrigger>
            <SheetContent className="w-80 sm:w-96 flex flex-col h-full p-0">
                <SheetHeader className="px-6 py-4 border-b">
                    <div className="flex items-center justify-between mt-2">
                        <SheetTitle className="text-sm font-bold uppercase tracking-wider flex items-center gap-2">
                            <Settings className="h-4 w-4 text-primary" />
                            Optimization rules
                        </SheetTitle>
                        <button
                            type="button"
                            onClick={resetSettings}
                            className="text-[10px] text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors"
                        >
                            <RefreshCw className="h-2.5 w-2.5" />
                            Reset Defaults
                        </button>
                    </div>
                    <SheetDescription className="text-xs text-muted-foreground mt-1">
                        Granularly select which parameters to strip and clean
                    </SheetDescription>
                </SheetHeader>

                <div className="flex-1 overflow-y-auto px-6 py-4 flex flex-col gap-5">
                    <div className="flex flex-col gap-2">
                        <div className="flex items-center justify-between">
                            <Label className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                                <Sliders className="h-3.5 w-3.5 text-muted-foreground/80" />
                                Decimal Precision
                            </Label>
                            <span className="text-xs font-mono font-bold text-foreground bg-muted px-2 py-0.5 rounded border shadow-xs">
                                {options.precision === -1 ? 'Off' : `${options.precision} places`}
                            </span>
                        </div>
                        <input
                            type="range"
                            min="-1"
                            max="6"
                            value={options.precision}
                            onChange={(e) =>
                                setOptions((prev) => ({
                                    ...prev,
                                    precision: parseInt(e.target.value),
                                }))
                            }
                            className="w-full h-1.5 bg-muted rounded-lg appearance-none cursor-pointer accent-primary mt-1"
                        />
                        <span className="text-[10px] text-muted-foreground leading-normal">
                            Round path points and sizes to reduce decimals.
                        </span>
                    </div>

                    <Separator />

                    <div className="flex flex-col gap-4">
                        <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                            <Layers className="h-3.5 w-3.5 text-muted-foreground/80" />
                            Code Cleanup
                        </span>

                        {[
                            {
                                id: 'remove-xml',
                                label: 'XML Instruction',
                                desc: 'Remove `<?xml ...?>` header',
                                key: 'removeXmlInstruction' as const,
                            },
                            {
                                id: 'remove-doctype',
                                label: 'DOCTYPE Tag',
                                desc: 'Remove document declarations',
                                key: 'removeDocType' as const,
                            },
                            {
                                id: 'remove-comments',
                                label: 'XML Comments',
                                desc: 'Remove descriptions & comments',
                                key: 'removeComments' as const,
                            },
                            {
                                id: 'remove-metadata',
                                label: 'Metadata Blocks',
                                desc: 'Remove editor metadata or licensing',
                                key: 'removeMetadata' as const,
                            },
                            {
                                id: 'remove-editor',
                                label: 'Editor Data',
                                desc: 'Remove Illustrator/Inkscape namespaces',
                                key: 'removeEditorData' as const,
                            },
                            {
                                id: 'remove-empty',
                                label: 'Empty Containers',
                                desc: 'Remove empty tags like `<g>`',
                                key: 'removeEmptyContainers' as const,
                            },
                        ].map(({ id, label, desc, key }) => (
                            <div key={id} className="flex items-center justify-between gap-4">
                                <div className="flex flex-col gap-0.5">
                                    <Label
                                        htmlFor={id}
                                        className="text-xs text-foreground font-semibold"
                                    >
                                        {label}
                                    </Label>
                                    <span className="text-[10px] text-muted-foreground">
                                        {desc}
                                    </span>
                                </div>
                                <Switch
                                    id={id}
                                    checked={options[key]}
                                    onCheckedChange={(checked) =>
                                        setOptions((prev) => ({ ...prev, [key]: checked }))
                                    }
                                />
                            </div>
                        ))}
                    </div>

                    <Separator />

                    <div className="flex flex-col gap-2">
                        <Label className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                            <FileCode className="h-3.5 w-3.5 text-muted-foreground/80" />
                            Output formatting
                        </Label>
                        <div className="flex gap-1 bg-muted p-0.5 rounded-lg border mt-1.5">
                            <button
                                type="button"
                                onClick={() => setOptions((prev) => ({ ...prev, beautify: false }))}
                                className={`flex-1 text-center py-1.5 text-xs font-bold rounded-md transition-all ${!options.beautify ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
                            >
                                Minified
                            </button>
                            <button
                                type="button"
                                onClick={() => setOptions((prev) => ({ ...prev, beautify: true }))}
                                className={`flex-1 text-center py-1.5 text-xs font-bold rounded-md transition-all ${options.beautify ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
                            >
                                Beautified
                            </button>
                        </div>
                    </div>
                </div>
            </SheetContent>
        </Sheet>
    );

    return (
        <ToolTabWrapper actions={actions} leadingContent={leadingSettingsTrigger}>
            <div className="flex flex-col gap-5 lg:flex-row py-4 items-stretch">
                {/* Source SVG */}
                <div className="min-w-0 w-full lg:w-1/2 flex flex-col gap-2">
                    <EditorPaneHeader
                        label="Source SVG"
                        content={content}
                        onContentChange={setContent}
                        onClear={() => setContent('')}
                        accept=".svg"
                        hideInputActions={readOnly}
                    />
                    <TextEditor
                        value={content}
                        onChange={setContent}
                        readOnly={readOnly}
                        emptyIcon={FileCode}
                        emptyTitle="Load SVG markup"
                        emptyDescription="Paste your SVG code, drag & drop a file, or fetch from a URL to begin optimizing"
                    />
                </div>

                {/* Optimized Output */}
                <div className="min-w-0 w-full lg:w-1/2 flex flex-col gap-2">
                    <EditorPaneHeader
                        label="Optimized SVG"
                        content={error ? '' : output}
                        onContentChange={() => {}}
                        downloadFilename="optimized.svg"
                        hideInputActions
                    />

                    {error ? (
                        <div className="flex-1 flex flex-col items-center justify-center gap-2 p-6 text-center border rounded-xl bg-card/60">
                            <ShieldAlert className="h-9 w-9 text-destructive animate-bounce" />
                            <p className="text-xs font-semibold text-destructive">
                                Invalid XML / SVG
                            </p>
                            <p className="text-[10px] text-muted-foreground/80 leading-normal line-clamp-4">
                                {error}
                            </p>
                        </div>
                    ) : (
                        <TextEditor
                            value={output}
                            onChange={() => {}}
                            readOnly
                            emptyIcon={FileCode}
                            emptyTitle="Optimized markup"
                            emptyDescription="Ready-to-use compressed code will appear here"
                            showEmptyPrompt
                        />
                    )}

                    {output && !error && (
                        <div className="grid grid-cols-3 gap-1.5 border rounded-xl p-2.5 bg-muted/20 text-center">
                            <div className="flex flex-col">
                                <span className="text-[9px] text-muted-foreground uppercase font-bold tracking-wider">
                                    Original
                                </span>
                                <span className="text-xs font-mono font-semibold text-foreground">
                                    {formatBytes(originalSize)}
                                </span>
                            </div>
                            <div className="flex flex-col border-x">
                                <span className="text-[9px] text-muted-foreground uppercase font-bold tracking-wider">
                                    Optimized
                                </span>
                                <span className="text-xs font-mono font-semibold text-foreground">
                                    {formatBytes(optimizedSize)}
                                </span>
                            </div>
                            <div className="flex flex-col">
                                <span className="text-[9px] text-muted-foreground uppercase font-bold tracking-wider">
                                    Saved
                                </span>
                                <span className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400">
                                    -{percentSaved.toFixed(1)}%
                                </span>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <ShareSidebarModal
                open={shareOpen}
                onOpenChange={setShareOpen}
                config={{
                    pageName: 'svg',
                    tabName: 'optimizer',
                    getState: () => ({ content }),
                    extraActions:
                        output && !error
                            ? [
                                  {
                                      id: 'copy-optimized',
                                      label: 'Copy Optimized SVG',
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
