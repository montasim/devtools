'use client';

import { FileText, Image as ImageIcon } from 'lucide-react';
import { SharedTab, type SharedItem } from '@/components/shared/shared-tab';
import { Base64Stats } from '@/components/base64';

interface SharedTabProps {
    onTabChange: (tab: string) => void;
}

export function Base64SharedTab({ onTabChange }: SharedTabProps) {
    const toolMapping = {
        'Media to Base64': {
            name: 'Media to Base64',
            icon: FileText,
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

    const renderStats = (item: SharedItem) => {
        const content = (item.content.rightContent ||
            item.content.leftContent ||
            JSON.stringify(item.content)) as string;
        return <Base64Stats content={content} />;
    };

    return (
        <SharedTab
            pageName="base64"
            queryKey="base64"
            toolMapping={toolMapping}
            tabMapping={tabMapping}
            renderStats={renderStats}
            onTabChange={onTabChange}
        />
    );
}
