export interface ParsedCurl {
    method: string;
    url: string;
    headers: Record<string, string>;
    data: string | null;
    flags: string[];
}

function unescapeArg(arg: string): string {
    if ((arg.startsWith('"') && arg.endsWith('"')) || (arg.startsWith("'") && arg.endsWith("'"))) {
        return arg.slice(1, -1);
    }
    return arg;
}

function tokenize(input: string): string[] {
    const tokens: string[] = [];
    let current = '';
    let i = 0;
    let inSingle = false;
    let inDouble = false;
    let escaped = false;

    while (i < input.length) {
        const ch = input[i];

        if (escaped) {
            current += ch;
            escaped = false;
            i++;
            continue;
        }

        if (ch === '\\') {
            if (inSingle) {
                current += ch;
            } else {
                escaped = true;
            }
            i++;
            continue;
        }

        if (ch === "'" && !inDouble) {
            inSingle = !inSingle;
            current += ch;
            i++;
            continue;
        }

        if (ch === '"' && !inSingle) {
            inDouble = !inDouble;
            current += ch;
            i++;
            continue;
        }

        if (/\s/.test(ch) && !inSingle && !inDouble) {
            if (current) {
                tokens.push(current);
                current = '';
            }
            i++;
            continue;
        }

        current += ch;
        i++;
    }

    if (current) tokens.push(current);
    return tokens;
}

export function parseCurl(input: string): ParsedCurl {
    const trimmed = input.trim();

    const lines = trimmed
        .split(/\r?\n/)
        .map((l) => l.trimEnd())
        .map((l) => (l.endsWith('\\') ? l.slice(0, -1) : l))
        .join(' ');

    const tokens = tokenize(lines);

    let method = '';
    let url = '';
    const headers: Record<string, string> = {};
    let data: string | null = null;
    const flags: string[] = [];

    let i = 0;

    const firstToken = tokens[i]?.toLowerCase();
    if (firstToken === 'curl') {
        i++;
    }

    while (i < tokens.length) {
        const token = tokens[i];

        if (token === '-X' || token === '--request') {
            i++;
            if (tokens[i]) method = unescapeArg(tokens[i]).toUpperCase();
            i++;
            continue;
        }

        if (token === '-H' || token === '--header') {
            i++;
            if (tokens[i]) {
                const headerRaw = unescapeArg(tokens[i]);
                const colonIdx = headerRaw.indexOf(':');
                if (colonIdx > 0) {
                    const name = headerRaw.slice(0, colonIdx).trim();
                    const value = headerRaw.slice(colonIdx + 1).trim();
                    headers[name] = value;
                }
            }
            i++;
            continue;
        }

        if (
            token === '-d' ||
            token === '--data' ||
            token === '--data-raw' ||
            token === '--data-binary'
        ) {
            i++;
            if (tokens[i]) data = unescapeArg(tokens[i]);
            i++;
            continue;
        }

        if (token === '--data-urlencode') {
            i++;
            if (tokens[i]) data = unescapeArg(tokens[i]);
            i++;
            continue;
        }

        if (token.startsWith('data=') || token.startsWith("data='") || token.startsWith('data="')) {
            const eqIdx = token.indexOf('=');
            data = unescapeArg(token.slice(eqIdx + 1));
            i++;
            continue;
        }

        if (token === '-F' || token === '--form') {
            i++;
            if (tokens[i]) {
                if (!data) data = '';
            }
            i++;
            continue;
        }

        if (token === '-u' || token === '--user') {
            i++;
            if (tokens[i]) {
                const cred = unescapeArg(tokens[i]);
                headers['Authorization'] = `Basic ${btoa(cred)}`;
            }
            i++;
            continue;
        }

        if (token === '-b' || token === '--cookie') {
            i++;
            if (tokens[i]) {
                headers['Cookie'] = unescapeArg(tokens[i]);
            }
            i++;
            continue;
        }

        if (token === '-A' || token === '--user-agent') {
            i++;
            if (tokens[i]) {
                headers['User-Agent'] = unescapeArg(tokens[i]);
            }
            i++;
            continue;
        }

        if (token === '-e' || token === '--referer') {
            i++;
            if (tokens[i]) {
                headers['Referer'] = unescapeArg(tokens[i]);
            }
            i++;
            continue;
        }

        if (
            token === '--compressed' ||
            token === '-k' ||
            token === '--insecure' ||
            token === '-L' ||
            token === '--location' ||
            token === '-s' ||
            token === '--silent' ||
            token === '-S' ||
            token === '--show-error' ||
            token === '-v' ||
            token === '--verbose' ||
            token === '-i' ||
            token === '--include' ||
            token === '-I' ||
            token === '--head'
        ) {
            flags.push(token);
            i++;
            continue;
        }

        if (
            token.startsWith('-') &&
            token.length > 1 &&
            !token.startsWith('http://') &&
            !token.startsWith('https://')
        ) {
            flags.push(token);
            i++;
            continue;
        }

        if (
            !url &&
            (token.startsWith('http://') ||
                token.startsWith('https://') ||
                token.startsWith("'http") ||
                token.startsWith('"http'))
        ) {
            url = unescapeArg(token);
            i++;
            continue;
        }

        if (!url && !token.startsWith('-')) {
            url = unescapeArg(token);
            i++;
            continue;
        }

        i++;
    }

    if (!method) {
        if (data !== null) {
            method = 'POST';
        } else if (flags.includes('-I') || flags.includes('--head')) {
            method = 'HEAD';
        } else {
            method = 'GET';
        }
    }

    return { method, url, headers, data, flags };
}
