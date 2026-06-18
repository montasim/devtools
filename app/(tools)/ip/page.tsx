'use client';

import { lazy, type ComponentType } from 'react';
import { Network, Search, Calculator } from 'lucide-react';
import { ToolPage } from '@/features/tools/core/components/tool-page';
import { createSavedTabPlugin } from '@/features/tools/core/plugins/saved';
import { createSharedTabPlugin } from '@/features/tools/core/plugins/shared';
import { createHistoryTabPlugin } from '@/features/tools/core/plugins/history';
import { registerTool } from '@/features/tools/core/config/tool-registry';
import { STORAGE_KEYS } from '@/lib/utils/constants';
import type { TabComponentProps } from '@/features/tools/core/types/tool';

const AnalyzeTab = lazy(
    () => import('@/features/tools/ip/tabs/analyze-tab'),
) as unknown as ComponentType<TabComponentProps>;

const CalculatorTab = lazy(
    () => import('@/features/tools/ip/tabs/calculator-tab'),
) as unknown as ComponentType<TabComponentProps>;

const IP_COLOR = 'bg-sky-100 text-sky-700 dark:bg-sky-900 dark:text-sky-300';

const toolMapping = {
    analyze: {
        name: 'IP Analyzer',
        icon: Search,
        color: IP_COLOR,
    },
    calculator: {
        name: 'CIDR Calculator',
        icon: Calculator,
        color: IP_COLOR,
    },
};

const IP_TOOL = registerToolAndGet();

function registerToolAndGet() {
    const definition = {
        pageName: 'ip',
        label: 'IP & CIDR Tools',
        icon: Network,
        defaultTab: 'analyze',
        mainTabs: [
            {
                id: 'analyze',
                label: 'Analyze',
                icon: Search,
                component: AnalyzeTab,
                contentType: 'text' as const,
            },
            {
                id: 'calculator',
                label: 'Calculator',
                icon: Calculator,
                component: CalculatorTab,
                contentType: 'text' as const,
            },
        ],
        plugins: {
            saved: createSavedTabPlugin({
                pageName: 'ip',
                queryKey: 'ip-saved',
                toolMapping,
                tabMapping: { analyze: 'analyze', calculator: 'calculator' },
                storageKeyMapping: {
                    analyze: STORAGE_KEYS.IP_ANALYZE_INPUT,
                    calculator: STORAGE_KEYS.IP_CIDR_INPUT,
                },
            }),
            shared: createSharedTabPlugin({
                pageName: 'ip',
                queryKey: 'ip-shared',
                toolMapping,
                tabMapping: { analyze: 'analyze', calculator: 'calculator' },
            }),
            history: createHistoryTabPlugin({
                pageName: 'ip',
                storageKeyFilter: (key) => key.startsWith('ip-'),
                toolMapping,
                tabMapping: { analyze: 'analyze', calculator: 'calculator' },
            }),
        },
    };

    registerTool(definition);
    return definition;
}

export default function IpPage() {
    return <ToolPage definition={IP_TOOL} />;
}
