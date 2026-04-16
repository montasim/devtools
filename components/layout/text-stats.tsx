'use client';

import { useMemo } from 'react';
import { HardDrive, Type, FileText, AlignLeft, List, Heading1 } from 'lucide-react';

export interface TextStats {
    fileSize: string;
    characterCount: number;
    wordCount: number;
    lineCount: number;
    sentenceCount: number;
    paragraphCount: number;
}

export interface TextStatsProps {
    content: string;
}

function calculateTextStats(content: string): TextStats {
    if (!content || content.trim() === '') {
        return {
            fileSize: '0 B',
            characterCount: 0,
            wordCount: 0,
            lineCount: 0,
            sentenceCount: 0,
            paragraphCount: 0,
        };
    }

    // Calculate file size
    const fileSize = new Blob([content]).size;
    const fileSizeFormatted =
        fileSize < 1024
            ? `${fileSize} B`
            : fileSize < 1024 * 1024
              ? `${(fileSize / 1024).toFixed(1)} KB`
              : `${(fileSize / (1024 * 1024)).toFixed(1)} MB`;

    // Calculate text statistics
    const characterCount = content.length;
    const wordCount = content.trim() ? content.trim().split(/\s+/).length : 0;
    const lineCount = content.split('\n').length;
    const sentences = content.split(/[.!?]+/).filter((s) => s.trim().length > 0);
    const sentenceCount = sentences.length;
    const paragraphs = content.split(/\n\s*\n/).filter((p) => p.trim().length > 0);
    const paragraphCount = paragraphs.length;

    return {
        fileSize: fileSizeFormatted,
        characterCount,
        wordCount,
        lineCount,
        sentenceCount,
        paragraphCount,
    };
}

export function TextStats({ content }: TextStatsProps) {
    const stats = useMemo(() => calculateTextStats(content), [content]);

    const statistics = useMemo(
        () => [
            {
                icon: HardDrive,
                label: stats.fileSize,
                title: 'File size',
            },
            {
                icon: Type,
                label: `${stats.characterCount} chars`,
                title: 'Characters',
            },
            {
                icon: FileText,
                label: `${stats.wordCount} words`,
                title: 'Words',
            },
            {
                icon: AlignLeft,
                label: `${stats.lineCount} lines`,
                title: 'Lines',
            },
            {
                icon: List,
                label: `${stats.sentenceCount} sentences`,
                title: 'Sentences',
            },
            {
                icon: Heading1,
                label: `${stats.paragraphCount} paragraphs`,
                title: 'Paragraphs',
            },
        ],
        [stats],
    );

    return (
        <div className="flex items-center gap-2">
            {statistics.map((stat, index) => (
                <div key={index} title={stat.title} className="flex items-center gap-1.5 shrink-0">
                    <stat.icon className="h-3.5 w-3.5 text-gray-500" />
                    <span className="text-xs text-muted-foreground">{stat.label}</span>
                </div>
            ))}
        </div>
    );
}
