'use client';

import { ToolContentSkeleton } from '@/app/(tools)/loading';
import { useState, useMemo } from 'react';
import { useToolState } from '../../core/hooks/use-tool-state';
import { useToolActions } from '../../core/hooks/use-tool-actions';
import { ToolTabWrapper } from '../../core/components/tool-tab-wrapper';
import { EditorPaneHeader } from '../../core/components/editor-pane-header';
import { ShareSidebarModal } from '../../core/plugins/share-sidebar';
import { TextEditor } from '../../text/components/text-editor';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useTheme } from 'next-themes';
import { FileCode, Eye, ZoomIn, ZoomOut, ShieldAlert } from 'lucide-react';
import type { TabComponentProps } from '../../core/types/tool';

export default function PreviewerTab({ sharedData, readOnly }: TabComponentProps) {
    const { content, setContent, isReady } = useToolState({
        storageKey: 'svg-optimizer-input-content',
        sharedData,
        tabId: 'previewer',
        readOnly,
    });

    const { theme } = useTheme();
    const isDark = theme === 'dark';

    const [bgMode, setBgMode] = useState<'grid' | 'dark' | 'light'>('grid');
    const [zoom, setZoom] = useState<number>(100);
    const [showOutline, setShowOutline] = useState<boolean>(true);
    const [shareOpen, setShareOpen] = useState(false);

    const parseError = useMemo(() => {
        if (!content.trim()) return null;
        try {
            const parser = new DOMParser();
            const doc = parser.parseFromString(content, 'image/svg+xml');
            const err = doc.querySelector('parsererror');
            return err ? err.textContent || 'Invalid SVG' : null;
        } catch (e) {
            return e instanceof Error ? e.message : String(e);
        }
    }, [content]);

    const svgContent = !content.trim() || parseError ? '' : content;

    const handleZoomIn = () => setZoom((prev) => Math.min(800, prev + 25));
    const handleZoomOut = () => setZoom((prev) => Math.max(25, prev - 25));
    const handleZoomReset = () => setZoom(100);

    const { actions } = useToolActions({
        pageName: 'svg',
        tabId: 'previewer',
        getContent: () => content,
        onClear: () => setContent(''),
        shareDialogOpen: shareOpen,
        setShareDialogOpen: setShareOpen,
        readOnly,
    });

    if (!isReady) return <ToolContentSkeleton />;

    return (
        <ToolTabWrapper actions={actions}>
            <div className="flex flex-col gap-5 lg:flex-row py-4 items-stretch">
                {/* Source SVG Input */}
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
                        emptyDescription="Paste your SVG code, drag & drop a file, or fetch from a URL to preview"
                    />
                </div>

                {/* Preview Viewport */}
                <div className="min-w-0 w-full lg:w-1/2 flex flex-col gap-2">
                    {/* Controls */}
                    <div className="flex items-center justify-between flex-wrap gap-2 mt-2">
                        <div className="flex items-center gap-1">
                            <button
                                type="button"
                                onClick={handleZoomOut}
                                className="h-7 w-7 rounded border bg-card flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted"
                                title="Zoom Out"
                            >
                                <ZoomOut className="h-3.5 w-3.5" />
                            </button>
                            <span className="text-[10px] font-mono px-2 text-foreground font-semibold min-w-10 text-center select-none">
                                {zoom}%
                            </span>
                            <button
                                type="button"
                                onClick={handleZoomIn}
                                className="h-7 w-7 rounded border bg-card flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted"
                                title="Zoom In"
                            >
                                <ZoomIn className="h-3.5 w-3.5" />
                            </button>
                            <button
                                type="button"
                                onClick={handleZoomReset}
                                className="h-7 px-2 text-[10px] rounded border bg-card flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted font-medium"
                            >
                                100%
                            </button>
                        </div>

                        <div className="flex items-center gap-2">
                            <div className="flex items-center gap-1.5 mr-1">
                                <Switch
                                    id="preview-outline-toggle"
                                    checked={showOutline}
                                    onCheckedChange={setShowOutline}
                                    className="scale-95"
                                />
                                <Label
                                    htmlFor="preview-outline-toggle"
                                    className="text-[9px] text-muted-foreground uppercase tracking-widest font-semibold cursor-pointer"
                                >
                                    Outline
                                </Label>
                            </div>
                            <div className="flex gap-0.5 bg-muted p-0.5 rounded border">
                                {(['grid', 'light', 'dark'] as const).map((mode) => (
                                    <button
                                        key={mode}
                                        type="button"
                                        onClick={() => setBgMode(mode)}
                                        className={`px-2 py-0.5 text-[9px] uppercase font-bold rounded transition-all ${bgMode === mode ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
                                    >
                                        {mode}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Viewport Frame */}
                    <div
                        className={`relative flex-1 flex items-center justify-center border rounded-xl overflow-hidden min-h-[350px] md:min-h-[400px] lg:min-h-[500px] shadow-inner select-none transition-all ${
                            bgMode === 'light'
                                ? 'bg-[#ffffff]'
                                : bgMode === 'dark'
                                  ? 'bg-[#09090b]'
                                  : ''
                        }`}
                        style={
                            bgMode === 'grid'
                                ? {
                                      backgroundImage: isDark
                                          ? `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 16 16'%3E%3Crect width='8' height='8' fill='%23222225'/%3E%3Crect x='8' y='8' width='8' height='8' fill='%23222225'/%3E%3Crect x='8' width='8' height='8' fill='%23141416'/%3E%3Crect y='8' width='8' height='8' fill='%23141416'/%3E%3C/svg%3E")`
                                          : `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 16 16'%3E%3Crect width='8' height='8' fill='%23e5e5e5'/%3E%3Crect x='8' y='8' width='8' height='8' fill='%23e5e5e5'/%3E%3Crect x='8' width='8' height='8' fill='%23f9f9fb'/%3E%3Crect y='8' width='8' height='8' fill='%23f9f9fb'/%3E%3C/svg%3E")`,
                                  }
                                : undefined
                        }
                    >
                        {parseError ? (
                            <div className="flex flex-col items-center gap-2 p-6 max-w-xs text-center bg-card/60 backdrop-blur-xs border rounded-xl shadow-xs">
                                <ShieldAlert className="h-9 w-9 text-destructive animate-bounce" />
                                <p className="text-xs font-semibold text-destructive">
                                    Invalid XML / SVG
                                </p>
                                <p className="text-[10px] text-muted-foreground/80 leading-normal line-clamp-4">
                                    {parseError}
                                </p>
                            </div>
                        ) : svgContent ? (
                            <div
                                className={`w-full h-full transition-transform duration-75 [&>svg]:w-full [&>svg]:h-full [&>svg]:max-w-full [&>svg]:max-h-full ${
                                    showOutline
                                        ? '[&>svg]:outline [&>svg]:outline-dashed [&>svg]:outline-1 [&>svg]:outline-primary/45 [&>svg]:rounded [&>svg]:shadow-xs'
                                        : ''
                                }`}
                                style={{ transform: `scale(${zoom / 100})` }}
                                dangerouslySetInnerHTML={{ __html: svgContent }}
                            />
                        ) : (
                            <div className="flex flex-col items-center justify-center text-center p-6 text-muted-foreground">
                                <Eye className="h-9 w-9 text-muted-foreground/20 mb-2" />
                                <p className="text-xs font-semibold">SVG Viewport</p>
                                <p className="text-[10px] text-muted-foreground/50 mt-1 max-w-[180px]">
                                    Paste SVG code on the left to inspect vectors
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <ShareSidebarModal
                open={shareOpen}
                onOpenChange={setShareOpen}
                config={{
                    pageName: 'svg',
                    tabName: 'previewer',
                    getState: () => ({ content }),
                }}
            />
        </ToolTabWrapper>
    );
}
