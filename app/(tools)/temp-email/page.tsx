'use client';

import { lazy, type ComponentType } from 'react';
import { MailX, Search, Database } from 'lucide-react';
import { ToolPage } from '@/features/tools/core/components/tool-page';
import { registerTool } from '@/features/tools/core/config/tool-registry';
import type { TabComponentProps } from '@/features/tools/core/types/tool';

const CheckerTab = lazy(
    () => import('@/features/tools/temp-email/tabs/checker-tab'),
) as unknown as ComponentType<TabComponentProps>;

const SampleDataTab = lazy(
    () => import('@/features/tools/temp-email/tabs/sample-data-tab'),
) as unknown as ComponentType<TabComponentProps>;

const TEMP_EMAIL_TOOL = registerToolAndGet();

function registerToolAndGet() {
    const definition = {
        pageName: 'temp-email',
        label: 'Temporary Email Checker',
        icon: MailX,
        defaultTab: 'checker',
        mainTabs: [
            {
                id: 'checker',
                label: 'Checker',
                icon: Search,
                component: CheckerTab,
                contentType: 'text' as const,
            },
            {
                id: 'sample-data',
                label: 'Sample Data',
                icon: Database,
                component: SampleDataTab,
                contentType: 'text' as const,
            },
        ],
    };

    registerTool(definition);
    return definition;
}

export default function TempEmailPage() {
    return <ToolPage definition={TEMP_EMAIL_TOOL} />;
}
