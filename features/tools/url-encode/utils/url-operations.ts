export function urlEncode(text: string): string {
    return encodeURIComponent(text);
}

export function urlDecode(text: string): string {
    try {
        return decodeURIComponent(text);
    } catch {
        throw new Error('Invalid percent-encoded string');
    }
}

export function urlEncodeComponent(text: string): string {
    return encodeURIComponent(text);
}

export function urlEncodeURI(text: string): string {
    return encodeURI(text);
}

export interface UrlEncodeOperation {
    value: string;
    label: string;
}

export const ENCODE_OPERATIONS: UrlEncodeOperation[] = [
    { value: 'component', label: 'encodeURIComponent' },
    { value: 'uri', label: 'encodeURI' },
];
