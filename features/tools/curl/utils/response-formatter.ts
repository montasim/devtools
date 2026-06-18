export function formatTime(ms: number): string {
    if (ms < 1000) return `${ms}ms`;
    return `${(ms / 1000).toFixed(2)}s`;
}

export function formatSize(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function formatHeaders(headers: Record<string, string>): string {
    return Object.entries(headers)
        .map(([key, value]) => `${key}: ${value}`)
        .join('\n');
}

export function prettifyBody(body: string, contentType: string): string {
    if (contentType.includes('json')) {
        try {
            return JSON.stringify(JSON.parse(body), null, 2);
        } catch {
            return body;
        }
    }
    if (contentType.includes('xml')) {
        // Basic XML formatting - could be enhanced
        return body;
    }
    return body;
}
