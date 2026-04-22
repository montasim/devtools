'use client';

import { lazy, type ComponentType } from 'react';
import { FileText } from 'lucide-react';
import { ToolPage } from '@/features/tools/core/components/tool-page';
import { createSharedTabPlugin } from '@/features/tools/core/plugins/shared';
import { createSavedTabPlugin } from '@/features/tools/core/plugins/saved';
import { createHistoryTabPlugin } from '@/features/tools/core/plugins/history';
import { registerTool } from '@/features/tools/core/config/tool-registry';
import { STORAGE_KEYS } from '@/lib/utils/constants';
import type { TabComponentProps } from '@/features/tools/core/types/tool';

const PreviewTab = lazy(
    () => import('@/features/tools/markdown/tabs/preview-tab'),
) as unknown as ComponentType<TabComponentProps>;

const MARKDOWN_COLOR = 'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300';

const toolMapping = {
    preview: {
        name: 'Markdown Preview',
        icon: FileText,
        color: MARKDOWN_COLOR,
    },
};

const MARKDOWN_TOOL = registerToolAndGet();

function registerToolAndGet() {
    const definition = {
        pageName: 'markdown',
        label: 'Markdown Preview',
        icon: FileText,
        defaultTab: 'preview',
        mainTabs: [
            {
                id: 'preview',
                label: 'Preview',
                icon: FileText,
                component: PreviewTab,
                contentType: 'text' as const,
            },
        ],
        plugins: {
            saved: createSavedTabPlugin({
                pageName: 'markdown',
                queryKey: 'markdown-saved',
                toolMapping,
                tabMapping: { preview: 'preview' },
                storageKeyMapping: {
                    preview: STORAGE_KEYS.MARKDOWN_PREVIEW_INPUT,
                },
            }),
            shared: createSharedTabPlugin({
                pageName: 'markdown',
                queryKey: 'markdown-shared',
                toolMapping,
                tabMapping: { preview: 'preview' },
            }),
            history: createHistoryTabPlugin({
                pageName: 'markdown',
                storageKeyFilter: (key) => key.startsWith('markdown-'),
                toolMapping,
                tabMapping: { preview: 'preview' },
            }),
        },
    };

    registerTool(definition);
    return definition;
}

export default function MarkdownPage() {
    return <ToolPage definition={MARKDOWN_TOOL} />;
}
