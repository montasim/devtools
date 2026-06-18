'use client';

import { lazy, type ComponentType } from 'react';
import { Code2, Minimize2, ShieldCheck } from 'lucide-react';
import { ToolPage } from '@/features/tools/core/components/tool-page';
import { createSavedTabPlugin } from '@/features/tools/core/plugins/saved';
import { createSharedTabPlugin } from '@/features/tools/core/plugins/shared';
import { createHistoryTabPlugin } from '@/features/tools/core/plugins/history';
import { registerTool } from '@/features/tools/core/config/tool-registry';
import { STORAGE_KEYS } from '@/lib/utils/constants';
import type { TabComponentProps } from '@/features/tools/core/types/tool';

const FormatTab = lazy(
    () => import('@/features/tools/html/tabs/format-tab'),
) as unknown as ComponentType<TabComponentProps>;
const MinifyTab = lazy(
    () => import('@/features/tools/html/tabs/minify-tab'),
) as unknown as ComponentType<TabComponentProps>;
const ValidateTab = lazy(
    () => import('@/features/tools/html/tabs/validate-tab'),
) as unknown as ComponentType<TabComponentProps>;

const HTML_TOOL = registerToolAndGet();

function registerToolAndGet() {
    const definition = {
        pageName: 'html',
        label: 'HTML Tools',
        icon: Code2,
        defaultTab: 'format',
        mainTabs: [
            {
                id: 'format',
                label: 'Format',
                icon: Code2,
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
                id: 'validate',
                label: 'Validate',
                icon: ShieldCheck,
                component: ValidateTab,
                contentType: 'text' as const,
            },
        ],
        plugins: {
            saved: createSavedTabPlugin({
                pageName: 'html',
                queryKey: 'html-saved',
                toolMapping: {
                    format: {
                        name: 'HTML Format',
                        icon: Code2,
                        color: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300',
                    },
                    minify: {
                        name: 'HTML Minify',
                        icon: Minimize2,
                        color: 'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300',
                    },
                    validate: {
                        name: 'HTML Validate',
                        icon: ShieldCheck,
                        color: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
                    },
                },
                tabMapping: {
                    format: 'format',
                    minify: 'minify',
                    validate: 'validate',
                },
                storageKeyMapping: {
                    format: 'html-format-content',
                    minify: 'html-minify-content',
                    validate: 'html-validate-content',
                },
            }),
            shared: createSharedTabPlugin({
                pageName: 'html',
                queryKey: 'html-shared',
                toolMapping: {
                    format: {
                        name: 'HTML Format',
                        icon: Code2,
                        color: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300',
                    },
                    minify: {
                        name: 'HTML Minify',
                        icon: Minimize2,
                        color: 'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300',
                    },
                    validate: {
                        name: 'HTML Validate',
                        icon: ShieldCheck,
                        color: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
                    },
                },
                tabMapping: {
                    format: 'format',
                    minify: 'minify',
                    validate: 'validate',
                },
                storageKeys: {
                    format: STORAGE_KEYS.HTML_FORMAT_CONTENT,
                    minify: STORAGE_KEYS.HTML_MINIFY_CONTENT,
                    validate: STORAGE_KEYS.HTML_VALIDATE_CONTENT,
                },
            }),
            history: createHistoryTabPlugin({
                pageName: 'html',
                storageKeyFilter: (key) => key.startsWith('html-'),
                toolMapping: {
                    format: {
                        name: 'HTML Format',
                        icon: Code2,
                        color: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300',
                    },
                    minify: {
                        name: 'HTML Minify',
                        icon: Minimize2,
                        color: 'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300',
                    },
                    validate: {
                        name: 'HTML Validate',
                        icon: ShieldCheck,
                        color: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
                    },
                },
                tabMapping: {
                    format: 'format',
                    minify: 'minify',
                    validate: 'validate',
                },
            }),
        },
    };

    registerTool(definition);
    return definition;
}

export default function HtmlPage() {
    return <ToolPage definition={HTML_TOOL} />;
}
