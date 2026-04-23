'use client';

import { lazy, type ComponentType } from 'react';
import { ShieldCheck } from 'lucide-react';
import { ToolPage } from '@/features/tools/core/components/tool-page';
import { createSharedTabPlugin } from '@/features/tools/core/plugins/shared';
import { createSavedTabPlugin } from '@/features/tools/core/plugins/saved';
import { createHistoryTabPlugin } from '@/features/tools/core/plugins/history';
import { registerTool } from '@/features/tools/core/config/tool-registry';
import { STORAGE_KEYS } from '@/lib/utils/constants';
import type { TabComponentProps } from '@/features/tools/core/types/tool';

const CheckerTab = lazy(
    () => import('@/features/tools/cors/tabs/checker-tab'),
) as unknown as ComponentType<TabComponentProps>;

const CHECKER_COLOR = 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300';

const toolMapping = {
    checker: {
        name: 'CORS Checker',
        icon: ShieldCheck,
        color: CHECKER_COLOR,
    },
};

const CORS_TOOL = registerToolAndGet();

function registerToolAndGet() {
    const definition = {
        pageName: 'cors',
        label: 'CORS Checker',
        icon: ShieldCheck,
        defaultTab: 'checker',
        mainTabs: [
            {
                id: 'checker',
                label: 'Check',
                icon: ShieldCheck,
                component: CheckerTab,
                contentType: 'text' as const,
            },
        ],
        plugins: {
            saved: createSavedTabPlugin({
                pageName: 'cors',
                queryKey: 'cors-saved',
                toolMapping,
                tabMapping: { checker: 'checker' },
                storageKeyMapping: {
                    checker: STORAGE_KEYS.CORS_CHECKER_URL,
                },
            }),
            shared: createSharedTabPlugin({
                pageName: 'cors',
                queryKey: 'cors-shared',
                toolMapping,
                tabMapping: { checker: 'checker' },
            }),
            history: createHistoryTabPlugin({
                pageName: 'cors',
                storageKeyFilter: (key) => key.startsWith('cors-'),
                toolMapping,
                tabMapping: { checker: 'checker' },
            }),
        },
    };

    registerTool(definition);
    return definition;
}

export default function CorsPage() {
    return <ToolPage definition={CORS_TOOL} />;
}
