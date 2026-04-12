/**
 * JSON Operations Utility Functions
 * Provides various JSON manipulation and formatting operations
 */

import { toast } from 'sonner';

/**
 * Copy JSON content to clipboard
 */
export async function copyToClipboard(content: string): Promise<boolean> {
    try {
        await navigator.clipboard.writeText(content);
        toast.success('Copied to clipboard');
        return true;
    } catch {
        toast.error('Failed to copy to clipboard');
        return false;
    }
}

/**
 * Format/Prettify JSON with proper indentation
 */
export function formatJson(content: string, indentation: number = 2): string {
    try {
        const parsed = JSON.parse(content);
        return JSON.stringify(parsed, null, indentation);
    } catch {
        return content; // Return original if invalid JSON
    }
}

/**
 * Minify JSON by removing all whitespace
 */
export function minifyJson(content: string): string {
    try {
        const parsed = JSON.parse(content);
        return JSON.stringify(parsed);
    } catch {
        return content; // Return original if invalid JSON
    }
}

/**
 * Expand all levels (format with larger indentation)
 */
export function expandJson(content: string, indentation: number = 4): string {
    try {
        const parsed = JSON.parse(content);
        return JSON.stringify(parsed, null, indentation);
    } catch {
        return content; // Return original if invalid JSON
    }
}

/**
 * Collapse JSON (minify version)
 */
export function collapseJson(content: string): string {
    return minifyJson(content);
}

/**
 * Remove null values from JSON
 */
export function removeNulls(content: string): string {
    try {
        const parsed = JSON.parse(content);
        const removeNullsRecursive = (obj: unknown): unknown => {
            if (obj === null) return null;
            if (Array.isArray(obj)) {
                return obj.filter((item) => item !== null).map(removeNullsRecursive);
            }
            if (typeof obj === 'object') {
                const result: Record<string, unknown> = {};
                for (const [key, value] of Object.entries(obj)) {
                    if (value !== null) {
                        result[key] = removeNullsRecursive(value);
                    }
                }
                return result;
            }
            return obj;
        };
        return JSON.stringify(removeNullsRecursive(parsed), null, 2);
    } catch {
        return content;
    }
}

/**
 * Remove empty strings from JSON
 */
export function removeEmptyStrings(content: string): string {
    try {
        const parsed = JSON.parse(content);
        const removeEmptyStringsRecursive = (obj: unknown): unknown => {
            if (obj === '') return null;
            if (Array.isArray(obj)) {
                const filtered = obj
                    .map(removeEmptyStringsRecursive)
                    .filter((item) => item !== null);
                return filtered.length === obj.length ? obj : filtered;
            }
            if (typeof obj === 'object' && obj !== null) {
                const result: Record<string, unknown> = {};
                for (const [key, value] of Object.entries(obj)) {
                    const cleaned = removeEmptyStringsRecursive(value);
                    if (cleaned !== null && cleaned !== '') {
                        result[key] = cleaned;
                    }
                }
                return Object.keys(result).length === Object.keys(obj).length ? obj : result;
            }
            return obj;
        };
        return JSON.stringify(removeEmptyStringsRecursive(parsed), null, 2);
    } catch {
        return content;
    }
}

/**
 * Remove empty objects and arrays from JSON
 */
export function removeEmptyObjects(content: string): string {
    try {
        const parsed = JSON.parse(content);
        const removeEmptyObjectsRecursive = (obj: unknown): unknown => {
            if (Array.isArray(obj)) {
                const filtered = obj
                    .map(removeEmptyObjectsRecursive)
                    .filter((item) => item !== null && item !== undefined && item !== '');
                return filtered.length === 0 ? null : filtered;
            }
            if (typeof obj === 'object' && obj !== null) {
                const result: Record<string, unknown> = {};
                let hasContent = false;
                for (const [key, value] of Object.entries(obj)) {
                    const cleaned = removeEmptyObjectsRecursive(value);
                    if (cleaned !== null && cleaned !== undefined && cleaned !== '') {
                        result[key] = cleaned;
                        hasContent = true;
                    }
                }
                return hasContent ? result : null;
            }
            return obj;
        };
        const result = removeEmptyObjectsRecursive(parsed);
        return JSON.stringify(result, null, 2);
    } catch {
        return content;
    }
}

/**
 * Sort JSON object keys alphabetically
 */
export function sortKeys(content: string): string {
    try {
        const parsed = JSON.parse(content);
        const sortKeysRecursive = (obj: unknown): unknown => {
            if (Array.isArray(obj)) {
                return obj.map(sortKeysRecursive);
            }
            if (typeof obj === 'object' && obj !== null) {
                const result: Record<string, unknown> = {};
                const sortedKeys = Object.keys(obj).sort();
                for (const key of sortedKeys) {
                    result[key] = sortKeysRecursive((obj as Record<string, unknown>)[key]);
                }
                return result;
            }
            return obj;
        };
        return JSON.stringify(sortKeysRecursive(parsed), null, 2);
    } catch {
        return content;
    }
}

/**
 * Format date strings in JSON to ISO format
 */
export function formatDates(content: string): string {
    try {
        const parsed = JSON.parse(content);
        const formatDatesRecursive = (obj: unknown): unknown => {
            if (typeof obj === 'string') {
                // Try to parse as date
                const date = new Date(obj);
                if (!isNaN(date.getTime())) {
                    return date.toISOString();
                }
                return obj;
            }
            if (Array.isArray(obj)) {
                return obj.map(formatDatesRecursive);
            }
            if (typeof obj === 'object' && obj !== null) {
                const result: Record<string, unknown> = {};
                for (const [key, value] of Object.entries(obj)) {
                    result[key] = formatDatesRecursive(value);
                }
                return result;
            }
            return obj;
        };
        return JSON.stringify(formatDatesRecursive(parsed), null, 2);
    } catch {
        return content;
    }
}

/**
 * Escape Unicode characters in JSON
 */
export function escapeUnicode(content: string): string {
    try {
        const parsed = JSON.parse(content);
        // Use JSON.stringify with replacer to escape unicode
        return JSON.stringify(
            parsed,
            (_, value) => {
                if (typeof value === 'string') {
                    // Escape unicode characters
                    return value.replace(/[\u007F-\uFFFF]/g, (char) => {
                        return '\\u' + char.charCodeAt(0).toString(16).padStart(4, '0');
                    });
                }
                return value;
            },
            2,
        );
    } catch {
        return content;
    }
}
