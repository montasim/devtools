'use client';

import { useState, useEffect, use, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { apiClient } from '@/lib/api/client';
import { PasswordPrompt } from '@/features/sharing/components/password-prompt';
import { SharedContentBanner } from '@/features/sharing/components/shared-content-banner';
import { ShareErrorDisplay } from '@/features/sharing/components/share-error-display';
import { Loader2, Share2 } from 'lucide-react';
import { ToolPage } from '@/features/tools/core/components/tool-page';
import { getToolDefinition } from '@/features/tools/core/config/tool-registry';
import type { ShareMetadata, ShareAccessResponse } from '@/features/sharing/types/share';

const toolImports: Record<string, () => Promise<any>> = {
    'api-builder': () => import('@/app/(tools)/api-builder/page'),
    'ascii-table': () => import('@/app/(tools)/ascii-table/page'),
    'base64': () => import('@/app/(tools)/base64/page'),
    'cert-decoder': () => import('@/app/(tools)/cert-decoder/page'),
    'color': () => import('@/app/(tools)/color/page'),
    'content-type': () => import('@/app/(tools)/content-type/page'),
    'cors': () => import('@/app/(tools)/cors/page'),
    'cron': () => import('@/app/(tools)/cron/page'),
    'css': () => import('@/app/(tools)/css/page'),
    'css-unit': () => import('@/app/(tools)/css-unit/page'),
    'csv': () => import('@/app/(tools)/csv/page'),
    'curl': () => import('@/app/(tools)/curl/page'),
    'emoji': () => import('@/app/(tools)/emoji/page'),
    'fancy-text': () => import('@/app/(tools)/fancy-text/page'),
    'free-email': () => import('@/app/(tools)/free-email/page'),
    'git-branch-generator': () => import('@/app/git-branch-generator/page'),
    'hash': () => import('@/app/(tools)/hash/page'),
    'html': () => import('@/app/(tools)/html/page'),
    'html-entity': () => import('@/app/(tools)/html-entity/page'),
    'http-header-parser': () => import('@/app/(tools)/http-header-parser/page'),
    'http-status': () => import('@/app/(tools)/http-status/page'),
    'id': () => import('@/app/(tools)/id/page'),
    'ip': () => import('@/app/(tools)/ip/page'),
    'json': () => import('@/app/(tools)/json/page'),
    'leet-text': () => import('@/app/(tools)/leet-text/page'),
    'markdown': () => import('@/app/(tools)/markdown/page'),
    'mime-type': () => import('@/app/(tools)/mime-type/page'),
    'nslookup': () => import('@/app/(tools)/nslookup/page'),
    'number-base': () => import('@/app/(tools)/number-base/page'),
    'passphrase': () => import('@/app/(tools)/passphrase/page'),
    'password': () => import('@/app/(tools)/password/page'),
    'password-hash': () => import('@/app/(tools)/password-hash/page'),
    'qrcode': () => import('@/app/(tools)/qrcode/page'),
    'regex': () => import('@/app/(tools)/regex/page'),
    'rsa-key': () => import('@/app/(tools)/rsa-key/page'),
    'rss': () => import('@/app/(tools)/rss/page'),
    'sample': () => import('@/app/(tools)/sample/page'),
    'spam-words': () => import('@/app/(tools)/spam-words/page'),
    'sql': () => import('@/app/(tools)/sql/page'),
    'stun': () => import('@/app/(tools)/stun/page'),
    'svg': () => import('@/app/(tools)/svg/page'),
    'temp-email': () => import('@/app/(tools)/temp-email/page'),
    'text': () => import('@/app/(tools)/text/page'),
    'text-art': () => import('@/app/(tools)/text-art/page'),
    'timestamp': () => import('@/app/(tools)/timestamp/page'),
    'timezones': () => import('@/app/(tools)/timezones/page'),
    'turn': () => import('@/app/(tools)/turn/page'),
    'unicode': () => import('@/app/(tools)/unicode/page'),
    'unit': () => import('@/app/(tools)/unit/page'),
    'url-encode': () => import('@/app/(tools)/url-encode/page'),
    'user-agent': () => import('@/app/(tools)/user-agent/page'),
    'web-playground': () => import('@/app/(tools)/web-playground/page'),
    'webhook': () => import('@/app/(tools)/webhook/page'),
    'websocket': () => import('@/app/(tools)/websocket/page'),
    'xml': () => import('@/app/(tools)/xml/page'),
    'yaml': () => import('@/app/(tools)/yaml/page'),
};

const SESSION_KEY = 'share-text-access-data';

function SharedLoadingState() {
    return (
        <div className="flex min-h-[80vh] items-center justify-center px-4 animate-in fade-in duration-500">
            <div className="relative mx-auto w-full max-w-sm overflow-hidden rounded-2xl border bg-card p-6 md:p-8 shadow-md text-center">
                <div className="absolute inset-0 bg-gradient-to-b from-primary/[0.02] to-transparent pointer-events-none" />

                <div className="flex flex-col items-center">
                    <div className="relative mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary border border-primary/20 shadow-inner">
                        <Share2 className="h-7 w-7 text-primary animate-pulse" />
                        <div className="absolute -inset-0.5 rounded-2xl bg-primary/20 blur opacity-40 animate-pulse pointer-events-none" />
                    </div>

                    <h2 className="text-lg font-bold tracking-tight text-foreground">Fetching Shared Content</h2>
                    <p className="mt-2 text-xs text-muted-foreground max-w-[240px] leading-relaxed">
                        Please wait while we verify access permissions and prepare the developer workspace.
                    </p>

                    <div className="mt-6 flex items-center gap-2 rounded-full bg-muted/60 border px-3 py-1 text-[11px] font-medium text-muted-foreground">
                        <Loader2 className="h-3.5 w-3.5 animate-spin text-primary" />
                        <span>Verifying secure link...</span>
                    </div>
                </div>
            </div>
        </div>
    );
}

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

            if (meta.pageName && meta.pageName !== 'text') {
                const importFn = toolImports[meta.pageName];
                if (importFn) {
                    try {
                        await importFn();
                    } catch (err) {
                        console.error('Failed to load tool chunk dynamically:', err);
                        setError('Failed to load the tool application chunk');
                        setLoading(false);
                        return;
                    }
                } else {
                    setError(`Unknown tool type: ${meta.pageName}`);
                    setLoading(false);
                    return;
                }
            }

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
        return <SharedLoadingState />;
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
        <Suspense fallback={<SharedLoadingState />}>
            <ShareContentLoader id={id} />
        </Suspense>
    );
}
