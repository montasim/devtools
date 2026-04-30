'use client';

import { lazy, type ComponentType } from 'react';
import { ShieldAlert, Search, Database } from 'lucide-react';
import { ToolPage } from '@/features/tools/core/components/tool-page';
import { createSharedTabPlugin } from '@/features/tools/core/plugins/shared';
import { createSavedTabPlugin } from '@/features/tools/core/plugins/saved';
import { createHistoryTabPlugin } from '@/features/tools/core/plugins/history';
import { registerTool } from '@/features/tools/core/config/tool-registry';
import { STORAGE_KEYS } from '@/lib/utils/constants';
import type { TabComponentProps } from '@/features/tools/core/types/tool';

const CheckerTab = lazy(
    () => import('@/features/tools/spam-words/tabs/checker-tab'),
) as unknown as ComponentType<TabComponentProps>;

const BrowserTab = lazy(
    () => import('@/features/tools/spam-words/tabs/browser-tab'),
) as unknown as ComponentType<TabComponentProps>;

const SPAM_WORDS_COLOR = 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300';

const toolMapping = {
    checker: {
        name: 'Content Checker',
        icon: ShieldAlert,
        color: SPAM_WORDS_COLOR,
    },
    browser: {
        name: 'Word Browser',
        icon: Database,
        color: SPAM_WORDS_COLOR,
    },
};

const SPAM_WORDS_TOOL = registerToolAndGet();

function registerToolAndGet() {
    const definition = {
        pageName: 'spam-words',
        label: 'Spam Words Checker',
        icon: ShieldAlert,
        defaultTab: 'checker',
        mainTabs: [
            {
                id: 'checker',
                label: 'Checker',
                icon: Search,
                component: CheckerTab,
                contentType: 'text' as const,
            },
            {
                id: 'browser',
                label: 'Browser',
                icon: Database,
                component: BrowserTab,
                contentType: 'text' as const,
            },
        ],
        plugins: {
            saved: createSavedTabPlugin({
                pageName: 'spam-words',
                queryKey: 'spam-words-saved',
                toolMapping,
                tabMapping: { checker: 'checker', browser: 'browser' },
                storageKeyMapping: {
                    checker: STORAGE_KEYS.SPAM_WORDS_INPUT,
                },
            }),
            shared: createSharedTabPlugin({
                pageName: 'spam-words',
                queryKey: 'spam-words-shared',
                toolMapping,
                tabMapping: { checker: 'checker', browser: 'browser' },
            }),
            history: createHistoryTabPlugin({
                pageName: 'spam-words',
                storageKeyFilter: (key) => key.startsWith('spam-words-'),
                toolMapping,
                tabMapping: { checker: 'checker', browser: 'browser' },
            }),
        },
    };

    registerTool(definition);
    return definition;
}

export default function SpamWordsPage() {
    return <ToolPage definition={SPAM_WORDS_TOOL} />;
}
