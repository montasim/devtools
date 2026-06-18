export interface CurlRequest {
    method: string;
    url: string;
    headers: Record<string, string>;
    body: string | null;
}

export interface CurlResponse {
    status: number;
    statusText: string;
    headers: Record<string, string>;
    body: string;
    size: number;
    time: number;
    success: boolean;
    contentType: string;
}

export async function executeRequest(request: CurlRequest): Promise<CurlResponse> {
    const startTime = performance.now();

    const response = await fetch(request.url, {
        method: request.method,
        headers: request.headers,
        body: request.body,
    });

    const time = Math.round(performance.now() - startTime);
    const responseBody = await response.text();
    const size = new Blob([responseBody]).size;
    const contentType = response.headers.get('content-type') ?? '';

    // Extract response headers
    const headers: Record<string, string> = {};
    response.headers.forEach((value, key) => {
        headers[key] = value;
    });

    return {
        status: response.status,
        statusText: response.statusText,
        headers,
        body: responseBody,
        size,
        time,
        success: response.ok,
        contentType,
    };
}
