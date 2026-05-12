'use client';

import { lazy, type ComponentType } from 'react';
import { Type, ArrowLeftRight, BookOpen } from 'lucide-react';
import { ToolPage } from '@/features/tools/core/components/tool-page';
import { createSharedTabPlugin } from '@/features/tools/core/plugins/shared';
import { createSavedTabPlugin } from '@/features/tools/core/plugins/saved';
import { createHistoryTabPlugin } from '@/features/tools/core/plugins/history';
import { registerTool } from '@/features/tools/core/config/tool-registry';
import { STORAGE_KEYS } from '@/lib/utils/constants';
import type { TabComponentProps } from '@/features/tools/core/types/tool';

const GenerateTab = lazy(
    () => import('@/features/tools/text-art/tabs/generate-tab'),
) as unknown as ComponentType<TabComponentProps>;
const DecodeTab = lazy(
    () => import('@/features/tools/text-art/tabs/decode-tab'),
) as unknown as ComponentType<TabComponentProps>;
const StylesTab = lazy(
    () => import('@/features/tools/text-art/tabs/styles-tab'),
) as unknown as ComponentType<TabComponentProps>;

const GENERATE_COLOR = 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300';
const DECODE_COLOR = 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300';

const toolMapping = {
    generate: {
        name: 'Text Art',
        icon: Type,
        color: GENERATE_COLOR,
    },
    decode: {
        name: 'Art Decode',
        icon: ArrowLeftRight,
        color: DECODE_COLOR,
    },
};

const TEXT_ART_TOOL = registerToolAndGet();

function registerToolAndGet() {
    const definition = {
        pageName: 'text-art',
        label: 'Text Art Generator',
        icon: Type,
        defaultTab: 'generate',
        mainTabs: [
            {
                id: 'generate',
                label: 'Generate',
                icon: Type,
                component: GenerateTab,
                contentType: 'text' as const,
            },
            {
                id: 'decode',
                label: 'Decode',
                icon: ArrowLeftRight,
                component: DecodeTab,
                contentType: 'text' as const,
            },
            {
                id: 'styles',
                label: 'Styles',
                icon: BookOpen,
                component: StylesTab,
                contentType: 'text' as const,
            },
        ],
        plugins: {
            saved: createSavedTabPlugin({
                pageName: 'text-art',
                queryKey: 'text-art-saved',
                toolMapping,
                tabMapping: { generate: 'generate', decode: 'decode' },
                storageKeyMapping: {
                    generate: STORAGE_KEYS.TEXT_ART_INPUT,
                    decode: STORAGE_KEYS.TEXT_ART_DECODE_INPUT,
                },
            }),
            shared: createSharedTabPlugin({
                pageName: 'text-art',
                queryKey: 'text-art-shared',
                toolMapping,
                tabMapping: { generate: 'generate', decode: 'decode' },
            }),
            history: createHistoryTabPlugin({
                pageName: 'text-art',
                storageKeyFilter: (key: string) => key.startsWith('text-art-'),
                toolMapping,
                tabMapping: { generate: 'generate', decode: 'decode' },
            }),
        },
    };

    registerTool(definition);
    return definition;
}

export default function TextArtPage() {
    return <ToolPage definition={TEXT_ART_TOOL} />;
}
