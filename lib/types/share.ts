export interface SharedLinkItem {
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

export interface SharedContentData {
    state: Record<string, unknown>;
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

export interface CreateShareRequest {
    pageName: string;
    tabName: string;
    title: string;
    comment?: string;
    expiresAt?: string | null;
    password?: string;
    state: Record<string, unknown>;
}

export interface AccessShareRequest {
    password?: string;
}
