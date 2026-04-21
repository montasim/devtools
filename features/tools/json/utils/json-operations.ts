export function formatJson(input: string, indent = 2): string {
    const parsed = JSON.parse(input);
    return JSON.stringify(parsed, null, indent);
}

export function minifyJson(input: string): string {
    const parsed = JSON.parse(input);
    return JSON.stringify(parsed);
}

export function validateJson(input: string): { valid: boolean; error?: string } {
    try {
        JSON.parse(input);
        return { valid: true };
    } catch (error) {
        return { valid: false, error: error instanceof Error ? error.message : 'Invalid JSON' };
    }
}

export function parseJson(input: string): { parsed: unknown; type: string; keys?: string[] } {
    const result = JSON.parse(input);
    const type = Array.isArray(result) ? 'array' : typeof result;
    const keys =
        result && typeof result === 'object' && !Array.isArray(result)
            ? Object.keys(result)
            : undefined;
    return { parsed: result, type, keys };
}

export function exportToJson(input: string, format: 'csv' | 'xml' | 'yaml'): string {
    const parsed = JSON.parse(input);
    switch (format) {
        case 'csv': {
            if (!Array.isArray(parsed) || parsed.length === 0) return '';
            const headers = Object.keys(parsed[0]);
            const rows = parsed.map((row) =>
                headers.map((h) => JSON.stringify(row[h] ?? '')).join(','),
            );
            return [headers.join(','), ...rows].join('\n');
        }
        case 'xml': {
            return objectToXml(parsed);
        }
        case 'yaml': {
            return objectToYaml(parsed);
        }
    }
}

function objectToXml(obj: unknown, indent = ''): string {
    if (Array.isArray(obj)) {
        return obj
            .map((item) => `${indent}<item>\n${objectToXml(item, indent + '  ')}${indent}</item>\n`)
            .join('');
    }
    if (obj && typeof obj === 'object') {
        return Object.entries(obj)
            .map(([key, value]) => {
                if (typeof value === 'object' && value !== null) {
                    return `${indent}<${key}>\n${objectToXml(value, indent + '  ')}${indent}</${key}>\n`;
                }
                return `${indent}<${key}>${String(value)}</${key}>\n`;
            })
            .join('');
    }
    return `${indent}${String(obj)}\n`;
}

function objectToYaml(obj: unknown, indent = ''): string {
    if (Array.isArray(obj)) {
        return obj
            .map(
                (item) =>
                    `${indent}- ${typeof item === 'object' ? '\n' + objectToYaml(item, indent + '  ') : String(item)}`,
            )
            .join('\n');
    }
    if (obj && typeof obj === 'object') {
        return Object.entries(obj)
            .map(([key, value]) => {
                if (typeof value === 'object' && value !== null) {
                    return `${indent}${key}:\n${objectToYaml(value, indent + '  ')}`;
                }
                return `${indent}${key}: ${value === null ? 'null' : String(value)}`;
            })
            .join('\n');
    }
    return `${indent}${String(obj)}`;
}

export function computeJsonDiff(
    left: string,
    right: string,
): { added: number; removed: number; changed: number } {
    try {
        const leftObj = JSON.parse(left);
        const rightObj = JSON.parse(right);
        return diffObjects(leftObj, rightObj);
    } catch {
        return { added: 0, removed: 0, changed: 0 };
    }
}

function diffObjects(
    left: unknown,
    right: unknown,
): { added: number; removed: number; changed: number } {
    let added = 0;
    let removed = 0;
    let changed = 0;

    if (typeof left === 'object' && typeof right === 'object' && left && right) {
        const leftKeys = new Set(Object.keys(left));
        const rightKeys = new Set(Object.keys(right));

        for (const key of rightKeys) {
            if (!leftKeys.has(key)) added++;
        }
        for (const key of leftKeys) {
            if (!rightKeys.has(key)) removed++;
        }
        for (const key of leftKeys) {
            if (rightKeys.has(key)) {
                const leftVal = (left as Record<string, unknown>)[key];
                const rightVal = (right as Record<string, unknown>)[key];
                if (JSON.stringify(leftVal) !== JSON.stringify(rightVal)) {
                    changed++;
                }
            }
        }
    }

    return { added, removed, changed };
}
