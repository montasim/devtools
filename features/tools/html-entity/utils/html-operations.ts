const NAMED_ENTITIES: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&apos;',
    '\u00A0': '&nbsp;',
    '\u00A9': '&copy;',
    '\u00AE': '&reg;',
    '\u2122': '&trade;',
    '\u00D7': '&times;',
    '\u00F7': '&divide;',
    '\u2013': '&ndash;',
    '\u2014': '&mdash;',
    '\u2018': '&lsquo;',
    '\u2019': '&rsquo;',
    '\u201C': '&ldquo;',
    '\u201D': '&rdquo;',
    '\u2026': '&hellip;',
    '\u2190': '&larr;',
    '\u2192': '&rarr;',
    '\u2191': '&uarr;',
    '\u2193': '&darr;',
    '\u2264': '&le;',
    '\u2265': '&ge;',
    '\u2260': '&ne;',
    '\u00B1': '&plusmn;',
    '\u221E': '&infin;',
    '\u03A9': '&Omega;',
    '\u00B0': '&deg;',
    '\u00B6': '&para;',
    '\u00A7': '&sect;',
    '\u00A2': '&cent;',
    '\u00A3': '&pound;',
    '\u00A5': '&yen;',
    '\u20AC': '&euro;',
    '\u0024': '&dollar;',
};

const CHAR_TO_ENTITY: Map<string, string> = new Map(
    Object.entries(NAMED_ENTITIES).map(([char, entity]) => [char, entity]),
);

const ENTITY_TO_CHAR: Map<string, string> = new Map(
    Object.entries(NAMED_ENTITIES).map(([char, entity]) => [entity, char]),
);

export type EntityMode = 'named' | 'decimal' | 'hexadecimal';

export const ENTITY_MODES: { value: EntityMode; label: string }[] = [
    { value: 'named', label: 'Named' },
    { value: 'decimal', label: 'Decimal (&#...;)' },
    { value: 'hexadecimal', label: 'Hex (&#x...;)' },
];

export function htmlEncode(text: string, mode: EntityMode = 'named'): string {
    let result = '';
    for (const ch of text) {
        const code = ch.codePointAt(0)!;

        if (mode === 'named' && CHAR_TO_ENTITY.has(ch)) {
            result += CHAR_TO_ENTITY.get(ch)!;
        } else if (mode === 'named' && code > 127) {
            result += `&#${code};`;
        } else if (mode === 'decimal') {
            if (code > 127 || ch === '<' || ch === '>' || ch === '&' || ch === '"' || ch === "'") {
                result += `&#${code};`;
            } else {
                result += ch;
            }
        } else if (mode === 'hexadecimal') {
            if (code > 127 || ch === '<' || ch === '>' || ch === '&' || ch === '"' || ch === "'") {
                result += `&#x${code.toString(16).toUpperCase()};`;
            } else {
                result += ch;
            }
        } else {
            result += ch;
        }
    }
    return result;
}

export function htmlDecode(text: string): string {
    return text.replace(/&(?:#x[0-9a-fA-F]+|#[0-9]+|[a-zA-Z][a-zA-Z0-9]*);/g, (entity) => {
        if (ENTITY_TO_CHAR.has(entity)) {
            return ENTITY_TO_CHAR.get(entity)!;
        }

        if (entity.startsWith('&#x') || entity.startsWith('&#X')) {
            const hex = entity.slice(3, -1);
            const code = parseInt(hex, 16);
            if (!isNaN(code) && code > 0) {
                return String.fromCodePoint(code);
            }
        }

        if (entity.startsWith('&#')) {
            const num = entity.slice(2, -1);
            const code = parseInt(num, 10);
            if (!isNaN(code) && code > 0) {
                return String.fromCodePoint(code);
            }
        }

        return entity;
    });
}
