export function copyToClipboard(text: string): boolean {
    try {
        navigator.clipboard.writeText(text);
        return true;
    } catch {
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
