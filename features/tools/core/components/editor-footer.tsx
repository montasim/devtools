'use client';

import { useMemo } from 'react';
import {
    HardDrive,
    Type,
    AlignLeft,
    WholeWord,
    MessageSquare,
    CheckCircle,
    XCircle,
    Braces,
    Key,
    Layers,
    FileDown,
} from 'lucide-react';

type FooterMode = 'text' | 'json' | 'base64';

interface EditorFooterProps {
    content: string;
    mode?: FooterMode;
}

function formatSize(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function getCommonStats(content: string) {
    const bytes = new TextEncoder().encode(content).length;
    const chars = content.length;
    const lines = content ? content.split('\n').length : 0;
    return { bytes, chars, lines };
}

function getJsonStats(content: string) {
    const common = getCommonStats(content);
    if (!content.trim()) return { ...common, valid: false, keys: 0, depth: 0, type: '-' };

    try {
        const parsed = JSON.parse(content);
        const type = Array.isArray(parsed) ? 'array' : typeof parsed;
        let keys = 0;
        let depth = 0;

        if (typeof parsed === 'object' && parsed !== null) {
            keys = Array.isArray(parsed) ? parsed.length : Object.keys(parsed).length;

            const calcDepth = (obj: unknown, d: number): number => {
                if (typeof obj !== 'object' || obj === null) return d;
                let max = d;
                const values = Array.isArray(obj)
                    ? obj
                    : Object.values(obj as Record<string, unknown>);
                for (const v of values) {
                    max = Math.max(max, calcDepth(v, d + 1));
                }
                return max;
            };
            depth = calcDepth(parsed, 0);
        }

        return { ...common, valid: true, keys, depth, type };
    } catch {
        return { ...common, valid: false, keys: 0, depth: 0, type: '-' };
    }
}

function getTextStats(content: string) {
    const common = getCommonStats(content);
    const words = content.trim() ? content.trim().split(/\s+/).length : 0;
    const sentences = content.split(/[.!?]+/).filter((s) => s.trim()).length;
    return { ...common, words, sentences };
}

function getBase64Stats(content: string) {
    const common = getCommonStats(content);
    const clean = content.replace(/^data:[^;]+;base64,/, '').replace(/\s/g, '');
    const padding = (clean.match(/=+$/) || [''])[0].length;
    const decodedBytes = Math.floor(((clean.length - padding) * 3) / 4);
    return { ...common, decodedBytes };
}

function Stat({
    icon: Icon,
    label,
}: {
    icon: React.ComponentType<{ className?: string }>;
    label: string;
}) {
    return (
        <span className="inline-flex items-center gap-1">
            <Icon className="h-3 w-3" />
            {label}
        </span>
    );
}

export function EditorFooter({ content, mode = 'text' }: EditorFooterProps) {
    const stats = useMemo(() => {
        switch (mode) {
            case 'json':
                return { mode: 'json' as const, data: getJsonStats(content) };
            case 'base64':
                return { mode: 'base64' as const, data: getBase64Stats(content) };
            default:
                return { mode: 'text' as const, data: getTextStats(content) };
        }
    }, [content, mode]);

    return (
        <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
            <Stat icon={HardDrive} label={formatSize(stats.data.bytes)} />
            <Stat icon={Type} label={`${stats.data.chars.toLocaleString()} chars`} />
            <Stat icon={AlignLeft} label={`${stats.data.lines.toLocaleString()} lines`} />

            {stats.mode === 'text' && (
                <>
                    <Stat icon={WholeWord} label={`${stats.data.words.toLocaleString()} words`} />
                    <Stat
                        icon={MessageSquare}
                        label={`${stats.data.sentences.toLocaleString()} sentences`}
                    />
                </>
            )}

            {stats.mode === 'json' && (
                <>
                    {stats.data.valid ? (
                        <span className="inline-flex items-center gap-1 text-green-600 dark:text-green-400">
                            <CheckCircle className="h-3 w-3" />
                            Valid JSON
                        </span>
                    ) : (
                        stats.data.chars > 0 && (
                            <span className="inline-flex items-center gap-1 text-destructive">
                                <XCircle className="h-3 w-3" />
                                Invalid JSON
                            </span>
                        )
                    )}
                    {stats.data.type !== '-' && (
                        <Stat icon={Braces} label={`Type: ${stats.data.type}`} />
                    )}
                    {stats.data.keys > 0 && (
                        <Stat icon={Key} label={`${stats.data.keys.toLocaleString()} keys`} />
                    )}
                    {stats.data.depth > 0 && (
                        <Stat icon={Layers} label={`Depth: ${stats.data.depth}`} />
                    )}
                </>
            )}

            {stats.mode === 'base64' && (
                <Stat icon={FileDown} label={`Decoded: ${formatSize(stats.data.decodedBytes)}`} />
            )}
        </div>
    );
}
