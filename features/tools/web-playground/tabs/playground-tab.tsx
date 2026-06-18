'use client';

import { ToolContentSkeleton } from '@/app/(tools)/loading';
import { useState, useEffect } from 'react';
import { useToolState } from '../../core/hooks/use-tool-state';
import { useToolActions } from '../../core/hooks/use-tool-actions';
import { ToolTabWrapper } from '../../core/components/tool-tab-wrapper';
import { EditorPaneHeader } from '../../core/components/editor-pane-header';
import { ShareSidebarModal } from '../../core/plugins/share-sidebar';
import { STORAGE_KEYS } from '@/lib/utils/constants';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Play, RotateCcw, Monitor, Code, Copy } from 'lucide-react';
import { useClipboard } from '@/lib/hooks/use-clipboard';
import type { TabComponentProps } from '../../core/types/tool';

const DEFAULT_BOILERPLATE = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Sandbox Preview</title>
  <style>
    body {
      font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      margin: 0;
      padding: 2rem;
      background: #0f172a;
      color: #f8fafc;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      box-sizing: border-box;
      text-align: center;
    }
    .card {
      background: #1e293b;
      border: 1px solid #334155;
      padding: 2.5rem;
      border-radius: 16px;
      box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.3), 0 8px 10px -6px rgba(0, 0, 0, 0.3);
      max-width: 450px;
      width: 100%;
    }
    h1 {
      font-size: 2rem;
      margin: 0 0 0.5rem 0;
      background: linear-gradient(135deg, #38bdf8 0%, #818cf8 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }
    p {
      color: #94a3b8;
      font-size: 0.95rem;
      line-height: 1.5;
      margin: 0 0 1.5rem 0;
    }
    button {
      background: linear-gradient(135deg, #0ea5e9 0%, #2563eb 100%);
      color: white;
      border: none;
      padding: 0.75rem 1.5rem;
      font-size: 0.95rem;
      font-weight: 600;
      border-radius: 8px;
      cursor: pointer;
      box-shadow: 0 4px 12px rgba(14, 165, 233, 0.3);
      transition: all 0.2s ease;
    }
    button:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 16px rgba(14, 165, 233, 0.4);
    }
    button:active {
      transform: translateY(0);
    }
    .counter {
      margin-top: 1rem;
      font-size: 1.1rem;
      font-weight: 500;
      color: #38bdf8;
    }
  </style>
</head>
<body>
  <div class="card">
    <h1>Web Sandbox</h1>
    <p>This is a completely isolated client-side sandbox environment. Edit the HTML/CSS/JS code in the editor and watch it refresh!</p>
    <button id="clickBtn">Interactive Test</button>
    <div id="counter" class="counter">Clicks: 0</div>
  </div>

  <script>
    let count = 0;
    const btn = document.getElementById('clickBtn');
    const counter = document.getElementById('counter');
    
    btn.addEventListener('click', () => {
      count++;
      counter.textContent = \`Clicks: \${count}\`;
      btn.style.transform = 'scale(0.95)';
      setTimeout(() => btn.style.transform = 'none', 100);
    });
  </script>
</body>
</html>`;

export default function PlaygroundTab({ sharedData, readOnly }: TabComponentProps) {
    const { content, setContent, isReady } = useToolState({
        storageKey: STORAGE_KEYS.PLAYGROUND_CODE,
        sharedData,
        tabId: 'playground',
        initialValue: DEFAULT_BOILERPLATE,
        readOnly,
    });

    const [autoRun, setAutoRun] = useState(() => {
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem('playground-autorun');
            return saved !== 'false'; // defaults to true
        }
        return true;
    });

    useEffect(() => {
        if (typeof window !== 'undefined') {
            localStorage.setItem('playground-autorun', String(autoRun));
        }
    }, [autoRun]);

    const [previewCode, setPreviewCode] = useState(content);
    const [refreshKey, setRefreshKey] = useState(0);
    const [shareOpen, setShareOpen] = useState(false);
    const { copy } = useClipboard();

    useEffect(() => {
        if (!autoRun) return;
        const timer = setTimeout(() => {
            setPreviewCode(content);
        }, 600);
        return () => clearTimeout(timer);
    }, [content, autoRun]);

    const handleRun = () => {
        setPreviewCode(content);
        setRefreshKey((prev) => prev + 1);
    };

    const handleReset = () => {
        setContent(DEFAULT_BOILERPLATE);
        setPreviewCode(DEFAULT_BOILERPLATE);
        setRefreshKey((prev) => prev + 1);
    };

    const { actions } = useToolActions({
        pageName: 'web-playground',
        tabId: 'playground',
        getContent: () => content,
        onClear: () => setContent(''),
        shareDialogOpen: shareOpen,
        setShareDialogOpen: setShareOpen,
        readOnly,
    });

    if (!isReady) return <ToolContentSkeleton />;

    return (
        <ToolTabWrapper
            actions={actions}
            leadingContent={
                <div className="flex items-center gap-4 flex-wrap">
                    <div className="flex items-center gap-2">
                        <Switch
                            id="auto-run-switch"
                            checked={autoRun}
                            onCheckedChange={setAutoRun}
                            size="sm"
                        />
                        <Label htmlFor="auto-run-switch" className="text-xs cursor-pointer select-none">
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
                            <Play className="h-3 w-3" />
                            Run
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleReset}
                            className="h-8 gap-1 text-xs"
                        >
                            <RotateCcw className="h-3 w-3" />
                            Reset Template
                        </Button>
                    </div>
                </div>
            }
        >
            <div className="flex flex-col gap-4 md:flex-row">
                <div className="min-w-0 w-full md:w-1/2">
                    <div className="flex flex-col gap-2">
                        <EditorPaneHeader
                            label="HTML Source Editor"
                            content={content}
                            onContentChange={setContent}
                            onClear={() => setContent('')}
                            hideInputActions={readOnly}
                        />
                        <div className="relative flex-1">
                            <Textarea
                                value={content}
                                onChange={(e) => setContent(e.target.value)}
                                placeholder="Write HTML/JS/CSS code here..."
                                className="min-h-[350px] resize-none font-mono text-sm md:min-h-[400px] lg:min-h-[500px] w-full"
                                style={{ fieldSizing: 'fixed', overflow: 'auto' }}
                                readOnly={readOnly}
                            />
                        </div>
                    </div>
                </div>
                <div className="min-w-0 w-full md:w-1/2">
                    <div className="flex flex-col gap-2 h-full">
                        <EditorPaneHeader
                            label="Sandbox Preview"
                            content=""
                            onContentChange={() => {}}
                            hideInputActions
                        />
                        <div className="relative flex-1 border rounded-lg bg-white overflow-hidden min-h-[350px] md:min-h-[400px] lg:min-h-[500px]">
                            {previewCode.trim() ? (
                                <iframe
                                    key={refreshKey}
                                    title="Web Playground Sandbox Preview"
                                    srcDoc={previewCode}
                                    sandbox="allow-scripts allow-modals"
                                    className="w-full h-full border-0"
                                />
                            ) : (
                                <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6 bg-slate-50 dark:bg-slate-900/10">
                                    <Monitor className="h-10 w-10 text-muted-foreground/40 mb-2" />
                                    <h3 className="font-semibold text-sm text-muted-foreground">Sandbox Preview</h3>
                                    <p className="text-xs text-muted-foreground/60 max-w-xs mt-1">
                                        Your rendered HTML, styles, and scripts will appear inside this sandbox when you write code
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
            <ShareSidebarModal
                open={shareOpen}
                onOpenChange={setShareOpen}
                config={{
                    pageName: 'web-playground',
                    tabName: 'playground',
                    getState: () => ({ content }),
                    extraActions: content
                        ? [
                              {
                                  id: 'copy-code',
                                  label: 'Copy Code',
                                  icon: Copy,
                                  handler: () => copy(content),
                              },
                          ]
                        : [],
                }}
            />
        </ToolTabWrapper>
    );
}
