'use client';

import { ToolContentSkeleton } from '@/app/(tools)/loading';
import { useState, useEffect } from 'react';
import { useToolState } from '../../core/hooks/use-tool-state';
import { useToolActions } from '../../core/hooks/use-tool-actions';
import { ToolTabWrapper } from '../../core/components/tool-tab-wrapper';
import { EditorPaneHeader } from '../../core/components/editor-pane-header';
import { ShareSidebarModal } from '../../core/plugins/share-sidebar';
import { STORAGE_KEYS } from '@/lib/utils/constants';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Play, RotateCcw, Monitor, Copy } from '@/components/icons';
import CodeMirror from '@uiw/react-codemirror';
import { html } from '@codemirror/lang-html';
import { css } from '@codemirror/lang-css';
import { javascript } from '@codemirror/lang-javascript';
import { useTheme } from 'next-themes';
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable';
import { useClipboard } from '@/lib/hooks/use-clipboard';
import type { TabComponentProps } from '../../core/types/tool';

const DEFAULT_HTML = `<div class="card">
  <h1>Hello Web!</h1>
  <p>Edit HTML, CSS, and JS to see changes live.</p>
  <button id="clickBtn">Interactive Test</button>
  <div id="counter" class="counter">Clicks: 0</div>
</div>`;

const DEFAULT_CSS = `body {
  font-family: system-ui, -apple-system, sans-serif;
  margin: 0;
  padding: 2rem;
  background: #0f172a;
  color: #f8fafc;
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  box-sizing: border-box;
}

.card {
  background: #1e293b;
  border: 1px solid #334155;
  padding: 2.5rem;
  border-radius: 16px;
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.3);
  text-align: center;
}

h1 {
  background: linear-gradient(135deg, #38bdf8 0%, #818cf8 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  margin: 0 0 1rem;
}

button {
  background: #2563eb;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  transition: transform 0.1s;
}

button:active {
  transform: scale(0.95);
}

.counter {
  margin-top: 1rem;
  color: #38bdf8;
  font-weight: 500;
}`;

const DEFAULT_JS = `let count = 0;
const btn = document.getElementById('clickBtn');
const counter = document.getElementById('counter');

if (btn && counter) {
  btn.addEventListener('click', () => {
    count++;
    counter.textContent = 'Clicks: ' + count;
  });
}`;

export default function EditorTab({ sharedData, readOnly }: TabComponentProps) {
    let parsedSharedData: { html?: string; css?: string; js?: string } | null = null;
    if (sharedData) {
        try {
            const sharedContent = sharedData.state.content;
            const parsed =
                typeof sharedContent === 'string' ? JSON.parse(sharedContent) : sharedContent;
            if (parsed && typeof parsed === 'object') {
                const content = parsed as Record<string, unknown>;
                parsedSharedData = {
                    html: typeof content.html === 'string' ? content.html : undefined,
                    css: typeof content.css === 'string' ? content.css : undefined,
                    js: typeof content.js === 'string' ? content.js : undefined,
                };
            }
        } catch {
            parsedSharedData = null;
        }
    }

    const sharedState = (content: string | undefined) =>
        content ? { tabName: 'editor', state: { content } } : null;

    const {
        content: htmlContent,
        setContent: setHtmlContent,
        isReady: isHtmlReady,
    } = useToolState({
        storageKey: STORAGE_KEYS.LIVE_WEB_EDITOR_HTML_CONTENT,
        sharedData: sharedState(parsedSharedData?.html),
        tabId: 'editor',
        initialValue: DEFAULT_HTML,
        readOnly,
    });

    const {
        content: cssContent,
        setContent: setCssContent,
        isReady: isCssReady,
    } = useToolState({
        storageKey: STORAGE_KEYS.LIVE_WEB_EDITOR_CSS_CONTENT,
        sharedData: sharedState(parsedSharedData?.css),
        tabId: 'editor',
        initialValue: DEFAULT_CSS,
        readOnly,
    });

    const {
        content: jsContent,
        setContent: setJsContent,
        isReady: isJsReady,
    } = useToolState({
        storageKey: STORAGE_KEYS.LIVE_WEB_EDITOR_JS_CONTENT,
        sharedData: sharedState(parsedSharedData?.js),
        tabId: 'editor',
        initialValue: DEFAULT_JS,
        readOnly,
    });

    const isReady = isHtmlReady && isCssReady && isJsReady;

    const { resolvedTheme } = useTheme();
    const isDark = resolvedTheme === 'dark';

    const [autoRun, setAutoRun] = useState(() => {
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem('live-web-editor-autorun');
            return saved !== 'false';
        }
        return true;
    });

    useEffect(() => {
        if (typeof window !== 'undefined') {
            localStorage.setItem('live-web-editor-autorun', String(autoRun));
        }
    }, [autoRun]);

    const buildPreviewContent = (html: string, css: string, js: string) => {
        return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>${css}</style>
</head>
<body>
  ${html}
  <script>${js}</script>
</body>
</html>`;
    };

    const [previewCode, setPreviewCode] = useState(() =>
        buildPreviewContent(htmlContent, cssContent, jsContent),
    );
    const [refreshKey, setRefreshKey] = useState(0);
    const [shareOpen, setShareOpen] = useState(false);
    const { copy } = useClipboard();

    useEffect(() => {
        if (!autoRun) return;
        const timer = setTimeout(() => {
            setPreviewCode(buildPreviewContent(htmlContent, cssContent, jsContent));
        }, 600);
        return () => clearTimeout(timer);
    }, [htmlContent, cssContent, jsContent, autoRun]);

    const handleRun = () => {
        setPreviewCode(buildPreviewContent(htmlContent, cssContent, jsContent));
        setRefreshKey((prev) => prev + 1);
    };

    const handleReset = () => {
        setHtmlContent(DEFAULT_HTML);
        setCssContent(DEFAULT_CSS);
        setJsContent(DEFAULT_JS);
        setPreviewCode(buildPreviewContent(DEFAULT_HTML, DEFAULT_CSS, DEFAULT_JS));
        setRefreshKey((prev) => prev + 1);
    };

    const { actions } = useToolActions({
        pageName: 'live-web-editor',
        tabId: 'editor',
        getContent: () => JSON.stringify({ html: htmlContent, css: cssContent, js: jsContent }),
        onClear: () => {
            setHtmlContent('');
            setCssContent('');
            setJsContent('');
        },
        shareDialogOpen: shareOpen,
        setShareDialogOpen: setShareOpen,
        readOnly,
    });

    if (!isReady) return <ToolContentSkeleton />;

    return (
        <ToolTabWrapper actions={actions}>
            <div className="flex flex-col gap-4 mt-4 h-[calc(100vh-200px)] min-h-[600px]">
                <div className="flex items-center justify-end gap-4 h-[38px] shrink-0">
                    <div className="flex items-center gap-2">
                        <Switch
                            id="auto-run-switch"
                            checked={autoRun}
                            onCheckedChange={setAutoRun}
                            size="sm"
                        />
                        <Label
                            htmlFor="auto-run-switch"
                            className="text-xs cursor-pointer select-none text-muted-foreground"
                        >
                            Auto Run
                        </Label>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button
                            variant={autoRun ? 'outline' : 'default'}
                            size="sm"
                            onClick={handleRun}
                            className="h-8 gap-1 text-xs"
                        >
                            <Play className="h-3 w-3" /> Run
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleReset}
                            className="h-8 gap-1 text-xs"
                        >
                            <RotateCcw className="h-3 w-3" /> Reset
                        </Button>
                    </div>
                </div>

                <ResizablePanelGroup
                    orientation="vertical"
                    className="flex-1 rounded-lg border bg-background overflow-hidden"
                >
                    <ResizablePanel defaultSize={50} minSize={20}>
                        <ResizablePanelGroup orientation="horizontal">
                            <ResizablePanel defaultSize={33} minSize={15}>
                                <div className="flex flex-col h-full">
                                    <EditorPaneHeader
                                        label="HTML"
                                        content={htmlContent}
                                        onContentChange={setHtmlContent}
                                        onClear={() => setHtmlContent('')}
                                        hideInputActions={readOnly}
                                    />
                                    <div className="flex-1 overflow-auto relative bg-background">
                                        <CodeMirror
                                            value={htmlContent}
                                            height="100%"
                                            extensions={[html()]}
                                            theme={isDark ? 'dark' : 'light'}
                                            onChange={(val) => setHtmlContent(val)}
                                            readOnly={readOnly}
                                            className="absolute inset-0 h-full text-sm [&_.cm-scroller]:font-mono"
                                        />
                                    </div>
                                </div>
                            </ResizablePanel>
                            <ResizableHandle withHandle />
                            <ResizablePanel defaultSize={33} minSize={15}>
                                <div className="flex flex-col h-full">
                                    <EditorPaneHeader
                                        label="CSS"
                                        content={cssContent}
                                        onContentChange={setCssContent}
                                        onClear={() => setCssContent('')}
                                        hideInputActions={readOnly}
                                    />
                                    <div className="flex-1 overflow-auto relative bg-background">
                                        <CodeMirror
                                            value={cssContent}
                                            height="100%"
                                            extensions={[css()]}
                                            theme={isDark ? 'dark' : 'light'}
                                            onChange={(val) => setCssContent(val)}
                                            readOnly={readOnly}
                                            className="absolute inset-0 h-full text-sm [&_.cm-scroller]:font-mono"
                                        />
                                    </div>
                                </div>
                            </ResizablePanel>
                            <ResizableHandle withHandle />
                            <ResizablePanel defaultSize={34} minSize={15}>
                                <div className="flex flex-col h-full">
                                    <EditorPaneHeader
                                        label="JS"
                                        content={jsContent}
                                        onContentChange={setJsContent}
                                        onClear={() => setJsContent('')}
                                        hideInputActions={readOnly}
                                    />
                                    <div className="flex-1 overflow-auto relative bg-background">
                                        <CodeMirror
                                            value={jsContent}
                                            height="100%"
                                            extensions={[javascript()]}
                                            theme={isDark ? 'dark' : 'light'}
                                            onChange={(val) => setJsContent(val)}
                                            readOnly={readOnly}
                                            className="absolute inset-0 h-full text-sm [&_.cm-scroller]:font-mono"
                                        />
                                    </div>
                                </div>
                            </ResizablePanel>
                        </ResizablePanelGroup>
                    </ResizablePanel>

                    <ResizableHandle withHandle />

                    <ResizablePanel defaultSize={50} minSize={20}>
                        <div className="flex flex-col h-full bg-muted/30">
                            <EditorPaneHeader
                                label="Live Preview"
                                content=""
                                onContentChange={() => {}}
                                hideInputActions
                            />
                            <div className="relative flex-1 bg-white overflow-hidden">
                                {htmlContent.trim() || cssContent.trim() || jsContent.trim() ? (
                                    <iframe
                                        key={refreshKey}
                                        title="Live Web Editor Preview"
                                        srcDoc={previewCode}
                                        sandbox="allow-scripts allow-modals"
                                        className="w-full h-full border-0 absolute inset-0 bg-white"
                                    />
                                ) : (
                                    <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6 bg-slate-50 dark:bg-slate-900/10">
                                        <Monitor className="h-10 w-10 text-muted-foreground/40 mb-2" />
                                        <h3 className="font-semibold text-sm text-muted-foreground">
                                            Preview Area
                                        </h3>
                                        <p className="text-xs text-muted-foreground/60 max-w-xs mt-1">
                                            Your output will appear here as you write code
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </ResizablePanel>
                </ResizablePanelGroup>
            </div>

            <ShareSidebarModal
                open={shareOpen}
                onOpenChange={setShareOpen}
                config={{
                    pageName: 'live-web-editor',
                    tabName: 'editor',
                    getState: () => ({ html: htmlContent, css: cssContent, js: jsContent }),
                    extraActions:
                        htmlContent || cssContent || jsContent
                            ? [
                                  {
                                      id: 'copy-html',
                                      label: 'Copy HTML',
                                      icon: Copy,
                                      handler: () => copy(htmlContent),
                                  },
                                  {
                                      id: 'copy-css',
                                      label: 'Copy CSS',
                                      icon: Copy,
                                      handler: () => copy(cssContent),
                                  },
                                  {
                                      id: 'copy-js',
                                      label: 'Copy JS',
                                      icon: Copy,
                                      handler: () => copy(jsContent),
                                  },
                              ]
                            : [],
                }}
            />
        </ToolTabWrapper>
    );
}
