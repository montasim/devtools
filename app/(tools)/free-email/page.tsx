'use client';

import { lazy, type ComponentType } from 'react';
import { MailQuestion, Search, Database } from 'lucide-react';
import { ToolPage } from '@/features/tools/core/components/tool-page';
import { createSharedTabPlugin } from '@/features/tools/core/plugins/shared';
import { createSavedTabPlugin } from '@/features/tools/core/plugins/saved';
import { createHistoryTabPlugin } from '@/features/tools/core/plugins/history';
import { registerTool } from '@/features/tools/core/config/tool-registry';
import { STORAGE_KEYS } from '@/lib/utils/constants';
import type { TabComponentProps } from '@/features/tools/core/types/tool';

const CheckerTab = lazy(
    () => import('@/features/tools/free-email/tabs/checker-tab'),
) as unknown as ComponentType<TabComponentProps>;

const SampleDataTab = lazy(
    () => import('@/features/tools/free-email/tabs/sample-data-tab'),
) as unknown as ComponentType<TabComponentProps>;

const FREE_EMAIL_COLOR = 'bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300';

const toolMapping = {
    checker: {
        name: 'Email Checker',
        icon: MailQuestion,
        color: FREE_EMAIL_COLOR,
    },
    'sample-data': {
        name: 'Sample Data',
        icon: Database,
        color: FREE_EMAIL_COLOR,
    },
};

const FREE_EMAIL_TOOL = registerToolAndGet();

function registerToolAndGet() {
    const definition = {
        pageName: 'free-email',
        label: 'Free Email Checker',
        icon: MailQuestion,
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
                id: 'sample-data',
                label: 'Sample Data',
                icon: Database,
                component: SampleDataTab,
                contentType: 'text' as const,
            },
        ],
        plugins: {
            saved: createSavedTabPlugin({
                pageName: 'free-email',
                queryKey: 'free-email-saved',
                toolMapping,
                tabMapping: { checker: 'checker', 'sample-data': 'sample-data' },
                storageKeyMapping: {
                    checker: STORAGE_KEYS.FREE_EMAIL_INPUT,
                },
            }),
            shared: createSharedTabPlugin({
                pageName: 'free-email',
                queryKey: 'free-email-shared',
                toolMapping,
                tabMapping: { checker: 'checker', 'sample-data': 'sample-data' },
            }),
            history: createHistoryTabPlugin({
                pageName: 'free-email',
                storageKeyFilter: (key) => key.startsWith('free-email-'),
                toolMapping,
                tabMapping: { checker: 'checker', 'sample-data': 'sample-data' },
            }),
        },
    };

    registerTool(definition);
    return definition;
}

export default function FreeEmailPage() {
    return <ToolPage definition={FREE_EMAIL_TOOL} />;
}
