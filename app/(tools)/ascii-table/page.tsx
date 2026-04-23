'use client';

import { lazy, type ComponentType } from 'react';
import { Table, Search } from 'lucide-react';
import { ToolPage } from '@/features/tools/core/components/tool-page';
import { createSharedTabPlugin } from '@/features/tools/core/plugins/shared';
import { createSavedTabPlugin } from '@/features/tools/core/plugins/saved';
import { createHistoryTabPlugin } from '@/features/tools/core/plugins/history';
import { registerTool } from '@/features/tools/core/config/tool-registry';
import { STORAGE_KEYS } from '@/lib/utils/constants';
import type { TabComponentProps } from '@/features/tools/core/types/tool';

const ReferenceTab = lazy(
    () => import('@/features/tools/ascii-table/tabs/reference-tab'),
) as unknown as ComponentType<TabComponentProps>;

const REFERENCE_COLOR = 'bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300';

const toolMapping = {
    reference: {
        name: 'ASCII Table',
        icon: Table,
        color: REFERENCE_COLOR,
    },
};

const ASCII_TABLE_TOOL = registerToolAndGet();

function registerToolAndGet() {
    const definition = {
        pageName: 'ascii-table',
        label: 'ASCII Table',
        icon: Table,
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
                pageName: 'ascii-table',
                queryKey: 'ascii-table-saved',
                toolMapping,
                tabMapping: { reference: 'reference' },
                storageKeyMapping: {
                    reference: STORAGE_KEYS.ASCII_TABLE_SEARCH,
                },
            }),
            shared: createSharedTabPlugin({
                pageName: 'ascii-table',
                queryKey: 'ascii-table-shared',
                toolMapping,
                tabMapping: { reference: 'reference' },
            }),
            history: createHistoryTabPlugin({
                pageName: 'ascii-table',
                storageKeyFilter: (key) => key.startsWith('ascii-table-'),
                toolMapping,
                tabMapping: { reference: 'reference' },
            }),
        },
    };

    registerTool(definition);
    return definition;
}

export default function AsciiTablePage() {
    return <ToolPage definition={ASCII_TABLE_TOOL} />;
}
