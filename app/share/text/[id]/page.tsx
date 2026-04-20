'use client';

import { useState, useEffect, use, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { apiClient } from '@/lib/api/client';
import { PasswordPrompt } from '@/features/sharing/components/password-prompt';
import { ShareErrorDisplay } from '@/features/sharing/components/share-error-display';
import { Loader2 } from 'lucide-react';
import type { ShareMetadata, ShareAccessResponse } from '@/features/sharing/types/share';

const SESSION_KEY = 'share-text-access-data';

function ShareTextRedirector({ id }: { id: string }) {
    const router = useRouter();

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [metadata, setMetadata] = useState<ShareMetadata | null>(null);
    const [needsPassword, setNeedsPassword] = useState(false);

    useEffect(() => {
        loadMetadata();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id]);

    async function loadMetadata() {
        try {
            const res = await apiClient.get<ShareMetadata>(`/api/shares/${id}`);
            if (!res.ok || !res.data) {
                setError(res.error?.message ?? 'Share not found');
                return;
            }

            const meta = res.data;
            setMetadata(meta);

            if (meta.expiresAt && new Date(meta.expiresAt) < new Date()) {
                setError('This share link has expired');
                return;
            }

            if (!meta.hasPassword) {
                await accessContent();
            } else {
                setNeedsPassword(true);
                setLoading(false);
            }
        } catch {
            setError('Failed to load shared content');
            setLoading(false);
        }
    }

    async function accessContent(password?: string): Promise<boolean> {
        try {
            const res = await apiClient.post<ShareAccessResponse>(
                `/api/shares/${id}/access`,
                password ? { password } : undefined,
            );
            if (!res.ok || !res.data) {
                if (res.error?.code === 'INVALID_PASSWORD') {
                    return false;
                }
                setError(res.error?.message ?? 'Failed to access content');
                return false;
            }

            sessionStorage.setItem(SESSION_KEY, JSON.stringify(res.data));
            router.replace('/share/text');
            return true;
        } catch {
            setError('Failed to access content');
            setLoading(false);
            return false;
        }
    }

    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        );
    }

    if (error) {
        return <ShareErrorDisplay message={error} />;
    }

    if (needsPassword && metadata) {
        return (
            <PasswordPrompt
                onSubmit={async (pwd) => {
                    const ok = await accessContent(pwd);
                    if (!ok) {
                        setError('Incorrect password');
                    }
                }}
            />
        );
    }

    return null;
}

export default function ShareTextRedirectPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    return (
        <Suspense
            fallback={
                <div className="flex min-h-screen items-center justify-center">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
            }
        >
            <ShareTextRedirector id={id} />
        </Suspense>
    );
}
