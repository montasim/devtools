'use client';
import { ToolContentSkeleton } from '@/app/(tools)/loading';

import { useState } from 'react';
import { useToolState } from '../../core/hooks/use-tool-state';
import { useToolActions } from '../../core/hooks/use-tool-actions';
import { ToolTabWrapper } from '../../core/components/tool-tab-wrapper';
import { ShareSidebarModal } from '../../core/plugins/share-sidebar';
import { STORAGE_KEYS } from '@/lib/utils/constants';
import { useRssAnalyzer } from '../hooks/use-rss-analyzer';
import { Badge } from '@/components/ui/badge';
import { EditorPaneHeader } from '../../core/components/editor-pane-header';
import { EmptyEditorPrompt } from '@/components/ui/empty-editor-prompt';
import { Rss, SearchCode } from 'lucide-react';
import type { TabComponentProps } from '../../core/types/tool';
import { Textarea } from '@/components/ui/textarea';
import { EditorFooter } from '../../core/components/editor-footer';
import { Button } from '@/components/ui/button';

export default function AnalyzerTab({ sharedData, readOnly }: TabComponentProps) {
    const { content, setContent, isReady } = useToolState({
        storageKey: STORAGE_KEYS.RSS_ANALYZER_CONTENT,
        sharedData,
        tabId: 'analyzer',
        readOnly,
    });
    const [shareOpen, setShareOpen] = useState(false);
    const [showAllItems, setShowAllItems] = useState(false);
    const { parsedData, error } = useRssAnalyzer(content);

    const { actions } = useToolActions({
        pageName: 'rss',
        tabId: 'analyzer',
        getContent: () => content,
        onClear: () => setContent(''),
        shareDialogOpen: shareOpen,
        setShareDialogOpen: setShareOpen,
        readOnly,
    });

    if (!isReady) return <ToolContentSkeleton />;

    const isEmpty = !content || content.trim() === '';
    const shouldShowPrompt = isEmpty && (!readOnly);

    return (
        <ToolTabWrapper actions={actions}>
            <div className="flex flex-col gap-4 md:flex-row">
                <div className="min-w-0 w-full md:w-1/2">
                    <div className="flex flex-col gap-2">
                        <EditorPaneHeader
                            label="RSS/Atom Feed XML Input"
                            content={content}
                            onContentChange={setContent}
                            onClear={() => setContent('')}
                            hideInputActions={readOnly}
                        />
                        <div className="relative flex-1">
                            <Textarea
                                value={content}
                                onChange={(e) => setContent(e.target.value)}
                                placeholder="Paste your RSS or Atom Feed XML here..."
                                className="min-h-[350px] resize-none font-mono text-sm md:min-h-[400px] lg:min-h-[500px]"
                                style={{ fieldSizing: 'fixed', overflow: 'auto' }}
                                readOnly={readOnly}
                            />
                            {shouldShowPrompt && (
                                <EmptyEditorPrompt
                                    icon={Rss}
                                    title="Add RSS/Atom feed"
                                    description="Paste RSS or Atom feed XML data to analyze its structure and items"
                                    showActions={!readOnly}
                                    overlay
                                />
                            )}
                            <EditorFooter content={content} mode="xml" />
                        </div>
                    </div>
                </div>
                <div className="min-w-0 w-full md:w-1/2">
                    <div className="flex flex-col gap-2">
                        <EditorPaneHeader
                            label="Analysis Results"
                            content={
                                parsedData !== null && !error
                                    ? String(JSON.stringify(parsedData, null, 2))
                                    : ''
                            }
                            onContentChange={() => {}}
                            downloadFilename="rss_analysis.json"
                            hideInputActions
                        />
                        <div className="relative min-h-[350px] md:min-h-[400px] lg:min-h-[500px] rounded-lg border p-4 overflow-auto">
                            {error && <p className="text-sm text-destructive">{error}</p>}
                            {parsedData !== null && !error && (
                                <div className="flex flex-col gap-6">
                                    <div className="flex flex-col gap-2">
                                        <div className="flex items-center gap-2">
                                            <h3 className="font-semibold text-lg">{parsedData.title}</h3>
                                            <Badge variant="outline">{parsedData.items.length} items</Badge>
                                        </div>
                                        <p className="text-sm text-muted-foreground">{parsedData.description}</p>
                                        <a href={parsedData.link} target="_blank" rel="noreferrer" className="text-sm text-blue-500 hover:underline">
                                            {parsedData.link}
                                        </a>
                                    </div>
                                    
                                    <div className="flex flex-col gap-4">
                                        <h4 className="font-semibold text-md border-b pb-1">Latest Items</h4>
                                {parsedData.items.slice(0, showAllItems ? undefined : 10).map((item, index) => (
                                            <div key={index} className="flex flex-col gap-1 border border-border/50 rounded p-3 bg-secondary/10">
                                                <a href={item.link} target="_blank" rel="noreferrer" className="font-medium hover:underline break-words">
                                                    {item.title}
                                                </a>
                                                <span className="text-xs text-muted-foreground">{item.pubDate}</span>
                                                <p className="text-sm line-clamp-2 mt-1">{item.description}</p>
                                            </div>
                                        ))}
                                        {parsedData.items.length > 10 && !showAllItems && (
                                            <div className="flex flex-col items-center mt-2 gap-2">
                                                <p className="text-xs text-muted-foreground italic">
                                                    Showing 10 of {parsedData.items.length} items...
                                                </p>
                                                <Button variant="outline" size="sm" onClick={() => setShowAllItems(true)}>
                                                    View All Items
                                                </Button>
                                            </div>
                                        )}
                                        {showAllItems && parsedData.items.length > 10 && (
                                            <div className="flex justify-center mt-2">
                                                <Button variant="outline" size="sm" onClick={() => setShowAllItems(false)}>
                                                    Show Less
                                                </Button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                            {parsedData === null && !error && (
                                <EmptyEditorPrompt
                                    icon={SearchCode}
                                    title="Analysis results"
                                    description="Parsed RSS structure and items will appear here once you add input"
                                    showActions={false}
                                    overlay
                                />
                            )}
                        </div>
                    </div>
                </div>
            </div>
            <ShareSidebarModal
                open={shareOpen}
                onOpenChange={setShareOpen}
                config={{
                    pageName: 'rss',
                    tabName: 'analyzer',
                    getState: () => ({ content }),
                }}
            />
        </ToolTabWrapper>
    );
}
