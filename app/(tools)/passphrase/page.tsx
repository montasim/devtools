'use client';

import { lazy, type ComponentType } from 'react';
import { Database, Shuffle } from 'lucide-react';
import { ToolPage } from '@/features/tools/core/components/tool-page';
import { createSharedTabPlugin } from '@/features/tools/core/plugins/shared';
import { createSavedTabPlugin } from '@/features/tools/core/plugins/saved';
import { createHistoryTabPlugin } from '@/features/tools/core/plugins/history';
import { registerTool } from '@/features/tools/core/config/tool-registry';
import { STORAGE_KEYS } from '@/lib/utils/constants';
import type { TabComponentProps } from '@/features/tools/core/types/tool';

const BrowserTab = lazy(
    () => import('@/features/tools/passphrase/tabs/browser-tab'),
) as unknown as ComponentType<TabComponentProps>;

const GenerateTab = lazy(
    () => import('@/features/tools/passphrase/tabs/generate-tab'),
) as unknown as ComponentType<TabComponentProps>;

const PASSPHRASE_COLOR = 'bg-violet-100 text-violet-700 dark:bg-violet-900 dark:text-violet-300';

const toolMapping = {
    'sample-data': {
        name: 'Word Browser',
        icon: Database,
        color: PASSPHRASE_COLOR,
    },
    generate: {
        name: 'Passphrase Generator',
        icon: Shuffle,
        color: PASSPHRASE_COLOR,
    },
};

const PASSPHRASE_WORDS_TOOL = registerToolAndGet();

function registerToolAndGet() {
    const definition = {
        pageName: 'passphrase',
        label: 'Passphrase',
        icon: Shuffle,
        defaultTab: 'generate',
        mainTabs: [
            {
                id: 'generate',
                label: 'Generate',
                icon: Shuffle,
                component: GenerateTab,
                contentType: 'text' as const,
            },
            {
                id: 'sample-data',
                label: 'Sample Data',
                icon: Database,
                component: BrowserTab,
                contentType: 'text' as const,
            },
        ],
        plugins: {
            saved: createSavedTabPlugin({
                pageName: 'passphrase',
                queryKey: 'passphrase-saved',
                toolMapping,
                tabMapping: { 'sample-data': 'sample-data', generate: 'generate' },
                storageKeyMapping: {
                    generate: STORAGE_KEYS.PASSPHRASE_WORDS_RESULTS,
                },
            }),
            shared: createSharedTabPlugin({
                pageName: 'passphrase',
                queryKey: 'passphrase-shared',
                toolMapping,
                tabMapping: { 'sample-data': 'sample-data', generate: 'generate' },
            }),
            history: createHistoryTabPlugin({
                pageName: 'passphrase',
                storageKeyFilter: (key: string) => key.startsWith('passphrase-'),
                toolMapping,
                tabMapping: { 'sample-data': 'sample-data', generate: 'generate' },
            }),
        },
    };

    registerTool(definition);
    return definition;
}

export default function PassphraseWordsPage() {
    return <ToolPage definition={PASSPHRASE_WORDS_TOOL} />;
}
