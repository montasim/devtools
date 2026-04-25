'use client';

import { lazy, type ComponentType } from 'react';
import { Globe, Search } from 'lucide-react';
import { ToolPage } from '@/features/tools/core/components/tool-page';
import { createSavedTabPlugin } from '@/features/tools/core/plugins/saved';
import { createSharedTabPlugin } from '@/features/tools/core/plugins/shared';
import { createHistoryTabPlugin } from '@/features/tools/core/plugins/history';
import { registerTool } from '@/features/tools/core/config/tool-registry';
import { STORAGE_KEYS } from '@/lib/utils/constants';
import type { TabComponentProps } from '@/features/tools/core/types/tool';

const LookupTab = lazy(
    () => import('@/features/tools/nslookup/tabs/lookup-tab'),
) as unknown as ComponentType<TabComponentProps>;

const NSLOOKUP_TOOL = registerToolAndGet();

function registerToolAndGet() {
    const definition = {
        pageName: 'nslookup',
        label: 'DNS Lookup',
        icon: Globe,
        defaultTab: 'lookup',
        mainTabs: [
            {
                id: 'lookup',
                label: 'Lookup',
                icon: Search,
                component: LookupTab,
                contentType: 'text' as const,
            },
        ],
        plugins: {
            saved: createSavedTabPlugin({
                pageName: 'nslookup',
                queryKey: 'nslookup-saved',
                toolMapping: {
                    lookup: {
                        name: 'DNS Lookup',
                        icon: Globe,
                        color: 'bg-sky-100 text-sky-700 dark:bg-sky-900 dark:text-sky-300',
                    },
                },
                tabMapping: { lookup: 'lookup' },
                storageKeyMapping: {
                    lookup: STORAGE_KEYS.NSLOOKUP_DOMAIN,
                },
            }),
            shared: createSharedTabPlugin({
                pageName: 'nslookup',
                queryKey: 'nslookup-shared',
                toolMapping: {
                    lookup: {
                        name: 'DNS Lookup',
                        icon: Globe,
                        color: 'bg-sky-100 text-sky-700 dark:bg-sky-900 dark:text-sky-300',
                    },
                },
                tabMapping: { lookup: 'lookup' },
                storageKeys: {
                    lookup: STORAGE_KEYS.NSLOOKUP_DOMAIN,
                },
            }),
            history: createHistoryTabPlugin({
                pageName: 'nslookup',
                storageKeyFilter: (key) => key.startsWith('nslookup-'),
                toolMapping: {
                    lookup: {
                        name: 'DNS Lookup',
                        icon: Globe,
                        color: 'bg-sky-100 text-sky-700 dark:bg-sky-900 dark:text-sky-300',
                    },
                },
                tabMapping: { lookup: 'lookup' },
            }),
        },
    };

    registerTool(definition);
    return definition;
}

export default function NslookupPage() {
    return <ToolPage definition={NSLOOKUP_TOOL} />;
}
