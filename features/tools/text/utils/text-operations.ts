export function convertCase(text: string, operation: string): string {
    switch (operation) {
        case 'uppercase':
            return text.toUpperCase();
        case 'lowercase':
            return text.toLowerCase();
        case 'titlecase':
            return text.replace(
                /\w\S*/g,
                (t) => t.charAt(0).toUpperCase() + t.slice(1).toLowerCase(),
            );
        case 'camelcase':
            return text.toLowerCase().replace(/[^a-zA-Z0-9]+(.)/g, (_, c) => c.toUpperCase());
        case 'pascalcase':
            return text
                .toLowerCase()
                .replace(/(^|[^a-zA-Z0-9]+)(.)/g, (_, _s, c) => c.toUpperCase());
        case 'snakecase':
            return text
                .toLowerCase()
                .replace(/\s+/g, '_')
                .replace(/[^a-zA-Z0-9_]/g, '');
        case 'kebabcase':
            return text
                .toLowerCase()
                .replace(/\s+/g, '-')
                .replace(/[^a-zA-Z0-9-]/g, '');
        case 'sentencecase':
            return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
        case 'reverse':
            return text.split('').reverse().join('');
        default:
            return text;
    }
}

export function cleanText(text: string, operations: string[]): string {
    let result = text;
    for (const op of operations) {
        switch (op) {
            case 'trim':
                result = result.trim();
                break;
            case 'trimLines':
                result = result
                    .split('\n')
                    .map((l) => l.trim())
                    .join('\n');
                break;
            case 'removeEmptyLines':
                result = result
                    .split('\n')
                    .filter((l) => l.trim())
                    .join('\n');
                break;
            case 'removeDuplicateLines':
                result = [...new Set(result.split('\n'))].join('\n');
                break;
            case 'removeExtraSpaces':
                result = result.replace(/\s+/g, ' ');
                break;
            case 'removeLineNumbers':
                result = result.replace(/^\d+[.)\]]\s*/gm, '');
                break;
            case 'sortLines':
                result = result.split('\n').sort().join('\n');
                break;
            case 'sortLinesReverse':
                result = result.split('\n').sort().reverse().join('\n');
                break;
            case 'removeHtmlTags':
                result = result.replace(/<[^>]*>/g, '');
                break;
            case 'decodeHtmlEntities': {
                const textarea =
                    typeof document !== 'undefined' ? document.createElement('textarea') : null;
                if (textarea) {
                    textarea.innerHTML = result;
                    result = textarea.value;
                }
                break;
            }
        }
    }
    return result;
}

export function getTextStats(text: string) {
    const chars = text.length;
    const charsNoSpaces = text.replace(/\s/g, '').length;
    const words = text.trim() ? text.trim().split(/\s+/).length : 0;
    const sentences = text.split(/[.!?]+/).filter((s) => s.trim()).length;
    const paragraphs = text.split(/\n\n+/).filter((p) => p.trim()).length;
    const lines = text.split('\n').length;

    return { chars, charsNoSpaces, words, sentences, paragraphs, lines };
}
