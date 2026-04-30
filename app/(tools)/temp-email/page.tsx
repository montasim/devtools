'use client';

import { lazy, type ComponentType } from 'react';
import { MailX, Search, Database } from 'lucide-react';
import { ToolPage } from '@/features/tools/core/components/tool-page';
import { createSharedTabPlugin } from '@/features/tools/core/plugins/shared';
import { createSavedTabPlugin } from '@/features/tools/core/plugins/saved';
import { createHistoryTabPlugin } from '@/features/tools/core/plugins/history';
import { registerTool } from '@/features/tools/core/config/tool-registry';
import { STORAGE_KEYS } from '@/lib/utils/constants';
import type { TabComponentProps } from '@/features/tools/core/types/tool';

const CheckerTab = lazy(
    () => import('@/features/tools/temp-email/tabs/checker-tab'),
) as unknown as ComponentType<TabComponentProps>;

const SampleDataTab = lazy(
    () => import('@/features/tools/temp-email/tabs/sample-data-tab'),
) as unknown as ComponentType<TabComponentProps>;

const TEMP_EMAIL_COLOR = 'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300';

const toolMapping = {
    checker: {
        name: 'Email Checker',
        icon: MailX,
        color: TEMP_EMAIL_COLOR,
    },
    'sample-data': {
        name: 'Sample Data',
        icon: Database,
        color: TEMP_EMAIL_COLOR,
    },
};

const TEMP_EMAIL_TOOL = registerToolAndGet();

function registerToolAndGet() {
    const definition = {
        pageName: 'temp-email',
        label: 'Temporary Email Checker',
        icon: MailX,
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
                pageName: 'temp-email',
                queryKey: 'temp-email-saved',
                toolMapping,
                tabMapping: { checker: 'checker', 'sample-data': 'sample-data' },
                storageKeyMapping: {
                    checker: STORAGE_KEYS.TEMP_EMAIL_INPUT,
                },
            }),
            shared: createSharedTabPlugin({
                pageName: 'temp-email',
                queryKey: 'temp-email-shared',
                toolMapping,
                tabMapping: { checker: 'checker', 'sample-data': 'sample-data' },
            }),
            history: createHistoryTabPlugin({
                pageName: 'temp-email',
                storageKeyFilter: (key) => key.startsWith('temp-email-'),
                toolMapping,
                tabMapping: { checker: 'checker', 'sample-data': 'sample-data' },
            }),
        },
    };

    registerTool(definition);
    return definition;
}

export default function TempEmailPage() {
    return <ToolPage definition={TEMP_EMAIL_TOOL} />;
}
