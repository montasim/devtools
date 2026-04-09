'use client';

import { useMemo } from 'react';
import { HardDrive, Type, FileText, AlignLeft, Layers, GitBranch } from 'lucide-react';
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
                    return obj.reduce((max, item) => Math.max(max, calculateDepth(item, currentDepth + 1)), currentDepth);
                }
                return Object.values(obj as object).reduce(
                    (max, value) => Math.max(max, calculateDepth(value, currentDepth + 1)),
                    currentDepth
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

    return (
        <div className="flex items-center justify-between px-3 py-1.5 border-t border-gray-200 dark:border-gray-700">
            {/* Left side: Statistics */}
            <div className="flex items-center gap-4 text-xs text-gray-600 dark:text-gray-400">
                <span title="File size" className="flex items-center gap-1.5">
                    <HardDrive className="h-3.5 w-3.5" />
                    {stats.fileSize}
                </span>
                <span title="Characters" className="flex items-center gap-1.5">
                    <Type className="h-3.5 w-3.5" />
                    {stats.characterCount}
                </span>
                <span title="Words" className="flex items-center gap-1.5">
                    <FileText className="h-3.5 w-3.5" />
                    {stats.wordCount}
                </span>
                <span title="Lines" className="flex items-center gap-1.5">
                    <AlignLeft className="h-3.5 w-3.5" />
                    {stats.lineCount}
                </span>
                {stats.depth > 0 && (
                    <span title="Max nesting depth" className="flex items-center gap-1.5">
                        <Layers className="h-3.5 w-3.5" />
                        {stats.depth}
                    </span>
                )}
                {stats.paths.length > 0 && (
                    <span title={`Found ${stats.paths.length} paths`} className="flex items-center gap-1.5">
                        <GitBranch className="h-3.5 w-3.5" />
                        {stats.paths.length}
                    </span>
                )}
            </div>

            {/* Right side: Validation status */}
            <div className="flex items-center gap-2">
                <span
                    className={`text-xs font-medium ${
                        error
                            ? 'text-red-600 dark:text-red-400'
                            : content.trim()
                              ? 'text-green-600 dark:text-green-400'
                              : 'text-gray-400 dark:text-gray-500'
                    }`}
                >
                    {error ? 'Invalid JSON' : content.trim() ? 'Valid JSON' : 'Empty'}
                </span>
            </div>
        </div>
    );
}
