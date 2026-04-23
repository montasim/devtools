'use client';

import { lazy, type ComponentType } from 'react';
import { Languages, Search } from 'lucide-react';
import { ToolPage } from '@/features/tools/core/components/tool-page';
import { createSharedTabPlugin } from '@/features/tools/core/plugins/shared';
import { createSavedTabPlugin } from '@/features/tools/core/plugins/saved';
import { createHistoryTabPlugin } from '@/features/tools/core/plugins/history';
import { registerTool } from '@/features/tools/core/config/tool-registry';
import { STORAGE_KEYS } from '@/lib/utils/constants';
import type { TabComponentProps } from '@/features/tools/core/types/tool';

const LookupTab = lazy(
    () => import('@/features/tools/unicode/tabs/lookup-tab'),
) as unknown as ComponentType<TabComponentProps>;

const LOOKUP_COLOR = 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300';

const toolMapping = {
    lookup: {
        name: 'Unicode Lookup',
        icon: Languages,
        color: LOOKUP_COLOR,
    },
};

const UNICODE_TOOL = registerToolAndGet();

function registerToolAndGet() {
    const definition = {
        pageName: 'unicode',
        label: 'Unicode Lookup',
        icon: Languages,
        defaultTab: 'lookup',
        mainTabs: [
            {
                id: 'lookup',
                label: 'Lookup',
                icon: Search,
                component: LookupTab,
                contentType: 'text' as const,
            },
        ],
        plugins: {
            saved: createSavedTabPlugin({
                pageName: 'unicode',
                queryKey: 'unicode-saved',
                toolMapping,
                tabMapping: { lookup: 'lookup' },
                storageKeyMapping: {
                    lookup: STORAGE_KEYS.UNICODE_SEARCH,
                },
            }),
            shared: createSharedTabPlugin({
                pageName: 'unicode',
                queryKey: 'unicode-shared',
                toolMapping,
                tabMapping: { lookup: 'lookup' },
            }),
            history: createHistoryTabPlugin({
                pageName: 'unicode',
                storageKeyFilter: (key) => key.startsWith('unicode-'),
                toolMapping,
                tabMapping: { lookup: 'lookup' },
            }),
        },
    };

    registerTool(definition);
    return definition;
}

export default function UnicodePage() {
    return <ToolPage definition={UNICODE_TOOL} />;
}
