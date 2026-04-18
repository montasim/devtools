'use client';

import { getTextStats } from '../utils/text-operations';

interface TextareaFooterProps {
    content: string;
}

export function TextareaFooter({ content }: TextareaFooterProps) {
    const stats = getTextStats(content);

    return (
        <div className="flex flex-wrap gap-4 text-xs text-muted-foreground mt-2">
            <span>{stats.chars} chars</span>
            <span>{stats.charsNoSpaces} chars (no spaces)</span>
            <span>{stats.words} words</span>
            <span>{stats.lines} lines</span>
        </div>
    );
}
