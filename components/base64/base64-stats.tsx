'use client';

import { useMemo } from 'react';
import { Type, HardDrive } from 'lucide-react';

export interface Base64StatsProps {
    content: string;
}

function calculateBase64Stats(content: string) {
    if (!content || content.trim() === '') {
        return {
            characterCount: 0,
            sizeInBytes: 0,
            sizeInKB: 0,
        };
    }

    // Calculate character count
    const characterCount = content.length;

    // Calculate size in bytes (assuming UTF-8 encoding)
    const sizeInBytes = characterCount;

    // Calculate size in KB
    const sizeInKB = sizeInBytes / 1024;

    return {
        characterCount,
        sizeInBytes,
        sizeInKB,
    };
}

export function Base64Stats({ content }: Base64StatsProps) {
    const stats = useMemo(() => calculateBase64Stats(content), [content]);

    const statistics = useMemo(
        () => [
            {
                icon: Type,
                label: `${stats.characterCount.toLocaleString()} chars`,
                title: 'Character count',
            },
            {
                icon: HardDrive,
                label: `${stats.sizeInKB.toFixed(2)} KB`,
                title: 'File size',
            },
        ],
        [stats],
    );

    return (
        <div className="flex items-center gap-2 sm:gap-4">
            {statistics.map((stat, index) => (
                <div
                    key={index}
                    title={stat.title}
                    className="flex items-center gap-1.5 text-xs text-gray-600 dark:text-gray-400 shrink-0"
                >
                    <stat.icon className="h-3.5 w-3.5" />
                    <span>{stat.label}</span>
                </div>
            ))}
        </div>
    );
}
