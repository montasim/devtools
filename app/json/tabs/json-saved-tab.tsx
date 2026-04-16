'use client';

import { GitCompare, Code, Minimize2, FileJson, FileDown, Bookmark } from 'lucide-react';
import { SavedTab, type SavedItem } from '@/components/shared/saved-tab';

interface SavedTabProps {
    onTabChange: (tab: string) => void;
}

export function JsonSavedTab({ onTabChange }: SavedTabProps) {
    const toolMapping = {
        'JSON Diff': { name: 'Diff', icon: GitCompare, color: 'text-blue-500' },
        'JSON Format': { name: 'Format', icon: Code, color: 'text-green-500' },
        'JSON Minify': { name: 'Minify', icon: Minimize2, color: 'text-purple-500' },
        'JSON Viewer': { name: 'Viewer', icon: FileJson, color: 'text-orange-500' },
        'JSON Parser': { name: 'Parser', icon: Bookmark, color: 'text-pink-500' },
        'JSON Export': { name: 'Export', icon: FileDown, color: 'text-indigo-500' },
    };

    const tabMapping: Record<string, string> = {
        'JSON Diff': 'diff',
        'JSON Format': 'format',
        'JSON Minify': 'minify',
        'JSON Viewer': 'viewer',
        'JSON Parser': 'parser',
        'JSON Export': 'export',
    };

    const storageKeyMapping: Record<string, string> = {
        'JSON Diff': 'json-diff-left-input',
        'JSON Format': 'json-format-input',
        'JSON Minify': 'json-minify-input',
        'JSON Viewer': 'json-viewer-input',
        'JSON Parser': 'json-parser-input',
        'JSON Export': 'json-export-input',
    };

    const extractContent = (item: SavedItem): string => {
        const mainContent =
            item.content.leftContent || item.content.rightContent || JSON.stringify(item.content);
        return typeof mainContent === 'string' ? mainContent : JSON.stringify(mainContent);
    };

    return (
        <SavedTab
            pageName="json"
            queryKey="json"
            toolMapping={toolMapping}
            tabMapping={tabMapping}
            storageKeyMapping={storageKeyMapping}
            extractContent={extractContent}
            onTabChange={onTabChange}
        />
    );
}
