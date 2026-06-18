'use client';

import { lazy, type ComponentType } from 'react';
import { Clock } from 'lucide-react';
import { ToolPage } from '@/features/tools/core/components/tool-page';
import { createSharedTabPlugin } from '@/features/tools/core/plugins/shared';
import { createSavedTabPlugin } from '@/features/tools/core/plugins/saved';
import { createHistoryTabPlugin } from '@/features/tools/core/plugins/history';
import { registerTool } from '@/features/tools/core/config/tool-registry';
import type { TabComponentProps } from '@/features/tools/core/types/tool';

const STORAGE_KEY = 'timestamp-convert-content';

const ConvertTab = lazy(
    () => import('@/features/tools/timestamp/tabs/convert-tab'),
) as unknown as ComponentType<TabComponentProps>;

const CONVERT_COLOR = 'bg-violet-100 text-violet-700 dark:bg-violet-900 dark:text-violet-300';

const toolMapping = {
    convert: {
        name: 'Timestamp Converter',
        icon: Clock,
        color: CONVERT_COLOR,
    },
};

const TIMESTAMP_TOOL = registerToolAndGet();

function registerToolAndGet() {
    const definition = {
        pageName: 'timestamp',
        label: 'Timestamp Converter',
        icon: Clock,
        defaultTab: 'convert',
        mainTabs: [
            {
                id: 'convert',
                label: 'Convert',
                icon: Clock,
                component: ConvertTab,
                contentType: 'text' as const,
            },
        ],
        plugins: {
            saved: createSavedTabPlugin({
                pageName: 'timestamp',
                queryKey: 'timestamp-saved',
                toolMapping,
                tabMapping: { convert: 'convert' },
                storageKeyMapping: {
                    convert: STORAGE_KEY,
                },
            }),
            shared: createSharedTabPlugin({
                pageName: 'timestamp',
                queryKey: 'timestamp-shared',
                toolMapping,
                tabMapping: { convert: 'convert' },
            }),
            history: createHistoryTabPlugin({
                pageName: 'timestamp',
                storageKeyFilter: (key) => key.startsWith('timestamp-'),
                toolMapping,
                tabMapping: { convert: 'convert' },
            }),
        },
    };

    registerTool(definition);
    return definition;
}

export default function TimestampPage() {
    return <ToolPage definition={TIMESTAMP_TOOL} />;
}
