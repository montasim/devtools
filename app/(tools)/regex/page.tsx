'use client';

import { lazy, type ComponentType } from 'react';
import { Regex } from 'lucide-react';
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

const REGEX_COLOR = 'bg-pink-100 text-pink-700 dark:bg-pink-900 dark:text-pink-300';

const toolMapping = {
    test: {
        name: 'Regex Tester',
        icon: Regex,
        color: REGEX_COLOR,
    },
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
        ],
        plugins: {
            saved: createSavedTabPlugin({
                pageName: 'regex',
                queryKey: 'regex-saved',
                toolMapping,
                tabMapping: { test: 'test' },
                storageKeyMapping: {
                    test: STORAGE_KEYS.REGEX_TEST_INPUT,
                },
            }),
            shared: createSharedTabPlugin({
                pageName: 'regex',
                queryKey: 'regex-shared',
                toolMapping,
                tabMapping: { test: 'test' },
            }),
            history: createHistoryTabPlugin({
                pageName: 'regex',
                storageKeyFilter: (key) => key.startsWith('regex-'),
                toolMapping,
                tabMapping: { test: 'test' },
            }),
        },
    };

    registerTool(definition);
    return definition;
}

export default function RegexPage() {
    return <ToolPage definition={REGEX_TOOL} />;
}
