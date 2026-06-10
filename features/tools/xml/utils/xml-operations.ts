export function formatXml(xml: string, indent = '  '): string {
    let formatted = '';
    let pad = 0;
    const reg = /(>)(<)(\/*)/g;
    xml = xml.replace(reg, '$1\n$2$3');
    xml.split('\n').forEach((node) => {
        let indentLevel = 0;
        if (node.match(/.+<\/\w[^>]*>$/)) {
            indentLevel = 0;
        } else if (node.match(/^<\/\w/)) {
            if (pad !== 0) {
                pad -= 1;
            }
        } else if (node.match(/^<\w[^>]*[^\/]>.*$/)) {
            indentLevel = 1;
        } else {
            indentLevel = 0;
        }

        let padding = '';
        for (let i = 0; i < pad; i++) {
            padding += indent;
        }

        formatted += padding + node + '\n';
        pad += indentLevel;
    });
    return formatted.trim();
}

export function minifyXml(xml: string): string {
    return xml.replace(/>\s+</g, '><').trim();
}

export function validateXml(xml: string): { valid: boolean; error?: string } {
    try {
        if (typeof window === 'undefined') return { valid: true };
        const parser = new DOMParser();
        const doc = parser.parseFromString(xml, 'application/xml');
        const parsererror = doc.querySelector('parsererror');
        if (parsererror) {
            return { valid: false, error: parsererror.textContent || 'Invalid XML' };
        }
        return { valid: true };
    } catch (error) {
        return { valid: false, error: error instanceof Error ? error.message : 'Invalid XML' };
    }
}

export function parseXml(xml: string): { parsed: unknown; type: string; keys?: string[] } {
    if (typeof window === 'undefined') return { parsed: {}, type: 'object' };
    const parser = new DOMParser();
    const doc = parser.parseFromString(xml, 'application/xml');
    const parsererror = doc.querySelector('parsererror');
    if (parsererror) throw new Error(parsererror.textContent || 'Invalid XML');

    function domToObject(node: Element): any {
        const obj: any = {};
        if (node.attributes.length > 0) {
            obj['@attributes'] = {};
            for (let j = 0; j < node.attributes.length; j++) {
                const attribute = node.attributes.item(j);
                if (attribute) obj['@attributes'][attribute.nodeName] = attribute.nodeValue;
            }
        }
        if (node.hasChildNodes()) {
            for (let i = 0; i < node.childNodes.length; i++) {
                const item = node.childNodes.item(i);
                const nodeName = item.nodeName;
                if (item.nodeType === 3) {
                    const text = item.nodeValue?.trim();
                    if (text) {
                        if (Object.keys(obj).length === 0) return text;
                        obj['#text'] = text;
                    }
                } else if (item.nodeType === 1) {
                    if (typeof obj[nodeName] === 'undefined') {
                        obj[nodeName] = domToObject(item as Element);
                    } else {
                        if (typeof obj[nodeName].push === 'undefined') {
                            const old = obj[nodeName];
                            obj[nodeName] = [];
                            obj[nodeName].push(old);
                        }
                        obj[nodeName].push(domToObject(item as Element));
                    }
                }
            }
        }
        return obj;
    }
    
    const root = doc.documentElement;
    const parsed = { [root.nodeName]: domToObject(root) };
    const type = 'object';
    const keys = Object.keys(parsed);
    return { parsed, type, keys };
}

export function computeXmlDiff(
    left: string,
    right: string,
): { added: number; removed: number; changed: number } {
    const leftLines = formatXml(left).split('\n');
    const rightLines = formatXml(right).split('\n');
    
    let added = 0;
    let removed = 0;
    
    const leftSet = new Set(leftLines.map(l => l.trim()).filter(Boolean));
    const rightSet = new Set(rightLines.map(l => l.trim()).filter(Boolean));
    
    for (const line of rightSet) {
        if (!leftSet.has(line)) added++;
    }
    for (const line of leftSet) {
        if (!rightSet.has(line)) removed++;
    }
    
    return { added, removed, changed: 0 };
}
