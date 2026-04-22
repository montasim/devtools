'use client';

import { lazy, type ComponentType } from 'react';
import { Link, Unlink } from 'lucide-react';
import { ToolPage } from '@/features/tools/core/components/tool-page';
import { createSharedTabPlugin } from '@/features/tools/core/plugins/shared';
import { createSavedTabPlugin } from '@/features/tools/core/plugins/saved';
import { createHistoryTabPlugin } from '@/features/tools/core/plugins/history';
import { registerTool } from '@/features/tools/core/config/tool-registry';
import { STORAGE_KEYS } from '@/lib/utils/constants';
import type { TabComponentProps } from '@/features/tools/core/types/tool';

const EncodeTab = lazy(
    () => import('@/features/tools/url-encode/tabs/encode-tab'),
) as unknown as ComponentType<TabComponentProps>;
const DecodeTab = lazy(
    () => import('@/features/tools/url-encode/tabs/decode-tab'),
) as unknown as ComponentType<TabComponentProps>;

const ENCODE_COLOR = 'bg-sky-100 text-sky-700 dark:bg-sky-900 dark:text-sky-300';
const DECODE_COLOR = 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300';

const toolMapping = {
    encode: {
        name: 'URL Encode',
        icon: Link,
        color: ENCODE_COLOR,
    },
    decode: {
        name: 'URL Decode',
        icon: Unlink,
        color: DECODE_COLOR,
    },
};

const URL_ENCODE_TOOL = registerToolAndGet();

function registerToolAndGet() {
    const definition = {
        pageName: 'url-encode',
        label: 'URL Encode / Decode',
        icon: Link,
        defaultTab: 'encode',
        mainTabs: [
            {
                id: 'encode',
                label: 'Encode',
                icon: Link,
                component: EncodeTab,
                contentType: 'text' as const,
            },
            {
                id: 'decode',
                label: 'Decode',
                icon: Unlink,
                component: DecodeTab,
                contentType: 'text' as const,
            },
        ],
        plugins: {
            saved: createSavedTabPlugin({
                pageName: 'url-encode',
                queryKey: 'url-encode-saved',
                toolMapping,
                tabMapping: { encode: 'encode', decode: 'decode' },
                storageKeyMapping: {
                    encode: STORAGE_KEYS.URL_ENCODE_INPUT,
                    decode: STORAGE_KEYS.URL_DECODE_INPUT,
                },
            }),
            shared: createSharedTabPlugin({
                pageName: 'url-encode',
                queryKey: 'url-encode-shared',
                toolMapping,
                tabMapping: { encode: 'encode', decode: 'decode' },
            }),
            history: createHistoryTabPlugin({
                pageName: 'url-encode',
                storageKeyFilter: (key) =>
                    key.startsWith('url-encode-') || key.startsWith('url-decode-'),
                toolMapping,
                tabMapping: { encode: 'encode', decode: 'decode' },
            }),
        },
    };

    registerTool(definition);
    return definition;
}

export default function UrlEncodePage() {
    return <ToolPage definition={URL_ENCODE_TOOL} />;
}
