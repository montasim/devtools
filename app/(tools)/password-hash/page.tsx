'use client';

import { lazy, type ComponentType } from 'react';
import { Lock, ShieldCheck, ShieldQuestion } from 'lucide-react';
import { ToolPage } from '@/features/tools/core/components/tool-page';
import { createSharedTabPlugin } from '@/features/tools/core/plugins/shared';
import { createSavedTabPlugin } from '@/features/tools/core/plugins/saved';
import { createHistoryTabPlugin } from '@/features/tools/core/plugins/history';
import { registerTool } from '@/features/tools/core/config/tool-registry';
import { STORAGE_KEYS } from '@/lib/utils/constants';
import type { TabComponentProps } from '@/features/tools/core/types/tool';

const HashTab = lazy(
    () => import('@/features/tools/password-hash/tabs/hash-tab'),
) as unknown as ComponentType<TabComponentProps>;
const VerifyTab = lazy(
    () => import('@/features/tools/password-hash/tabs/verify-tab'),
) as unknown as ComponentType<TabComponentProps>;

const HASH_COLOR = 'bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300';
const VERIFY_COLOR = 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300';

const toolMapping = {
    hash: {
        name: 'Password Hash',
        icon: Lock,
        color: HASH_COLOR,
    },
    verify: {
        name: 'Password Verify',
        icon: ShieldCheck,
        color: VERIFY_COLOR,
    },
};

const PASSWORD_HASH_TOOL = registerToolAndGet();

function registerToolAndGet() {
    const definition = {
        pageName: 'password-hash',
        label: 'Password Hash / Verify',
        icon: Lock,
        defaultTab: 'hash',
        mainTabs: [
            {
                id: 'hash',
                label: 'Hash',
                icon: Lock,
                component: HashTab,
                contentType: 'text' as const,
            },
            {
                id: 'verify',
                label: 'Verify',
                icon: ShieldQuestion,
                component: VerifyTab,
                contentType: 'text' as const,
            },
        ],
        plugins: {
            saved: createSavedTabPlugin({
                pageName: 'password-hash',
                queryKey: 'password-hash-saved',
                toolMapping,
                tabMapping: { hash: 'hash', verify: 'verify' },
                storageKeyMapping: {
                    hash: STORAGE_KEYS.PASSWORD_HASH_INPUT,
                    verify: STORAGE_KEYS.PASSWORD_VERIFY_INPUT,
                },
            }),
            shared: createSharedTabPlugin({
                pageName: 'password-hash',
                queryKey: 'password-hash-shared',
                toolMapping,
                tabMapping: { hash: 'hash', verify: 'verify' },
            }),
            history: createHistoryTabPlugin({
                pageName: 'password-hash',
                storageKeyFilter: (key) =>
                    key.startsWith('password-hash-') || key.startsWith('password-verify-'),
                toolMapping,
                tabMapping: { hash: 'hash', verify: 'verify' },
            }),
        },
    };

    registerTool(definition);
    return definition;
}

export default function PasswordHashPage() {
    return <ToolPage definition={PASSWORD_HASH_TOOL} />;
}
