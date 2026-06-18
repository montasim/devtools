export function escapeJsonString(input: string): string {
    if (!input) return '';
    return input
        .replace(/\\/g, '\\\\')
        .replace(/"/g, '\\"')
        .replace(/\n/g, '\\n')
        .replace(/\r/g, '\\r')
        .replace(/\t/g, '\\t')
        .replace(/\f/g, '\\f')
        .replace(/\b/g, '\\b')
        .replace(/[\x00-\x1f\x7f]/g, (c) => {
            const hex = c.charCodeAt(0).toString(16).padStart(4, '0');
            return `\\u${hex}`;
        });
}

export function unescapeJsonString(input: string): string {
    if (!input) return '';
    try {
        return JSON.parse(`"${input.replace(/^"|"$/g, '')}"`);
    } catch {
        return input
            .replace(/\\n/g, '\n')
            .replace(/\\r/g, '\r')
            .replace(/\\t/g, '\t')
            .replace(/\\f/g, '\f')
            .replace(/\\b/g, '\b')
            .replace(/\\"/g, '"')
            .replace(/\\\\/g, '\\')
            .replace(/\\u([0-9a-fA-F]{4})/g, (_, hex) => String.fromCharCode(parseInt(hex, 16)));
    }
}
