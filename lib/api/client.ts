export interface ApiResponse<T = unknown> {
    ok: boolean;
    data?: T;
    error?: { code: string; message: string; details?: unknown };
}

export class ApiClient {
    private baseUrl: string;

    constructor(baseUrl = '') {
        this.baseUrl = baseUrl;
    }

    private async request<T>(path: string, options?: RequestInit): Promise<ApiResponse<T>> {
        try {
            const res = await fetch(`${this.baseUrl}${path}`, {
                headers: {
                    'Content-Type': 'application/json',
                    ...options?.headers,
                },
                ...options,
            });

            const data = await res.json();
            return data as ApiResponse<T>;
        } catch (error) {
            return {
                ok: false,
                error: {
                    code: 'NETWORK_ERROR',
                    message: error instanceof Error ? error.message : 'Network request failed',
                },
            };
        }
    }

    async get<T>(path: string): Promise<ApiResponse<T>> {
        return this.request<T>(path, { method: 'GET' });
    }

    async post<T>(path: string, body?: unknown): Promise<ApiResponse<T>> {
        return this.request<T>(path, {
            method: 'POST',
            body: body ? JSON.stringify(body) : undefined,
        });
    }

    async put<T>(path: string, body?: unknown): Promise<ApiResponse<T>> {
        return this.request<T>(path, {
            method: 'PUT',
            body: body ? JSON.stringify(body) : undefined,
        });
    }

    async delete<T>(path: string): Promise<ApiResponse<T>> {
        return this.request<T>(path, { method: 'DELETE' });
    }
}

export const apiClient = new ApiClient();
