'use client';

import { Share2, Code, Minimize2, Eye, FileJson, FileDown, Bookmark } from 'lucide-react';
import { SharedTab } from '@/components/shared/shared-tab';

interface SharedTabProps {
    onTabChange: (tab: string) => void;
}

export function JsonShareTab({ onTabChange }: SharedTabProps) {
    const toolMapping = {
        'JSON Diff': { name: 'Diff', icon: Share2, color: 'text-blue-500' },
        'JSON Format': { name: 'Format', icon: Code, color: 'text-green-500' },
        'JSON Minify': { name: 'Minify', icon: Minimize2, color: 'text-purple-500' },
        'JSON Viewer': { name: 'Viewer', icon: Eye, color: 'text-orange-500' },
        'JSON Parser': { name: 'Parser', icon: FileJson, color: 'text-pink-500' },
        'JSON Export': { name: 'Export', icon: FileDown, color: 'text-indigo-500' },
        'JSON Schema': { name: 'Schema', icon: Bookmark, color: 'text-teal-500' },
    };

    const tabMapping: Record<string, string> = {
        'JSON Diff': 'diff',
        'JSON Format': 'format',
        'JSON Minify': 'minify',
        'JSON Viewer': 'viewer',
        'JSON Parser': 'parser',
        'JSON Export': 'export',
        'JSON Schema': 'schema',
    };

    return (
        <SharedTab
            pageName="json"
            queryKey="json"
            toolMapping={toolMapping}
            tabMapping={tabMapping}
            onTabChange={onTabChange}
        />
    );
}
