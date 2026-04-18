import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';

export interface SharedTabConfig {
    pageName: string;
    queryKey: string;
    toolMapping: Record<string, { name: string; icon: LucideIcon; color: string }>;
    tabMapping: Record<string, string>;
    renderStats?: (item: SharedLinkItemData) => ReactNode;
}

export interface SharedLinkItemData {
    id: string;
    userId: string | null;
    pageName: string;
    tabName: string;
    title: string;
    comment: string | null;
    expiresAt: string | null;
    hasPassword: boolean;
    viewCount: number;
    createdAt: string;
    updatedAt: string;
}
