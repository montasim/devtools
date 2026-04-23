'use client';

import { lazy, type ComponentType } from 'react';
import { Clock, Settings } from 'lucide-react';
import { ToolPage } from '@/features/tools/core/components/tool-page';
import { createSharedTabPlugin } from '@/features/tools/core/plugins/shared';
import { createSavedTabPlugin } from '@/features/tools/core/plugins/saved';
import { createHistoryTabPlugin } from '@/features/tools/core/plugins/history';
import { registerTool } from '@/features/tools/core/config/tool-registry';
import { STORAGE_KEYS } from '@/lib/utils/constants';
import type { TabComponentProps } from '@/features/tools/core/types/tool';

const BuilderTab = lazy(
    () => import('@/features/tools/cron/tabs/builder-tab'),
) as unknown as ComponentType<TabComponentProps>;

const BUILDER_COLOR = 'bg-teal-100 text-teal-700 dark:bg-teal-900 dark:text-teal-300';

const toolMapping = {
    builder: {
        name: 'CRON Builder',
        icon: Clock,
        color: BUILDER_COLOR,
    },
};

const CRON_TOOL = registerToolAndGet();

function registerToolAndGet() {
    const definition = {
        pageName: 'cron',
        label: 'CRON Expression Builder',
        icon: Clock,
        defaultTab: 'builder',
        mainTabs: [
            {
                id: 'builder',
                label: 'Builder',
                icon: Settings,
                component: BuilderTab,
                contentType: 'text' as const,
            },
        ],
        plugins: {
            saved: createSavedTabPlugin({
                pageName: 'cron',
                queryKey: 'cron-saved',
                toolMapping,
                tabMapping: { builder: 'builder' },
                storageKeyMapping: {
                    builder: STORAGE_KEYS.CRON_BUILDER_CONFIG,
                },
            }),
            shared: createSharedTabPlugin({
                pageName: 'cron',
                queryKey: 'cron-shared',
                toolMapping,
                tabMapping: { builder: 'builder' },
            }),
            history: createHistoryTabPlugin({
                pageName: 'cron',
                storageKeyFilter: (key) => key.startsWith('cron-'),
                toolMapping,
                tabMapping: { builder: 'builder' },
            }),
        },
    };

    registerTool(definition);
    return definition;
}

export default function CronPage() {
    return <ToolPage definition={CRON_TOOL} />;
}
