'use client';

import { lazy, type ComponentType } from 'react';
import { GitCompare, Code, Minimize2, Eye, FileJson, FileOutput, Shield } from 'lucide-react';
import { ToolPage } from '@/features/tools/core/components/tool-page';
import { createSavedTabPlugin } from '@/features/tools/core/plugins/saved';
import { createSharedTabPlugin } from '@/features/tools/core/plugins/shared';
import { createHistoryTabPlugin } from '@/features/tools/core/plugins/history';
import { registerTool } from '@/features/tools/core/config/tool-registry';
import { STORAGE_KEYS } from '@/lib/utils/constants';
import type { TabComponentProps } from '@/features/tools/core/types/tool';

const DiffTab = lazy(
    () => import('@/features/tools/json/tabs/diff-tab'),
) as unknown as ComponentType<TabComponentProps>;
const FormatTab = lazy(
    () => import('@/features/tools/json/tabs/format-tab'),
) as unknown as ComponentType<TabComponentProps>;
const MinifyTab = lazy(
    () => import('@/features/tools/json/tabs/minify-tab'),
) as unknown as ComponentType<TabComponentProps>;
const ViewerTab = lazy(
    () => import('@/features/tools/json/tabs/viewer-tab'),
) as unknown as ComponentType<TabComponentProps>;
const ParserTab = lazy(
    () => import('@/features/tools/json/tabs/parser-tab'),
) as unknown as ComponentType<TabComponentProps>;
const ExportTab = lazy(
    () => import('@/features/tools/json/tabs/export-tab'),
) as unknown as ComponentType<TabComponentProps>;
const SchemaTab = lazy(
    () => import('@/features/tools/json/tabs/schema-tab'),
) as unknown as ComponentType<TabComponentProps>;

const JSON_TOOL = registerToolAndGet();

function registerToolAndGet() {
    const definition = {
        pageName: 'json',
        label: 'JSON Tools',
        icon: FileJson,
        defaultTab: 'diff',
        mainTabs: [
            {
                id: 'diff',
                label: 'Diff',
                icon: GitCompare,
                component: DiffTab,
                contentType: 'json' as const,
            },
            {
                id: 'format',
                label: 'Format',
                icon: Code,
                component: FormatTab,
                contentType: 'json' as const,
            },
            {
                id: 'minify',
                label: 'Minify',
                icon: Minimize2,
                component: MinifyTab,
                contentType: 'json' as const,
            },
            {
                id: 'viewer',
                label: 'Viewer',
                icon: Eye,
                component: ViewerTab,
                contentType: 'json' as const,
            },
            {
                id: 'parser',
                label: 'Parser',
                icon: FileJson,
                component: ParserTab,
                contentType: 'json' as const,
            },
            {
                id: 'export',
                label: 'Export',
                icon: FileOutput,
                component: ExportTab,
                contentType: 'json' as const,
            },
            {
                id: 'schema',
                label: 'Schema',
                icon: Shield,
                component: SchemaTab,
                contentType: 'json' as const,
            },
        ],
        plugins: {
            saved: createSavedTabPlugin({
                pageName: 'json',
                queryKey: 'json-saved',
                toolMapping: {
                    diff: {
                        name: 'JSON Diff',
                        icon: GitCompare,
                        color: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
                    },
                    format: {
                        name: 'JSON Format',
                        icon: Code,
                        color: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300',
                    },
                    minify: {
                        name: 'JSON Minify',
                        icon: Minimize2,
                        color: 'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300',
                    },
                    viewer: {
                        name: 'JSON Viewer',
                        icon: Eye,
                        color: 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300',
                    },
                    parser: {
                        name: 'JSON Parser',
                        icon: FileJson,
                        color: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900 dark:text-cyan-300',
                    },
                    export: {
                        name: 'JSON Export',
                        icon: FileOutput,
                        color: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300',
                    },
                    schema: {
                        name: 'JSON Schema',
                        icon: Shield,
                        color: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300',
                    },
                },
                tabMapping: {
                    diff: 'diff',
                    format: 'format',
                    minify: 'minify',
                    viewer: 'viewer',
                    parser: 'parser',
                    export: 'export',
                    schema: 'schema',
                },
                storageKeyMapping: {
                    diff: 'json-diff-left-content',
                    format: 'json-format-left-content',
                    minify: 'json-minify-left-content',
                    viewer: 'json-viewer-content',
                    parser: 'json-parser-content',
                    export: 'json-export-content',
                    schema: 'json-schema-json-content',
                },
            }),
            shared: createSharedTabPlugin({
                pageName: 'json',
                queryKey: 'json-shared',
                toolMapping: {
                    diff: {
                        name: 'JSON Diff',
                        icon: GitCompare,
                        color: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
                    },
                    format: {
                        name: 'JSON Format',
                        icon: Code,
                        color: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300',
                    },
                    minify: {
                        name: 'JSON Minify',
                        icon: Minimize2,
                        color: 'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300',
                    },
                    viewer: {
                        name: 'JSON Viewer',
                        icon: Eye,
                        color: 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300',
                    },
                    parser: {
                        name: 'JSON Parser',
                        icon: FileJson,
                        color: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900 dark:text-cyan-300',
                    },
                    export: {
                        name: 'JSON Export',
                        icon: FileOutput,
                        color: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300',
                    },
                    schema: {
                        name: 'JSON Schema',
                        icon: Shield,
                        color: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300',
                    },
                },
                tabMapping: {
                    diff: 'diff',
                    format: 'format',
                    minify: 'minify',
                    viewer: 'viewer',
                    parser: 'parser',
                    export: 'export',
                    schema: 'schema',
                },
                storageKeys: {
                    diff: STORAGE_KEYS.JSON_DIFF_LEFT_CONTENT,
                    format: STORAGE_KEYS.JSON_FORMAT_LEFT_CONTENT,
                    minify: STORAGE_KEYS.JSON_MINIFY_LEFT_CONTENT,
                    viewer: STORAGE_KEYS.JSON_VIEWER_CONTENT,
                    parser: STORAGE_KEYS.JSON_PARSER_CONTENT,
                    export: STORAGE_KEYS.JSON_EXPORT_CONTENT,
                    schema: STORAGE_KEYS.JSON_SCHEMA_JSON_CONTENT,
                },
            }),
            history: createHistoryTabPlugin({
                pageName: 'json',
                storageKeyFilter: (key) => key.startsWith('json-'),
                toolMapping: {
                    diff: {
                        name: 'JSON Diff',
                        icon: GitCompare,
                        color: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
                    },
                    format: {
                        name: 'JSON Format',
                        icon: Code,
                        color: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300',
                    },
                },
                tabMapping: {
                    diff: 'diff',
                    format: 'format',
                    minify: 'minify',
                    viewer: 'viewer',
                },
            }),
        },
    };

    registerTool(definition);
    return definition;
}

export default function JsonPage() {
    return <ToolPage definition={JSON_TOOL} />;
}
