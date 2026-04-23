import type { ParsedCurl } from './curl-parser';

export type TargetLanguage = 'fetch' | 'axios' | 'python' | 'httpie';

function indent(str: string, spaces: number): string {
    const pad = ' '.repeat(spaces);
    return str
        .split('\n')
        .map((line) => (line.trim() ? pad + line : ''))
        .join('\n');
}

function jsHeaders(headers: Record<string, string>, indentSize: number): string {
    const entries = Object.entries(headers);
    if (entries.length === 0) return '';
    const pad = ' '.repeat(indentSize);
    const lines = entries.map(([k, v]) => `${pad}  '${k}': '${v}',`).join('\n');
    return `${pad}headers: {\n${lines}\n${pad}}`;
}

function jsonSafeParse(input: string): unknown | null {
    try {
        return JSON.parse(input);
    } catch {
        return null;
    }
}

function formatJsBody(data: string | null, indentSize: number): string {
    if (!data) return '';
    const pad = ' '.repeat(indentSize);
    const parsed = jsonSafeParse(data);
    if (parsed !== null) {
        const json = JSON.stringify(parsed, null, 2);
        const indented = json
            .split('\n')
            .map((line) => (line ? pad + '  ' + line : ''))
            .join('\n');
        return `${pad}body: JSON.stringify(${indented})`;
    }
    return `${pad}body: '${data.replace(/\\/g, '\\\\').replace(/'/g, "\\'")}'`;
}

export function toFetch(parsed: ParsedCurl): string {
    const { method, url, headers, data } = parsed;
    const hasHeaders = Object.keys(headers).length > 0;
    const hasBody = data !== null;
    const needsOptions = method !== 'GET' || hasHeaders || hasBody;

    if (!needsOptions) {
        return `const response = await fetch('${url}');\nconst data = await response.json();`;
    }

    const lines: string[] = [`const response = await fetch('${url}', {`];

    if (method !== 'GET') {
        lines.push(`  method: '${method}',`);
    }

    if (hasHeaders) {
        lines.push(jsHeaders(headers, 0).replace(/^/gm, '  '));
    }

    if (hasBody) {
        lines.push(formatJsBody(data, 0).replace(/^/gm, '  '));
    }

    lines.push('});');
    lines.push('const data = await response.json();');

    return lines.join('\n');
}

export function toAxios(parsed: ParsedCurl): string {
    const { method, url, headers, data } = parsed;
    const hasHeaders = Object.keys(headers).length > 0;
    const parsedBody = data ? jsonSafeParse(data) : null;

    const parts: string[] = [];

    if (method === 'GET' && !hasHeaders) {
        return `const response = await axios.get('${url}');`;
    }

    const methodLower = method.toLowerCase();

    if (['get', 'post', 'put', 'patch', 'delete', 'head', 'options'].includes(methodLower)) {
        parts.push(`const response = await axios.${methodLower}('${url}'`);

        if (parsedBody !== null) {
            parts.push(`, ${JSON.stringify(parsedBody, null, 2)}`);
            if (hasHeaders) {
                parts.push(`, {\n${indent(jsHeaders(headers, 0), 2).trim()}\n}`);
            }
        } else if (data) {
            parts.push(`, '${data.replace(/\\/g, '\\\\').replace(/'/g, "\\'")}'`);
            if (hasHeaders) {
                parts.push(`, {\n${indent(jsHeaders(headers, 0), 2).trim()}\n}`);
            }
        } else if (hasHeaders) {
            parts.push(`, {\n${indent(jsHeaders(headers, 0), 2).trim()}\n}`);
        }

        parts.push(');');
        return parts.join('');
    }

    parts.push(`const response = await axios({`);
    parts.push(`  url: '${url}',`);
    parts.push(`  method: '${method}',`);

    if (hasHeaders) {
        parts.push(indent(jsHeaders(headers, 2), 0).replace(/^/gm, '  '));
    }

    if (parsedBody !== null) {
        parts.push(
            `  data: ${JSON.stringify(parsedBody, null, 4)
                .split('\n')
                .map((l, i) => (i === 0 ? l : '  ' + l))
                .join('\n')},`,
        );
    } else if (data) {
        parts.push(`  data: '${data.replace(/\\/g, '\\\\').replace(/'/g, "\\'")}',`);
    }

    parts.push('});');
    return parts.join('\n');
}

export function toPython(parsed: ParsedCurl): string {
    const { method, url, headers, data } = parsed;
    const hasHeaders = Object.keys(headers).length > 0;
    const parsedBody = data ? jsonSafeParse(data) : null;

    const lines: string[] = ['import requests', ''];

    if (hasHeaders) {
        lines.push('headers = {');
        for (const [k, v] of Object.entries(headers)) {
            lines.push(`    '${k}': '${v}',`);
        }
        lines.push('}');
    }

    if (data) {
        if (parsedBody !== null) {
            lines.push(`json_data = ${JSON.stringify(parsedBody, null, 4)}`);
        } else {
            lines.push(`data = '${data.replace(/\\/g, '\\\\').replace(/'/g, "\\'")}'`);
        }
    }

    lines.push('');

    const methodLower = method.toLowerCase();
    const args: string[] = [`'${url}'`];
    if (hasHeaders) args.push('headers=headers');

    if (data) {
        if (parsedBody !== null) {
            args.push('json=json_data');
        } else {
            args.push('data=data');
        }
    }

    lines.push(`response = requests.${methodLower}(${args.join(', ')})`);
    lines.push('print(response.json())');

    return lines.join('\n');
}

export function toHttpie(parsed: ParsedCurl): string {
    const { method, url, headers, data } = parsed;
    const parts: string[] = ['http'];

    if (method === 'GET') {
        parts.push('GET');
    } else if (method === 'POST') {
        parts.push('POST');
    } else {
        parts.push(method);
    }

    parts.push(url);

    for (const [k, v] of Object.entries(headers)) {
        parts.push(`'${k}:${v}'`);
    }

    if (data) {
        const parsedBody = jsonSafeParse(data);
        if (parsedBody !== null && typeof parsedBody === 'object') {
            for (const [k, v] of Object.entries(parsedBody as Record<string, unknown>)) {
                parts.push(`${k}=${typeof v === 'string' ? v : JSON.stringify(v)}`);
            }
        } else {
            parts.push(`<<<'${data}'`);
        }
    }

    return parts.join(' \\\n  ');
}

export function generateCode(parsed: ParsedCurl, target: TargetLanguage): string {
    switch (target) {
        case 'fetch':
            return toFetch(parsed);
        case 'axios':
            return toAxios(parsed);
        case 'python':
            return toPython(parsed);
        case 'httpie':
            return toHttpie(parsed);
    }
}
