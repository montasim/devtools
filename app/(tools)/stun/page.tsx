'use client';

import { lazy, type ComponentType } from 'react';
import { Radio } from 'lucide-react';
import { ToolPage } from '@/features/tools/core/components/tool-page';
import { createSharedTabPlugin } from '@/features/tools/core/plugins/shared';
import { createSavedTabPlugin } from '@/features/tools/core/plugins/saved';
import { createHistoryTabPlugin } from '@/features/tools/core/plugins/history';
import { registerTool } from '@/features/tools/core/config/tool-registry';
import { STORAGE_KEYS } from '@/lib/utils/constants';
import type { TabComponentProps } from '@/features/tools/core/types/tool';

const CheckerTab = lazy(
    () => import('@/features/tools/stun/tabs/checker-tab'),
) as unknown as ComponentType<TabComponentProps>;

const CHECKER_COLOR = 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300';

const toolMapping = {
    checker: {
        name: 'STUN Checker',
        icon: Radio,
        color: CHECKER_COLOR,
    },
};

const STUN_TOOL = registerToolAndGet();

function registerToolAndGet() {
    const definition = {
        pageName: 'stun',
        label: 'STUN Server Checker',
        icon: Radio,
        defaultTab: 'checker',
        mainTabs: [
            {
                id: 'checker',
                label: 'Check',
                icon: Radio,
                component: CheckerTab,
                contentType: 'text' as const,
            },
        ],
        plugins: {
            saved: createSavedTabPlugin({
                pageName: 'stun',
                queryKey: 'stun-saved',
                toolMapping,
                tabMapping: { checker: 'checker' },
                storageKeyMapping: {
                    checker: STORAGE_KEYS.STUN_CHECKER_URL,
                },
            }),
            shared: createSharedTabPlugin({
                pageName: 'stun',
                queryKey: 'stun-shared',
                toolMapping,
                tabMapping: { checker: 'checker' },
            }),
            history: createHistoryTabPlugin({
                pageName: 'stun',
                storageKeyFilter: (key) => key.startsWith('stun-'),
                toolMapping,
                tabMapping: { checker: 'checker' },
            }),
        },
    };

    registerTool(definition);
    return definition;
}

export default function StunPage() {
    return <ToolPage definition={STUN_TOOL} />;
}
