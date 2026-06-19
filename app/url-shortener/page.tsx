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
import { Label } from '@/components/ui/label';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { apiClient } from '@/lib/api/client';
import { useClipboard } from '@/lib/hooks/use-clipboard';
import { useAuth } from '@/features/auth/hooks/use-auth';
import { useConfirmAction } from '@/hooks/use-confirm-action';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { EmptyStateCard } from '@/components/ui/empty-state-card';
import { ContentListSkeleton } from '@/components/ui/content-list-skeleton';
import { QRCodeSVG } from 'qrcode.react';
import { usePathname, useSearchParams } from 'next/navigation';

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
                <div className="space-y-2">
                    <Label htmlFor="url-input" className="text-sm font-semibold text-foreground">
                        Shorten a long link
                    </Label>
                    <div className="flex flex-col gap-3">
                        <div className="relative">
                            <div className="pointer-events-none absolute top-3 left-3 text-muted-foreground">
                                <Link2 className="h-4 w-4" />
                            </div>
                            <textarea
                                id="url-input"
                                value={url}
                                onChange={(e) => setUrl(e.target.value)}
                                placeholder="Paste your long URL here (e.g., https://example.com/very-long-url...)"
                                className="w-full pl-9 pr-3 py-2.5 min-h-[80px] border border-border bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary rounded-xl text-sm leading-relaxed resize-y"
                                required
                            />
                        </div>
                        <div className="flex justify-end">
                            <Button
                                type="submit"
                                disabled={shortenMutation.isPending}
                                className="h-9 px-4 rounded-lg font-semibold gap-1.5 bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm transition text-xs"
                            >
                                {shortenMutation.isPending ? (
                                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                ) : (
                                    <Zap className="h-3.5 w-3.5" />
                                )}
                                Shorten Link
                            </Button>
                        </div>
                    </div>
                </div>
            </form>

            {result && (
                <div className="rounded-2xl border bg-primary/5 p-6 space-y-4 animate-in zoom-in-95 duration-300">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="space-y-1">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-primary">Successfully Shortened</span>
                            <h4 className="text-lg font-bold text-foreground break-all">
                                {result.shortUrl}
                            </h4>
                            <p className="text-xs text-muted-foreground truncate max-w-md" title={result.originalUrl}>
                                Redirects to: <span className="font-mono">{result.originalUrl}</span>
                            </p>
                        </div>

                        {/* Action buttons */}
                        <div className="flex items-center gap-2 shrink-0">
                            <Button
                                variant="outline"
                                onClick={handleCopy}
                                className="gap-1.5 h-9 rounded-lg"
                            >
                                {copied ? (
                                    <>
                                        <Check className="h-4 w-4 text-emerald-500" />
                                        Copied
                                    </>
                                ) : (
                                    <>
                                        <Copy className="h-4 w-4" />
                                        Copy
                                    </>
                                )}
                            </Button>
                            <Button variant="outline" asChild className="gap-1.5 h-9 rounded-lg">
                                <a href={result.shortUrl} target="_blank" rel="noopener noreferrer">
                                    <ExternalLink className="h-4 w-4" />
                                    Open
                                </a>
                            </Button>
                        </div>
                    </div>

                    {/* QR Code section */}
                    <div className="pt-4 border-t border-border flex flex-col sm:flex-row items-center gap-4">
                        <div className="p-3 bg-white dark:bg-zinc-900 rounded-xl border flex items-center justify-center shrink-0 shadow-inner">
                            <QRCodeSVG
                                value={result.shortUrl}
                                size={80}
                                bgColor="transparent"
                                fgColor="currentColor"
                                className="text-foreground"
                                level="M"
                            />
                        </div>
                        <div className="space-y-1 text-center sm:text-left">
                            <h5 className="text-xs font-semibold text-foreground">QR Code Generated</h5>
                            <p className="text-[11px] text-muted-foreground max-w-xs leading-relaxed">
                                Share this QR code to let users scan and access your shortened link on mobile devices instantly.
                            </p>
                        </div>
                    </div>
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

    const [copiedId, setCopiedId] = useState<string | null>(null);

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

    const handleCopy = (urlStr: string, id: string) => {
        copy(urlStr);
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 2000);
    };

    const pathname = usePathname();
    const searchParams = useSearchParams();

    if (!isAuthenticated) {
        const redirectUrl = searchParams.toString()
            ? `${pathname}?${searchParams.toString()}`
            : pathname;
        return (
            <EmptyStateCard
                icon={Link2}
                title="Login to track your URLs"
                description="Sign in to see your shortened URL history and track real-time click statistics."
                actionLabel="Login"
                actionHref={`/login?redirect=${encodeURIComponent(redirectUrl)}`}
            />
        );
    }

    if (isLoading) {
        return <ContentListSkeleton />;
    }

    if (!urls || urls.length === 0) {
        return (
            <EmptyStateCard
                icon={BarChart3}
                title="No shortened URLs yet"
                description="Create a short URL to start tracking click metrics."
            />
        );
    }

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <span className="text-xs font-semibold text-muted-foreground">
                    {urls.length} Link{urls.length === 1 ? '' : 's'} Created
                </span>
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
                    className="flex items-center gap-1.5 bg-destructive/5 text-destructive hover:bg-destructive/10 border-destructive/20 hover:border-destructive/30"
                >
                    <Trash2 className="h-3.5 w-3.5" />
                    Clear All
                </Button>
            </div>

            <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1">
                {urls.map((url) => (
                    <div key={url.id} className="flex items-center justify-between gap-4 rounded-xl border bg-card p-4 transition-all hover:bg-muted/30 hover:border-primary/20 hover:shadow-sm">
                        <div className="flex items-center gap-3.5 min-w-0 flex-1">
                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary border border-primary/10">
                                <Link2 className="h-4.5 w-4.5" />
                            </div>
                            <div className="min-w-0 flex-1">
                                <button
                                    onClick={() => handleCopy(url.shortUrl, url.id)}
                                    className="truncate font-mono text-sm font-semibold text-primary hover:underline block text-left"
                                >
                                    {url.shortUrl}
                                </button>
                                <p className="truncate text-xs text-muted-foreground mt-0.5 max-w-md" title={url.originalUrl}>
                                    {url.originalUrl}
                                </p>
                                <div className="mt-2 flex items-center gap-4 text-[10px] text-muted-foreground">
                                    <span className="inline-flex items-center gap-1 font-semibold px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                                        <BarChart3 className="h-3 w-3" />
                                        {url.clicks} Click{url.clicks === 1 ? '' : 's'}
                                    </span>
                                    <span className="flex items-center gap-1">
                                        {new Date(url.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="flex shrink-0 items-center gap-1.5">
                            <Button
                                variant="outline"
                                size="icon"
                                className="h-8 w-8 rounded-lg"
                                onClick={() => handleCopy(url.shortUrl, url.id)}
                                title="Copy Short URL"
                            >
                                {copiedId === url.id ? (
                                    <Check className="h-4 w-4 text-emerald-500" />
                                ) : (
                                    <Copy className="h-4 w-4" />
                                )}
                            </Button>
                            <Button
                                variant="outline"
                                size="icon"
                                className="h-8 w-8 rounded-lg text-destructive hover:bg-destructive/5 hover:border-destructive/30"
                                onClick={() => deleteMutation.mutate(url.id)}
                                title="Delete Link"
                            >
                                <Trash2 className="h-4 w-4" />
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
        <div className="py-6 space-y-8 animate-in fade-in duration-500">
            <div className="flex flex-col-reverse lg:grid lg:grid-cols-12 gap-8">
                {/* Left Side: Stats and Info (4 cols) */}
                <div className="lg:col-span-4 space-y-6">
                    <div className="rounded-2xl border bg-card p-4 shadow-sm relative overflow-hidden">
                        <div className="absolute inset-y-0 right-0 w-1/2 bg-gradient-to-l from-primary/5 to-transparent pointer-events-none" />
                        <h2 className="text-lg font-bold text-foreground mb-4">Analytics & Features</h2>
                        <div className="space-y-4">
                            {FEATURES.map((feature) => (
                                <div key={feature.title} className="flex gap-3.5 items-start p-2 rounded-xl transition hover:bg-muted/50">
                                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary border border-primary/10">
                                        <feature.icon className="h-4 w-4" />
                                    </div>
                                    <div>
                                        <p className="text-xs font-semibold text-foreground">{feature.title}</p>
                                        <p className="text-[11px] text-muted-foreground leading-relaxed mt-0.5">
                                            {feature.description}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="rounded-2xl border bg-card p-6 shadow-sm flex flex-col justify-between">
                        <div className="space-y-2">
                            <h3 className="text-sm font-semibold text-muted-foreground">Quick Stats</h3>
                            <p className="text-xs text-muted-foreground leading-relaxed">
                                Get click metrics on all your links automatically. Login to start tracking.
                            </p>
                        </div>
                        {/* A tiny custom stat box */}
                        <div className="mt-4 pt-4 border-t flex justify-around text-center">
                            <div>
                                <span className="block text-2xl font-extrabold text-primary">100%</span>
                                <span className="text-[10px] text-muted-foreground">Uptime</span>
                            </div>
                            <div className="border-l my-2"></div>
                            <div>
                                <span className="block text-2xl font-extrabold text-primary">&lt; 5ms</span>
                                <span className="text-[10px] text-muted-foreground">Redirect Time</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Side: Interactive Tool Workspace (8 cols) */}
                <div className="lg:col-span-8">
                    <div className="rounded-2xl border bg-card p-6 shadow-sm min-h-[450px] flex flex-col">
                        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full flex-1 flex flex-col">
                            <TabsList variant="line" className="w-full justify-start border-b pb-1 mb-6 bg-transparent gap-2">
                                <TabsTrigger value="create" className={tabTriggerClass}>
                                    <Link2 className="h-4 w-4 shrink-0" />
                                    Shorten Link
                                </TabsTrigger>
                                <TabsTrigger value="history" className={tabTriggerClass}>
                                    <History className="h-4 w-4 shrink-0" />
                                    My Links
                                </TabsTrigger>
                            </TabsList>

                            <div className="flex-1 flex flex-col">
                                <TabsContent value="create" className="mt-0 flex-1">
                                    <UrlShortenerForm />
                                </TabsContent>
                                <TabsContent value="history" className="mt-0 flex-1">
                                    <UrlHistory />
                                </TabsContent>
                            </div>
                        </Tabs>
                    </div>
                </div>
            </div>
        </div>
    );
}
