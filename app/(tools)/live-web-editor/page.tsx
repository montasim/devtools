'use client';

import { lazy, type ComponentType } from 'react';
import { LayoutTemplate } from '@/components/icons';
import { ToolPage } from '@/features/tools/core/components/tool-page';
import { registerTool } from '@/features/tools/core/config/tool-registry';
import { createSavedTabPlugin } from '@/features/tools/core/plugins/saved';
import { createSharedTabPlugin } from '@/features/tools/core/plugins/shared';
import { STORAGE_KEYS } from '@/lib/utils/constants';
import type { TabComponentProps } from '@/features/tools/core/types/tool';

const EditorTab = lazy(
    () => import('@/features/tools/live-web-editor/tabs/editor-tab'),
) as unknown as ComponentType<TabComponentProps>;

const LIVE_WEB_EDITOR_TOOL = registerToolAndGet();

function registerToolAndGet() {
    const definition = {
        pageName: 'live-web-editor',
        label: 'Live Web Editor',
        icon: LayoutTemplate,
        defaultTab: 'editor',
        mainTabs: [
            {
                id: 'editor',
                label: 'Editor',
                icon: LayoutTemplate,
                component: EditorTab,
                contentType: 'text' as const,
            },
        ],
        plugins: {
            saved: createSavedTabPlugin({
                pageName: 'live-web-editor',
                queryKey: 'live-web-editor-saved',
                toolMapping: {
                    editor: {
                        name: 'Live Web Editor',
                        icon: LayoutTemplate,
                        color: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300',
                    },
                },
                tabMapping: {
                    editor: 'editor',
                },
                storageKeyMapping: {
                    editor: 'live-web-editor-code',
                },
            }),
            shared: createSharedTabPlugin({
                pageName: 'live-web-editor',
                queryKey: 'live-web-editor-shared',
                toolMapping: {
                    editor: {
                        name: 'Live Web Editor',
                        icon: LayoutTemplate,
                        color: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300',
                    },
                },
                tabMapping: {
                    editor: 'editor',
                },
                storageKeys: {
                    editor: STORAGE_KEYS.LIVE_WEB_EDITOR_HTML_CONTENT,
                },
            }),
        },
    };

    registerTool(definition);
    return definition;
}

export default function LiveWebEditorPage() {
    return <ToolPage definition={LIVE_WEB_EDITOR_TOOL} />;
}
