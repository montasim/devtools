export interface WebhookRequest {
    id: string;
    method: string;
    headers: Record<string, string>;
    body: string | null;
    query: Record<string, string>;
    timestamp: number;
    contentType: string;
    size: number;
}

export const webhookStore = new Map<string, WebhookRequest[]>();
export const MAX_REQUESTS_PER_ID = 100;

export function pruneStore() {
    if (webhookStore.size > 500) {
        const oldest = [...webhookStore.keys()].slice(0, 50);
        oldest.forEach((k) => webhookStore.delete(k));
    }
}
