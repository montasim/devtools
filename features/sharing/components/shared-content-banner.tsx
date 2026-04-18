'use client';

import { Badge } from '@/components/ui/badge';
import { Share2 } from 'lucide-react';
import type { ShareMetadata } from '../types/share';

interface SharedContentBannerProps {
    metadata: ShareMetadata;
}

export function SharedContentBanner({ metadata }: SharedContentBannerProps) {
    return (
        <div className="flex items-center gap-3 rounded-lg border border-blue-200 bg-blue-50 p-3 dark:border-blue-800 dark:bg-blue-950">
            <Share2 className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            <div className="flex-1">
                <p className="text-sm font-medium">Shared Content: {metadata.title}</p>
                {metadata.comment && (
                    <p className="text-xs text-muted-foreground">{metadata.comment}</p>
                )}
            </div>
            <Badge variant="secondary" className="text-xs">
                Views: {metadata.viewCount}
            </Badge>
        </div>
    );
}
