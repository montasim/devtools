'use client';

import { lazy, type ComponentType } from 'react';
import { List, FileText } from 'lucide-react';
import { ToolPage } from '@/features/tools/core/components/tool-page';
import { registerTool } from '@/features/tools/core/config/tool-registry';
import type { TabComponentProps } from '@/features/tools/core/types/tool';

const ParserTab = lazy(
    () => import('@/features/tools/http-header-parser/tabs/parser-tab'),
) as unknown as ComponentType<TabComponentProps>;

const HTTP_HEADER_PARSER_TOOL = registerToolAndGet();

function registerToolAndGet() {
    const definition = {
        pageName: 'http-header-parser',
        label: 'HTTP Header Parser',
        icon: List,
        defaultTab: 'parser',
        mainTabs: [
            {
                id: 'parser',
                label: 'Parser',
                icon: FileText,
                component: ParserTab,
                contentType: 'text' as const,
            },
        ],
    };

    registerTool(definition);
    return definition;
}

export default function HttpHeaderParserPage() {
    return <ToolPage definition={HTTP_HEADER_PARSER_TOOL} />;
}
