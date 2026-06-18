'use client';

import { Button } from '@/components/ui/button';
import { Share2, ExternalLink, Eye, Clock, Lock } from 'lucide-react';
import type { ShareMetadata } from '../types/share';
import { useRouter } from 'next/navigation';
import { STORAGE_KEYS } from '@/lib/utils/constants';

interface SharedContentBannerProps {
    metadata: ShareMetadata;
    state?: Record<string, unknown> | null;
    onOpenInEditor?: () => void;
}

function getStorageKey(pageName: string, tabName: string): string | null {
    if (pageName === 'json') {
        const keys: Record<string, string> = {
            diff: STORAGE_KEYS.JSON_DIFF_LEFT_CONTENT,
            format: STORAGE_KEYS.JSON_FORMAT_LEFT_CONTENT,
            minify: STORAGE_KEYS.JSON_MINIFY_LEFT_CONTENT,
            viewer: STORAGE_KEYS.JSON_VIEWER_CONTENT,
            parser: STORAGE_KEYS.JSON_PARSER_CONTENT,
            export: STORAGE_KEYS.JSON_EXPORT_CONTENT,
            schema: STORAGE_KEYS.JSON_SCHEMA_JSON_CONTENT,
        };
        return keys[tabName] || null;
    }
    if (pageName === 'xml') {
        const keys: Record<string, string> = {
            format: STORAGE_KEYS.XML_FORMAT_LEFT_CONTENT,
            minify: STORAGE_KEYS.XML_MINIFY_LEFT_CONTENT,
            diff: STORAGE_KEYS.XML_DIFF_LEFT_CONTENT,
            viewer: STORAGE_KEYS.XML_VIEWER_CONTENT,
            parser: STORAGE_KEYS.XML_PARSER_CONTENT,
        };
        return keys[tabName] || null;
    }
    if (pageName === 'text') {
        const keys: Record<string, string> = {
            diff: STORAGE_KEYS.TEXT_DIFF_LEFT_CONTENT,
            convert: STORAGE_KEYS.TEXT_CONVERT_INPUT_CONTENT,
            clean: STORAGE_KEYS.TEXT_CLEAN_INPUT_CONTENT,
        };
        return keys[tabName] || null;
    }
    if (pageName === 'qrcode') {
        return STORAGE_KEYS.QR_CREATE_INPUT;
    }
    return `${pageName}-${tabName}`;
}

function formatExpiry(expiresAt: string | null): string {
    if (!expiresAt) return 'Never';
    const diff = new Date(expiresAt).getTime() - Date.now();
    if (diff <= 0) return 'Expired';
    const hours = Math.floor(diff / 3600000);
    if (hours < 24) return `${hours}h left`;
    const days = Math.floor(hours / 24);
    return `${days}d left`;
}

function formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
    });
}

export function SharedContentBanner({ metadata, state, onOpenInEditor }: SharedContentBannerProps) {
    const router = useRouter();
    const toolPath = `/${metadata.pageName}`;

    const handleOpenInEditor = (e: React.MouseEvent) => {
        e.preventDefault();

        if (onOpenInEditor) {
            onOpenInEditor();
            return;
        }

        if (state && typeof window !== 'undefined') {
            const storageKey = getStorageKey(metadata.pageName, metadata.tabName);
            if (storageKey) {
                const content =
                    (state.leftContent as string) ??
                    (state.inputContent as string) ??
                    (state.content as string) ??
                    (state.text as string) ??
                    '';
                try {
                    localStorage.setItem(storageKey, JSON.stringify(content));
                } catch (err) {
                    console.error('Failed to write to localStorage:', err);
                }
            }
        }

        router.push(toolPath);
    };

    return (
        <div className="my-6 rounded-lg border bg-muted/30">
            <div className="flex items-start justify-between gap-4 p-4 pb-3">
                <div className="flex items-start gap-3 min-w-0">
                    <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
                        <Share2 className="h-4 w-4" />
                    </div>
                    <div className="min-w-0">
                        <h2 className="text-sm font-semibold truncate">{metadata.title}</h2>
                        <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                            <span className="inline-flex items-center gap-1">
                                <Eye className="h-3 w-3" />
                                {metadata.viewCount} views
                            </span>
                            <span>{formatDate(metadata.createdAt)}</span>
                            <span className="inline-flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {formatExpiry(metadata.expiresAt)}
                            </span>
                            {metadata.hasPassword && (
                                <span className="inline-flex items-center gap-1">
                                    <Lock className="h-3 w-3" />
                                    Protected
                                </span>
                            )}
                        </div>
                    </div>
                </div>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={handleOpenInEditor}
                    className="bg-primary/10 text-primary hover:bg-primary/20"
                >
                    <ExternalLink className="h-3.5 w-3.5 mr-1.5" />
                    Open in Editor
                </Button>
            </div>
            {metadata.comment && (
                <div className="border-t px-4 py-2.5">
                    <p className="text-xs text-muted-foreground">{metadata.comment}</p>
                </div>
            )}
        </div>
    );
}
