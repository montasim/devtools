import type { LucideIcon } from 'lucide-react';

export interface SavedTabConfig {
    pageName: string;
    queryKey: string;
    toolMapping: Record<string, { name: string; icon: LucideIcon; color: string }>;
    tabMapping: Record<string, string>;
    storageKeyMapping: Record<string, string>;
    extractContent?: (item: SavedItemData) => string;
}

export interface SavedItemData {
    id: string;
    userId: string | null;
    pageName: string;
    tabName: string;
    name: string;
    content: Record<string, unknown>;
    createdAt: string;
    updatedAt: string;
}
