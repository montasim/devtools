'use client';

import { lazy, type ComponentType } from 'react';
import { Fingerprint, Layers, Hash } from 'lucide-react';
import { ToolPage } from '@/features/tools/core/components/tool-page';
import { createSharedTabPlugin } from '@/features/tools/core/plugins/shared';
import { createSavedTabPlugin } from '@/features/tools/core/plugins/saved';
import { createHistoryTabPlugin } from '@/features/tools/core/plugins/history';
import { registerTool } from '@/features/tools/core/config/tool-registry';
import { STORAGE_KEYS } from '@/lib/utils/constants';
import type { TabComponentProps } from '@/features/tools/core/types/tool';

const UuidTab = lazy(
    () => import('@/features/tools/id/tabs/uuid-tab'),
) as unknown as ComponentType<TabComponentProps>;
const UlidTab = lazy(
    () => import('@/features/tools/id/tabs/ulid-tab'),
) as unknown as ComponentType<TabComponentProps>;
const NanoidTab = lazy(
    () => import('@/features/tools/id/tabs/nanoid-tab'),
) as unknown as ComponentType<TabComponentProps>;

const UUID_COLOR = 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300';
const ULID_COLOR = 'bg-teal-100 text-teal-700 dark:bg-teal-900 dark:text-teal-300';
const NANO_COLOR = 'bg-rose-100 text-rose-700 dark:bg-rose-900 dark:text-rose-300';

const toolMapping = {
    uuid: {
        name: 'UUID Generator',
        icon: Fingerprint,
        color: UUID_COLOR,
    },
    ulid: {
        name: 'ULID Generator',
        icon: Layers,
        color: ULID_COLOR,
    },
    nanoid: {
        name: 'NanoID Generator',
        icon: Hash,
        color: NANO_COLOR,
    },
};

const ID_TOOL = registerToolAndGet();

function registerToolAndGet() {
    const definition = {
        pageName: 'id',
        label: 'ID Generator',
        icon: Fingerprint,
        defaultTab: 'uuid',
        mainTabs: [
            {
                id: 'uuid',
                label: 'UUID',
                icon: Fingerprint,
                component: UuidTab,
                contentType: 'text' as const,
            },
            {
                id: 'ulid',
                label: 'ULID',
                icon: Layers,
                component: UlidTab,
                contentType: 'text' as const,
            },
            {
                id: 'nanoid',
                label: 'NanoID',
                icon: Hash,
                component: NanoidTab,
                contentType: 'text' as const,
            },
        ],
        plugins: {
            saved: createSavedTabPlugin({
                pageName: 'id',
                queryKey: 'id-saved',
                toolMapping,
                tabMapping: { uuid: 'uuid', ulid: 'ulid', nanoid: 'nanoid' },
                storageKeyMapping: {
                    uuid: STORAGE_KEYS.UUID_RESULTS,
                    ulid: STORAGE_KEYS.ULID_RESULTS,
                    nanoid: STORAGE_KEYS.NANOID_RESULTS,
                },
            }),
            shared: createSharedTabPlugin({
                pageName: 'id',
                queryKey: 'id-shared',
                toolMapping,
                tabMapping: { uuid: 'uuid', ulid: 'ulid', nanoid: 'nanoid' },
            }),
            history: createHistoryTabPlugin({
                pageName: 'id',
                storageKeyFilter: (key) =>
                    key.startsWith('uuid-') || key.startsWith('ulid-') || key.startsWith('nanoid-'),
                toolMapping,
                tabMapping: { uuid: 'uuid', ulid: 'ulid', nanoid: 'nanoid' },
            }),
        },
    };

    registerTool(definition);
    return definition;
}

export default function IdPage() {
    return <ToolPage definition={ID_TOOL} />;
}
