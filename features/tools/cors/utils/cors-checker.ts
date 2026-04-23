export interface CorsResult {
    url: string;
    method: string;
    timestamp: number;
    isCorsEnabled: boolean;
    accessControlAllowOrigin: string | null;
    accessControlAllowMethods: string | null;
    accessControlAllowHeaders: string | null;
    accessControlAllowCredentials: boolean | null;
    accessControlMaxAge: string | null;
    accessControlExposeHeaders: string | null;
    allHeaders: Record<string, string>;
    error: string | null;
    responseStatus: number | null;
    responseStatusText: string | null;
    responseTime: number;
    preflightSuccess: boolean | null;
}

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

async function performPreflightCheck(
    url: string,
    method: HttpMethod,
    signal?: AbortSignal,
): Promise<{ success: boolean; headers: Record<string, string> }> {
    try {
        const res = await fetch(url, {
            method: 'OPTIONS',
            headers: {
                Origin: window.location.origin,
                'Access-Control-Request-Method': method,
                'Access-Control-Request-Headers': 'content-type',
            },
            signal,
            redirect: 'follow',
        });

        const headers = extractHeaders(res);
        return { success: res.ok, headers };
    } catch {
        return { success: false, headers: {} };
    }
}

function extractHeaders(response: Response): Record<string, string> {
    const headers: Record<string, string> = {};
    response.headers.forEach((value, key) => {
        headers[key] = value;
    });
    return headers;
}

export async function checkCors(
    url: string,
    method: HttpMethod = 'GET',
    signal?: AbortSignal,
): Promise<CorsResult> {
    const startTime = performance.now();
    const result: CorsResult = {
        url,
        method,
        timestamp: Date.now(),
        isCorsEnabled: false,
        accessControlAllowOrigin: null,
        accessControlAllowMethods: null,
        accessControlAllowHeaders: null,
        accessControlAllowCredentials: null,
        accessControlMaxAge: null,
        accessControlExposeHeaders: null,
        allHeaders: {},
        error: null,
        responseStatus: null,
        responseStatusText: null,
        responseTime: 0,
        preflightSuccess: null,
    };

    try {
        const preflight = await performPreflightCheck(url, method, signal);
        result.preflightSuccess = preflight.success;

        const res = await fetch(url, {
            method,
            headers: {
                Origin: window.location.origin,
            },
            signal,
            redirect: 'follow',
        });

        result.responseStatus = res.status;
        result.responseStatusText = res.statusText;
        result.allHeaders = extractHeaders(res);

        const acao = res.headers.get('access-control-allow-origin');
        const acam = res.headers.get('access-control-allow-methods');
        const acah = res.headers.get('access-control-allow-headers');
        const acac = res.headers.get('access-control-allow-credentials');
        const acma = res.headers.get('access-control-max-age');
        const aceh = res.headers.get('access-control-expose-headers');

        result.accessControlAllowOrigin = acao;
        result.accessControlAllowMethods = acam;
        result.accessControlAllowHeaders = acah;
        result.accessControlAllowCredentials = acac === 'true';
        result.accessControlMaxAge = acma;
        result.accessControlExposeHeaders = aceh;

        result.isCorsEnabled = acao !== null;

        if (acao === '*') {
            result.isCorsEnabled = true;
        } else if (acao) {
            result.isCorsEnabled =
                acao.includes(window.location.hostname) || acao === window.location.origin;
        }
    } catch (err) {
        if (err instanceof DOMException && err.name === 'AbortError') {
            result.error = 'Request was cancelled';
        } else if (err instanceof TypeError && err.message.includes('CORS')) {
            result.error = 'CORS request was blocked by the browser';
            result.isCorsEnabled = false;
        } else if (err instanceof TypeError) {
            result.error =
                'Network error or CORS blocked — the server may not allow cross-origin requests';
            result.isCorsEnabled = false;
        } else {
            result.error = err instanceof Error ? err.message : 'Unknown error';
        }
    }

    result.responseTime = Math.round(performance.now() - startTime);
    return result;
}
