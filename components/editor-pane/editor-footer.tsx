'use client';

import { useMemo } from 'react';
import { HardDrive, Type, FileText, AlignLeft, Layers, GitBranch, Check, X } from 'lucide-react';
import type { ParseError } from './types';

export interface EditorStats {
    fileSize: string;
    characterCount: number;
    wordCount: number;
    lineCount: number;
    depth: number;
    paths: string[];
}

export interface EditorFooterProps {
    content: string;
    error: ParseError | null;
}

function calculateStats(content: string): EditorStats {
    // Calculate file size
    const fileSize = new Blob([content]).size;
    const fileSizeFormatted =
        fileSize < 1024
            ? `${fileSize} B`
            : fileSize < 1024 * 1024
              ? `${(fileSize / 1024).toFixed(1)} KB`
              : `${(fileSize / (1024 * 1024)).toFixed(1)} MB`;

    // Calculate character count
    const characterCount = content.length;

    // Calculate word count
    const wordCount = content.trim() ? content.trim().split(/\s+/).length : 0;

    // Calculate line count
    const lineCount = content.split('\n').length;

    // Calculate depth (max nesting level)
    let depth = 0;
    try {
        if (content.trim()) {
            const parsed = JSON.parse(content);
            const calculateDepth = (obj: unknown, currentDepth = 0): number => {
                if (obj === null || typeof obj !== 'object') {
                    return currentDepth;
                }
                if (Array.isArray(obj)) {
                    return obj.reduce(
                        (max, item) => Math.max(max, calculateDepth(item, currentDepth + 1)),
                        currentDepth,
                    );
                }
                return Object.values(obj as object).reduce(
                    (max, value) => Math.max(max, calculateDepth(value, currentDepth + 1)),
                    currentDepth,
                );
            };
            depth = calculateDepth(parsed);
        }
    } catch {
        depth = 0;
    }

    // Extract paths (all property paths)
    const paths: string[] = [];
    try {
        if (content.trim()) {
            const parsed = JSON.parse(content);
            const extractPaths = (obj: unknown, currentPath = ''): void => {
                if (obj === null || typeof obj !== 'object') {
                    if (currentPath) {
                        paths.push(currentPath);
                    }
                    return;
                }
                if (Array.isArray(obj)) {
                    obj.forEach((_, index) => {
                        extractPaths(index, `${currentPath}[${index}]`);
                    });
                    return;
                }
                Object.entries(obj as object).forEach(([key, value]) => {
                    const newPath = currentPath ? `${currentPath}.${key}` : key;
                    extractPaths(value, newPath);
                });
            };
            extractPaths(parsed);
        }
    } catch {
        // Invalid JSON, no paths
    }

    return {
        fileSize: fileSizeFormatted,
        characterCount,
        wordCount,
        lineCount,
        depth,
        paths,
    };
}

export function EditorFooter({ content, error }: EditorFooterProps) {
    const stats = useMemo(() => calculateStats(content), [content]);

    const statistics = useMemo(
        () => [
            { icon: HardDrive, label: stats.fileSize, title: 'File size', emphasized: true },
            { icon: Type, label: `${stats.characterCount} chars`, title: 'Characters' },
            { icon: FileText, label: `${stats.wordCount} words`, title: 'Words' },
            { icon: AlignLeft, label: `${stats.lineCount} lines`, title: 'Lines' },
            ...(stats.depth > 0
                ? [
                      {
                          icon: Layers,
                          label: `depth ${stats.depth}`,
                          title: 'Max nesting depth',
                          emphasized: true,
                      },
                  ]
                : []),
            ...(stats.paths.length > 0
                ? [
                      {
                          icon: GitBranch,
                          label: `${stats.paths.length} paths`,
                          title: `${stats.paths.length} paths`,
                      },
                  ]
                : []),
        ],
        [stats],
    );

    return (
        <div className="border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between py-2">
                {/* Left side: Statistics */}
                <div className="flex items-center gap-4 text-xs text-gray-600 dark:text-gray-400 overflow-x-auto scrollbar-hide flex-1">
                    {statistics.map((stat, index) => (
                        <div
                            key={index}
                            title={stat.title}
                            className="flex items-center gap-1.5 shrink-0"
                        >
                            <stat.icon className="h-3.5 w-3.5 text-gray-500" />
                            <span className={stat.emphasized ? 'font-medium' : ''}>
                                {stat.label}
                            </span>
                        </div>
                    ))}
                </div>

                {/* Right side: Validation status */}
                <div className="flex items-center gap-2 shrink-0">
                    <div
                        className={`flex items-center gap-1.5 py-1 rounded-md text-xs font-medium ${
                            error
                                ? 'bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400'
                                : content.trim()
                                  ? 'bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400'
                                  : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
                        }`}
                    >
                        {error ? (
                            <X className="h-3.5 w-3.5" />
                        ) : content.trim() ? (
                            <Check className="h-3.5 w-3.5" />
                        ) : (
                            <span className="h-3.5 w-3.5" />
                        )}
                        <span>{error ? 'Invalid' : content.trim() ? 'Valid' : 'Empty'}</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
