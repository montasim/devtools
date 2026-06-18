'use client';

import { lazy, type ComponentType } from 'react';
import { Braces, FileCode } from 'lucide-react';
import { ToolPage } from '@/features/tools/core/components/tool-page';
import { registerTool } from '@/features/tools/core/config/tool-registry';
import type { TabComponentProps } from '@/features/tools/core/types/tool';

const ConverterTab = lazy(
    () => import('@/features/tools/json-to-typescript/tabs/converter-tab'),
) as unknown as ComponentType<TabComponentProps>;

const JSON_TO_TYPESCRIPT_TOOL = registerToolAndGet();

function registerToolAndGet() {
    const definition = {
        pageName: 'json-to-typescript',
        label: 'JSON to TypeScript',
        icon: FileCode,
        defaultTab: 'converter',
        mainTabs: [
            {
                id: 'converter',
                label: 'Converter',
                icon: Braces,
                component: ConverterTab,
                contentType: 'text' as const,
            },
        ],
    };

    registerTool(definition);
    return definition;
}

export default function JsonToTypescriptPage() {
    return <ToolPage definition={JSON_TO_TYPESCRIPT_TOOL} />;
}
