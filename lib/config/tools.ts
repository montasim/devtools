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
} from 'lucide-react';
import type { ComponentType } from 'react';

export interface TabDefinition {
    value: string;
    label: string;
    icon: ComponentType<{ className?: string }>;
}

export interface ToolConfig {
    pageName: string;
    defaultTab: string;
    mainTabs: TabDefinition[];
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
};

// Base64 Tool Configuration
export const BASE64_CONFIG: ToolConfig = {
    pageName: 'base64',
    defaultTab: 'media-to-base64',
    mainTabs: [
        { value: 'media-to-base64', label: 'Media to Base64', icon: FileCode },
        { value: 'base64-to-media', label: 'Base64 to Media', icon: ImageIcon },
    ],
};

// Shared tabs (common to all tools)
export const SHARED_TABS = {
    SAVED: { value: 'saved', label: 'Saved', icon: Bookmark },
    SHARED: { value: 'shared', label: 'Shared', icon: Share2 },
    HISTORY: { value: 'history', label: 'History', icon: History },
} as const;
