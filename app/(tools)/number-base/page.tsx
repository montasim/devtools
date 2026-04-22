'use client';

import { lazy, type ComponentType } from 'react';
import { Binary } from 'lucide-react';
import { ToolPage } from '@/features/tools/core/components/tool-page';
import { createSharedTabPlugin } from '@/features/tools/core/plugins/shared';
import { createSavedTabPlugin } from '@/features/tools/core/plugins/saved';
import { createHistoryTabPlugin } from '@/features/tools/core/plugins/history';
import { registerTool } from '@/features/tools/core/config/tool-registry';
import { STORAGE_KEYS } from '@/lib/utils/constants';
import type { TabComponentProps } from '@/features/tools/core/types/tool';

const ConvertTab = lazy(
    () => import('@/features/tools/number-base/tabs/convert-tab'),
) as unknown as ComponentType<TabComponentProps>;

const NUMBER_BASE_COLOR =
    'bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300';

const toolMapping = {
    convert: {
        name: 'Number Base Converter',
        icon: Binary,
        color: NUMBER_BASE_COLOR,
    },
};

const NUMBER_BASE_TOOL = registerToolAndGet();

function registerToolAndGet() {
    const definition = {
        pageName: 'number-base',
        label: 'Number Base Converter',
        icon: Binary,
        defaultTab: 'convert',
        mainTabs: [
            {
                id: 'convert',
                label: 'Convert',
                icon: Binary,
                component: ConvertTab,
                contentType: 'text' as const,
            },
        ],
        plugins: {
            saved: createSavedTabPlugin({
                pageName: 'number-base',
                queryKey: 'number-base-saved',
                toolMapping,
                tabMapping: { convert: 'convert' },
                storageKeyMapping: {
                    convert: STORAGE_KEYS.NUMBER_BASE_STATE,
                },
            }),
            shared: createSharedTabPlugin({
                pageName: 'number-base',
                queryKey: 'number-base-shared',
                toolMapping,
                tabMapping: { convert: 'convert' },
            }),
            history: createHistoryTabPlugin({
                pageName: 'number-base',
                storageKeyFilter: (key) => key.startsWith('number-base-'),
                toolMapping,
                tabMapping: { convert: 'convert' },
            }),
        },
    };

    registerTool(definition);
    return definition;
}

export default function NumberBasePage() {
    return <ToolPage definition={NUMBER_BASE_TOOL} />;
}
