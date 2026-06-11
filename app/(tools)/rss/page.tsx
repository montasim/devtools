'use client';

import { lazy, type ComponentType } from 'react';
import { Rss, Activity } from 'lucide-react';
import { ToolPage } from '@/features/tools/core/components/tool-page';
import { createSavedTabPlugin } from '@/features/tools/core/plugins/saved';
import { createSharedTabPlugin } from '@/features/tools/core/plugins/shared';
import { createHistoryTabPlugin } from '@/features/tools/core/plugins/history';
import { registerTool } from '@/features/tools/core/config/tool-registry';
import { STORAGE_KEYS } from '@/lib/utils/constants';
import type { TabComponentProps } from '@/features/tools/core/types/tool';

const AnalyzerTab = lazy(
    () => import('@/features/tools/rss/tabs/analyzer-tab'),
) as unknown as ComponentType<TabComponentProps>;

const RSS_TOOL = registerToolAndGet();

function registerToolAndGet() {
    const definition = {
        pageName: 'rss',
        label: 'RSS Tools',
        icon: Rss,
        defaultTab: 'analyzer',
        mainTabs: [
            {
                id: 'analyzer',
                label: 'Analyzer',
                icon: Activity,
                component: AnalyzerTab,
                contentType: 'xml' as const,
            },
        ],
        plugins: {
            saved: createSavedTabPlugin({
                pageName: 'rss',
                queryKey: 'rss-saved',
                toolMapping: {
                    analyzer: {
                        name: 'RSS Analyzer',
                        icon: Activity,
                        color: 'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300',
                    },
                },
                tabMapping: {
                    analyzer: 'analyzer',
                },
                storageKeyMapping: {
                    analyzer: 'rss-analyzer-content',
                },
            }),
            shared: createSharedTabPlugin({
                pageName: 'rss',
                queryKey: 'rss-shared',
                toolMapping: {
                    analyzer: {
                        name: 'RSS Analyzer',
                        icon: Activity,
                        color: 'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300',
                    },
                },
                tabMapping: {
                    analyzer: 'analyzer',
                },
                storageKeys: {
                    analyzer: STORAGE_KEYS.RSS_ANALYZER_CONTENT,
                },
            }),
            history: createHistoryTabPlugin({
                pageName: 'rss',
                storageKeyFilter: (key) => key.startsWith('rss-'),
                toolMapping: {
                    analyzer: {
                        name: 'RSS Analyzer',
                        icon: Activity,
                        color: 'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300',
                    },
                },
                tabMapping: {
                    analyzer: 'analyzer',
                },
            }),
        },
    };

    registerTool(definition);
    return definition;
}

export default function RssPage() {
    return <ToolPage definition={RSS_TOOL} />;
}
