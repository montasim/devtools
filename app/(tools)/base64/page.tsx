'use client';

import { lazy, type ComponentType } from 'react';
import { Upload, Download, Binary } from 'lucide-react';
import { ToolPage } from '@/features/tools/core/components/tool-page';
import { createSharedTabPlugin } from '@/features/tools/core/plugins/shared';
import { createHistoryTabPlugin } from '@/features/tools/core/plugins/history';
import { registerTool } from '@/features/tools/core/config/tool-registry';
import type { TabComponentProps } from '@/features/tools/core/types/tool';

const MediaToBase64Tab = lazy(
    () => import('@/features/tools/base64/tabs/media-to-base64-tab'),
) as unknown as ComponentType<TabComponentProps>;
const Base64ToMediaTab = lazy(
    () => import('@/features/tools/base64/tabs/base64-to-media-tab'),
) as unknown as ComponentType<TabComponentProps>;

const BASE64_TOOL = registerToolAndGet();

function registerToolAndGet() {
    const definition = {
        pageName: 'base64',
        label: 'Base64 Tools',
        icon: Binary,
        defaultTab: 'media-to-base64',
        mainTabs: [
            {
                id: 'media-to-base64',
                label: 'Media to Base64',
                icon: Upload,
                component: MediaToBase64Tab,
                contentType: 'base64' as const,
            },
            {
                id: 'base64-to-media',
                label: 'Base64 to Media',
                icon: Download,
                component: Base64ToMediaTab,
                contentType: 'base64' as const,
            },
        ],
        plugins: {
            shared: createSharedTabPlugin({
                pageName: 'base64',
                queryKey: 'base64-shared',
                toolMapping: {
                    'media-to-base64': {
                        name: 'Media to Base64',
                        icon: Upload,
                        color: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
                    },
                    'base64-to-media': {
                        name: 'Base64 to Media',
                        icon: Download,
                        color: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300',
                    },
                },
                tabMapping: {
                    'media-to-base64': 'media-to-base64',
                    'base64-to-media': 'base64-to-media',
                },
            }),
            history: createHistoryTabPlugin({
                pageName: 'base64',
                storageKeyFilter: (key) => key.startsWith('base64-'),
                toolMapping: {
                    'media-to-base64': {
                        name: 'Media to Base64',
                        icon: Upload,
                        color: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
                    },
                    'base64-to-media': {
                        name: 'Base64 to Media',
                        icon: Download,
                        color: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300',
                    },
                },
                tabMapping: {
                    'media-to-base64': 'media-to-base64',
                    'base64-to-media': 'base64-to-media',
                },
            }),
        },
    };

    registerTool(definition);
    return definition;
}

export default function Base64Page() {
    return <ToolPage definition={BASE64_TOOL} />;
}
