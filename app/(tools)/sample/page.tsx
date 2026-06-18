'use client';

import { lazy, type ComponentType } from 'react';
import { Database, Search } from 'lucide-react';
import { ToolPage } from '@/features/tools/core/components/tool-page';
import { registerTool } from '@/features/tools/core/config/tool-registry';
import type { TabComponentProps } from '@/features/tools/core/types/tool';

const ReferenceTab = lazy(
    () => import('@/features/tools/sample/tabs/reference-tab'),
) as unknown as ComponentType<TabComponentProps>;

const SAMPLE_TOOL = registerToolAndGet();

function registerToolAndGet() {
    const definition = {
        pageName: 'sample',
        label: 'Sample Data',
        icon: Database,
        defaultTab: 'reference',
        mainTabs: [
            {
                id: 'reference',
                label: 'Reference',
                icon: Search,
                component: ReferenceTab,
                contentType: 'text' as const,
            },
        ],
    };

    registerTool(definition);
    return definition;
}

export default function SamplePage() {
    return <ToolPage definition={SAMPLE_TOOL} />;
}
