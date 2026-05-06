'use client';

import { useEffect, useState, use } from 'react';
import Link from 'next/link';
import { Loader2, AlertCircle, Link2, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { apiClient } from '@/lib/api/client';

interface StatsResponse {
    originalUrl: string;
    clicks: number;
    createdAt: string;
}

export default function ShortRedirectPage({ params }: { params: Promise<{ code: string }> }) {
    const { code } = use(params);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function redirect() {
            try {
                const res = await apiClient.get<StatsResponse>(`/api/url/${code}?stats=true`);
                if (!res.ok || !res.data) {
                    setError('This short link does not exist or has been removed.');
                    return;
                }

                await apiClient.get(`/api/url/${code}/click`);

                window.location.replace(res.data.originalUrl);
            } catch {
                setError('Something went wrong. Please try again.');
            }
        }
        redirect();
    }, [code]);

    if (error) {
        return (
            <div className="flex min-h-[70vh] flex-col items-center justify-center px-4">
                <div className="flex flex-col items-center text-center">
                    <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-2xl border bg-card/50 backdrop-blur-sm">
                        <AlertCircle className="h-10 w-10 text-destructive" />
                    </div>
                    <h1 className="text-lg font-semibold">Link Not Found</h1>
                    <p className="mt-2 max-w-sm text-sm text-muted-foreground">{error}</p>
                    <Button size="lg" asChild className="mt-8 h-11 px-6 text-sm">
                        <Link href="/url-shortener">
                            <Link2 className="mr-2 h-4 w-4" />
                            Create a New Link
                        </Link>
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="flex min-h-[70vh] flex-col items-center justify-center px-4">
            <div className="flex flex-col items-center text-center">
                <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-2xl border bg-card/50 backdrop-blur-sm">
                    <Loader2 className="h-10 w-10 animate-spin text-primary" />
                </div>
                <h1 className="text-lg font-semibold">Redirecting you...</h1>
                <p className="mt-2 max-w-sm text-sm text-muted-foreground">
                    Hang tight — we&apos;re sending you to the right place.
                </p>
                <div className="mt-3 flex items-center gap-1 text-xs text-muted-foreground">
                    <ArrowRight className="h-3 w-3 animate-pulse" />
                    <span>Almost there</span>
                </div>
            </div>
        </div>
    );
}
