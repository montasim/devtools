'use client';
import { ToolContentSkeleton } from '@/app/(tools)/loading';

import { useState, useCallback } from 'react';
import { useToolState } from '../../core/hooks/use-tool-state';
import { useToolActions } from '../../core/hooks/use-tool-actions';
import { ToolTabWrapper } from '../../core/components/tool-tab-wrapper';
import { ShareSidebarModal } from '../../core/plugins/share-sidebar';
import { STORAGE_KEYS } from '@/lib/utils/constants';
import { useRssAnalyzer } from '../hooks/use-rss-analyzer';
import { Badge } from '@/components/ui/badge';
import { EmptyEditorPrompt } from '@/components/ui/empty-editor-prompt';
import { Rss, SearchCode, Loader2, Globe } from 'lucide-react';
import type { TabComponentProps } from '../../core/types/tool';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { fetchRssFeed } from '../actions/fetch-rss';

export default function UrlAnalyzerTab({ sharedData, readOnly }: TabComponentProps) {
    const { content, setContent, isReady } = useToolState({
        storageKey: 'rss-url-analyzer-url',
        sharedData,
        tabId: 'url-analyzer',
        readOnly,
    });
    
    const [shareOpen, setShareOpen] = useState(false);
    const [xmlData, setXmlData] = useState<string>('');
    const [loading, setLoading] = useState(false);
    const [fetchError, setFetchError] = useState<string | null>(null);
    const [showAllItems, setShowAllItems] = useState(false);

    const { parsedData, error: parseError } = useRssAnalyzer(xmlData);

    const handleFetch = useCallback(async () => {
        if (!content.trim()) return;
        
        setLoading(true);
        setFetchError(null);
        setXmlData('');

        const result = await fetchRssFeed(content.trim());
        
        if (result.error) {
            setFetchError(result.error);
        } else if (result.data) {
            setXmlData(result.data);
        }
        
        setLoading(false);
    }, [content]);

    const { actions } = useToolActions({
        pageName: 'rss',
        tabId: 'url-analyzer',
        getContent: () => content,
        onClear: () => {
            setContent('');
            setXmlData('');
            setFetchError(null);
        },
        shareDialogOpen: shareOpen,
        setShareDialogOpen: setShareOpen,
        readOnly,
    });

    if (!isReady) return <ToolContentSkeleton />;

    const error = fetchError || parseError;

    return (
        <ToolTabWrapper actions={actions}>
            <div className="flex flex-col gap-4 py-4">
                <div className="flex gap-2">
                    <Input
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        placeholder="https://example.com/feed.xml"
                        className="h-9 font-mono text-sm"
                        spellCheck={false}
                        readOnly={readOnly}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') handleFetch();
                        }}
                    />
                    <Button
                        onClick={handleFetch}
                        disabled={loading || !content.trim() || readOnly}
                        size="sm"
                        className="h-9 px-4 gap-1.5"
                    >
                        {loading ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                            <Globe className="h-4 w-4" />
                        )}
                        Analyze
                    </Button>
                </div>

                <div className="relative min-h-[350px] md:min-h-[400px] lg:min-h-[500px] rounded-lg border p-4 overflow-auto bg-background">
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
                    
                    {parsedData === null && !error && !loading && (
                        <EmptyEditorPrompt
                            icon={SearchCode}
                            title="Direct URL Analysis"
                            description="Enter an RSS or Atom feed URL above to fetch and analyze its contents"
                            showActions={false}
                            overlay
                        />
                    )}
                    
                    {loading && (
                        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-background/50 backdrop-blur-sm">
                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                            <p className="mt-4 text-sm font-medium text-muted-foreground">Fetching and analyzing feed...</p>
                        </div>
                    )}
                </div>
            </div>
            <ShareSidebarModal
                open={shareOpen}
                onOpenChange={setShareOpen}
                config={{
                    pageName: 'rss',
                    tabName: 'url-analyzer',
                    getState: () => ({ content }),
                }}
            />
        </ToolTabWrapper>
    );
}
