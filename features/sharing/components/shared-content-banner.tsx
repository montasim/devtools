'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Share2, ExternalLink } from 'lucide-react';
import type { ShareMetadata } from '../types/share';

interface SharedContentBannerProps {
    metadata: ShareMetadata;
}

export function SharedContentBanner({ metadata }: SharedContentBannerProps) {
    const toolPath = `/${metadata.pageName}`;

    return (
        <div className="my-6 flex items-center gap-3 rounded-lg border border-blue-200 bg-blue-50 p-3 dark:border-blue-800 dark:bg-blue-950">
            <Share2 className="h-5 w-5 shrink-0 text-blue-600 dark:text-blue-400" />
            <div className="flex-1 min-w-0">
                <p className="text-sm font-medium">Shared Content: {metadata.title}</p>
                {metadata.comment && (
                    <p className="text-xs text-muted-foreground truncate">{metadata.comment}</p>
                )}
            </div>
            <Badge variant="secondary" className="text-xs shrink-0">
                Views: {metadata.viewCount}
            </Badge>
            <Button
                className="bg-primary/20 text-primary hover:bg-primary/20"
                variant="outline"
                size="sm"
                asChild
            >
                <a href={toolPath} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="h-4 w-4 mr-1.5" />
                    Fork
                </a>
            </Button>
        </div>
    );
}
