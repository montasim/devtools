'use client';

import { lazy, type ComponentType } from 'react';
import { Table2, ArrowLeftRight, Eye } from 'lucide-react';
import { ToolPage } from '@/features/tools/core/components/tool-page';
import { createSavedTabPlugin } from '@/features/tools/core/plugins/saved';
import { createSharedTabPlugin } from '@/features/tools/core/plugins/shared';
import { createHistoryTabPlugin } from '@/features/tools/core/plugins/history';
import { registerTool } from '@/features/tools/core/config/tool-registry';
import { STORAGE_KEYS } from '@/lib/utils/constants';
import type { TabComponentProps } from '@/features/tools/core/types/tool';

const ConvertTab = lazy(
    () => import('@/features/tools/csv/tabs/convert-tab'),
) as unknown as ComponentType<TabComponentProps>;

const PreviewTab = lazy(
    () => import('@/features/tools/csv/tabs/preview-tab'),
) as unknown as ComponentType<TabComponentProps>;

const CSV_COLOR = 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300';

const toolMapping = {
    convert: {
        name: 'CSV Converter',
        icon: ArrowLeftRight,
        color: CSV_COLOR,
    },
    preview: {
        name: 'CSV Preview',
        icon: Eye,
        color: CSV_COLOR,
    },
};

const CSV_TOOL = registerToolAndGet();

function registerToolAndGet() {
    const definition = {
        pageName: 'csv',
        label: 'CSV Tools',
        icon: Table2,
        defaultTab: 'convert',
        mainTabs: [
            {
                id: 'convert',
                label: 'Convert',
                icon: ArrowLeftRight,
                component: ConvertTab,
                contentType: 'text' as const,
            },
            {
                id: 'preview',
                label: 'Preview',
                icon: Eye,
                component: PreviewTab,
                contentType: 'text' as const,
            },
        ],
        plugins: {
            saved: createSavedTabPlugin({
                pageName: 'csv',
                queryKey: 'csv-saved',
                toolMapping,
                tabMapping: { convert: 'convert', preview: 'preview' },
                storageKeyMapping: {
                    convert: STORAGE_KEYS.CSV_CONVERT_CONTENT,
                    preview: STORAGE_KEYS.CSV_PREVIEW_CONTENT,
                },
            }),
            shared: createSharedTabPlugin({
                pageName: 'csv',
                queryKey: 'csv-shared',
                toolMapping,
                tabMapping: { convert: 'convert', preview: 'preview' },
            }),
            history: createHistoryTabPlugin({
                pageName: 'csv',
                storageKeyFilter: (key) => key.startsWith('csv-'),
                toolMapping,
                tabMapping: { convert: 'convert', preview: 'preview' },
            }),
        },
    };

    registerTool(definition);
    return definition;
}

export default function CsvPage() {
    return <ToolPage definition={CSV_TOOL} />;
}
