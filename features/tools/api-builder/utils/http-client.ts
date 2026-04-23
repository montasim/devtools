export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' | 'HEAD' | 'OPTIONS';

export const HTTP_METHODS: HttpMethod[] = [
    'GET',
    'POST',
    'PUT',
    'PATCH',
    'DELETE',
    'HEAD',
    'OPTIONS',
];

export const METHOD_COLORS: Record<HttpMethod, string> = {
    GET: 'text-green-600 dark:text-green-400',
    POST: 'text-blue-600 dark:text-blue-400',
    PUT: 'text-amber-600 dark:text-amber-400',
    PATCH: 'text-orange-600 dark:text-orange-400',
    DELETE: 'text-red-600 dark:text-red-400',
    HEAD: 'text-purple-600 dark:text-purple-400',
    OPTIONS: 'text-cyan-600 dark:text-cyan-400',
};

export interface KeyValueItem {
    id: string;
    key: string;
    value: string;
    enabled: boolean;
}

export interface ApiRequest {
    method: HttpMethod;
    url: string;
    headers: KeyValueItem[];
    queryParams: KeyValueItem[];
    body: string;
    bodyType: 'json' | 'text' | 'form-data' | 'urlencoded';
    authType: 'none' | 'bearer' | 'basic';
    authToken: string;
    authUsername: string;
    authPassword: string;
}

export interface ApiResponse {
    status: number;
    statusText: string;
    headers: Record<string, string>;
    body: string;
    size: number;
    time: number;
}

export interface RequestHistoryEntry {
    id: string;
    request: ApiRequest;
    response: ApiResponse;
    timestamp: number;
}

export function createEmptyKeyValue(): KeyValueItem {
    return { id: crypto.randomUUID(), key: '', value: '', enabled: true };
}

export function createDefaultRequest(): ApiRequest {
    return {
        method: 'GET',
        url: '',
        headers: [createEmptyKeyValue()],
        queryParams: [createEmptyKeyValue()],
        body: '',
        bodyType: 'json',
        authType: 'none',
        authToken: '',
        authUsername: '',
        authPassword: '',
    };
}

function keyValueListToObject(items: KeyValueItem[]): Record<string, string> {
    const result: Record<string, string> = {};
    for (const item of items) {
        if (item.enabled && item.key.trim()) {
            result[item.key.trim()] = item.value;
        }
    }
    return result;
}

export function buildUrlWithParams(baseUrl: string, params: KeyValueItem[]): string {
    if (!baseUrl.trim()) return '';

    try {
        const url = new URL(baseUrl);
        const paramObj = keyValueListToObject(params);
        for (const [key, value] of Object.entries(paramObj)) {
            url.searchParams.set(key, value);
        }
        return url.toString();
    } catch {
        if (baseUrl.includes('?')) return baseUrl;
        return baseUrl;
    }
}

export function formatBody(body: string, contentType: string): string {
    if (!body.trim()) return '';
    if (contentType.includes('json')) {
        try {
            return JSON.stringify(JSON.parse(body), null, 2);
        } catch {
            return body;
        }
    }
    return body;
}

export function getResponseBodyType(contentType: string): 'json' | 'xml' | 'html' | 'text' {
    if (contentType.includes('json')) return 'json';
    if (contentType.includes('xml')) return 'xml';
    if (contentType.includes('html')) return 'html';
    return 'text';
}

export async function executeRequest(request: ApiRequest): Promise<ApiResponse> {
    const fullUrl = buildUrlWithParams(request.url, request.queryParams);
    const headers = keyValueListToObject(request.headers);

    if (request.authType === 'bearer' && request.authToken) {
        headers['Authorization'] = `Bearer ${request.authToken}`;
    } else if (request.authType === 'basic' && request.authUsername) {
        const encoded = btoa(`${request.authUsername}:${request.authPassword}`);
        headers['Authorization'] = `Basic ${encoded}`;
    }

    let body: string | undefined;
    if (request.method !== 'GET' && request.method !== 'HEAD' && request.body.trim()) {
        body = request.body;
        if (!headers['Content-Type']) {
            switch (request.bodyType) {
                case 'json':
                    headers['Content-Type'] = 'application/json';
                    break;
                case 'text':
                    headers['Content-Type'] = 'text/plain';
                    break;
                case 'urlencoded':
                    headers['Content-Type'] = 'application/x-www-form-urlencoded';
                    break;
                case 'form-data':
                    headers['Content-Type'] = 'multipart/form-data';
                    break;
            }
        }
    }

    const startTime = performance.now();

    const response = await fetch(fullUrl, {
        method: request.method,
        headers,
        body,
    });

    const time = Math.round(performance.now() - startTime);
    const responseBody = await response.text();
    const size = new Blob([responseBody]).size;

    const responseHeaders: Record<string, string> = {};
    response.headers.forEach((value, key) => {
        responseHeaders[key] = value;
    });

    return {
        status: response.status,
        statusText: response.statusText,
        headers: responseHeaders,
        body: responseBody,
        size,
        time,
    };
}

export function getStatusColor(status: number): string {
    if (status >= 200 && status < 300) return 'text-green-600 dark:text-green-400';
    if (status >= 300 && status < 400) return 'text-blue-600 dark:text-blue-400';
    if (status >= 400 && status < 500) return 'text-amber-600 dark:text-amber-400';
    return 'text-red-600 dark:text-red-400';
}

export function formatSize(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function formatTime(ms: number): string {
    if (ms < 1000) return `${ms} ms`;
    return `${(ms / 1000).toFixed(2)} s`;
}
