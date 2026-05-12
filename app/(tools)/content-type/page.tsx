'use client';

import { lazy, type ComponentType } from 'react';
import { FileCode, Search } from 'lucide-react';
import { ToolPage } from '@/features/tools/core/components/tool-page';
import { registerTool } from '@/features/tools/core/config/tool-registry';
import type { TabComponentProps } from '@/features/tools/core/types/tool';

const ReferenceTab = lazy(
    () => import('@/features/tools/content-type/tabs/reference-tab'),
) as unknown as ComponentType<TabComponentProps>;

const CONTENT_TYPE_TOOL = registerToolAndGet();

function registerToolAndGet() {
    const definition = {
        pageName: 'content-type',
        label: 'Content-Type Reference',
        icon: FileCode,
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

export default function ContentTypePage() {
    return <ToolPage definition={CONTENT_TYPE_TOOL} />;
}
