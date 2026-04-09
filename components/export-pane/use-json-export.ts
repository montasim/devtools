import { useMemo } from 'react';
import type { ExportOptions, ExportResult } from './types';

export function useJsonExport(json: string, options: ExportOptions): ExportResult {
    return useMemo(() => {
        if (!json || json.trim().length === 0) {
            return {
                converted: '',
                isValid: false,
                error: null,
            };
        }

        try {
            const parsed = JSON.parse(json);

            let converted = '';

            switch (options.format) {
                case 'csv':
                    converted = jsonToCSV(parsed, options);
                    break;
                case 'xml':
                    converted = jsonToXML(parsed, options);
                    break;
                case 'yaml':
                    converted = jsonToYAML(parsed, options);
                    break;
                case 'toml':
                    converted = jsonToTOML(parsed, options);
                    break;
                case 'json':
                    converted = JSON.stringify(parsed, null, 2);
                    break;
                default:
                    converted = json;
            }

            return {
                converted,
                isValid: true,
                error: null,
            };
        } catch (error) {
            return {
                converted: '',
                isValid: false,
                error: (error as Error).message,
            };
        }
    }, [json, options.format, options.csvDelimiter, options.xmlRootTag, options.yamlIndent, options.includeHeaders]);
}

// Convert JSON to CSV
function jsonToCSV(obj: any, options: ExportOptions): string {
    const delimiter = options.csvDelimiter || ',';
    const includeHeaders = options.includeHeaders !== false;

    // If obj is an array of objects
    if (Array.isArray(obj) && obj.length > 0 && typeof obj[0] === 'object') {
        const headers = Object.keys(obj[0]);
        const rows: string[] = [];

        if (includeHeaders) {
            rows.push(headers.join(delimiter));
        }

        obj.forEach(item => {
            const values = headers.map(header => {
                const value = item[header];
                if (value === null || value === undefined) return '';
                if (typeof value === 'string') return `"${value.replace(/"/g, '""')}"`;
                return String(value);
            });
            rows.push(values.join(delimiter));
        });

        return rows.join('\n');
    }

    // If obj is a single object
    if (typeof obj === 'object' && obj !== null && !Array.isArray(obj)) {
        const headers = Object.keys(obj);
        const values = headers.map(header => {
            const value = obj[header];
            if (value === null || value === undefined) return '';
            if (typeof value === 'string') return `"${value.replace(/"/g, '""')}"`;
            return String(value);
        });

        if (includeHeaders) {
            return [headers.join(delimiter), values.join(delimiter)].join('\n');
        }
        return values.join(delimiter);
    }

    return JSON.stringify(obj, null, 2);
}

// Convert JSON to XML
function jsonToXML(obj: any, options: ExportOptions): string {
    const rootTag = options.xmlRootTag || 'root';

    function valueToXML(value: any, key: string, indent: number): string {
        const spaces = ' '.repeat(indent);
        const innerSpaces = ' '.repeat(indent + 2);

        if (value === null || value === undefined) {
            return `${spaces}<${key} xsi:nil="true" />\n`;
        }

        if (typeof value === 'boolean' || typeof value === 'number') {
            return `${spaces}<${key}>${value}</${key}>\n`;
        }

        if (typeof value === 'string') {
            return `${spaces}<${key}>${escapeXML(value)}</${key}>\n`;
        }

        if (Array.isArray(value)) {
            if (value.length === 0) {
                return `${spaces}<${key} />\n`;
            }

            let xml = `${spaces}<${key}>\n`;
            value.forEach(item => {
                xml += valueToXML(item, 'item', indent + 2);
            });
            xml += `${spaces}</${key}>\n`;
            return xml;
        }

        if (typeof value === 'object') {
            const keys = Object.keys(value);
            if (keys.length === 0) {
                return `${spaces}<${key} />\n`;
            }

            let xml = `${spaces}<${key}>\n`;
            keys.forEach(k => {
                xml += valueToXML(value[k], k, indent + 2);
            });
            xml += `${spaces}</${key}>\n`;
            return xml;
        }

        return `${spaces}<${key}>${String(value)}</${key}>\n`;
    }

    function escapeXML(str: string): string {
        return str
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&apos;');
    }

    return `<?xml version="1.0" encoding="UTF-8"?>\n${valueToXML(obj, rootTag, 0)}`;
}

// Convert JSON to YAML
function jsonToYAML(obj: any, options: ExportOptions): string {
    const indent = options.yamlIndent || 2;

    function toYAML(value: any, indentLevel: number): string {
        const spaces = ' '.repeat(indentLevel);

        if (value === null) {
            return 'null';
        }

        if (typeof value === 'boolean') {
            return String(value);
        }

        if (typeof value === 'number') {
            return String(value);
        }

        if (typeof value === 'string') {
            // Check if string needs quotes
            if (/^[\w-]+$/.test(value) && !isNaN(Number(value))) {
                return value;
            }
            return `"${value.replace(/"/g, '\\"')}"`;
        }

        if (Array.isArray(value)) {
            if (value.length === 0) {
                return '[]';
            }

            let yaml = '\n';
            value.forEach(item => {
                const itemYAML = toYAML(item, indentLevel + indent);
                yaml += `${spaces}- ${itemYAML.startsWith('\n') ? itemYAML.slice(1) : itemYAML}\n`;
            });
            return yaml;
        }

        if (typeof value === 'object') {
            const keys = Object.keys(value);
            if (keys.length === 0) {
                return '{}';
            }

            let yaml = '\n';
            keys.forEach(key => {
                const valueYAML = toYAML(value[key], indentLevel + indent);
                yaml += `${spaces}${key}:${valueYAML.startsWith('\n') ? valueYAML : ' ' + valueYAML}\n`;
            });
            return yaml;
        }

        return String(value);
    }

    return toYAML(obj, 0).trim();
}

// Convert JSON to TOML
function jsonToTOML(obj: any, options: ExportOptions): string {
    function toTOML(value: any, key: string = '', indentLevel: number = 0): string {
        const spaces = ' '.repeat(indentLevel);

        if (value === null) {
            return `${spaces}${key} = null\n`;
        }

        if (typeof value === 'boolean') {
            return `${spaces}${key} = ${String(value)}\n`;
        }

        if (typeof value === 'number') {
            return `${spaces}${key} = ${value}\n`;
        }

        if (typeof value === 'string') {
            return `${spaces}${key} = "${value.replace(/"/g, '\\"').replace(/\n/g, '\\n')}"\n`;
        }

        if (Array.isArray(value)) {
            if (value.length === 0) {
                return `${spaces}${key} = []\n`;
            }

            let toml = `${spaces}${key} = [\n`;
            value.forEach(item => {
                toml += toTOML(item, '', indentLevel + 2);
            });
            toml += `${spaces}]\n`;
            return toml;
        }

        if (typeof value === 'object') {
            const keys = Object.keys(value);
            if (keys.length === 0) {
                return `${spaces}${key} = {}\n`;
            }

            let toml = `${spaces}${key} = { ${keys.join(', ')} }\n`;
            keys.forEach(k => {
                toml += toTOML(value[k], k, indentLevel + 2);
            });
            return toml;
        }

        return `${spaces}${key} = ${JSON.stringify(value)}\n`;
    }

    if (Array.isArray(obj)) {
        let toml = '';
        obj.forEach(item => {
            toml += toTOML(item, '', 0);
        });
        return toml.trim();
    }

    if (typeof obj === 'object') {
        let toml = '';
        Object.keys(obj).forEach(key => {
            toml += toTOML(obj[key], key, 0);
        });
        return toml.trim();
    }

    return JSON.stringify(obj, null, 2);
}
