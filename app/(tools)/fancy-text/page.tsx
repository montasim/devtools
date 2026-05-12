'use client';

import { lazy, type ComponentType } from 'react';
import { Sparkles } from 'lucide-react';
import { ToolPage } from '@/features/tools/core/components/tool-page';
import { registerTool } from '@/features/tools/core/config/tool-registry';
import type { TabComponentProps } from '@/features/tools/core/types/tool';

const GenerateTab = lazy(
    () => import('@/features/tools/fancy-text/tabs/generate-tab'),
) as unknown as ComponentType<TabComponentProps>;

const FANCY_TEXT_TOOL = registerToolAndGet();

function registerToolAndGet() {
    const definition = {
        pageName: 'fancy-text',
        label: 'Fancy Text Generator',
        icon: Sparkles,
        defaultTab: 'generate',
        mainTabs: [
            {
                id: 'generate',
                label: 'Generate',
                icon: Sparkles,
                component: GenerateTab,
                contentType: 'text' as const,
            },
        ],
    };

    registerTool(definition);
    return definition;
}

export default function FancyTextPage() {
    return <ToolPage definition={FANCY_TEXT_TOOL} />;
}
