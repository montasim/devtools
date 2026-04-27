'use client';

import { lazy, type ComponentType } from 'react';
import { GitBranch } from 'lucide-react';
import { ToolPage } from '@/features/tools/core/components/tool-page';
import { createSharedTabPlugin } from '@/features/tools/core/plugins/shared';
import { createSavedTabPlugin } from '@/features/tools/core/plugins/saved';
import { createHistoryTabPlugin } from '@/features/tools/core/plugins/history';
import { registerTool } from '@/features/tools/core/config/tool-registry';
import { STORAGE_KEYS } from '@/lib/utils/constants';
import type { TabComponentProps } from '@/features/tools/core/types/tool';

const GeneratorTab = lazy(
    () => import('@/features/tools/git-branch-generator/tabs/generator-tab'),
) as unknown as ComponentType<TabComponentProps>;

const GENERATOR_COLOR = 'bg-primary/10 text-primary';

const toolMapping = {
    generator: {
        name: 'Branch Generator',
        icon: GitBranch,
        color: GENERATOR_COLOR,
    },
};

const GIT_BRANCH_TOOL = registerToolAndGet();

function registerToolAndGet() {
    const definition = {
        pageName: 'git-branch-generator',
        label: 'Git Branch Generator',
        icon: GitBranch,
        defaultTab: 'generator',
        mainTabs: [
            {
                id: 'generator',
                label: 'Generate',
                icon: GitBranch,
                component: GeneratorTab,
                contentType: 'text' as const,
            },
        ],
        plugins: {
            saved: createSavedTabPlugin({
                pageName: 'git-branch-generator',
                queryKey: 'git-branch-generator-saved',
                toolMapping,
                tabMapping: { generator: 'generator' },
                storageKeyMapping: {
                    generator: STORAGE_KEYS.GIT_BRANCH_LAST_GENERATED,
                },
            }),
            shared: createSharedTabPlugin({
                pageName: 'git-branch-generator',
                queryKey: 'git-branch-generator-shared',
                toolMapping,
                tabMapping: { generator: 'generator' },
            }),
            history: createHistoryTabPlugin({
                pageName: 'git-branch-generator',
                storageKeyFilter: (key) => key.startsWith('git-branch'),
                toolMapping,
                tabMapping: { generator: 'generator' },
            }),
        },
    };

    registerTool(definition);
    return definition;
}

export default function GitBranchGeneratorPage() {
    return <ToolPage definition={GIT_BRANCH_TOOL} />;
}
