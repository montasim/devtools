const VOID_ELEMENTS = new Set([
    'area',
    'base',
    'br',
    'col',
    'embed',
    'hr',
    'img',
    'input',
    'link',
    'meta',
    'param',
    'source',
    'track',
    'wbr',
]);

const RAW_TEXT_ELEMENTS = new Set(['script', 'style']);

function serializeNode(node: Node, indent: string, level: number): string {
    const pad = indent.repeat(level);

    if (node.nodeType === Node.TEXT_NODE) {
        const text = node.textContent ?? '';
        const trimmed = text.trim();
        if (!trimmed) return '';
        return pad + trimmed + '\n';
    }

    if (node.nodeType === Node.COMMENT_NODE) {
        return pad + '<!--' + (node.textContent ?? '') + '-->\n';
    }

    if (node.nodeType !== Node.ELEMENT_NODE) return '';

    const el = node as Element;
    const tagName = el.tagName.toLowerCase();

    let attrs = '';
    for (let i = 0; i < el.attributes.length; i++) {
        const attr = el.attributes[i];
        attrs += ` ${attr.name}="${attr.value}"`;
    }

    if (VOID_ELEMENTS.has(tagName)) {
        return `${pad}<${tagName}${attrs}>\n`;
    }

    if (RAW_TEXT_ELEMENTS.has(tagName)) {
        const inner = el.textContent ?? '';
        const trimmed = inner.trim();
        if (!trimmed) return `${pad}<${tagName}${attrs}></${tagName}>\n`;
        const contentLines = trimmed
            .split('\n')
            .map((line) => indent.repeat(level + 1) + line.trim())
            .join('\n');
        return `${pad}<${tagName}${attrs}>\n${contentLines}\n${pad}</${tagName}>\n`;
    }

    let children = '';
    let hasElementChildren = false;
    for (let i = 0; i < el.childNodes.length; i++) {
        const child = el.childNodes[i];
        if (child.nodeType === Node.ELEMENT_NODE) {
            hasElementChildren = true;
            break;
        }
    }

    if (!hasElementChildren && el.childNodes.length > 0) {
        // Inline text content
        const textContent = el.textContent?.trim() ?? '';
        if (textContent) {
            return `${pad}<${tagName}${attrs}>${textContent}</${tagName}>\n`;
        }
        return `${pad}<${tagName}${attrs}></${tagName}>\n`;
    }

    for (let i = 0; i < el.childNodes.length; i++) {
        children += serializeNode(el.childNodes[i], indent, level + 1);
    }

    if (!children.trim()) {
        return `${pad}<${tagName}${attrs}></${tagName}>\n`;
    }

    return `${pad}<${tagName}${attrs}>\n${children}${pad}</${tagName}>\n`;
}

export function formatHtml(html: string, indent = '  '): string {
    if (typeof window === 'undefined') return html;
    if (!html.trim()) return '';

    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');

    const isFragment =
        !html.trim().toLowerCase().startsWith('<!doctype') &&
        !html.trim().toLowerCase().startsWith('<html');

    if (isFragment) {
        let result = '';
        const body = doc.body;
        for (let i = 0; i < body.childNodes.length; i++) {
            result += serializeNode(body.childNodes[i], indent, 0);
        }
        return result.trim();
    }

    let result = '<!DOCTYPE html>\n';
    const htmlEl = doc.documentElement;
    let htmlAttrs = '';
    for (let i = 0; i < htmlEl.attributes.length; i++) {
        const attr = htmlEl.attributes[i];
        htmlAttrs += ` ${attr.name}="${attr.value}"`;
    }
    result += `<html${htmlAttrs}>\n`;

    const head = doc.head;
    if (head) {
        result += `${indent}<head>\n`;
        for (let i = 0; i < head.childNodes.length; i++) {
            result += serializeNode(head.childNodes[i], indent, 2);
        }
        result += `${indent}</head>\n`;
    }

    const body = doc.body;
    if (body) {
        result += `${indent}<body>\n`;
        for (let i = 0; i < body.childNodes.length; i++) {
            result += serializeNode(body.childNodes[i], indent, 2);
        }
        result += `${indent}</body>\n`;
    }

    result += '</html>';
    return result;
}

export function minifyHtml(html: string): string {
    if (!html.trim()) return '';

    return (
        html
            // Remove HTML comments (but not conditional comments)
            .replace(/<!--(?!\[if)[\s\S]*?-->/g, '')
            // Collapse whitespace between tags
            .replace(/>\s+</g, '><')
            // Trim leading/trailing whitespace from attribute values
            .replace(/\s*=\s*"/g, '="')
            .replace(/\s*=\s*'/g, "='")
            // Collapse multiple whitespace to single space
            .replace(/\s{2,}/g, ' ')
            .trim()
    );
}

export function validateHtml(html: string): {
    valid: boolean;
    errors: string[];
    stats: { elements: number; comments: number };
} {
    if (typeof window === 'undefined') {
        return { valid: true, errors: [], stats: { elements: 0, comments: 0 } };
    }
    if (!html.trim()) {
        return { valid: true, errors: [], stats: { elements: 0, comments: 0 } };
    }

    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');

    const errors: string[] = [];

    // Count elements and comments
    const allElements = doc.querySelectorAll('*');
    const elements = allElements.length;

    let comments = 0;
    const countComments = (node: Node) => {
        for (let i = 0; i < node.childNodes.length; i++) {
            const child = node.childNodes[i];
            if (child.nodeType === Node.COMMENT_NODE) {
                comments++;
            }
            countComments(child);
        }
    };
    countComments(doc);

    // Check for duplicate IDs
    const ids = new Map<string, number>();
    allElements.forEach((el) => {
        const id = el.getAttribute('id');
        if (id) {
            ids.set(id, (ids.get(id) ?? 0) + 1);
        }
    });
    ids.forEach((count, id) => {
        if (count > 1) {
            errors.push(`Duplicate ID "${id}" found ${count} times`);
        }
    });

    // Check for img elements missing alt attribute
    const images = doc.querySelectorAll('img');
    images.forEach((img) => {
        if (!img.hasAttribute('alt')) {
            const src = img.getAttribute('src') ?? 'unknown';
            errors.push(`<img> element missing alt attribute (src="${src}")`);
        }
    });

    // Check for empty anchor href
    const anchors = doc.querySelectorAll('a');
    anchors.forEach((a) => {
        if (!a.hasAttribute('href')) {
            const text = a.textContent?.trim() ?? '';
            errors.push(`<a> element missing href attribute${text ? ` (text="${text}")` : ''}`);
        }
    });

    return {
        valid: errors.length === 0,
        errors,
        stats: { elements, comments },
    };
}
