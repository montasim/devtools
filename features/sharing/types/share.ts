export interface ShareMetadata {
    id: string;
    pageName: string;
    tabName: string;
    title: string;
    comment: string | null;
    expiresAt: string | null;
    hasPassword: boolean;
    viewCount: number;
    createdAt: string;
}

export interface ShareAccessData {
    state: Record<string, unknown>;
}

export interface ShareAccessResponse {
    metadata: ShareMetadata;
    content: ShareAccessData;
}
