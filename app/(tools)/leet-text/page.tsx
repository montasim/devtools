'use client';

import { lazy, type ComponentType } from 'react';
import { Terminal, ArrowLeftRight, BookOpen } from 'lucide-react';
import { ToolPage } from '@/features/tools/core/components/tool-page';
import { createSharedTabPlugin } from '@/features/tools/core/plugins/shared';
import { createSavedTabPlugin } from '@/features/tools/core/plugins/saved';
import { createHistoryTabPlugin } from '@/features/tools/core/plugins/history';
import { registerTool } from '@/features/tools/core/config/tool-registry';
import { STORAGE_KEYS } from '@/lib/utils/constants';
import type { TabComponentProps } from '@/features/tools/core/types/tool';

const EncodeTab = lazy(
    () => import('@/features/tools/leet-text/tabs/encode-tab'),
) as unknown as ComponentType<TabComponentProps>;
const DecodeTab = lazy(
    () => import('@/features/tools/leet-text/tabs/decode-tab'),
) as unknown as ComponentType<TabComponentProps>;
const CharactersTab = lazy(
    () => import('@/features/tools/leet-text/tabs/characters-tab'),
) as unknown as ComponentType<TabComponentProps>;

const ENCODE_COLOR = 'bg-sky-100 text-sky-700 dark:bg-sky-900 dark:text-sky-300';
const DECODE_COLOR = 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300';

const toolMapping = {
    encode: {
        name: 'Leet Encode',
        icon: Terminal,
        color: ENCODE_COLOR,
    },
    decode: {
        name: 'Leet Decode',
        icon: ArrowLeftRight,
        color: DECODE_COLOR,
    },
};

const LEET_TEXT_TOOL = registerToolAndGet();

function registerToolAndGet() {
    const definition = {
        pageName: 'leet-text',
        label: 'Leet Text Encoder / Decoder',
        icon: Terminal,
        defaultTab: 'encode',
        mainTabs: [
            {
                id: 'encode',
                label: 'Encode',
                icon: Terminal,
                component: EncodeTab,
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
                pageName: 'leet-text',
                queryKey: 'leet-text-saved',
                toolMapping,
                tabMapping: { encode: 'encode', decode: 'decode' },
                storageKeyMapping: {
                    encode: STORAGE_KEYS.LEET_TEXT_ENCODE_INPUT,
                    decode: STORAGE_KEYS.LEET_TEXT_DECODE_INPUT,
                },
            }),
            shared: createSharedTabPlugin({
                pageName: 'leet-text',
                queryKey: 'leet-text-shared',
                toolMapping,
                tabMapping: { encode: 'encode', decode: 'decode' },
            }),
            history: createHistoryTabPlugin({
                pageName: 'leet-text',
                storageKeyFilter: (key) => key.startsWith('leet-text-'),
                toolMapping,
                tabMapping: { encode: 'encode', decode: 'decode' },
            }),
        },
    };

    registerTool(definition);
    return definition;
}

export default function LeetTextPage() {
    return <ToolPage definition={LEET_TEXT_TOOL} />;
}
