'use client';

import { lazy, type ComponentType } from 'react';
import { GitCompare, ArrowLeftRight, Sparkles, Type } from 'lucide-react';
import { ToolPage } from '@/features/tools/core/components/tool-page';
import { createSavedTabPlugin } from '@/features/tools/core/plugins/saved';
import { createSharedTabPlugin } from '@/features/tools/core/plugins/shared';
import { createHistoryTabPlugin } from '@/features/tools/core/plugins/history';
import { registerTool } from '@/features/tools/core/config/tool-registry';
import { STORAGE_KEYS } from '@/lib/utils/constants';
import type { TabComponentProps } from '@/features/tools/core/types/tool';

const TextDiffTab = lazy(
    () => import('@/features/tools/text/tabs/diff-tab'),
) as unknown as ComponentType<TabComponentProps>;
const ConvertTab = lazy(
    () => import('@/features/tools/text/tabs/convert-tab'),
) as unknown as ComponentType<TabComponentProps>;
const CleanTab = lazy(
    () => import('@/features/tools/text/tabs/clean-tab'),
) as unknown as ComponentType<TabComponentProps>;

const TEXT_TOOL = registerToolAndGet();

function registerToolAndGet() {
    const definition = {
        pageName: 'text',
        label: 'Text Tools',
        icon: Type,
        defaultTab: 'diff',
        mainTabs: [
            {
                id: 'diff',
                label: 'Diff',
                icon: GitCompare,
                component: TextDiffTab,
                contentType: 'text' as const,
            },
            {
                id: 'convert',
                label: 'Convert',
                icon: ArrowLeftRight,
                component: ConvertTab,
                contentType: 'text' as const,
            },
            {
                id: 'clean',
                label: 'Clean',
                icon: Sparkles,
                component: CleanTab,
                contentType: 'text' as const,
            },
        ],
        plugins: {
            saved: createSavedTabPlugin({
                pageName: 'text',
                queryKey: 'text-saved',
                toolMapping: {
                    diff: {
                        name: 'Text Diff',
                        icon: GitCompare,
                        color: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
                    },
                    convert: {
                        name: 'Text Convert',
                        icon: ArrowLeftRight,
                        color: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300',
                    },
                    clean: {
                        name: 'Text Clean',
                        icon: Sparkles,
                        color: 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300',
                    },
                },
                tabMapping: { diff: 'diff', convert: 'convert', clean: 'clean' },
                storageKeyMapping: {
                    diff: 'text-diff-left-content',
                    convert: 'text-convert-input-content',
                    clean: 'text-clean-input-content',
                },
            }),
            shared: createSharedTabPlugin({
                pageName: 'text',
                queryKey: 'text-shared',
                toolMapping: {
                    diff: {
                        name: 'Text Diff',
                        icon: GitCompare,
                        color: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
                    },
                    convert: {
                        name: 'Text Convert',
                        icon: ArrowLeftRight,
                        color: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300',
                    },
                    clean: {
                        name: 'Text Clean',
                        icon: Sparkles,
                        color: 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300',
                    },
                },
                tabMapping: { diff: 'diff', convert: 'convert', clean: 'clean' },
                storageKeys: {
                    diff: STORAGE_KEYS.TEXT_DIFF_LEFT_CONTENT,
                    convert: STORAGE_KEYS.TEXT_CONVERT_INPUT_CONTENT,
                    clean: STORAGE_KEYS.TEXT_CLEAN_INPUT_CONTENT,
                },
            }),
            history: createHistoryTabPlugin({
                pageName: 'text',
                storageKeyFilter: (key) => key.startsWith('text-'),
                toolMapping: {
                    diff: {
                        name: 'Text Diff',
                        icon: GitCompare,
                        color: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
                    },
                    convert: {
                        name: 'Text Convert',
                        icon: ArrowLeftRight,
                        color: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300',
                    },
                },
                tabMapping: { diff: 'diff', convert: 'convert', clean: 'clean' },
            }),
        },
    };

    registerTool(definition);
    return definition;
}

export default function TextPage() {
    return <ToolPage definition={TEXT_TOOL} />;
}
