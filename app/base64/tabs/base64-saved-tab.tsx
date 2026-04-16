'use client';

import { FileCode, Image as ImageIcon } from 'lucide-react';
import { SavedTab, type SavedItem } from '@/components/shared/saved-tab';

interface Base64SavedTabProps {
    onTabChange: (tab: string) => void;
}

export function Base64SavedTab({ onTabChange }: Base64SavedTabProps) {
    const toolMapping = {
        'Media to Base64': {
            name: 'Media to Base64',
            icon: FileCode,
            color: 'text-blue-500',
        },
        'Base64 to Media': {
            name: 'Base64 to Media',
            icon: ImageIcon,
            color: 'text-green-500',
        },
    };

    const tabMapping: Record<string, string> = {
        'Media to Base64': 'media-to-base64',
        'Base64 to Media': 'base64-to-media',
    };

    const storageKeyMapping: Record<string, string> = {
        'Media to Base64': 'base64-media-input-content',
        'Base64 to Media': 'base64-media-input-content',
    };

    const extractContent = (item: SavedItem): string => {
        const mainContent =
            item.content.rightContent || item.content.leftContent || JSON.stringify(item.content);
        return typeof mainContent === 'string' ? mainContent : JSON.stringify(mainContent);
    };

    return (
        <SavedTab
            pageName="base64"
            queryKey="base64"
            toolMapping={toolMapping}
            tabMapping={tabMapping}
            storageKeyMapping={storageKeyMapping}
            extractContent={extractContent}
            onTabChange={onTabChange}
        />
    );
}
