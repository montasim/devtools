'use client';

import { lazy, type ComponentType } from 'react';
import { Globe, Search } from 'lucide-react';
import { ToolPage } from '@/features/tools/core/components/tool-page';
import { createSharedTabPlugin } from '@/features/tools/core/plugins/shared';
import { createSavedTabPlugin } from '@/features/tools/core/plugins/saved';
import { createHistoryTabPlugin } from '@/features/tools/core/plugins/history';
import { registerTool } from '@/features/tools/core/config/tool-registry';
import { STORAGE_KEYS } from '@/lib/utils/constants';
import type { TabComponentProps } from '@/features/tools/core/types/tool';

const ReferenceTab = lazy(
    () => import('@/features/tools/http-status/tabs/reference-tab'),
) as unknown as ComponentType<TabComponentProps>;

const HTTP_STATUS_COLOR = 'bg-sky-100 text-sky-700 dark:bg-sky-900 dark:text-sky-300';

const toolMapping = {
    reference: {
        name: 'HTTP Status Codes',
        icon: Globe,
        color: HTTP_STATUS_COLOR,
    },
};

const HTTP_STATUS_TOOL = registerToolAndGet();

function registerToolAndGet() {
    const definition = {
        pageName: 'http-status',
        label: 'HTTP Status Codes',
        icon: Globe,
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
                pageName: 'http-status',
                queryKey: 'http-status-saved',
                toolMapping,
                tabMapping: { reference: 'reference' },
                storageKeyMapping: {
                    reference: STORAGE_KEYS.HTTP_STATUS_SEARCH,
                },
            }),
            shared: createSharedTabPlugin({
                pageName: 'http-status',
                queryKey: 'http-status-shared',
                toolMapping,
                tabMapping: { reference: 'reference' },
            }),
            history: createHistoryTabPlugin({
                pageName: 'http-status',
                storageKeyFilter: (key) => key.startsWith('http-status-'),
                toolMapping,
                tabMapping: { reference: 'reference' },
            }),
        },
    };

    registerTool(definition);
    return definition;
}

export default function HttpStatusPage() {
    return <ToolPage definition={HTTP_STATUS_TOOL} />;
}
