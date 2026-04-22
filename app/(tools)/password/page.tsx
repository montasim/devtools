'use client';

import { lazy, type ComponentType } from 'react';
import { KeyRound } from 'lucide-react';
import { ToolPage } from '@/features/tools/core/components/tool-page';
import { createSharedTabPlugin } from '@/features/tools/core/plugins/shared';
import { createSavedTabPlugin } from '@/features/tools/core/plugins/saved';
import { createHistoryTabPlugin } from '@/features/tools/core/plugins/history';
import { registerTool } from '@/features/tools/core/config/tool-registry';
import { STORAGE_KEYS } from '@/lib/utils/constants';
import type { TabComponentProps } from '@/features/tools/core/types/tool';

const GenerateTab = lazy(
    () => import('@/features/tools/password/tabs/generate-tab'),
) as unknown as ComponentType<TabComponentProps>;

const PASSWORD_COLOR = 'bg-rose-100 text-rose-700 dark:bg-rose-900 dark:text-rose-300';

const toolMapping = {
    generate: {
        name: 'Password Generator',
        icon: KeyRound,
        color: PASSWORD_COLOR,
    },
};

const PASSWORD_TOOL = registerToolAndGet();

function registerToolAndGet() {
    const definition = {
        pageName: 'password',
        label: 'Password Generator',
        icon: KeyRound,
        defaultTab: 'generate',
        mainTabs: [
            {
                id: 'generate',
                label: 'Generate',
                icon: KeyRound,
                component: GenerateTab,
                contentType: 'text' as const,
            },
        ],
        plugins: {
            saved: createSavedTabPlugin({
                pageName: 'password',
                queryKey: 'password-saved',
                toolMapping,
                tabMapping: { generate: 'generate' },
                storageKeyMapping: {
                    generate: STORAGE_KEYS.PASSWORD_RESULTS,
                },
            }),
            shared: createSharedTabPlugin({
                pageName: 'password',
                queryKey: 'password-shared',
                toolMapping,
                tabMapping: { generate: 'generate' },
            }),
            history: createHistoryTabPlugin({
                pageName: 'password',
                storageKeyFilter: (key) => key.startsWith('password-'),
                toolMapping,
                tabMapping: { generate: 'generate' },
            }),
        },
    };

    registerTool(definition);
    return definition;
}

export default function PasswordPage() {
    return <ToolPage definition={PASSWORD_TOOL} />;
}
