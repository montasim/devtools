'use client';

import { lazy, type ComponentType } from 'react';
import { Globe2, Clock, Database, Search } from 'lucide-react';
import { ToolPage } from '@/features/tools/core/components/tool-page';
import { createSharedTabPlugin } from '@/features/tools/core/plugins/shared';
import { createSavedTabPlugin } from '@/features/tools/core/plugins/saved';
import { createHistoryTabPlugin } from '@/features/tools/core/plugins/history';
import { registerTool } from '@/features/tools/core/config/tool-registry';
import { STORAGE_KEYS } from '@/lib/utils/constants';
import type { TabComponentProps } from '@/features/tools/core/types/tool';

const WorldClockTab = lazy(
    () => import('@/features/tools/timezones/tabs/world-clock-tab'),
) as unknown as ComponentType<TabComponentProps>;

const BrowserTab = lazy(
    () => import('@/features/tools/timezones/tabs/browser-tab'),
) as unknown as ComponentType<TabComponentProps>;

const TIMEZONES_COLOR = 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300';

const toolMapping = {
    'world-clock': {
        name: 'World Clock',
        icon: Clock,
        color: TIMEZONES_COLOR,
    },
    browser: {
        name: 'Timezone Browser',
        icon: Database,
        color: TIMEZONES_COLOR,
    },
};

const TIMEZONES_TOOL = registerToolAndGet();

function registerToolAndGet() {
    const definition = {
        pageName: 'timezones',
        label: 'Timezones',
        icon: Globe2,
        defaultTab: 'world-clock',
        mainTabs: [
            {
                id: 'world-clock',
                label: 'World Clock',
                icon: Clock,
                component: WorldClockTab,
                contentType: 'text' as const,
            },
            {
                id: 'browser',
                label: 'Browser',
                icon: Search,
                component: BrowserTab,
                contentType: 'text' as const,
            },
        ],
        plugins: {
            saved: createSavedTabPlugin({
                pageName: 'timezones',
                queryKey: 'timezones-saved',
                toolMapping,
                tabMapping: { 'world-clock': 'world-clock', browser: 'browser' },
                storageKeyMapping: {
                    'world-clock': STORAGE_KEYS.TIMEZONES_INPUT,
                },
            }),
            shared: createSharedTabPlugin({
                pageName: 'timezones',
                queryKey: 'timezones-shared',
                toolMapping,
                tabMapping: { 'world-clock': 'world-clock', browser: 'browser' },
            }),
            history: createHistoryTabPlugin({
                pageName: 'timezones',
                storageKeyFilter: (key: string) => key.startsWith('timezones-'),
                toolMapping,
                tabMapping: { 'world-clock': 'world-clock', browser: 'browser' },
            }),
        },
    };

    registerTool(definition);
    return definition;
}

export default function TimezonesPage() {
    return <ToolPage definition={TIMEZONES_TOOL} />;
}
