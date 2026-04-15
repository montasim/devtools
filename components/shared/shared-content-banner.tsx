'use client';

import { Lock, Clock, Eye, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface SharedContentBannerProps {
    title?: string;
    comment?: string | null;
    expiresAt?: string | null;
    hasPassword?: boolean;
    viewCount?: number;
    createdAt?: string;
    onClose?: () => void;
}

export function SharedContentBanner({
    title,
    comment,
    expiresAt,
    hasPassword,
    viewCount,
    createdAt,
    onClose,
}: SharedContentBannerProps) {
    const formatExpiration = (dateStr: string) => {
        const date = new Date(dateStr);
        const now = new Date();
        const diff = date.getTime() - now.getTime();

        if (diff < 0) return 'Expired';

        const hours = Math.floor(diff / (1000 * 60 * 60));
        const days = Math.floor(hours / 24);

        if (days > 0) return `Expires in ${days} day${days > 1 ? 's' : ''}`;
        if (hours > 0) return `Expires in ${hours} hour${hours > 1 ? 's' : ''}`;
        return 'Expires soon';
    };

    const formatCreatedDate = (dateStr: string) => {
        if (!dateStr) return 'Unknown date';
        const date = new Date(dateStr);
        // Check if date is invalid
        if (isNaN(date.getTime())) return 'Unknown date';
        return date.toLocaleDateString();
    };

    return (
        <div className="dark:bg-transparent dark:hover:text-accent-foreground border-b border-primary/50 mt-6 border rounded-md">
            <div className="mx-auto px-4 py-3">
                <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2 mb-2">
                            <h1 className="shrink-0">Shared Content</h1>
                            {onClose && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-6 w-6 p-0 bg-red-200 hover:bg-red-400 text-red-900 dark:bg-red-900 dark:hover:bg-red-950 dark:text-white"
                                    onClick={onClose}
                                >
                                    <X className="h-4 w-4" />
                                </Button>
                            )}
                        </div>

                        {title && (
                            <h2 className="text-lg font-semibold truncate">Title: {title}</h2>
                        )}

                        {comment && (
                            <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                                Comment: {comment}
                            </p>
                        )}

                        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-2 text-sm text-muted-foreground">
                            {viewCount && viewCount > 0 && (
                                <div className="flex items-center gap-1">
                                    <Eye className="h-3.5 w-3.5" />
                                    <span>
                                        {viewCount} view{viewCount !== 1 ? 's' : ''}
                                    </span>
                                </div>
                            )}

                            {hasPassword && (
                                <div className="flex items-center gap-1">
                                    <Lock className="h-3.5 w-3.5" />
                                    <span>Password protected</span>
                                </div>
                            )}

                            {expiresAt && (
                                <div className="flex items-center gap-1">
                                    <Clock className="h-3.5 w-3.5" />
                                    <span>{formatExpiration(expiresAt)}</span>
                                </div>
                            )}

                            {createdAt && <div>Created {formatCreatedDate(createdAt)}</div>}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
