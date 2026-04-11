import { toast } from 'sonner';

export function copyToClipboard(text: string): boolean {
    try {
        navigator.clipboard.writeText(text);
        toast.success('Copied to clipboard');
        return true;
    } catch {
        toast.error('Failed to copy to clipboard');
        return false;
    }
}

export function toUpperCase(text: string): string {
    return text.toUpperCase();
}

export function toLowerCase(text: string): string {
    return text.toLowerCase();
}

export function toTitleCase(text: string): string {
    return text
        .toLowerCase()
        .split(' ')
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
}

export function toSentenceCase(text: string): string {
    return text
        .toLowerCase()
        .split('. ')
        .map((sentence) => sentence.charAt(0).toUpperCase() + sentence.slice(1))
        .join('. ');
}

export function toCapitalizedCase(text: string): string {
    return text
        .toLowerCase()
        .split(' ')
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
}

export function toKebabCase(text: string): string {
    return text
        .replace(/([a-z])([A-Z])/g, '$1-$2')
        .replace(/[\s_]+/g, '-')
        .toLowerCase();
}

export function toSnakeCase(text: string): string {
    return text
        .replace(/([a-z])([A-Z])/g, '$1_$2')
        .replace(/[\s-]+/g, '_')
        .toLowerCase();
}

export function toCamelCase(text: string): string {
    return text
        .replace(/[-_\s]+(.)?/g, (_, char) => (char ? char.toUpperCase() : ''))
        .replace(/^[A-Z]/, (char) => char.toLowerCase());
}

export function toPascalCase(text: string): string {
    return text
        .replace(/[-_\s]+(.)?/g, (_, char) => (char ? char.toUpperCase() : ''))
        .replace(/^[a-z]/, (char) => char.toUpperCase());
}

export function toConstantCase(text: string): string {
    return text
        .replace(/([a-z])([A-Z])/g, '$1_$2')
        .replace(/[\s-]+/g, '_')
        .toUpperCase();
}

export function toDotCase(text: string): string {
    return text
        .replace(/([a-z])([A-Z])/g, '$1.$2')
        .replace(/[\s_]+/g, '.')
        .toLowerCase();
}

export function toSlugCase(text: string): string {
    return text
        .toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .replace(/[\s_]+/g, '-')
        .replace(/-+/g, '-')
        .trim();
}

export function toAlternatingCase(text: string): string {
    return text
        .split('')
        .map((char, index) => (index % 2 === 0 ? char.toUpperCase() : char.toLowerCase()))
        .join('');
}

export function toInverseCase(text: string): string {
    return text
        .split('')
        .map((char) => {
            if (char === char.toUpperCase()) {
                return char.toLowerCase();
            } else {
                return char.toUpperCase();
            }
        })
        .join('');
}

export function capitalize(text: string): string {
    return text.charAt(0).toUpperCase() + text.slice(1);
}

export function trim(text: string): string {
    return text.trim();
}

export function trimLeft(text: string): string {
    return text.trimLeft();
}

export function trimRight(text: string): string {
    return text.trimRight();
}

export function removeExtraSpaces(text: string): string {
    return text.replace(/\s+/g, ' ').trim();
}

export function removeLineBreaks(text: string): string {
    return text.replace(/[\r\n]+/g, ' ');
}

export function removeDuplicateLines(text: string): string {
    const lines = text.split('\n');
    const unique = Array.from(new Set(lines));
    return unique.join('\n');
}

export function sortLinesAscending(text: string): string {
    return text.split('\n').sort().join('\n');
}

export function sortLinesDescending(text: string): string {
    return text.split('\n').sort().reverse().join('\n');
}

export function sortLinesAlphabetically(text: string): string {
    return text
        .split('\n')
        .sort((a, b) => a.localeCompare(b))
        .join('\n');
}

export function sortLinesByLength(text: string): string {
    return text
        .split('\n')
        .sort((a, b) => a.length - b.length)
        .join('\n');
}

export function removeEmptyLines(text: string): string {
    return text
        .split('\n')
        .filter((line) => line.trim() !== '')
        .join('\n');
}

export function reverseText(text: string): string {
    return text.split('').reverse().join('');
}

export function reverseLines(text: string): string {
    return text.split('\n').reverse().join('\n');
}

export function removeNumbers(text: string): string {
    return text.replace(/\d/g, '');
}

export function removeSpecialChars(text: string): string {
    return text.replace(/[^a-zA-Z0-9\s]/g, '');
}

export function removeLetters(text: string): string {
    return text.replace(/[a-zA-Z]/g, '');
}

export function escapeHtml(text: string): string {
    return text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

export function unescapeHtml(text: string): string {
    return text
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&#039;/g, "'");
}

export function encodeBase64(text: string): string {
    try {
        return btoa(text);
    } catch {
        return text;
    }
}

export function decodeBase64(text: string): string {
    try {
        return atob(text);
    } catch {
        return text;
    }
}

export function encodeUrl(text: string): string {
    return encodeURIComponent(text);
}

export function decodeUrl(text: string): string {
    try {
        return decodeURIComponent(text);
    } catch {
        return text;
    }
}
