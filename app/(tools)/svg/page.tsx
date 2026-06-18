'use client';

import { lazy, type ComponentType } from 'react';
import { Sparkles, FileCode, Eye } from 'lucide-react';
import { ToolPage } from '@/features/tools/core/components/tool-page';
import { registerTool } from '@/features/tools/core/config/tool-registry';
import type { TabComponentProps } from '@/features/tools/core/types/tool';

const OptimizerTab = lazy(
    () => import('@/features/tools/svg-optimizer/tabs/optimizer-tab'),
) as unknown as ComponentType<TabComponentProps>;

const PreviewerTab = lazy(
    () => import('@/features/tools/svg-optimizer/tabs/previewer-tab'),
) as unknown as ComponentType<TabComponentProps>;

const SVG_TOOL = registerToolAndGet();

function registerToolAndGet() {
    const definition = {
        pageName: 'svg',
        label: 'SVG Tools',
        icon: Sparkles,
        defaultTab: 'optimizer',
        mainTabs: [
            {
                id: 'optimizer',
                label: 'Optimizer',
                icon: FileCode,
                component: OptimizerTab,
                contentType: 'text' as const,
            },
            {
                id: 'previewer',
                label: 'Previewer',
                icon: Eye,
                component: PreviewerTab,
                contentType: 'text' as const,
            },
        ],
    };

    registerTool(definition);
    return definition;
}

export default function SvgPage() {
    return <ToolPage definition={SVG_TOOL} />;
}
