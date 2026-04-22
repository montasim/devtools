import { marked } from 'marked';

marked.setOptions({
    gfm: true,
    breaks: true,
});

export function renderMarkdown(source: string): string {
    if (!source.trim()) return '';
    return marked.parse(source) as string;
}

export interface MarkdownStats {
    chars: number;
    words: number;
    lines: number;
}

export function getMarkdownStats(text: string): MarkdownStats {
    const chars = text.length;
    const words = text.trim() ? text.trim().split(/\s+/).length : 0;
    const lines = text ? text.split('\n').length : 0;
    return { chars, words, lines };
}

export const MARKDOWN_SAMPLE = `# Markdown Preview

Write **Markdown** on the left and see the live preview on the right.

## Features

- **Bold** and *italic* text
- ~~Strikethrough~~ text
- [Links](https://example.com)
- Inline \`code\` and code blocks

## Code Block

\`\`\`javascript
function greet(name) {
    return \`Hello, \${name}!\`;
}
\`\`\`

## Table

| Feature | Status |
|---------|--------|
| Headings | Supported |
| Lists | Supported |
| Tables | Supported |
| Code | Supported |

> Blockquotes look like this.

---

1. Ordered list item one
2. Ordered list item two
3. Ordered list item three
`;
