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
    () => import('@/features/tools/rsa-key/tabs/generate-tab'),
) as unknown as ComponentType<TabComponentProps>;

const GENERATE_COLOR = 'bg-violet-100 text-violet-700 dark:bg-violet-900 dark:text-violet-300';

const toolMapping = {
    generate: {
        name: 'RSA Key Generator',
        icon: KeyRound,
        color: GENERATE_COLOR,
    },
};

const RSA_KEY_TOOL = registerToolAndGet();

function registerToolAndGet() {
    const definition = {
        pageName: 'rsa-key',
        label: 'RSA Key Generator',
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
                pageName: 'rsa-key',
                queryKey: 'rsa-key-saved',
                toolMapping,
                tabMapping: { generate: 'generate' },
                storageKeyMapping: {
                    generate: STORAGE_KEYS.RSA_KEY_INPUT,
                },
            }),
            shared: createSharedTabPlugin({
                pageName: 'rsa-key',
                queryKey: 'rsa-key-shared',
                toolMapping,
                tabMapping: { generate: 'generate' },
            }),
            history: createHistoryTabPlugin({
                pageName: 'rsa-key',
                storageKeyFilter: (key) => key.startsWith('rsa-key-'),
                toolMapping,
                tabMapping: { generate: 'generate' },
            }),
        },
    };

    registerTool(definition);
    return definition;
}

export default function RsaKeyPage() {
    return <ToolPage definition={RSA_KEY_TOOL} />;
}
