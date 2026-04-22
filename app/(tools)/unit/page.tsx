'use client';

import { lazy, type ComponentType } from 'react';
import { ArrowLeftRight } from 'lucide-react';
import { ToolPage } from '@/features/tools/core/components/tool-page';
import { createSharedTabPlugin } from '@/features/tools/core/plugins/shared';
import { createSavedTabPlugin } from '@/features/tools/core/plugins/saved';
import { createHistoryTabPlugin } from '@/features/tools/core/plugins/history';
import { registerTool } from '@/features/tools/core/config/tool-registry';
import { STORAGE_KEYS } from '@/lib/utils/constants';
import type { TabComponentProps } from '@/features/tools/core/types/tool';
import { HardDrive, Clock, Globe } from 'lucide-react';

const DataTab = lazy(
    () => import('@/features/tools/unit/tabs/data-tab'),
) as unknown as ComponentType<TabComponentProps>;

const TimeTab = lazy(
    () => import('@/features/tools/unit/tabs/time-tab'),
) as unknown as ComponentType<TabComponentProps>;

const TimezoneTab = lazy(
    () => import('@/features/tools/unit/tabs/timezone-tab'),
) as unknown as ComponentType<TabComponentProps>;

const UNIT_COLOR = 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900 dark:text-cyan-300';

const toolMapping = {
    data: {
        name: 'Data Size Converter',
        icon: HardDrive,
        color: UNIT_COLOR,
    },
    time: {
        name: 'Time Duration Converter',
        icon: Clock,
        color: UNIT_COLOR,
    },
    timezone: {
        name: 'Timezone Converter',
        icon: Globe,
        color: UNIT_COLOR,
    },
};

const UNIT_TOOL = registerToolAndGet();

function registerToolAndGet() {
    const definition = {
        pageName: 'unit',
        label: 'Unit Converter',
        icon: ArrowLeftRight,
        defaultTab: 'data',
        mainTabs: [
            {
                id: 'data',
                label: 'Data Size',
                icon: HardDrive,
                component: DataTab,
                contentType: 'text' as const,
            },
            {
                id: 'time',
                label: 'Time',
                icon: Clock,
                component: TimeTab,
                contentType: 'text' as const,
            },
            {
                id: 'timezone',
                label: 'Timezone',
                icon: Globe,
                component: TimezoneTab,
                contentType: 'text' as const,
            },
        ],
        plugins: {
            saved: createSavedTabPlugin({
                pageName: 'unit',
                queryKey: 'unit-saved',
                toolMapping,
                tabMapping: { data: 'data', time: 'time', timezone: 'timezone' },
                storageKeyMapping: {
                    data: STORAGE_KEYS.UNIT_DATA_STATE,
                    time: STORAGE_KEYS.UNIT_TIME_STATE,
                    timezone: STORAGE_KEYS.UNIT_TIMEZONE_STATE,
                },
            }),
            shared: createSharedTabPlugin({
                pageName: 'unit',
                queryKey: 'unit-shared',
                toolMapping,
                tabMapping: { data: 'data', time: 'time', timezone: 'timezone' },
            }),
            history: createHistoryTabPlugin({
                pageName: 'unit',
                storageKeyFilter: (key) => key.startsWith('unit-'),
                toolMapping,
                tabMapping: { data: 'data', time: 'time', timezone: 'timezone' },
            }),
        },
    };

    registerTool(definition);
    return definition;
}

export default function UnitPage() {
    return <ToolPage definition={UNIT_TOOL} />;
}
