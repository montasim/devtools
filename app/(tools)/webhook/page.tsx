'use client';

import { lazy, type ComponentType } from 'react';
import { Webhook } from 'lucide-react';
import { ToolPage } from '@/features/tools/core/components/tool-page';
import { createSavedTabPlugin } from '@/features/tools/core/plugins/saved';
import { createSharedTabPlugin } from '@/features/tools/core/plugins/shared';
import { createHistoryTabPlugin } from '@/features/tools/core/plugins/history';
import { registerTool } from '@/features/tools/core/config/tool-registry';
import type { TabComponentProps } from '@/features/tools/core/types/tool';

const InboxTab = lazy(
    () => import('@/features/tools/webhook/tabs/inbox-tab'),
) as unknown as ComponentType<TabComponentProps>;

const STORAGE_KEY = 'webhook-inbox-id';
const WEBHOOK_COLOR = 'bg-violet-100 text-violet-700 dark:bg-violet-900 dark:text-violet-300';

const toolMapping = {
    inbox: {
        name: 'Webhook Inbox',
        icon: Webhook,
        color: WEBHOOK_COLOR,
    },
};

const WEBHOOK_TOOL = registerToolAndGet();

function registerToolAndGet() {
    const definition = {
        pageName: 'webhook',
        label: 'Webhook Tester',
        icon: Webhook,
        defaultTab: 'inbox',
        mainTabs: [
            {
                id: 'inbox',
                label: 'Inbox',
                icon: Webhook,
                component: InboxTab,
                contentType: 'text' as const,
            },
        ],
        plugins: {
            saved: createSavedTabPlugin({
                pageName: 'webhook',
                queryKey: 'webhook-saved',
                toolMapping,
                tabMapping: { inbox: 'inbox' },
                storageKeyMapping: { inbox: STORAGE_KEY },
            }),
            shared: createSharedTabPlugin({
                pageName: 'webhook',
                queryKey: 'webhook-shared',
                toolMapping,
                tabMapping: { inbox: 'inbox' },
            }),
            history: createHistoryTabPlugin({
                pageName: 'webhook',
                storageKeyFilter: (key) => key.startsWith('webhook-'),
                toolMapping,
                tabMapping: { inbox: 'inbox' },
            }),
        },
    };

    registerTool(definition);
    return definition;
}

export default function WebhookPage() {
    return <ToolPage definition={WEBHOOK_TOOL} />;
}
