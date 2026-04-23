'use client';

import { lazy, type ComponentType } from 'react';
import { Terminal } from 'lucide-react';
import { ToolPage } from '@/features/tools/core/components/tool-page';
import { createSharedTabPlugin } from '@/features/tools/core/plugins/shared';
import { createSavedTabPlugin } from '@/features/tools/core/plugins/saved';
import { createHistoryTabPlugin } from '@/features/tools/core/plugins/history';
import { registerTool } from '@/features/tools/core/config/tool-registry';
import { STORAGE_KEYS } from '@/lib/utils/constants';
import type { TabComponentProps } from '@/features/tools/core/types/tool';

const ConvertTab = lazy(
    () => import('@/features/tools/curl/tabs/convert-tab'),
) as unknown as ComponentType<TabComponentProps>;

const CONVERT_COLOR = 'bg-violet-100 text-violet-700 dark:bg-violet-900 dark:text-violet-300';

const toolMapping = {
    convert: {
        name: 'cURL Converter',
        icon: Terminal,
        color: CONVERT_COLOR,
    },
};

const CURL_TOOL = registerToolAndGet();

function registerToolAndGet() {
    const definition = {
        pageName: 'curl',
        label: 'cURL Converter',
        icon: Terminal,
        defaultTab: 'convert',
        mainTabs: [
            {
                id: 'convert',
                label: 'Convert',
                icon: Terminal,
                component: ConvertTab,
                contentType: 'text' as const,
            },
        ],
        plugins: {
            saved: createSavedTabPlugin({
                pageName: 'curl',
                queryKey: 'curl-saved',
                toolMapping,
                tabMapping: { convert: 'convert' },
                storageKeyMapping: {
                    convert: STORAGE_KEYS.CURL_CONVERT_INPUT,
                },
            }),
            shared: createSharedTabPlugin({
                pageName: 'curl',
                queryKey: 'curl-shared',
                toolMapping,
                tabMapping: { convert: 'convert' },
            }),
            history: createHistoryTabPlugin({
                pageName: 'curl',
                storageKeyFilter: (key) => key.startsWith('curl-'),
                toolMapping,
                tabMapping: { convert: 'convert' },
            }),
        },
    };

    registerTool(definition);
    return definition;
}

export default function CurlPage() {
    return <ToolPage definition={CURL_TOOL} />;
}
