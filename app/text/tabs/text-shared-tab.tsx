'use client';

import { FileText } from 'lucide-react';
import { SharedTab } from '@/components/shared/shared-tab';

interface SharedTabProps {
    onTabChange: (tab: string) => void;
}

export function TextSharedTab({ onTabChange }: SharedTabProps) {
    const toolMapping = {
        'Text Diff': {
            name: 'Diff',
            icon: FileText,
            color: 'text-blue-500',
        },
        'Text Convert': {
            name: 'Convert',
            icon: FileText,
            color: 'text-green-500',
        },
        'Text Clean': {
            name: 'Clean',
            icon: FileText,
            color: 'text-purple-500',
        },
    };

    const tabMapping: Record<string, string> = {
        'Text Diff': 'diff',
        'Text Convert': 'convert',
        'Text Clean': 'clean',
    };

    return (
        <SharedTab
            pageName="text"
            queryKey="text"
            toolMapping={toolMapping}
            tabMapping={tabMapping}
            onTabChange={onTabChange}
        />
    );
}
