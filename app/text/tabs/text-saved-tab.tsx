'use client';

import { GitCompare, Sparkles, ArrowLeftRight } from 'lucide-react';
import { SavedTab, type SavedItem } from '@/components/shared/saved-tab';

interface TextSavedTabProps {
    onTabChange: (tab: string) => void;
}

export function TextSavedTab({ onTabChange }: TextSavedTabProps) {
    const toolMapping = {
        'Text Diff': {
            name: 'Diff',
            icon: GitCompare,
            color: 'text-blue-500',
        },
        'Text Convert': {
            name: 'Convert',
            icon: ArrowLeftRight,
            color: 'text-green-500',
        },
        'Text Clean': {
            name: 'Clean',
            icon: Sparkles,
            color: 'text-purple-500',
        },
    };

    const tabMapping: Record<string, string> = {
        'Text Diff': 'diff',
        'Text Convert': 'convert',
        'Text Clean': 'clean',
    };

    const storageKeyMapping: Record<string, string> = {
        'Text Diff': 'text-diff-left-input',
        'Text Convert': 'text-convert-input',
        'Text Clean': 'text-clean-input',
    };

    const extractContent = (item: SavedItem): string => {
        const mainContent =
            item.content.leftContent || item.content.rightContent || JSON.stringify(item.content);
        return typeof mainContent === 'string' ? mainContent : JSON.stringify(mainContent);
    };

    return (
        <SavedTab
            pageName="text"
            queryKey="text"
            toolMapping={toolMapping}
            tabMapping={tabMapping}
            storageKeyMapping={storageKeyMapping}
            extractContent={extractContent}
            onTabChange={onTabChange}
        />
    );
}
