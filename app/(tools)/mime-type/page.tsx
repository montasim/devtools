'use client';

import { lazy, type ComponentType } from 'react';
import { FileText, Search } from 'lucide-react';
import { ToolPage } from '@/features/tools/core/components/tool-page';
import { createSharedTabPlugin } from '@/features/tools/core/plugins/shared';
import { createSavedTabPlugin } from '@/features/tools/core/plugins/saved';
import { createHistoryTabPlugin } from '@/features/tools/core/plugins/history';
import { registerTool } from '@/features/tools/core/config/tool-registry';
import { STORAGE_KEYS } from '@/lib/utils/constants';
import type { TabComponentProps } from '@/features/tools/core/types/tool';

const ReferenceTab = lazy(
    () => import('@/features/tools/mime-type/tabs/reference-tab'),
) as unknown as ComponentType<TabComponentProps>;

const MIME_COLOR = 'bg-fuchsia-100 text-fuchsia-700 dark:bg-fuchsia-900 dark:text-fuchsia-300';

const toolMapping = {
    reference: {
        name: 'MIME Type Reference',
        icon: FileText,
        color: MIME_COLOR,
    },
};

const MIME_TYPE_TOOL = registerToolAndGet();

function registerToolAndGet() {
    const definition = {
        pageName: 'mime-type',
        label: 'MIME Type Reference',
        icon: FileText,
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
                pageName: 'mime-type',
                queryKey: 'mime-type-saved',
                toolMapping,
                tabMapping: { reference: 'reference' },
                storageKeyMapping: {
                    reference: STORAGE_KEYS.MIME_TYPE_SEARCH,
                },
            }),
            shared: createSharedTabPlugin({
                pageName: 'mime-type',
                queryKey: 'mime-type-shared',
                toolMapping,
                tabMapping: { reference: 'reference' },
            }),
            history: createHistoryTabPlugin({
                pageName: 'mime-type',
                storageKeyFilter: (key) => key.startsWith('mime-type-'),
                toolMapping,
                tabMapping: { reference: 'reference' },
            }),
        },
    };

    registerTool(definition);
    return definition;
}

export default function MimeTypePage() {
    return <ToolPage definition={MIME_TYPE_TOOL} />;
}
