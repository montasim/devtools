'use client';

import { lazy, type ComponentType } from 'react';
import { GitCompare, Code, Minimize2, Eye, SearchCode } from 'lucide-react';
import { ToolPage } from '@/features/tools/core/components/tool-page';
import { createSavedTabPlugin } from '@/features/tools/core/plugins/saved';
import { createSharedTabPlugin } from '@/features/tools/core/plugins/shared';
import { createHistoryTabPlugin } from '@/features/tools/core/plugins/history';
import { registerTool } from '@/features/tools/core/config/tool-registry';
import { STORAGE_KEYS } from '@/lib/utils/constants';
import type { TabComponentProps } from '@/features/tools/core/types/tool';

const DiffTab = lazy(
    () => import('@/features/tools/xml/tabs/diff-tab'),
) as unknown as ComponentType<TabComponentProps>;
const FormatTab = lazy(
    () => import('@/features/tools/xml/tabs/format-tab'),
) as unknown as ComponentType<TabComponentProps>;
const MinifyTab = lazy(
    () => import('@/features/tools/xml/tabs/minify-tab'),
) as unknown as ComponentType<TabComponentProps>;
const ViewerTab = lazy(
    () => import('@/features/tools/xml/tabs/viewer-tab'),
) as unknown as ComponentType<TabComponentProps>;
const ParserTab = lazy(
    () => import('@/features/tools/xml/tabs/parser-tab'),
) as unknown as ComponentType<TabComponentProps>;

const XML_TOOL = registerToolAndGet();

function registerToolAndGet() {
    const definition = {
        pageName: 'xml',
        label: 'XML Tools',
        icon: Code,
        defaultTab: 'diff',
        mainTabs: [
            {
                id: 'diff',
                label: 'Diff',
                icon: GitCompare,
                component: DiffTab,
                contentType: 'xml' as const,
            },
            {
                id: 'format',
                label: 'Format',
                icon: Code,
                component: FormatTab,
                contentType: 'xml' as const,
            },
            {
                id: 'minify',
                label: 'Minify',
                icon: Minimize2,
                component: MinifyTab,
                contentType: 'xml' as const,
            },
            {
                id: 'viewer',
                label: 'Viewer',
                icon: Eye,
                component: ViewerTab,
                contentType: 'xml' as const,
            },
            {
                id: 'parser',
                label: 'Parser',
                icon: SearchCode,
                component: ParserTab,
                contentType: 'xml' as const,
            },
        ],
        plugins: {
            saved: createSavedTabPlugin({
                pageName: 'xml',
                queryKey: 'xml-saved',
                toolMapping: {
                    format: {
                        name: 'XML Format',
                        icon: Code,
                        color: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300',
                    },
                    minify: {
                        name: 'XML Minify',
                        icon: Minimize2,
                        color: 'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300',
                    },
                    diff: {
                        name: 'XML Diff',
                        icon: GitCompare,
                        color: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
                    },
                    viewer: {
                        name: 'XML Viewer',
                        icon: Eye,
                        color: 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300',
                    },
                    parser: {
                        name: 'XML Parser',
                        icon: SearchCode,
                        color: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900 dark:text-cyan-300',
                    },
                },
                tabMapping: {
                    format: 'format',
                    minify: 'minify',
                    diff: 'diff',
                    viewer: 'viewer',
                    parser: 'parser',
                },
                storageKeyMapping: {
                    format: 'xml-format-left-content',
                    minify: 'xml-minify-left-content',
                    diff: 'xml-diff-left-content',
                    viewer: 'xml-viewer-content',
                    parser: 'xml-parser-content',
                },
            }),
            shared: createSharedTabPlugin({
                pageName: 'xml',
                queryKey: 'xml-shared',
                toolMapping: {
                    format: {
                        name: 'XML Format',
                        icon: Code,
                        color: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300',
                    },
                    minify: {
                        name: 'XML Minify',
                        icon: Minimize2,
                        color: 'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300',
                    },
                    diff: {
                        name: 'XML Diff',
                        icon: GitCompare,
                        color: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
                    },
                    viewer: {
                        name: 'XML Viewer',
                        icon: Eye,
                        color: 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300',
                    },
                    parser: {
                        name: 'XML Parser',
                        icon: SearchCode,
                        color: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900 dark:text-cyan-300',
                    },
                },
                tabMapping: {
                    format: 'format',
                    minify: 'minify',
                    diff: 'diff',
                    viewer: 'viewer',
                    parser: 'parser',
                },
                storageKeys: {
                    format: STORAGE_KEYS.XML_FORMAT_LEFT_CONTENT,
                    minify: STORAGE_KEYS.XML_MINIFY_LEFT_CONTENT,
                    diff: STORAGE_KEYS.XML_DIFF_LEFT_CONTENT,
                    viewer: STORAGE_KEYS.XML_VIEWER_CONTENT,
                    parser: STORAGE_KEYS.XML_PARSER_CONTENT,
                },
            }),
            history: createHistoryTabPlugin({
                pageName: 'xml',
                storageKeyFilter: (key) => key.startsWith('xml-'),
                toolMapping: {
                    format: {
                        name: 'XML Format',
                        icon: Code,
                        color: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300',
                    },
                    diff: {
                        name: 'XML Diff',
                        icon: GitCompare,
                        color: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
                    },
                },
                tabMapping: {
                    format: 'format',
                    minify: 'minify',
                    diff: 'diff',
                    viewer: 'viewer',
                },
            }),
        },
    };

    registerTool(definition);
    return definition;
}

export default function XmlPage() {
    return <ToolPage definition={XML_TOOL} />;
}
