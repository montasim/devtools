'use client';

import { lazy, type ComponentType } from 'react';
import { Regex, Braces } from 'lucide-react';
import { ToolPage } from '@/features/tools/core/components/tool-page';
import { createSharedTabPlugin } from '@/features/tools/core/plugins/shared';
import { createSavedTabPlugin } from '@/features/tools/core/plugins/saved';
import { createHistoryTabPlugin } from '@/features/tools/core/plugins/history';
import { registerTool } from '@/features/tools/core/config/tool-registry';
import { STORAGE_KEYS } from '@/lib/utils/constants';
import type { TabComponentProps } from '@/features/tools/core/types/tool';

const TestTab = lazy(
    () => import('@/features/tools/regex/tabs/test-tab'),
) as unknown as ComponentType<TabComponentProps>;
const RegexEscapeTab = lazy(
    () => import('@/features/tools/regex/tabs/escape-tab'),
) as unknown as ComponentType<TabComponentProps>;

const REGEX_COLOR = 'bg-pink-100 text-pink-700 dark:bg-pink-900 dark:text-pink-300';
const ESCAPE_COLOR = 'bg-teal-100 text-teal-700 dark:bg-teal-900 dark:text-teal-300';

const toolMapping = {
    test: { name: 'Regex Tester', icon: Regex, color: REGEX_COLOR },
    escape: { name: 'Regex Escape', icon: Braces, color: ESCAPE_COLOR },
};

const REGEX_TOOL = registerToolAndGet();

function registerToolAndGet() {
    const definition = {
        pageName: 'regex',
        label: 'Regex Tester',
        icon: Regex,
        defaultTab: 'test',
        mainTabs: [
            {
                id: 'test',
                label: 'Test',
                icon: Regex,
                component: TestTab,
                contentType: 'text' as const,
            },
            {
                id: 'escape',
                label: 'Escape',
                icon: Braces,
                component: RegexEscapeTab,
                contentType: 'text' as const,
            },
        ],
        plugins: {
            saved: createSavedTabPlugin({
                pageName: 'regex',
                queryKey: 'regex-saved',
                toolMapping,
                tabMapping: { test: 'test', escape: 'escape' },
                storageKeyMapping: {
                    test: STORAGE_KEYS.REGEX_TEST_INPUT,
                    escape: STORAGE_KEYS.REGEX_ESCAPE_CONTENT,
                },
            }),
            shared: createSharedTabPlugin({
                pageName: 'regex',
                queryKey: 'regex-shared',
                toolMapping,
                tabMapping: { test: 'test', escape: 'escape' },
            }),
            history: createHistoryTabPlugin({
                pageName: 'regex',
                storageKeyFilter: (key) => key.startsWith('regex-'),
                toolMapping,
                tabMapping: { test: 'test', escape: 'escape' },
            }),
        },
    };

    registerTool(definition);
    return definition;
}

export default function RegexPage() {
    return <ToolPage definition={REGEX_TOOL} />;
}
