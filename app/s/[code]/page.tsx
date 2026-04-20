'use client';

import { useEffect, useState, use } from 'react';
import { Link2, Loader2, AlertCircle } from 'lucide-react';
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
            <div className="flex min-h-screen items-center justify-center">
                <div className="flex flex-col items-center gap-4 text-center">
                    <div className="rounded-full bg-destructive/10 p-4">
                        <AlertCircle className="h-8 w-8 text-destructive" />
                    </div>
                    <div>
                        <h1 className="text-lg font-semibold">Link Not Found</h1>
                        <p className="mt-1 text-sm text-muted-foreground">{error}</p>
                    </div>
                    <a href="/url-shortener" className="text-sm text-primary hover:underline">
                        Create a new short link
                    </a>
                </div>
            </div>
        );
    }

    return (
        <div className="flex min-h-screen items-center justify-center">
            <div className="flex flex-col items-center gap-4 text-center">
                <div className="relative">
                    <div className="absolute -right-1 -top-1">
                        <Loader2 className="h-10 w-10 animate-spin text-primary" />
                    </div>
                </div>
                <div>
                    <h1 className="text-lg font-semibold">Redirecting you...</h1>
                    <p className="mt-1 text-sm text-muted-foreground">
                        You will be redirected to your destination shortly.
                    </p>
                </div>
            </div>
        </div>
    );
}
