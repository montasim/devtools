import type { LucideIcon } from 'lucide-react';
import type { ComponentType } from 'react';

export interface HistoryTabConfig {
    pageName: string;
    storageKeyFilter: (key: string) => boolean;
    toolMapping: Record<string, { name: string; icon: LucideIcon; color: string }>;
    tabMapping: Record<string, string>;
    statsComponent?: ComponentType<{ content: string }>;
}

export interface HistoryItem {
    key: string;
    content: string;
    timestamp: number;
    tabName: string;
}
