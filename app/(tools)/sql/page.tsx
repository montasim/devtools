'use client';

import { lazy, type ComponentType } from 'react';
import { Database, Minimize2, Braces } from 'lucide-react';
import { ToolPage } from '@/features/tools/core/components/tool-page';
import { createSavedTabPlugin } from '@/features/tools/core/plugins/saved';
import { createSharedTabPlugin } from '@/features/tools/core/plugins/shared';
import { createHistoryTabPlugin } from '@/features/tools/core/plugins/history';
import { registerTool } from '@/features/tools/core/config/tool-registry';
import type { TabComponentProps } from '@/features/tools/core/types/tool';

const FormatTab = lazy(
    () => import('@/features/tools/sql/tabs/format-tab'),
) as unknown as ComponentType<TabComponentProps>;
const MinifyTab = lazy(
    () => import('@/features/tools/sql/tabs/minify-tab'),
) as unknown as ComponentType<TabComponentProps>;
const SqlEscapeTab = lazy(
    () => import('@/features/tools/sql/tabs/escape-tab'),
) as unknown as ComponentType<TabComponentProps>;

const SQL_TOOL = registerToolAndGet();

function registerToolAndGet() {
    const definition = {
        pageName: 'sql',
        label: 'SQL Tools',
        icon: Database,
        defaultTab: 'format',
        mainTabs: [
            {
                id: 'format',
                label: 'Format',
                icon: Database,
                component: FormatTab,
                contentType: 'text' as const,
            },
            {
                id: 'minify',
                label: 'Minify',
                icon: Minimize2,
                component: MinifyTab,
                contentType: 'text' as const,
            },
            {
                id: 'escape',
                label: 'Escape',
                icon: Braces,
                component: SqlEscapeTab,
                contentType: 'text' as const,
            },
        ],
        plugins: {
            saved: createSavedTabPlugin({
                pageName: 'sql',
                queryKey: 'sql-saved',
                toolMapping: {
                    format: {
                        name: 'SQL Format',
                        icon: Database,
                        color: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
                    },
                    minify: {
                        name: 'SQL Minify',
                        icon: Minimize2,
                        color: 'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300',
                    },
                    escape: {
                        name: 'SQL Escape',
                        icon: Braces,
                        color: 'bg-teal-100 text-teal-700 dark:bg-teal-900 dark:text-teal-300',
                    },
                },
                tabMapping: {
                    format: 'format',
                    minify: 'minify',
                    escape: 'escape',
                },
                storageKeyMapping: {
                    format: 'sql-format-content',
                    minify: 'sql-minify-content',
                    escape: 'sql-escape-content',
                },
            }),
            shared: createSharedTabPlugin({
                pageName: 'sql',
                queryKey: 'sql-shared',
                toolMapping: {
                    format: {
                        name: 'SQL Format',
                        icon: Database,
                        color: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
                    },
                    minify: {
                        name: 'SQL Minify',
                        icon: Minimize2,
                        color: 'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300',
                    },
                    escape: {
                        name: 'SQL Escape',
                        icon: Braces,
                        color: 'bg-teal-100 text-teal-700 dark:bg-teal-900 dark:text-teal-300',
                    },
                },
                tabMapping: {
                    format: 'format',
                    minify: 'minify',
                    escape: 'escape',
                },
                storageKeys: {
                    format: 'sql-format-content',
                    minify: 'sql-minify-content',
                    escape: 'sql-escape-content',
                },
            }),
            history: createHistoryTabPlugin({
                pageName: 'sql',
                storageKeyFilter: (key) => key.startsWith('sql-'),
                toolMapping: {
                    format: {
                        name: 'SQL Format',
                        icon: Database,
                        color: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
                    },
                    minify: {
                        name: 'SQL Minify',
                        icon: Minimize2,
                        color: 'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300',
                    },
                    escape: {
                        name: 'SQL Escape',
                        icon: Braces,
                        color: 'bg-teal-100 text-teal-700 dark:bg-teal-900 dark:text-teal-300',
                    },
                },
                tabMapping: {
                    format: 'format',
                    minify: 'minify',
                    escape: 'escape',
                },
            }),
        },
    };

    registerTool(definition);
    return definition;
}

export default function SqlPage() {
    return <ToolPage definition={SQL_TOOL} />;
}
