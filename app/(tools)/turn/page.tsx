'use client';

import { lazy, type ComponentType } from 'react';
import { Route } from 'lucide-react';
import { ToolPage } from '@/features/tools/core/components/tool-page';
import { createSharedTabPlugin } from '@/features/tools/core/plugins/shared';
import { createSavedTabPlugin } from '@/features/tools/core/plugins/saved';
import { createHistoryTabPlugin } from '@/features/tools/core/plugins/history';
import { registerTool } from '@/features/tools/core/config/tool-registry';
import { STORAGE_KEYS } from '@/lib/utils/constants';
import type { TabComponentProps } from '@/features/tools/core/types/tool';

const CheckerTab = lazy(
    () => import('@/features/tools/turn/tabs/checker-tab'),
) as unknown as ComponentType<TabComponentProps>;

const CHECKER_COLOR = 'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300';

const toolMapping = {
    checker: {
        name: 'TURN Checker',
        icon: Route,
        color: CHECKER_COLOR,
    },
};

const TURN_TOOL = registerToolAndGet();

function registerToolAndGet() {
    const definition = {
        pageName: 'turn',
        label: 'TURN Server Checker',
        icon: Route,
        defaultTab: 'checker',
        mainTabs: [
            {
                id: 'checker',
                label: 'Check',
                icon: Route,
                component: CheckerTab,
                contentType: 'text' as const,
            },
        ],
        plugins: {
            saved: createSavedTabPlugin({
                pageName: 'turn',
                queryKey: 'turn-saved',
                toolMapping,
                tabMapping: { checker: 'checker' },
                storageKeyMapping: {
                    checker: STORAGE_KEYS.TURN_CHECKER_URL,
                },
            }),
            shared: createSharedTabPlugin({
                pageName: 'turn',
                queryKey: 'turn-shared',
                toolMapping,
                tabMapping: { checker: 'checker' },
            }),
            history: createHistoryTabPlugin({
                pageName: 'turn',
                storageKeyFilter: (key) => key.startsWith('turn-'),
                toolMapping,
                tabMapping: { checker: 'checker' },
            }),
        },
    };

    registerTool(definition);
    return definition;
}

export default function TurnPage() {
    return <ToolPage definition={TURN_TOOL} />;
}
