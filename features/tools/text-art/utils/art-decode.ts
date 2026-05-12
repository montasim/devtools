// ---------------------------------------------------------------------------
// Decode text art back to plain text
// ---------------------------------------------------------------------------

export interface DecodeResult {
    decoded: string;
    method: string;
    confidence: number;
}

// ---------------------------------------------------------------------------
// Box border stripping
// ---------------------------------------------------------------------------

const BOX_PATTERNS: Array<{ name: string; re: RegExp; strip: (lines: string[]) => string }> = [
    {
        name: 'Single Border Box',
        re: /^[┌╭]\s*[─━]+\s*[┐╮]/,
        strip: (lines) =>
            lines
                .slice(1, -1)
                .map((l) => l.replace(/^\s*[│║┃┊┆]\s*/, '').replace(/\s*[│║┃┊┆]\s*$/, ''))
                .join('\n'),
    },
    {
        name: 'Double Border Box',
        re: /^[╔]\s*[═]+\s*[╗]/,
        strip: (lines) =>
            lines
                .slice(1, -1)
                .map((l) => l.replace(/^\s*[║│]\s*/, '').replace(/\s*[║│]\s*$/, ''))
                .join('\n'),
    },
    {
        name: 'Bold Border Box',
        re: /^[┏]\s*[━]+\s*[┓]/,
        strip: (lines) =>
            lines
                .slice(1, -1)
                .map((l) => l.replace(/^\s*[┃│]\s*/, '').replace(/\s*[┃│]\s*$/, ''))
                .join('\n'),
    },
    {
        name: 'Star Border Box',
        re: /^\*{3,}/,
        strip: (lines) =>
            lines
                .slice(1, -1)
                .map((l) => l.replace(/^\*\s*/, '').replace(/\s*\*$/, ''))
                .join('\n'),
    },
    {
        name: 'Hash Border Box',
        re: /^#{3,}/,
        strip: (lines) =>
            lines
                .slice(1, -1)
                .map((l) => l.replace(/^#\s*/, '').replace(/\s*#$/, ''))
                .join('\n'),
    },
];

// ---------------------------------------------------------------------------
// Figlet decode (heuristic — look for repeated char patterns forming letters)
// ---------------------------------------------------------------------------

function tryFigletDecode(text: string): string | null {
    const lines = text.split('\n');
    if (lines.length < 2 || lines.length > 12) return null;

    // Check if lines look like ASCII art (lots of non-alphanumeric chars)
    const nonAlphaRatio = text.replace(/[a-zA-Z0-9\s]/g, '').length / text.length;
    if (nonAlphaRatio < 0.3) return null;

    // Try to identify letters by reading columns
    // This is a simple heuristic — reads the most common letter shape
    const trimmed = lines.map((l) => l.replace(/\s+$/, ''));
    const maxLen = Math.max(...trimmed.map((l) => l.length));

    // Group columns into letter segments by detecting gaps
    let inLetter = false;
    let letterStart = 0;
    const segments: Array<[number, number]> = [];

    for (let col = 0; col < maxLen; col++) {
        const hasContent = trimmed.some((l) => col < l.length && l[col] !== ' ');
        if (hasContent && !inLetter) {
            inLetter = true;
            letterStart = col;
        } else if (!hasContent && inLetter) {
            inLetter = false;
            segments.push([letterStart, col]);
        }
    }
    if (inLetter) segments.push([letterStart, maxLen]);

    // For each segment, try to match a letter pattern
    // Simple approach: extract the pattern and try to match against known figlet outputs
    // For now, return a note that this is figlet art with the number of detected chars
    if (segments.length > 0) {
        return `[ASCII art with ~${segments.length} characters]`;
    }

    return null;
}

// ---------------------------------------------------------------------------
// Auto-detect and decode
// ---------------------------------------------------------------------------

export function autoDecodeArt(text: string): DecodeResult {
    const lines = text.split('\n');

    // 1. Try box border stripping
    for (const pattern of BOX_PATTERNS) {
        if (pattern.re.test(lines[0])) {
            const decoded = pattern.strip(lines).trim();
            if (decoded && decoded !== text) {
                const asciiRatio =
                    (decoded.match(/[a-zA-Z0-9]/g) || []).length /
                    decoded.replace(/\s/g, '').length;
                return {
                    decoded,
                    method: pattern.name,
                    confidence: Math.max(0.5, asciiRatio),
                };
            }
        }
    }

    // 2. Try figlet decode
    const figletResult = tryFigletDecode(text);
    if (figletResult) {
        return {
            decoded: figletResult,
            method: 'ASCII Banner (figlet)',
            confidence: 0.3,
        };
    }

    // 3. Fallback — just strip non-printable decorative chars
    const cleaned = text
        .replace(/[═╬╦╩╠╣╔╗╚╝╠╣╠╣╭╮╰╯─━│┃┏┓┗┛┌┐└┘├┤┬┴┼]/g, '')
        .replace(/[░▒▓█▀▄▐▌]/g, '')
        .replace(/\n{3,}/g, '\n\n')
        .trim();

    if (cleaned && cleaned !== text) {
        return {
            decoded: cleaned,
            method: 'Decorative chars stripped',
            confidence: 0.2,
        };
    }

    return {
        decoded: text,
        method: 'Unknown',
        confidence: 0,
    };
}
