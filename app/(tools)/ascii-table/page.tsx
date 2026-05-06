'use client';

import { lazy, type ComponentType } from 'react';
import { Table, Search } from 'lucide-react';
import { ToolPage } from '@/features/tools/core/components/tool-page';
import { registerTool } from '@/features/tools/core/config/tool-registry';
import type { TabComponentProps } from '@/features/tools/core/types/tool';

const ReferenceTab = lazy(
    () => import('@/features/tools/ascii-table/tabs/reference-tab'),
) as unknown as ComponentType<TabComponentProps>;

const ASCII_TABLE_TOOL = registerToolAndGet();

function registerToolAndGet() {
    const definition = {
        pageName: 'ascii-table',
        label: 'ASCII Table',
        icon: Table,
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

export default function AsciiTablePage() {
    return <ToolPage definition={ASCII_TABLE_TOOL} />;
}
