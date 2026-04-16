'use client';

import {
    GitCompare,
    Sparkles,
    ArrowLeftRight,
    Share2,
    History,
    Bookmark,
    Code,
    Minimize2,
    Eye,
    FileJson,
    FileDown,
    FileCode,
    Image as ImageIcon,
    FileText,
} from 'lucide-react';
import type { ComponentType } from 'react';
import type { ReactNode } from 'react';
import { Base64Stats } from '@/components/base64';

export interface TabDefinition {
    value: string;
    label: string;
    icon: ComponentType<{ className?: string }>;
}

export interface ToolConfig {
    pageName: string;
    defaultTab: string;
    mainTabs: TabDefinition[];
    savedTabs?: SavedTabConfig;
    sharedTabs?: SharedTabConfig;
}

export interface SavedTabConfig {
    pageName: string;
    queryKey: string;
    toolMapping: Record<string, ToolMapping>;
    tabMapping: Record<string, string>;
    storageKeyMapping: Record<string, string>;
    extractContent?: (item: import('@/components/shared/saved-tab').SavedItem) => string;
}

export interface SharedTabConfig {
    pageName: string;
    queryKey: string;
    toolMapping: Record<string, ToolMapping>;
    tabMapping: Record<string, string>;
    renderStats?: (item: import('@/components/shared/shared-tab').SharedItem) => ReactNode;
}

export interface ToolMapping {
    name: string;
    icon: ComponentType<{ className?: string }>;
    color: string;
}

// Text Tool Configuration
export const TEXT_CONFIG: ToolConfig = {
    pageName: 'text',
    defaultTab: 'diff',
    mainTabs: [
        { value: 'diff', label: 'Diff', icon: GitCompare },
        { value: 'convert', label: 'Convert', icon: ArrowLeftRight },
        { value: 'clean', label: 'Clean', icon: Sparkles },
    ],
    savedTabs: {
        pageName: 'text',
        queryKey: 'text',
        toolMapping: {
            'Text Diff': { name: 'Diff', icon: GitCompare, color: 'text-blue-500' },
            'Text Convert': { name: 'Convert', icon: ArrowLeftRight, color: 'text-green-500' },
            'Text Clean': { name: 'Clean', icon: Sparkles, color: 'text-purple-500' },
        },
        tabMapping: {
            'Text Diff': 'diff',
            'Text Convert': 'convert',
            'Text Clean': 'clean',
        },
        storageKeyMapping: {
            'Text Diff': 'text-diff-left-input',
            'Text Convert': 'text-convert-input',
            'Text Clean': 'text-clean-input',
        },
        extractContent: (item) => {
            const mainContent =
                item.content.leftContent ||
                item.content.rightContent ||
                JSON.stringify(item.content);
            return typeof mainContent === 'string' ? mainContent : JSON.stringify(mainContent);
        },
    },
    sharedTabs: {
        pageName: 'text',
        queryKey: 'text',
        toolMapping: {
            'Text Diff': { name: 'Diff', icon: FileText, color: 'text-blue-500' },
            'Text Convert': { name: 'Convert', icon: FileText, color: 'text-green-500' },
            'Text Clean': { name: 'Clean', icon: FileText, color: 'text-purple-500' },
        },
        tabMapping: {
            'Text Diff': 'diff',
            'Text Convert': 'convert',
            'Text Clean': 'clean',
        },
    },
};

// JSON Tool Configuration
export const JSON_CONFIG: ToolConfig = {
    pageName: 'json',
    defaultTab: 'diff',
    mainTabs: [
        { value: 'diff', label: 'Diff', icon: GitCompare },
        { value: 'format', label: 'Format', icon: Code },
        { value: 'minify', label: 'Minify', icon: Minimize2 },
        { value: 'viewer', label: 'Viewer', icon: Eye },
        { value: 'parser', label: 'Parser', icon: FileJson },
        { value: 'export', label: 'Export', icon: FileDown },
        { value: 'schema', label: 'Schema', icon: FileJson },
    ],
    savedTabs: {
        pageName: 'json',
        queryKey: 'json',
        toolMapping: {
            'JSON Diff': { name: 'Diff', icon: GitCompare, color: 'text-blue-500' },
            'JSON Format': { name: 'Format', icon: Code, color: 'text-green-500' },
            'JSON Minify': { name: 'Minify', icon: Minimize2, color: 'text-purple-500' },
            'JSON Viewer': { name: 'Viewer', icon: FileJson, color: 'text-orange-500' },
            'JSON Parser': { name: 'Parser', icon: Bookmark, color: 'text-pink-500' },
            'JSON Export': { name: 'Export', icon: FileDown, color: 'text-indigo-500' },
        },
        tabMapping: {
            'JSON Diff': 'diff',
            'JSON Format': 'format',
            'JSON Minify': 'minify',
            'JSON Viewer': 'viewer',
            'JSON Parser': 'parser',
            'JSON Export': 'export',
        },
        storageKeyMapping: {
            'JSON Diff': 'json-diff-left-input',
            'JSON Format': 'json-format-input',
            'JSON Minify': 'json-minify-input',
            'JSON Viewer': 'json-viewer-input',
            'JSON Parser': 'json-parser-input',
            'JSON Export': 'json-export-input',
        },
        extractContent: (item) => {
            const mainContent =
                item.content.leftContent ||
                item.content.rightContent ||
                JSON.stringify(item.content);
            return typeof mainContent === 'string' ? mainContent : JSON.stringify(mainContent);
        },
    },
    sharedTabs: {
        pageName: 'json',
        queryKey: 'json',
        toolMapping: {
            'JSON Diff': { name: 'Diff', icon: Share2, color: 'text-blue-500' },
            'JSON Format': { name: 'Format', icon: Code, color: 'text-green-500' },
            'JSON Minify': { name: 'Minify', icon: Minimize2, color: 'text-purple-500' },
            'JSON Viewer': { name: 'Viewer', icon: Eye, color: 'text-orange-500' },
            'JSON Parser': { name: 'Parser', icon: FileJson, color: 'text-pink-500' },
            'JSON Export': { name: 'Export', icon: FileDown, color: 'text-indigo-500' },
            'JSON Schema': { name: 'Schema', icon: Bookmark, color: 'text-teal-500' },
        },
        tabMapping: {
            'JSON Diff': 'diff',
            'JSON Format': 'format',
            'JSON Minify': 'minify',
            'JSON Viewer': 'viewer',
            'JSON Parser': 'parser',
            'JSON Export': 'export',
            'JSON Schema': 'schema',
        },
    },
};

// Base64 Tool Configuration
export const BASE64_CONFIG: ToolConfig = {
    pageName: 'base64',
    defaultTab: 'media-to-base64',
    mainTabs: [
        { value: 'media-to-base64', label: 'Media to Base64', icon: FileCode },
        { value: 'base64-to-media', label: 'Base64 to Media', icon: ImageIcon },
    ],
    savedTabs: {
        pageName: 'base64',
        queryKey: 'base64',
        toolMapping: {
            'Media to Base64': { name: 'Media to Base64', icon: FileCode, color: 'text-blue-500' },
            'Base64 to Media': {
                name: 'Base64 to Media',
                icon: ImageIcon,
                color: 'text-green-500',
            },
        },
        tabMapping: {
            'Media to Base64': 'media-to-base64',
            'Base64 to Media': 'base64-to-media',
        },
        storageKeyMapping: {
            'Media to Base64': 'base64-media-input-content',
            'Base64 to Media': 'base64-media-input-content',
        },
        extractContent: (item) => {
            // Note: Base64 uses rightContent first (different from text/JSON)
            const mainContent =
                item.content.rightContent ||
                item.content.leftContent ||
                JSON.stringify(item.content);
            return typeof mainContent === 'string' ? mainContent : JSON.stringify(mainContent);
        },
    },
    sharedTabs: {
        pageName: 'base64',
        queryKey: 'base64',
        toolMapping: {
            'Media to Base64': { name: 'Media to Base64', icon: FileText, color: 'text-blue-500' },
            'Base64 to Media': {
                name: 'Base64 to Media',
                icon: ImageIcon,
                color: 'text-green-500',
            },
        },
        tabMapping: {
            'Media to Base64': 'media-to-base64',
            'Base64 to Media': 'base64-to-media',
        },
        renderStats: (item) => {
            const content = (item.content.rightContent ||
                item.content.leftContent ||
                JSON.stringify(item.content)) as string;
            return <Base64Stats content={content} />;
        },
    },
};

// Shared tabs (common to all tools)
export const SHARED_TABS = {
    SAVED: { value: 'saved', label: 'Saved', icon: Bookmark },
    SHARED: { value: 'shared', label: 'Shared', icon: Share2 },
    HISTORY: { value: 'history', label: 'History', icon: History },
} as const;
