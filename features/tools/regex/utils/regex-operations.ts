export interface RegexFlag {
    value: string;
    label: string;
    description: string;
}

export const REGEX_FLAGS: RegexFlag[] = [
    { value: 'g', label: 'Global', description: 'Find all matches' },
    { value: 'i', label: 'Case-insensitive', description: 'Ignore case' },
    { value: 'm', label: 'Multiline', description: '^ and $ match line start/end' },
    { value: 's', label: 'Dotall', description: '. matches newlines' },
    { value: 'u', label: 'Unicode', description: 'Unicode property escapes' },
];

export interface MatchResult {
    match: string;
    index: number;
    groups: Record<string, string> | undefined;
    numberedGroups: string[];
}

export interface RegexResult {
    matches: MatchResult[];
    error: string | null;
}

export function testRegex(pattern: string, flags: string, testString: string): RegexResult {
    if (!pattern.trim()) {
        return { matches: [], error: null };
    }

    try {
        const regex = new RegExp(pattern, flags);
        const matches: MatchResult[] = [];

        if (flags.includes('g')) {
            let match: RegExpExecArray | null;
            while ((match = regex.exec(testString)) !== null) {
                matches.push({
                    match: match[0],
                    index: match.index,
                    groups: match.groups,
                    numberedGroups: match.slice(1),
                });
                if (match[0].length === 0) {
                    regex.lastIndex++;
                }
            }
        } else {
            const match = regex.exec(testString);
            if (match) {
                matches.push({
                    match: match[0],
                    index: match.index,
                    groups: match.groups,
                    numberedGroups: match.slice(1),
                });
            }
        }

        return { matches, error: null };
    } catch (e) {
        return {
            matches: [],
            error: e instanceof Error ? e.message : 'Invalid regex',
        };
    }
}

export function highlightMatches(testString: string, matches: MatchResult[]): string {
    if (matches.length === 0) return escapeHtml(testString);

    const parts: { text: string; isMatch: boolean; matchIndex: number }[] = [];
    const sorted = [...matches].sort((a, b) => a.index - b.index);

    let lastIndex = 0;
    for (let i = 0; i < sorted.length; i++) {
        const m = sorted[i];
        if (m.index > lastIndex) {
            parts.push({
                text: testString.slice(lastIndex, m.index),
                isMatch: false,
                matchIndex: -1,
            });
        }
        parts.push({ text: m.match, isMatch: true, matchIndex: i });
        lastIndex = m.index + m.match.length;
    }
    if (lastIndex < testString.length) {
        parts.push({ text: testString.slice(lastIndex), isMatch: false, matchIndex: -1 });
    }

    return parts
        .map((p) => {
            const escaped = escapeHtml(p.text);
            if (p.isMatch) {
                const bg =
                    p.matchIndex % 2 === 0
                        ? 'background:rgba(72,187,120,0.3);color:inherit;border-radius:2px;padding:1px 0;'
                        : 'background:rgba(99,145,255,0.3);color:inherit;border-radius:2px;padding:1px 0;';
                return `<mark style="${bg}" data-index="${p.matchIndex}">${escaped}</mark>`;
            }
            return escaped.replace(/\n/g, '<br/>');
        })
        .join('');
}

function escapeHtml(text: string): string {
    return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}
