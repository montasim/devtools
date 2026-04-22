'use client';

import { lazy, type ComponentType } from 'react';
import { Ruler } from 'lucide-react';
import { ToolPage } from '@/features/tools/core/components/tool-page';
import { createSharedTabPlugin } from '@/features/tools/core/plugins/shared';
import { createSavedTabPlugin } from '@/features/tools/core/plugins/saved';
import { createHistoryTabPlugin } from '@/features/tools/core/plugins/history';
import { registerTool } from '@/features/tools/core/config/tool-registry';
import { STORAGE_KEYS } from '@/lib/utils/constants';
import type { TabComponentProps } from '@/features/tools/core/types/tool';

const ConvertTab = lazy(
    () => import('@/features/tools/css-unit/tabs/convert-tab'),
) as unknown as ComponentType<TabComponentProps>;

const CSS_UNIT_COLOR = 'bg-teal-100 text-teal-700 dark:bg-teal-900 dark:text-teal-300';

const toolMapping = {
    convert: {
        name: 'CSS Unit Converter',
        icon: Ruler,
        color: CSS_UNIT_COLOR,
    },
};

const CSS_UNIT_TOOL = registerToolAndGet();

function registerToolAndGet() {
    const definition = {
        pageName: 'css-unit',
        label: 'CSS Unit Converter',
        icon: Ruler,
        defaultTab: 'convert',
        mainTabs: [
            {
                id: 'convert',
                label: 'Convert',
                icon: Ruler,
                component: ConvertTab,
                contentType: 'text' as const,
            },
        ],
        plugins: {
            saved: createSavedTabPlugin({
                pageName: 'css-unit',
                queryKey: 'css-unit-saved',
                toolMapping,
                tabMapping: { convert: 'convert' },
                storageKeyMapping: {
                    convert: STORAGE_KEYS.CSS_UNIT_STATE,
                },
            }),
            shared: createSharedTabPlugin({
                pageName: 'css-unit',
                queryKey: 'css-unit-shared',
                toolMapping,
                tabMapping: { convert: 'convert' },
            }),
            history: createHistoryTabPlugin({
                pageName: 'css-unit',
                storageKeyFilter: (key) => key.startsWith('css-unit-'),
                toolMapping,
                tabMapping: { convert: 'convert' },
            }),
        },
    };

    registerTool(definition);
    return definition;
}

export default function CssUnitPage() {
    return <ToolPage definition={CSS_UNIT_TOOL} />;
}
