import type { LucideIcon } from 'lucide-react';

export interface ShareSidebarConfig {
    pageName: string;
    tabName: string;
    getState: () => Record<string, unknown>;
    extraActions?: ShareExtraAction[];
}

export interface ShareExtraAction {
    id: string;
    label: string;
    icon: LucideIcon;
    handler: () => void | Promise<void>;
    variant?: 'default' | 'outline' | 'ghost';
}
