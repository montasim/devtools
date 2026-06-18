export interface HeaderEntry {
    key: string;
    value: string;
}

export interface ParsedRequest {
    method: string;
    path: string;
    protocol: string;
    headers: HeaderEntry[];
    url: string;
    curl: string;
}

export function parseHttpRequest(rawInput: string): ParsedRequest {
    const lines = rawInput.split(/\r?\n/);
    const headers: HeaderEntry[] = [];
    let method = 'GET';
    let path = '/';
    let protocol = 'HTTP/1.1';
    let host = '';

    // Standard HTTP request line: "METHOD PATH PROTOCOL"
    const requestLineRegex = /^(GET|POST|PUT|DELETE|PATCH|HEAD|OPTIONS|CONNECT|TRACE)\s+(\S+)\s+(HTTP\/\d\.\d|HTTP\/\d)$/i;

    for (let line of lines) {
        line = line.trim();
        if (!line) continue;

        const requestMatch = line.match(requestLineRegex);
        if (requestMatch) {
            method = requestMatch[1].toUpperCase();
            path = requestMatch[2];
            protocol = requestMatch[3];
            continue;
        }

        // Split on the first colon that is not part of a leading pseudo-header colon (e.g. :authority)
        const colonIndex = line.indexOf(':', line.startsWith(':') ? 1 : 0);
        if (colonIndex > 0) {
            const key = line.substring(0, colonIndex).trim();
            const value = line.substring(colonIndex + 1).trim();

            const lowerKey = key.toLowerCase();
            if (lowerKey === 'host') {
                host = value;
            } else if (lowerKey === ':authority') {
                host = value;
            } else if (lowerKey === ':method') {
                method = value.toUpperCase();
            } else if (lowerKey === ':path') {
                path = value;
            }

            headers.push({ key, value });
        }
    }

    const cleanHost = host || 'example.com';
    const cleanPath = path.startsWith('/') ? path : `/${path}`;
    
    // Check if the path is a full URL itself (e.g. GET http://example.com/index.html)
    let url = '';
    if (/^https?:\/\//i.test(path)) {
        url = path;
    } else {
        url = `https://${cleanHost}${cleanPath}`;
    }

    // Build cURL representation
    let curl = `curl -X ${method} '${url}'`;
    for (const header of headers) {
        // Pseudo headers (starts with colons) are omitted in traditional cURL calls
        if (header.key.startsWith(':')) continue;

        const escapedValue = header.value.replace(/'/g, "'\\''");
        curl += ` \\\n  -H '${header.key}: ${escapedValue}'`;
    }

    return {
        method,
        path,
        protocol,
        headers,
        url,
        curl,
    };
}
