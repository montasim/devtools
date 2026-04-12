'use client';

import { useMemo } from 'react';
import { Type, Layers, GitCompare } from 'lucide-react';

export interface JsonStats {
    characterCount: number;
    depth: number;
    pathCount: number;
}

export interface JsonStatsProps {
    content: string;
}

function calculateJsonStats(content: string): JsonStats {
    if (!content || content.trim() === '') {
        return {
            characterCount: 0,
            depth: 0,
            pathCount: 0,
        };
    }

    // Calculate character count
    const characterCount = content.length;

    // Calculate JSON depth
    const calculateDepth = (jsonString: string): number => {
        try {
            const obj = JSON.parse(jsonString) as unknown;
            const traverse = (item: unknown, currentDepth: number = 0): number => {
                if (item === null || typeof item !== 'object') {
                    return currentDepth;
                }
                const values = Object.values(item as object);
                if (values.length === 0) {
                    return currentDepth;
                }
                return Math.max(...values.map((v) => traverse(v, currentDepth + 1)));
            };
            return traverse(obj);
        } catch {
            return 0;
        }
    };

    // Count all paths in JSON structure
    const countPaths = (jsonString: string): number => {
        try {
            const obj = JSON.parse(jsonString) as unknown;
            let count = 0;

            const traverse = (item: unknown) => {
                if (item === null || typeof item !== 'object') {
                    return;
                }
                count += Object.keys(item as object).length;
                Object.values(item as object).forEach((value) => {
                    if (typeof value === 'object' && value !== null) {
                        traverse(value);
                    }
                });
            };

            traverse(obj);
            return count;
        } catch {
            return 0;
        }
    };

    return {
        characterCount,
        depth: calculateDepth(content),
        pathCount: countPaths(content),
    };
}

export function JsonStats({ content }: JsonStatsProps) {
    const stats = useMemo(() => calculateJsonStats(content), [content]);

    const statistics = useMemo(
        () => [
            {
                icon: Type,
                label: `${stats.characterCount} chars`,
                title: 'Character count',
            },
            {
                icon: Layers,
                label: `${stats.depth} depth`,
                title: 'Maximum nesting depth',
            },
            {
                icon: GitCompare,
                label: `${stats.pathCount} paths`,
                title: 'Total number of paths',
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
