'use client';

import { lazy, type ComponentType } from 'react';
import { Languages, Search } from 'lucide-react';
import { ToolPage } from '@/features/tools/core/components/tool-page';
import { registerTool } from '@/features/tools/core/config/tool-registry';
import type { TabComponentProps } from '@/features/tools/core/types/tool';

const LookupTab = lazy(
    () => import('@/features/tools/unicode/tabs/lookup-tab'),
) as unknown as ComponentType<TabComponentProps>;

const UNICODE_TOOL = registerToolAndGet();

function registerToolAndGet() {
    const definition = {
        pageName: 'unicode',
        label: 'Unicode Lookup',
        icon: Languages,
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
    };

    registerTool(definition);
    return definition;
}

export default function UnicodePage() {
    return <ToolPage definition={UNICODE_TOOL} />;
}
