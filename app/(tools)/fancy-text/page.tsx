'use client';

import { lazy, type ComponentType } from 'react';
import { Sparkles, ArrowLeftRight, BookOpen } from 'lucide-react';
import { ToolPage } from '@/features/tools/core/components/tool-page';
import { createSharedTabPlugin } from '@/features/tools/core/plugins/shared';
import { createSavedTabPlugin } from '@/features/tools/core/plugins/saved';
import { createHistoryTabPlugin } from '@/features/tools/core/plugins/history';
import { registerTool } from '@/features/tools/core/config/tool-registry';
import { STORAGE_KEYS } from '@/lib/utils/constants';
import type { TabComponentProps } from '@/features/tools/core/types/tool';

const GenerateTab = lazy(
    () => import('@/features/tools/fancy-text/tabs/generate-tab'),
) as unknown as ComponentType<TabComponentProps>;
const DecodeTab = lazy(
    () => import('@/features/tools/fancy-text/tabs/decode-tab'),
) as unknown as ComponentType<TabComponentProps>;
const CharactersTab = lazy(
    () => import('@/features/tools/fancy-text/tabs/characters-tab'),
) as unknown as ComponentType<TabComponentProps>;

const GENERATE_COLOR = 'bg-sky-100 text-sky-700 dark:bg-sky-900 dark:text-sky-300';
const DECODE_COLOR = 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300';

const toolMapping = {
    generate: {
        name: 'Fancy Generate',
        icon: Sparkles,
        color: GENERATE_COLOR,
    },
    decode: {
        name: 'Fancy Decode',
        icon: ArrowLeftRight,
        color: DECODE_COLOR,
    },
};

const FANCY_TEXT_TOOL = registerToolAndGet();

function registerToolAndGet() {
    const definition = {
        pageName: 'fancy-text',
        label: 'Fancy Text Generator',
        icon: Sparkles,
        defaultTab: 'generate',
        mainTabs: [
            {
                id: 'generate',
                label: 'Generate',
                icon: Sparkles,
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
                id: 'characters',
                label: 'Characters',
                icon: BookOpen,
                component: CharactersTab,
                contentType: 'text' as const,
            },
        ],
        plugins: {
            saved: createSavedTabPlugin({
                pageName: 'fancy-text',
                queryKey: 'fancy-text-saved',
                toolMapping,
                tabMapping: { generate: 'generate', decode: 'decode' },
                storageKeyMapping: {
                    generate: STORAGE_KEYS.FANCY_TEXT_INPUT,
                    decode: STORAGE_KEYS.FANCY_TEXT_DECODE_INPUT,
                },
            }),
            shared: createSharedTabPlugin({
                pageName: 'fancy-text',
                queryKey: 'fancy-text-shared',
                toolMapping,
                tabMapping: { generate: 'generate', decode: 'decode' },
            }),
            history: createHistoryTabPlugin({
                pageName: 'fancy-text',
                storageKeyFilter: (key) => key.startsWith('fancy-text-'),
                toolMapping,
                tabMapping: { generate: 'generate', decode: 'decode' },
            }),
        },
    };

    registerTool(definition);
    return definition;
}

export default function FancyTextPage() {
    return <ToolPage definition={FANCY_TEXT_TOOL} />;
}
