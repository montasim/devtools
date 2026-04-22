'use client';

import { lazy, type ComponentType } from 'react';
import { Hash } from 'lucide-react';
import { ToolPage } from '@/features/tools/core/components/tool-page';
import { createSharedTabPlugin } from '@/features/tools/core/plugins/shared';
import { createSavedTabPlugin } from '@/features/tools/core/plugins/saved';
import { createHistoryTabPlugin } from '@/features/tools/core/plugins/history';
import { registerTool } from '@/features/tools/core/config/tool-registry';
import { STORAGE_KEYS } from '@/lib/utils/constants';
import type { TabComponentProps } from '@/features/tools/core/types/tool';

const GenerateTab = lazy(
    () => import('@/features/tools/hash/tabs/generate-tab'),
) as unknown as ComponentType<TabComponentProps>;

const HASH_TOOL = registerToolAndGet();

function registerToolAndGet() {
    const definition = {
        pageName: 'hash',
        label: 'Hash Generator',
        icon: Hash,
        defaultTab: 'generate',
        mainTabs: [
            {
                id: 'generate',
                label: 'Generate',
                icon: Hash,
                component: GenerateTab,
                contentType: 'text' as const,
            },
        ],
        plugins: {
            saved: createSavedTabPlugin({
                pageName: 'hash',
                queryKey: 'hash-saved',
                toolMapping: {
                    generate: {
                        name: 'Hash Generator',
                        icon: Hash,
                        color: 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300',
                    },
                },
                tabMapping: {
                    generate: 'generate',
                },
                storageKeyMapping: {
                    generate: STORAGE_KEYS.HASH_GENERATE_INPUT,
                },
            }),
            shared: createSharedTabPlugin({
                pageName: 'hash',
                queryKey: 'hash-shared',
                toolMapping: {
                    generate: {
                        name: 'Hash Generator',
                        icon: Hash,
                        color: 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300',
                    },
                },
                tabMapping: {
                    generate: 'generate',
                },
            }),
            history: createHistoryTabPlugin({
                pageName: 'hash',
                storageKeyFilter: (key) => key.startsWith('hash-'),
                toolMapping: {
                    generate: {
                        name: 'Hash Generator',
                        icon: Hash,
                        color: 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300',
                    },
                },
                tabMapping: {
                    generate: 'generate',
                },
            }),
        },
    };

    registerTool(definition);
    return definition;
}

export default function HashPage() {
    return <ToolPage definition={HASH_TOOL} />;
}
