'use client';

import { useState, useCallback } from 'react';
import { diffLines } from 'diff';
import { UseJsonDiffOptions, UseJsonDiffReturn, DiffResult, DiffHunk, DiffLine } from './types';

export function useJsonDiff(options: UseJsonDiffOptions): UseJsonDiffReturn {
    const [diff, setDiff] = useState<DiffResult | null>(null);
    const [error, setError] = useState<Error | null>(null);
    const [isComputing, setIsComputing] = useState(false);

    const sortObjectKeys = (obj: unknown): unknown => {
        if (obj === null || typeof obj !== 'object') {
            return obj;
        }

        if (Array.isArray(obj)) {
            return obj.map(sortObjectKeys);
        }

        const sorted = Object.keys(obj as object)
            .sort()
            .reduce((acc: Record<string, unknown>, key) => {
                acc[key] = sortObjectKeys((obj as Record<string, unknown>)[key]);
                return acc;
            }, {});

        return sorted;
    };

    const computeDiff = useCallback(async () => {
        setIsComputing(true);
        setError(null);

        try {
            // Parse JSON
            const leftParsed = JSON.parse(options.leftContent);
            const rightParsed = JSON.parse(options.rightContent);

            // Apply toggles
            let leftStr = JSON.stringify(leftParsed);
            let rightStr = JSON.stringify(rightParsed);

            // Pretty Print
            if (options.prettyPrint) {
                leftStr = JSON.stringify(JSON.parse(leftStr), null, 2);
                rightStr = JSON.stringify(JSON.parse(rightStr), null, 2);
            }

            // Ignore Whitespace
            if (options.ignoreWhitespace) {
                leftStr = leftStr
                    .replace(/\s+/g, ' ')
                    .replace(/\s*\n\s*/g, '')
                    .trim();
                rightStr = rightStr
                    .replace(/\s+/g, ' ')
                    .replace(/\s*\n\s*/g, '')
                    .trim();
            }

            // Ignore Key Order
            if (options.ignoreKeyOrder) {
                leftStr = JSON.stringify(sortObjectKeys(JSON.parse(leftStr)), null, 2);
                rightStr = JSON.stringify(sortObjectKeys(JSON.parse(rightStr)), null, 2);
            }

            // Semantic Type Diff (simplified - will be expanded in Task 9)
            if (options.semanticTypeDiff) {
                // For now, just compare as-is
                // Full implementation will handle type coercion
            }

            // Compute diff using diff package
            const differences = diffLines(leftStr, rightStr);

            // Convert to our format
            const hunks: DiffHunk[] = [];
            let currentHunk: Partial<DiffHunk> | null = null;
            let oldLineNumber = 1;
            let newLineNumber = 1;
            let additionCount = 0;
            let deletionCount = 0;

            differences.forEach((part) => {
                const lines = part.value
                    .split('\n')
                    .filter((l) => l.length > 0 || part.added || part.removed);

                lines.forEach((line) => {
                    if (!currentHunk) {
                        currentHunk = {
                            oldStart: oldLineNumber,
                            newStart: newLineNumber,
                            oldLines: 0,
                            newLines: 0,
                            lines: [],
                        };
                    }

                    if (part.added) {
                        currentHunk.lines?.push({
                            type: 'addition',
                            content: line,
                            newLineNumber,
                        });
                        currentHunk.newLines = (currentHunk.newLines || 0) + 1;
                        newLineNumber++;
                        additionCount++;
                    } else if (part.removed) {
                        currentHunk.lines?.push({
                            type: 'deletion',
                            content: line,
                            oldLineNumber,
                        });
                        currentHunk.oldLines = (currentHunk.oldLines || 0) + 1;
                        oldLineNumber++;
                        deletionCount++;
                    } else {
                        currentHunk.lines?.push({
                            type: 'unchanged',
                            content: line,
                            oldLineNumber,
                            newLineNumber,
                        });
                        currentHunk.oldLines = (currentHunk.oldLines || 0) + 1;
                        currentHunk.newLines = (currentHunk.newLines || 0) + 1;
                        oldLineNumber++;
                        newLineNumber++;
                    }
                });
            });

            if (currentHunk) {
                hunks.push(currentHunk as DiffHunk);
            }

            const result: DiffResult = {
                hunks,
                lineCount: oldLineNumber + newLineNumber - 2,
                additionCount,
                deletionCount,
            };

            setDiff(result);
        } catch (err) {
            setError(err as Error);
        } finally {
            setIsComputing(false);
        }
    }, [options]);

    return {
        diff,
        error,
        isComputing,
        computeDiff,
    };
}
