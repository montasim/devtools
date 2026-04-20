import type { LucideIcon } from 'lucide-react';
import type { ComponentType } from 'react';

export interface SharedData {
    tabName: string;
    state: Record<string, unknown>;
}

export interface TabDefinition {
    id: string;
    label: string;
    icon: LucideIcon;
    component: ComponentType<TabComponentProps>;
    storageKeys?: Record<string, string>;
    contentType: 'json' | 'text' | 'base64';
}

export interface TabComponentProps {
    sharedData?: SharedData | null;
    onShareDialogOpen?: (open: boolean) => void;
    readOnly?: boolean;
}

export interface ToolDefinition {
    pageName: string;
    label: string;
    icon: LucideIcon;
    defaultTab: string;
    mainTabs: TabDefinition[];
    plugins: {
        saved?: ComponentType<PluginTabProps>;
        shared?: ComponentType<PluginTabProps>;
        history?: ComponentType<PluginTabProps>;
    };
}

export interface PluginTabProps {
    onTabChange: (tab: string) => void;
}

export interface ActionItem {
    id: string;
    label: string;
    icon: LucideIcon;
    onClick: () => void;
    variant?: 'default' | 'outline' | 'ghost' | 'destructive';
    disabled?: boolean;
    authRequired?: boolean;
    className?: string;
}
