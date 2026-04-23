'use client';

import { lazy, type ComponentType } from 'react';
import { Send, Zap } from 'lucide-react';
import { ToolPage } from '@/features/tools/core/components/tool-page';
import { createSharedTabPlugin } from '@/features/tools/core/plugins/shared';
import { createSavedTabPlugin } from '@/features/tools/core/plugins/saved';
import { createHistoryTabPlugin } from '@/features/tools/core/plugins/history';
import { registerTool } from '@/features/tools/core/config/tool-registry';
import { STORAGE_KEYS } from '@/lib/utils/constants';
import type { TabComponentProps } from '@/features/tools/core/types/tool';

const BuilderTab = lazy(
    () => import('@/features/tools/api-builder/tabs/builder-tab'),
) as unknown as ComponentType<TabComponentProps>;

const BUILDER_COLOR = 'bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300';

const toolMapping = {
    builder: {
        name: 'API Request Builder',
        icon: Send,
        color: BUILDER_COLOR,
    },
};

const API_BUILDER_TOOL = registerToolAndGet();

function registerToolAndGet() {
    const definition = {
        pageName: 'api-builder',
        label: 'API Request Builder',
        icon: Zap,
        defaultTab: 'builder',
        mainTabs: [
            {
                id: 'builder',
                label: 'Request',
                icon: Send,
                component: BuilderTab,
                contentType: 'text' as const,
            },
        ],
        plugins: {
            saved: createSavedTabPlugin({
                pageName: 'api-builder',
                queryKey: 'api-builder-saved',
                toolMapping,
                tabMapping: { builder: 'builder' },
                storageKeyMapping: {
                    builder: STORAGE_KEYS.API_BUILDER_STATE,
                },
            }),
            shared: createSharedTabPlugin({
                pageName: 'api-builder',
                queryKey: 'api-builder-shared',
                toolMapping,
                tabMapping: { builder: 'builder' },
            }),
            history: createHistoryTabPlugin({
                pageName: 'api-builder',
                storageKeyFilter: (key) => key.startsWith('api-builder-'),
                toolMapping,
                tabMapping: { builder: 'builder' },
            }),
        },
    };

    registerTool(definition);
    return definition;
}

export default function ApiBuilderPage() {
    return <ToolPage definition={API_BUILDER_TOOL} />;
}
