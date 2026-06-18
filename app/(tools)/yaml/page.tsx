'use client';

import { lazy, type ComponentType } from 'react';
import { Layers, ArrowRight, ArrowLeft, ShieldCheck } from 'lucide-react';
import { ToolPage } from '@/features/tools/core/components/tool-page';
import { createSavedTabPlugin } from '@/features/tools/core/plugins/saved';
import { createSharedTabPlugin } from '@/features/tools/core/plugins/shared';
import { createHistoryTabPlugin } from '@/features/tools/core/plugins/history';
import { registerTool } from '@/features/tools/core/config/tool-registry';
import type { TabComponentProps } from '@/features/tools/core/types/tool';

const FormatTab = lazy(
    () => import('@/features/tools/yaml/tabs/format-tab'),
) as unknown as ComponentType<TabComponentProps>;
const YamlToJsonTab = lazy(
    () => import('@/features/tools/yaml/tabs/yaml-to-json-tab'),
) as unknown as ComponentType<TabComponentProps>;
const JsonToYamlTab = lazy(
    () => import('@/features/tools/yaml/tabs/json-to-yaml-tab'),
) as unknown as ComponentType<TabComponentProps>;
const ValidateTab = lazy(
    () => import('@/features/tools/yaml/tabs/validate-tab'),
) as unknown as ComponentType<TabComponentProps>;

const YAML_COLOR = 'bg-violet-100 text-violet-700 dark:bg-violet-900 dark:text-violet-300';

const toolMapping = {
    format: {
        name: 'YAML Format',
        icon: Layers,
        color: YAML_COLOR,
    },
    'yaml-to-json': {
        name: 'YAML → JSON',
        icon: ArrowRight,
        color: YAML_COLOR,
    },
    'json-to-yaml': {
        name: 'JSON → YAML',
        icon: ArrowLeft,
        color: YAML_COLOR,
    },
    validate: {
        name: 'YAML Validate',
        icon: ShieldCheck,
        color: YAML_COLOR,
    },
};

const YAML_TOOL = registerToolAndGet();

function registerToolAndGet() {
    const definition = {
        pageName: 'yaml',
        label: 'YAML Tools',
        icon: Layers,
        defaultTab: 'format',
        mainTabs: [
            {
                id: 'format',
                label: 'Format',
                icon: Layers,
                component: FormatTab,
                contentType: 'text' as const,
            },
            {
                id: 'yaml-to-json',
                label: 'YAML → JSON',
                icon: ArrowRight,
                component: YamlToJsonTab,
                contentType: 'text' as const,
            },
            {
                id: 'json-to-yaml',
                label: 'JSON → YAML',
                icon: ArrowLeft,
                component: JsonToYamlTab,
                contentType: 'text' as const,
            },
            {
                id: 'validate',
                label: 'Validate',
                icon: ShieldCheck,
                component: ValidateTab,
                contentType: 'text' as const,
            },
        ],
        plugins: {
            saved: createSavedTabPlugin({
                pageName: 'yaml',
                queryKey: 'yaml-saved',
                toolMapping,
                tabMapping: {
                    format: 'format',
                    'yaml-to-json': 'yaml-to-json',
                    'json-to-yaml': 'json-to-yaml',
                    validate: 'validate',
                },
                storageKeyMapping: {
                    format: 'yaml-format-content',
                    'yaml-to-json': 'yaml-to-json-yaml-content',
                    'json-to-yaml': 'json-to-yaml-json-content',
                    validate: 'yaml-validate-content',
                },
            }),
            shared: createSharedTabPlugin({
                pageName: 'yaml',
                queryKey: 'yaml-shared',
                toolMapping,
                tabMapping: {
                    format: 'format',
                    'yaml-to-json': 'yaml-to-json',
                    'json-to-yaml': 'json-to-yaml',
                    validate: 'validate',
                },
            }),
            history: createHistoryTabPlugin({
                pageName: 'yaml',
                storageKeyFilter: (key) =>
                    key.startsWith('yaml-') || key.startsWith('json-to-yaml-'),
                toolMapping,
                tabMapping: {
                    format: 'format',
                    'yaml-to-json': 'yaml-to-json',
                    'json-to-yaml': 'json-to-yaml',
                    validate: 'validate',
                },
            }),
        },
    };

    registerTool(definition);
    return definition;
}

export default function YamlPage() {
    return <ToolPage definition={YAML_TOOL} />;
}
