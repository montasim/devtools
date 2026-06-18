'use client';

import { lazy, type ComponentType } from 'react';
import { Monitor, Code } from 'lucide-react';
import { ToolPage } from '@/features/tools/core/components/tool-page';
import { registerTool } from '@/features/tools/core/config/tool-registry';
import type { TabComponentProps } from '@/features/tools/core/types/tool';

const PlaygroundTab = lazy(
    () => import('@/features/tools/web-playground/tabs/playground-tab'),
) as unknown as ComponentType<TabComponentProps>;

const PLAYGROUND_TOOL = registerToolAndGet();

function registerToolAndGet() {
    const definition = {
        pageName: 'web-playground',
        label: 'Web Playground',
        icon: Monitor,
        defaultTab: 'playground',
        mainTabs: [
            {
                id: 'playground',
                label: 'Playground',
                icon: Code,
                component: PlaygroundTab,
                contentType: 'text' as const,
            },
        ],
    };

    registerTool(definition);
    return definition;
}

export default function WebPlaygroundPage() {
    return <ToolPage definition={PLAYGROUND_TOOL} />;
}
