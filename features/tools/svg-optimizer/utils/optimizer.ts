export interface SVGOptimizerOptions {
    removeXmlInstruction: boolean;
    removeDocType: boolean;
    removeComments: boolean;
    removeMetadata: boolean;
    removeEditorData: boolean;
    removeEmptyContainers: boolean;
    precision: number; // decimal places, -1 means no rounding
    beautify: boolean;
}

export const DEFAULT_OPTIMIZER_OPTIONS: SVGOptimizerOptions = {
    removeXmlInstruction: true,
    removeDocType: true,
    removeComments: true,
    removeMetadata: true,
    removeEditorData: true,
    removeEmptyContainers: true,
    precision: 2,
    beautify: false,
};

function formatXml(xml: string): string {
    const reg = /(>)\s*(<)(\/*)/g;
    const wspace = xml.replace(reg, '$1\r\n$2$3');
    const lines = wspace.split('\r\n');
    let formatted = '';
    let indent = 0;

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;

        if (line.match(/^<\/\w/)) {
            indent = Math.max(0, indent - 1);
        }

        formatted += '  '.repeat(indent) + line + '\n';

        // If starts with an open tag and does NOT end with a close tag or self-closing tag
        if (line.match(/^<\w/) && !line.match(/\/>$/) && !line.match(/<\/\w+>$/)) {
            indent++;
        }
    }
    return formatted.trim();
}

function cleanPathCoordinates(d: string, precision: number): string {
    if (precision < 0) return d;
    return d.replace(/-?\d*\.\d+(?:[eE][-+]?\d+)?/g, (match) => {
        const num = parseFloat(match);
        if (isNaN(num)) return match;
        const rounded = Number(num.toFixed(precision));
        if (rounded === 0) return '0';
        // Strip leading zero from decimals to keep compact SVG path notation
        // e.g. 0.62 → .62, -0.62 → -.62
        return rounded.toString().replace(/^0\./, '.').replace(/^-0\./, '-.');
    });
}

export function optimizeSVG(
    svgContent: string,
    options: SVGOptimizerOptions = DEFAULT_OPTIMIZER_OPTIONS,
): string {
    if (!svgContent.trim()) return '';

    const parser = new DOMParser();
    const doc = parser.parseFromString(svgContent, 'image/svg+xml');

    // Check for parser errors
    const parserError = doc.querySelector('parsererror');
    if (parserError) {
        throw new Error(parserError.textContent || 'XML parsing failed');
    }

    const root = doc.documentElement;
    if (root.tagName.toLowerCase() !== 'svg') {
        throw new Error('Root element is not an <svg> tag');
    }

    // Helper function to recursively clean elements
    const cleanNode = (node: Node) => {
        const children = Array.from(node.childNodes);

        for (const child of children) {
            // Remove comment nodes
            if (options.removeComments && child.nodeType === Node.COMMENT_NODE) {
                node.removeChild(child);
                continue;
            }

            if (child.nodeType === Node.ELEMENT_NODE) {
                const el = child as Element;
                const tagName = el.tagName.toLowerCase();

                // Remove metadata nodes
                if (options.removeMetadata && tagName === 'metadata') {
                    node.removeChild(child);
                    continue;
                }

                // Remove editor tags (inkscape / sodipodi metadata tags)
                if (
                    options.removeEditorData &&
                    (tagName.startsWith('sodipodi:') || tagName.startsWith('inkscape:'))
                ) {
                    node.removeChild(child);
                    continue;
                }

                // Recursively clean children
                cleanNode(el);

                // Clean attributes
                const attrs = Array.from(el.attributes);
                for (const attr of attrs) {
                    const name = attr.name;

                    // Remove XML NS or editor attributes
                    if (options.removeEditorData) {
                        if (
                            name.startsWith('inkscape:') ||
                            name.startsWith('sodipodi:') ||
                            name === 'xmlns:inkscape' ||
                            name === 'xmlns:sodipodi' ||
                            name === 'xmlns:custom' ||
                            name.startsWith('illustrator:')
                        ) {
                            el.removeAttribute(name);
                            continue;
                        }
                    }

                    // Apply coordinates rounding precision
                    if (options.precision >= 0) {
                        if (name === 'd' || name === 'points') {
                            const cleanedVal = cleanPathCoordinates(attr.value, options.precision);
                            el.setAttribute(name, cleanedVal);
                        } else if (
                            name === 'x' ||
                            name === 'y' ||
                            name === 'width' ||
                            name === 'height' ||
                            name === 'cx' ||
                            name === 'cy' ||
                            name === 'r'
                        ) {
                            const val = parseFloat(attr.value);
                            if (!isNaN(val)) {
                                const rounded = Number(val.toFixed(options.precision));
                                el.setAttribute(name, rounded.toString());
                            }
                        }
                    }
                }

                // Remove empty containers
                if (options.removeEmptyContainers) {
                    const emptyContainerTags = ['g', 'defs', 'linearGradient', 'radialGradient'];
                    if (
                        emptyContainerTags.includes(tagName) &&
                        el.children.length === 0 &&
                        Array.from(el.attributes).length === 0
                    ) {
                        node.removeChild(child);
                        continue;
                    }
                }
            }
        }
    };

    // Clean all sub-nodes
    cleanNode(root);

    // Clean root attributes too
    const rootAttrs = Array.from(root.attributes);
    for (const attr of rootAttrs) {
        const name = attr.name;
        if (options.removeEditorData) {
            if (
                name.startsWith('inkscape:') ||
                name.startsWith('sodipodi:') ||
                name === 'xmlns:inkscape' ||
                name === 'xmlns:sodipodi'
            ) {
                root.removeAttribute(name);
            }
        }
        if (
            options.precision >= 0 &&
            (name === 'width' || name === 'height' || name === 'viewBox')
        ) {
            if (name === 'viewBox') {
                const cleanedBox = cleanPathCoordinates(attr.value, options.precision);
                root.setAttribute(name, cleanedBox);
            } else {
                const val = parseFloat(attr.value);
                if (!isNaN(val)) {
                    const rounded = Number(val.toFixed(options.precision));
                    root.setAttribute(name, rounded.toString());
                }
            }
        }
    }

    // Serialize back to XML
    const serializer = new XMLSerializer();
    let result = serializer.serializeToString(doc);

    // Post-processing string replacements
    if (options.removeXmlInstruction) {
        result = result.replace(/<\?xml\s+[^>]*\?>/gi, '');
    }
    if (options.removeDocType) {
        result = result.replace(/<!DOCTYPE\s+[^>]*>/gi, '');
    }

    // XMLSerializer adds xmlns:xlink even when unused — strip only if xlink: prefix not actually referenced
    if (!/\bxlink:/.test(result)) {
        result = result.replace(/\s+xmlns:xlink="[^"]*"/g, '');
    }
    // Strip editor namespace declarations added by serializer if not referenced
    for (const prefix of ['sodipodi', 'inkscape', 'dc', 'cc', 'rdf', 'svg']) {
        const used = new RegExp(`\\b${prefix}:`).test(
            result.replace(new RegExp(`\\s+xmlns:${prefix}="[^"]*"`, 'g'), ''),
        );
        if (!used) {
            result = result.replace(new RegExp(`\\s+xmlns:${prefix}="[^"]*"`, 'g'), '');
        }
    }

    result = result.trim();

    if (options.beautify) {
        return formatXml(result);
    } else {
        // Simple Minifier: collapse multiple whitespaces
        return result.replace(/\s+/g, ' ').replace(/> </g, '><').trim();
    }
}
