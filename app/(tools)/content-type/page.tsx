'use client';

import { lazy, type ComponentType } from 'react';
import { FileCode, Search } from 'lucide-react';
import { ToolPage } from '@/features/tools/core/components/tool-page';
import { createSharedTabPlugin } from '@/features/tools/core/plugins/shared';
import { createSavedTabPlugin } from '@/features/tools/core/plugins/saved';
import { createHistoryTabPlugin } from '@/features/tools/core/plugins/history';
import { registerTool } from '@/features/tools/core/config/tool-registry';
import { STORAGE_KEYS } from '@/lib/utils/constants';
import type { TabComponentProps } from '@/features/tools/core/types/tool';

const ReferenceTab = lazy(
    () => import('@/features/tools/content-type/tabs/reference-tab'),
) as unknown as ComponentType<TabComponentProps>;

const TOOL_COLOR = 'bg-sky-100 text-sky-700 dark:bg-sky-900 dark:text-sky-300';

const toolMapping = {
    reference: {
        name: 'Content-Type Reference',
        icon: FileCode,
        color: TOOL_COLOR,
    },
};

const CONTENT_TYPE_TOOL = registerToolAndGet();

function registerToolAndGet() {
    const definition = {
        pageName: 'content-type',
        label: 'Content-Type Reference',
        icon: FileCode,
        defaultTab: 'reference',
        mainTabs: [
            {
                id: 'reference',
                label: 'Reference',
                icon: Search,
                component: ReferenceTab,
                contentType: 'text' as const,
            },
        ],
        plugins: {
            saved: createSavedTabPlugin({
                pageName: 'content-type',
                queryKey: 'content-type-saved',
                toolMapping,
                tabMapping: { reference: 'reference' },
                storageKeyMapping: {
                    reference: STORAGE_KEYS.CONTENT_TYPE_SEARCH,
                },
            }),
            shared: createSharedTabPlugin({
                pageName: 'content-type',
                queryKey: 'content-type-shared',
                toolMapping,
                tabMapping: { reference: 'reference' },
            }),
            history: createHistoryTabPlugin({
                pageName: 'content-type',
                storageKeyFilter: (key) => key.startsWith('content-type-'),
                toolMapping,
                tabMapping: { reference: 'reference' },
            }),
        },
    };

    registerTool(definition);
    return definition;
}

export default function ContentTypePage() {
    return <ToolPage definition={CONTENT_TYPE_TOOL} />;
}
