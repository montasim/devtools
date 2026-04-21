'use client';

import { lazy, type ComponentType } from 'react';
import { QrCode, Plus } from 'lucide-react';
import { ToolPage } from '@/features/tools/core/components/tool-page';
import { createSavedTabPlugin } from '@/features/tools/core/plugins/saved';
import { createSharedTabPlugin } from '@/features/tools/core/plugins/shared';
import { createHistoryTabPlugin } from '@/features/tools/core/plugins/history';
import { registerTool } from '@/features/tools/core/config/tool-registry';
import { STORAGE_KEYS } from '@/lib/utils/constants';
import type { TabComponentProps } from '@/features/tools/core/types/tool';

const CreateTab = lazy(
    () => import('@/features/tools/qrcode/tabs/create-tab'),
) as unknown as ComponentType<TabComponentProps>;

const QRCODE_TOOL = registerToolAndGet();

function registerToolAndGet() {
    const definition = {
        pageName: 'qrcode',
        label: 'QR Code Generator',
        icon: QrCode,
        defaultTab: 'create',
        mainTabs: [
            {
                id: 'create',
                label: 'Create',
                icon: Plus,
                component: CreateTab,
                contentType: 'qrcode' as const,
            },
        ],
        plugins: {
            saved: createSavedTabPlugin({
                pageName: 'qrcode',
                queryKey: 'qrcode-saved',
                toolMapping: {
                    create: {
                        name: 'QR Create',
                        icon: QrCode,
                        color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300',
                    },
                },
                tabMapping: { create: 'create' },
                storageKeyMapping: {
                    create: STORAGE_KEYS.QR_CREATE_INPUT,
                },
            }),
            shared: createSharedTabPlugin({
                pageName: 'qrcode',
                queryKey: 'qrcode-shared',
                toolMapping: {
                    create: {
                        name: 'QR Create',
                        icon: QrCode,
                        color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300',
                    },
                },
                tabMapping: { create: 'create' },
                storageKeys: {
                    create: STORAGE_KEYS.QR_CREATE_INPUT,
                },
            }),
            history: createHistoryTabPlugin({
                pageName: 'qrcode',
                storageKeyFilter: (key) => key.startsWith('qr-'),
                toolMapping: {
                    create: {
                        name: 'QR Create',
                        icon: QrCode,
                        color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300',
                    },
                },
                tabMapping: { create: 'create' },
            }),
        },
    };

    registerTool(definition);
    return definition;
}

export default function QRCodePage() {
    return <ToolPage definition={QRCODE_TOOL} />;
}
