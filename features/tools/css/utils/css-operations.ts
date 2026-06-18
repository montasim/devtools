export function formatCss(css: string, indent = '  '): string {
    // Remove existing block comments
    const src = css.replace(/\/\*[\s\S]*?\*\//g, '');

    // Tokenise: split by { } ; preserving the delimiter
    const tokens = src.split(/([\{\};])/);

    const lines: string[] = [];
    let depth = 0;

    const pad = () => indent.repeat(depth);

    for (let i = 0; i < tokens.length; i++) {
        const raw = tokens[i];
        const token = raw.trim();

        if (token === '{') {
            // The previous line already has the selector — append `{`
            const last = lines.length - 1;
            if (last >= 0) {
                lines[last] = lines[last].trimEnd() + ' {';
            } else {
                lines.push('{');
            }
            depth++;
        } else if (token === '}') {
            depth = Math.max(0, depth - 1);
            lines.push(pad() + '}');
            // Blank line after closing brace at root level
            if (depth === 0) {
                lines.push('');
            }
        } else if (token === ';') {
            // Append semicolon to the current last declaration line
            const last = lines.length - 1;
            if (last >= 0 && lines[last].trim() !== '') {
                lines[last] = lines[last].trimEnd() + ';';
            }
        } else if (token !== '') {
            // Could be selector(s) or a property:value pair (no { follows immediately)
            // Split multi-selectors on commas (but only at root of a selector, not inside parens)
            const isDeclaration = token.includes(':') && depth > 0;

            if (isDeclaration) {
                // Single property:value — indent it
                const parts = token.split(':');
                const prop = parts[0].trim();
                const val = parts.slice(1).join(':').trim();
                if (prop) {
                    lines.push(pad() + prop + ': ' + val);
                }
            } else {
                // Selector — handle comma-separated selectors
                const selectors = splitSelectors(token);
                for (const sel of selectors) {
                    if (sel.trim()) {
                        lines.push(pad() + sel.trim());
                    }
                }
            }
        }
    }

    // Clean up: remove consecutive blank lines, trim trailing blank
    const result = lines
        .join('\n')
        .replace(/\n{3,}/g, '\n\n')
        .trim();

    return result;
}

/** Split comma-separated selectors, respecting parentheses (e.g. :not(), :is()) */
function splitSelectors(selector: string): string[] {
    const parts: string[] = [];
    let depth = 0;
    let current = '';

    for (const ch of selector) {
        if (ch === '(') depth++;
        else if (ch === ')') depth--;

        if (ch === ',' && depth === 0) {
            parts.push(current);
            current = '';
        } else {
            current += ch;
        }
    }
    if (current.trim()) parts.push(current);
    return parts;
}

export function minifyCss(css: string): string {
    return (
        css
            // Remove block comments
            .replace(/\/\*[\s\S]*?\*\//g, '')
            // Collapse whitespace to a single space
            .replace(/\s+/g, ' ')
            // Remove spaces around { } : ; ,
            .replace(/\s*\{\s*/g, '{')
            .replace(/\s*\}\s*/g, '}')
            .replace(/\s*:\s*/g, ':')
            .replace(/\s*;\s*/g, ';')
            .replace(/\s*,\s*/g, ',')
            // Remove trailing semicolon before closing brace
            .replace(/;}/g, '}')
            .trim()
    );
}

export function validateCss(css: string): { valid: boolean; error?: string } {
    if (!css || !css.trim()) {
        return { valid: false, error: 'Input is empty' };
    }

    // Check balanced braces
    let depth = 0;
    let inString = false;
    let stringChar = '';

    for (let i = 0; i < css.length; i++) {
        const ch = css[i];

        if (inString) {
            if (ch === stringChar && css[i - 1] !== '\\') inString = false;
            continue;
        }

        if (ch === '"' || ch === "'") {
            inString = true;
            stringChar = ch;
            continue;
        }

        if (ch === '{') depth++;
        else if (ch === '}') {
            depth--;
            if (depth < 0) {
                return { valid: false, error: 'Unexpected closing brace `}`' };
            }
        }
    }

    if (depth !== 0) {
        return { valid: false, error: `Unmatched opening brace — ${depth} block(s) not closed` };
    }

    // Must contain at least one rule
    const stripped = css.replace(/\/\*[\s\S]*?\*\//g, '').trim();
    if (!stripped.includes('{') || !stripped.includes('}')) {
        return { valid: false, error: 'No valid CSS rules found' };
    }

    return { valid: true };
}
