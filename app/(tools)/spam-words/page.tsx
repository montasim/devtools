'use client';

import { lazy, type ComponentType } from 'react';
import { ShieldAlert, Search, Database } from 'lucide-react';
import { ToolPage } from '@/features/tools/core/components/tool-page';
import { registerTool } from '@/features/tools/core/config/tool-registry';
import type { TabComponentProps } from '@/features/tools/core/types/tool';

const CheckerTab = lazy(
    () => import('@/features/tools/spam-words/tabs/checker-tab'),
) as unknown as ComponentType<TabComponentProps>;

const BrowserTab = lazy(
    () => import('@/features/tools/spam-words/tabs/browser-tab'),
) as unknown as ComponentType<TabComponentProps>;

const SPAM_WORDS_TOOL = registerToolAndGet();

function registerToolAndGet() {
    const definition = {
        pageName: 'spam-words',
        label: 'Spam Words Checker',
        icon: ShieldAlert,
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
                id: 'browser',
                label: 'Browser',
                icon: Database,
                component: BrowserTab,
                contentType: 'text' as const,
            },
        ],
    };

    registerTool(definition);
    return definition;
}

export default function SpamWordsPage() {
    return <ToolPage definition={SPAM_WORDS_TOOL} />;
}
