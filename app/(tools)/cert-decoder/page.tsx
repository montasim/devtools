'use client';

import { lazy, type ComponentType } from 'react';
import { Fingerprint, FileSearch } from 'lucide-react';
import { ToolPage } from '@/features/tools/core/components/tool-page';
import { createSharedTabPlugin } from '@/features/tools/core/plugins/shared';
import { createSavedTabPlugin } from '@/features/tools/core/plugins/saved';
import { createHistoryTabPlugin } from '@/features/tools/core/plugins/history';
import { registerTool } from '@/features/tools/core/config/tool-registry';
import { STORAGE_KEYS } from '@/lib/utils/constants';
import type { TabComponentProps } from '@/features/tools/core/types/tool';

const DecodeTab = lazy(
    () => import('@/features/tools/cert-decoder/tabs/decode-tab'),
) as unknown as ComponentType<TabComponentProps>;

const DECODE_COLOR = 'bg-teal-100 text-teal-700 dark:bg-teal-900 dark:text-teal-300';

const toolMapping = {
    decode: {
        name: 'Certificate Decoder',
        icon: Fingerprint,
        color: DECODE_COLOR,
    },
};

const CERT_DECODER_TOOL = registerToolAndGet();

function registerToolAndGet() {
    const definition = {
        pageName: 'cert-decoder',
        label: 'Certificate Decoder',
        icon: Fingerprint,
        defaultTab: 'decode',
        mainTabs: [
            {
                id: 'decode',
                label: 'Decode',
                icon: FileSearch,
                component: DecodeTab,
                contentType: 'text' as const,
            },
        ],
        plugins: {
            saved: createSavedTabPlugin({
                pageName: 'cert-decoder',
                queryKey: 'cert-decoder-saved',
                toolMapping,
                tabMapping: { decode: 'decode' },
                storageKeyMapping: {
                    decode: STORAGE_KEYS.CERT_DECODER_INPUT,
                },
            }),
            shared: createSharedTabPlugin({
                pageName: 'cert-decoder',
                queryKey: 'cert-decoder-shared',
                toolMapping,
                tabMapping: { decode: 'decode' },
            }),
            history: createHistoryTabPlugin({
                pageName: 'cert-decoder',
                storageKeyFilter: (key) => key.startsWith('cert-decoder-'),
                toolMapping,
                tabMapping: { decode: 'decode' },
            }),
        },
    };

    registerTool(definition);
    return definition;
}

export default function CertDecoderPage() {
    return <ToolPage definition={CERT_DECODER_TOOL} />;
}
