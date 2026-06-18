'use client';

import { useState, useEffect, use, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { apiClient } from '@/lib/api/client';
import { PasswordPrompt } from '@/features/sharing/components/password-prompt';
import { SharedContentBanner } from '@/features/sharing/components/shared-content-banner';
import { ShareErrorDisplay } from '@/features/sharing/components/share-error-display';
import { Loader2 } from 'lucide-react';
import { ToolPage } from '@/features/tools/core/components/tool-page';
import { getToolDefinition } from '@/features/tools/core/config/tool-registry';
import type { ShareMetadata, ShareAccessResponse } from '@/features/sharing/types/share';

import '@/app/(tools)/json/page';
import '@/app/(tools)/text/page';
import '@/app/(tools)/base64/page';
import '@/app/(tools)/qrcode/page';

const SESSION_KEY = 'share-text-access-data';

function ShareContentLoader({ id }: { id: string }) {
    const router = useRouter();

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [metadata, setMetadata] = useState<ShareMetadata | null>(null);
    const [needsPassword, setNeedsPassword] = useState(false);
    const [accessData, setAccessData] = useState<ShareAccessResponse | null>(null);

    useEffect(() => {
        loadMetadata();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id]);

    async function loadMetadata() {
        try {
            const res = await apiClient.get<ShareMetadata>(`/api/shares/${id}`);
            if (!res.ok || !res.data) {
                setError(res.error?.message ?? 'Share not found');
                setLoading(false);
                return;
            }

            const meta = res.data;
            setMetadata(meta);

            if (meta.expiresAt && new Date(meta.expiresAt) < new Date()) {
                setError('This share link has expired');
                setLoading(false);
                return;
            }

            if (!meta.hasPassword) {
                await accessContent(meta);
            } else {
                setNeedsPassword(true);
                setLoading(false);
            }
        } catch {
            setError('Failed to load shared content');
            setLoading(false);
        }
    }

    async function accessContent(meta: ShareMetadata, passwordInput?: string): Promise<boolean> {
        try {
            setLoading(true);
            const res = await apiClient.post<ShareAccessResponse>(
                `/api/shares/${id}/access`,
                passwordInput ? { password: passwordInput } : undefined,
            );
            if (!res.ok || !res.data) {
                if (res.error?.code === 'INVALID_PASSWORD') {
                    setLoading(false);
                    return false;
                }
                setError(res.error?.message ?? 'Failed to access content');
                setLoading(false);
                return false;
            }

            if (meta.pageName === 'text') {
                sessionStorage.setItem(SESSION_KEY, JSON.stringify(res.data));
                router.replace('/share/text');
            } else {
                setAccessData(res.data);
                setNeedsPassword(false);
                setLoading(false);
            }
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
                    const ok = await accessContent(metadata, pwd);
                    if (!ok) {
                        setError('Incorrect password');
                    }
                }}
            />
        );
    }

    if (metadata && metadata.pageName !== 'text') {
        const toolDefinition = getToolDefinition(metadata.pageName);
        if (!toolDefinition) {
            return <ShareErrorDisplay message={`Unknown tool type: ${metadata.pageName}`} />;
        }

        const sharedData = accessData?.content
            ? { tabName: metadata.tabName, state: accessData.content.state }
            : null;

        return (
            <>
                <SharedContentBanner metadata={metadata} state={accessData?.content?.state ?? null} />
                <ToolPage definition={toolDefinition} sharedData={sharedData} />
            </>
        );
    }

    return null;
}

export default function SharedContentPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    return (
        <Suspense
            fallback={
                <div className="flex min-h-screen items-center justify-center">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
            }
        >
            <ShareContentLoader id={id} />
        </Suspense>
    );
}
