'use client';

import { lazy, type ComponentType } from 'react';
import { Monitor, Search, BarChart3 } from 'lucide-react';
import { ToolPage } from '@/features/tools/core/components/tool-page';
import { createSharedTabPlugin } from '@/features/tools/core/plugins/shared';
import { createSavedTabPlugin } from '@/features/tools/core/plugins/saved';
import { createHistoryTabPlugin } from '@/features/tools/core/plugins/history';
import { registerTool } from '@/features/tools/core/config/tool-registry';
import { STORAGE_KEYS } from '@/lib/utils/constants';
import type { TabComponentProps } from '@/features/tools/core/types/tool';

const AnalyzerTab = lazy(
    () => import('@/features/tools/user-agent/tabs/analyzer-tab'),
) as unknown as ComponentType<TabComponentProps>;

const StatsTab = lazy(
    () => import('@/features/tools/user-agent/tabs/stats-tab'),
) as unknown as ComponentType<TabComponentProps>;

const UA_COLOR = 'bg-violet-100 text-violet-700 dark:bg-violet-900 dark:text-violet-300';

const toolMapping = {
    analyzer: {
        name: 'User Agent Analyzer',
        icon: Monitor,
        color: UA_COLOR,
    },
    'sample-data': {
        name: 'Sample Data',
        icon: BarChart3,
        color: UA_COLOR,
    },
};

const USER_AGENT_TOOL = registerToolAndGet();

function registerToolAndGet() {
    const definition = {
        pageName: 'user-agent',
        label: 'User Agent Analyzer',
        icon: Monitor,
        defaultTab: 'analyzer',
        mainTabs: [
            {
                id: 'analyzer',
                label: 'Analyzer',
                icon: Search,
                component: AnalyzerTab,
                contentType: 'text' as const,
            },
            {
                id: 'sample-data',
                label: 'Sample Data',
                icon: BarChart3,
                component: StatsTab,
                contentType: 'text' as const,
            },
        ],
        plugins: {
            saved: createSavedTabPlugin({
                pageName: 'user-agent',
                queryKey: 'user-agent-saved',
                toolMapping,
                tabMapping: { analyzer: 'analyzer', 'sample-data': 'sample-data' },
                storageKeyMapping: {
                    analyzer: STORAGE_KEYS.USER_AGENT_INPUT,
                },
            }),
            shared: createSharedTabPlugin({
                pageName: 'user-agent',
                queryKey: 'user-agent-shared',
                toolMapping,
                tabMapping: { analyzer: 'analyzer', 'sample-data': 'sample-data' },
            }),
            history: createHistoryTabPlugin({
                pageName: 'user-agent',
                storageKeyFilter: (key) => key.startsWith('user-agent-'),
                toolMapping,
                tabMapping: { analyzer: 'analyzer', 'sample-data': 'sample-data' },
            }),
        },
    };

    registerTool(definition);
    return definition;
}

export default function UserAgentPage() {
    return <ToolPage definition={USER_AGENT_TOOL} />;
}
