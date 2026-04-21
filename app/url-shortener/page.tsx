'use client';

import { useState } from 'react';
import {
    Link2,
    Copy,
    Check,
    ExternalLink,
    BarChart3,
    Trash2,
    Loader2,
    History,
    Zap,
    Shield,
    BarChart,
    Globe,
} from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { apiClient } from '@/lib/api/client';
import { useClipboard } from '@/lib/hooks/use-clipboard';
import { useAuth } from '@/features/auth/hooks/use-auth';
import { useConfirmAction } from '@/hooks/use-confirm-action';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { EmptyStateCard } from '@/components/ui/empty-state-card';

const tabTriggerClass =
    'gap-2 whitespace-nowrap rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-primary data-[state=active]:text-primary data-[state=active]:font-semibold data-[state=active]:bg-primary/10';

const FEATURES = [
    {
        icon: Zap,
        title: 'Instant Shortening',
        description: 'Generate short links in milliseconds with a single click',
    },
    {
        icon: BarChart,
        title: 'Click Tracking',
        description: 'Monitor how many times your short links are clicked',
    },
    {
        icon: Shield,
        title: 'Secure & Reliable',
        description: 'All links are stored securely and redirect reliably',
    },
    {
        icon: Globe,
        title: 'Share Anywhere',
        description: 'Use short links in messages, social media, or emails',
    },
];

interface ShortenedUrlData {
    id: string;
    shortCode: string;
    shortUrl: string;
    originalUrl: string;
    clicks: number;
    createdAt: string;
}

function UrlShortenerForm() {
    const [url, setUrl] = useState('');
    const [result, setResult] = useState<ShortenedUrlData | null>(null);
    const [copied, setCopied] = useState(false);
    const { copy } = useClipboard();
    const queryClient = useQueryClient();

    const shortenMutation = useMutation({
        mutationFn: async (originalUrl: string) => {
            const res = await apiClient.post<ShortenedUrlData>('/api/url/shorten', { originalUrl });
            if (!res.ok) throw new Error(res.error?.message ?? 'Failed to shorten URL');
            return res.data!;
        },
        onSuccess: (data) => {
            setResult(data);
            setUrl('');
            queryClient.invalidateQueries({ queryKey: ['shortened-urls'] });
            toast.success('URL shortened!');
        },
        onError: (error) => {
            toast.error(error instanceof Error ? error.message : 'Failed to shorten URL');
        },
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!url.trim()) {
            toast.error('Please enter a URL');
            return;
        }
        shortenMutation.mutate(url.trim());
    };

    const handleCopy = () => {
        if (!result) return;
        copy(result.shortUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="space-y-6">
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <Label htmlFor="url-input" className="mb-2 block text-sm font-semibold">
                        Enter URL
                    </Label>
                    <div className="flex gap-2">
                        <Input
                            id="url-input"
                            type="url"
                            value={url}
                            onChange={(e) => setUrl(e.target.value)}
                            placeholder="https://example.com/very-long-url-that-needs-shortening"
                            className="flex-1"
                        />
                        <Button
                            type="submit"
                            disabled={shortenMutation.isPending}
                            className="gap-2 shrink-0"
                        >
                            {shortenMutation.isPending ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                                <Link2 className="h-4 w-4" />
                            )}
                            Shorten
                        </Button>
                    </div>
                </div>
            </form>

            {result && (
                <div className="rounded-lg border bg-primary/5 p-4">
                    <div className="mb-2 flex items-center justify-between">
                        <Label className="text-sm font-semibold">Shortened URL</Label>
                        <div className="flex items-center gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handleCopy}
                                className="gap-1.5"
                            >
                                {copied ? (
                                    <Check className="h-3.5 w-3.5" />
                                ) : (
                                    <Copy className="h-3.5 w-3.5" />
                                )}
                                {copied ? 'Copied' : 'Copy'}
                            </Button>
                            <Button variant="outline" size="sm" asChild className="gap-1.5">
                                <a href={result.shortUrl} target="_blank" rel="noopener noreferrer">
                                    <ExternalLink className="h-3.5 w-3.5" />
                                    Open
                                </a>
                            </Button>
                        </div>
                    </div>
                    <div className="rounded-md border bg-background p-3">
                        <code className="break-all font-mono text-sm text-primary">
                            {result.shortUrl}
                        </code>
                    </div>
                    <p className="mt-2 truncate text-xs text-muted-foreground">
                        {result.originalUrl}
                    </p>
                </div>
            )}

            {!result && (
                <div className="grid gap-4 sm:grid-cols-2">
                    {FEATURES.map((feature) => (
                        <div
                            key={feature.title}
                            className="flex items-start gap-3 rounded-lg border p-4"
                        >
                            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
                                <feature.icon className="h-4 w-4" />
                            </div>
                            <div>
                                <p className="text-sm font-medium">{feature.title}</p>
                                <p className="text-xs text-muted-foreground">
                                    {feature.description}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

function UrlHistory() {
    const { isAuthenticated } = useAuth();
    const { copy } = useClipboard();
    const queryClient = useQueryClient();
    const { confirm, dialog } = useConfirmAction();

    const { data: urls, isLoading } = useQuery({
        queryKey: ['shortened-urls'],
        queryFn: async () => {
            const res = await apiClient.get<ShortenedUrlData[]>('/api/url/list');
            if (!res.ok) return [];
            return res.data ?? [];
        },
        enabled: isAuthenticated,
    });

    const deleteMutation = useMutation({
        mutationFn: async (id: string) => {
            const res = await apiClient.delete(`/api/url/${id}`);
            if (!res.ok) throw new Error('Failed to delete');
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['shortened-urls'] });
            toast.success('URL deleted');
        },
        onError: () => toast.error('Failed to delete URL'),
    });

    const clearAllMutation = useMutation({
        mutationFn: async (ids: string[]) => {
            const res = await apiClient.post('/api/url/clear-all', { ids });
            if (!res.ok) throw new Error('Failed to clear');
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['shortened-urls'] });
            toast.success('All URLs deleted');
        },
        onError: () => toast.error('Failed to delete URLs'),
    });

    if (!isAuthenticated) {
        return (
            <EmptyStateCard
                icon={Link2}
                title="Login to track your URLs"
                description="Sign in to see your shortened URL history and click stats"
                actionLabel="Login"
                actionHref="/login"
            />
        );
    }

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
        );
    }

    if (!urls || urls.length === 0) {
        return (
            <EmptyStateCard
                icon={BarChart3}
                title="No shortened URLs yet"
                description="Create a short URL to start tracking clicks"
            />
        );
    }

    return (
        <div className="space-y-2">
            <div className="flex justify-end">
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                        confirm(() => clearAllMutation.mutate(urls.map((u) => u.id)), {
                            title: 'Clear All URLs',
                            description:
                                'This will permanently delete all your shortened URLs. This action cannot be undone.',
                            confirmLabel: 'Clear All',
                            variant: 'destructive',
                        })
                    }
                    className="flex items-center gap-1.5 bg-destructive/10 text-destructive hover:bg-destructive/20"
                >
                    <Trash2 className="h-4 w-4" />
                    Clear All
                </Button>
            </div>
            <div className="space-y-3">
                {urls.map((url) => (
                    <div key={url.id} className="flex items-start gap-3 rounded-lg border p-3">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
                            <Link2 className="h-4 w-4" />
                        </div>
                        <div className="min-w-0 flex-1">
                            <button
                                onClick={() => copy(url.shortUrl)}
                                className="truncate font-mono text-sm text-primary hover:underline"
                            >
                                {url.shortUrl}
                            </button>
                            <p className="truncate text-xs text-muted-foreground">
                                {url.originalUrl}
                            </p>
                            <div className="mt-1 flex items-center gap-3 text-xs text-muted-foreground">
                                <span className="inline-flex items-center gap-1">
                                    <BarChart3 className="h-3 w-3" />
                                    {url.clicks} clicks
                                </span>
                                <span>{new Date(url.createdAt).toLocaleDateString()}</span>
                            </div>
                        </div>
                        <div className="flex shrink-0 items-center gap-1">
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7"
                                onClick={() => copy(url.shortUrl)}
                                title="Copy"
                            >
                                <Copy className="h-3.5 w-3.5" />
                            </Button>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 text-destructive"
                                onClick={() => deleteMutation.mutate(url.id)}
                                title="Delete"
                            >
                                <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                        </div>
                    </div>
                ))}
            </div>
            {dialog}
        </div>
    );
}

export default function UrlShortenerPage() {
    const [activeTab, setActiveTab] = useState('create');

    return (
        <div className="mx-auto py-4">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <div className="border-b">
                    <TabsList
                        variant="line"
                        className="h-auto w-full justify-start overflow-x-auto border-0 bg-transparent p-0 scrollbar-hide"
                    >
                        <div className="flex w-full min-w-max justify-between gap-2 pb-2">
                            <div className="flex min-w-max gap-1">
                                <TabsTrigger value="create" className={tabTriggerClass}>
                                    <Link2 className="h-4 w-4 shrink-0" />
                                    Create
                                </TabsTrigger>
                            </div>
                            <div className="flex min-w-max gap-1">
                                <TabsTrigger value="history" className={tabTriggerClass}>
                                    <History className="h-4 w-4 shrink-0" />
                                    History
                                </TabsTrigger>
                            </div>
                        </div>
                    </TabsList>
                </div>

                <div className="mx-auto">
                    <TabsContent value="create" className="mt-0 pt-4">
                        <UrlShortenerForm />
                    </TabsContent>
                    <TabsContent value="history" className="mt-0 pt-2">
                        <UrlHistory />
                    </TabsContent>
                </div>
            </Tabs>
        </div>
    );
}
