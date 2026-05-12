'use client';

import { lazy, type ComponentType } from 'react';
import { Globe2, Clock, Search } from 'lucide-react';
import { ToolPage } from '@/features/tools/core/components/tool-page';
import { registerTool } from '@/features/tools/core/config/tool-registry';
import type { TabComponentProps } from '@/features/tools/core/types/tool';

const WorldClockTab = lazy(
    () => import('@/features/tools/timezones/tabs/world-clock-tab'),
) as unknown as ComponentType<TabComponentProps>;

const BrowserTab = lazy(
    () => import('@/features/tools/timezones/tabs/browser-tab'),
) as unknown as ComponentType<TabComponentProps>;

const TIMEZONES_TOOL = registerToolAndGet();

function registerToolAndGet() {
    const definition = {
        pageName: 'timezones',
        label: 'Timezones',
        icon: Globe2,
        defaultTab: 'world-clock',
        mainTabs: [
            {
                id: 'world-clock',
                label: 'World Clock',
                icon: Clock,
                component: WorldClockTab,
                contentType: 'text' as const,
            },
            {
                id: 'browser',
                label: 'Browser',
                icon: Search,
                component: BrowserTab,
                contentType: 'text' as const,
            },
        ],
    };

    registerTool(definition);
    return definition;
}

export default function TimezonesPage() {
    return <ToolPage definition={TIMEZONES_TOOL} />;
}
