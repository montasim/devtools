'use client';

import { lazy, type ComponentType } from 'react';
import { Paintbrush, Minimize2 } from 'lucide-react';
import { ToolPage } from '@/features/tools/core/components/tool-page';
import { createSavedTabPlugin } from '@/features/tools/core/plugins/saved';
import { createSharedTabPlugin } from '@/features/tools/core/plugins/shared';
import { createHistoryTabPlugin } from '@/features/tools/core/plugins/history';
import { registerTool } from '@/features/tools/core/config/tool-registry';
import type { TabComponentProps } from '@/features/tools/core/types/tool';

const FormatTab = lazy(
    () => import('@/features/tools/css/tabs/format-tab'),
) as unknown as ComponentType<TabComponentProps>;
const MinifyTab = lazy(
    () => import('@/features/tools/css/tabs/minify-tab'),
) as unknown as ComponentType<TabComponentProps>;

const CSS_TOOL = registerToolAndGet();

function registerToolAndGet() {
    const definition = {
        pageName: 'css',
        label: 'CSS Tools',
        icon: Paintbrush,
        defaultTab: 'format',
        mainTabs: [
            {
                id: 'format',
                label: 'Format',
                icon: Paintbrush,
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
        ],
        plugins: {
            saved: createSavedTabPlugin({
                pageName: 'css',
                queryKey: 'css-saved',
                toolMapping: {
                    format: {
                        name: 'CSS Format',
                        icon: Paintbrush,
                        color: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
                    },
                    minify: {
                        name: 'CSS Minify',
                        icon: Minimize2,
                        color: 'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300',
                    },
                },
                tabMapping: {
                    format: 'format',
                    minify: 'minify',
                },
                storageKeyMapping: {
                    format: 'css-format-content',
                    minify: 'css-minify-content',
                },
            }),
            shared: createSharedTabPlugin({
                pageName: 'css',
                queryKey: 'css-shared',
                toolMapping: {
                    format: {
                        name: 'CSS Format',
                        icon: Paintbrush,
                        color: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
                    },
                    minify: {
                        name: 'CSS Minify',
                        icon: Minimize2,
                        color: 'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300',
                    },
                },
                tabMapping: {
                    format: 'format',
                    minify: 'minify',
                },
                storageKeys: {
                    format: 'css-format-content',
                    minify: 'css-minify-content',
                },
            }),
            history: createHistoryTabPlugin({
                pageName: 'css',
                storageKeyFilter: (key) => key.startsWith('css-'),
                toolMapping: {
                    format: {
                        name: 'CSS Format',
                        icon: Paintbrush,
                        color: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
                    },
                    minify: {
                        name: 'CSS Minify',
                        icon: Minimize2,
                        color: 'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300',
                    },
                },
                tabMapping: {
                    format: 'format',
                    minify: 'minify',
                },
            }),
        },
    };

    registerTool(definition);
    return definition;
}

export default function CssPage() {
    return <ToolPage definition={CSS_TOOL} />;
}
