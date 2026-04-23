'use client';

import { lazy, type ComponentType } from 'react';
import { Plug } from 'lucide-react';
import { ToolPage } from '@/features/tools/core/components/tool-page';
import { createSharedTabPlugin } from '@/features/tools/core/plugins/shared';
import { createSavedTabPlugin } from '@/features/tools/core/plugins/saved';
import { createHistoryTabPlugin } from '@/features/tools/core/plugins/history';
import { registerTool } from '@/features/tools/core/config/tool-registry';
import { STORAGE_KEYS } from '@/lib/utils/constants';
import type { TabComponentProps } from '@/features/tools/core/types/tool';

const TesterTab = lazy(
    () => import('@/features/tools/websocket/tabs/tester-tab'),
) as unknown as ComponentType<TabComponentProps>;

const TESTER_COLOR = 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900 dark:text-cyan-300';

const toolMapping = {
    tester: {
        name: 'WebSocket Tester',
        icon: Plug,
        color: TESTER_COLOR,
    },
};

const WEBSOCKET_TOOL = registerToolAndGet();

function registerToolAndGet() {
    const definition = {
        pageName: 'websocket',
        label: 'WebSocket Tester',
        icon: Plug,
        defaultTab: 'tester',
        mainTabs: [
            {
                id: 'tester',
                label: 'Test',
                icon: Plug,
                component: TesterTab,
                contentType: 'text' as const,
            },
        ],
        plugins: {
            saved: createSavedTabPlugin({
                pageName: 'websocket',
                queryKey: 'websocket-saved',
                toolMapping,
                tabMapping: { tester: 'tester' },
                storageKeyMapping: {
                    tester: STORAGE_KEYS.WEBSOCKET_TESTER_URL,
                },
            }),
            shared: createSharedTabPlugin({
                pageName: 'websocket',
                queryKey: 'websocket-shared',
                toolMapping,
                tabMapping: { tester: 'tester' },
            }),
            history: createHistoryTabPlugin({
                pageName: 'websocket',
                storageKeyFilter: (key) => key.startsWith('websocket-'),
                toolMapping,
                tabMapping: { tester: 'tester' },
            }),
        },
    };

    registerTool(definition);
    return definition;
}

export default function WebSocketPage() {
    return <ToolPage definition={WEBSOCKET_TOOL} />;
}
