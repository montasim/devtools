'use client';

import { lazy, type ComponentType } from 'react';
import { FileCode, Braces, Binary } from 'lucide-react';
import { ToolPage } from '@/features/tools/core/components/tool-page';
import { createSharedTabPlugin } from '@/features/tools/core/plugins/shared';
import { createSavedTabPlugin } from '@/features/tools/core/plugins/saved';
import { createHistoryTabPlugin } from '@/features/tools/core/plugins/history';
import { registerTool } from '@/features/tools/core/config/tool-registry';
import { STORAGE_KEYS } from '@/lib/utils/constants';
import type { TabComponentProps } from '@/features/tools/core/types/tool';

const EncodeTab = lazy(
    () => import('@/features/tools/html-entity/tabs/encode-tab'),
) as unknown as ComponentType<TabComponentProps>;
const DecodeTab = lazy(
    () => import('@/features/tools/html-entity/tabs/decode-tab'),
) as unknown as ComponentType<TabComponentProps>;

const ENCODE_COLOR = 'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300';
const DECODE_COLOR = 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900 dark:text-cyan-300';

const toolMapping = {
    encode: {
        name: 'HTML Entity Encode',
        icon: Braces,
        color: ENCODE_COLOR,
    },
    decode: {
        name: 'HTML Entity Decode',
        icon: Binary,
        color: DECODE_COLOR,
    },
};

const HTML_ENTITY_TOOL = registerToolAndGet();

function registerToolAndGet() {
    const definition = {
        pageName: 'html-entity',
        label: 'HTML Entity Encode / Decode',
        icon: FileCode,
        defaultTab: 'encode',
        mainTabs: [
            {
                id: 'encode',
                label: 'Encode',
                icon: Braces,
                component: EncodeTab,
                contentType: 'text' as const,
            },
            {
                id: 'decode',
                label: 'Decode',
                icon: Binary,
                component: DecodeTab,
                contentType: 'text' as const,
            },
        ],
        plugins: {
            saved: createSavedTabPlugin({
                pageName: 'html-entity',
                queryKey: 'html-entity-saved',
                toolMapping,
                tabMapping: { encode: 'encode', decode: 'decode' },
                storageKeyMapping: {
                    encode: STORAGE_KEYS.HTML_ENTITY_ENCODE_INPUT,
                    decode: STORAGE_KEYS.HTML_ENTITY_DECODE_INPUT,
                },
            }),
            shared: createSharedTabPlugin({
                pageName: 'html-entity',
                queryKey: 'html-entity-shared',
                toolMapping,
                tabMapping: { encode: 'encode', decode: 'decode' },
            }),
            history: createHistoryTabPlugin({
                pageName: 'html-entity',
                storageKeyFilter: (key) => key.startsWith('html-entity-'),
                toolMapping,
                tabMapping: { encode: 'encode', decode: 'decode' },
            }),
        },
    };

    registerTool(definition);
    return definition;
}

export default function HtmlEntityPage() {
    return <ToolPage definition={HTML_ENTITY_TOOL} />;
}
