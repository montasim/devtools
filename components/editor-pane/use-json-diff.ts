'use client';

/**
 * useJsonDiff - Custom hook for computing JSON diffs with various options
 *
 * Supported Options:
 * - ignoreKeyOrder: Sorts object keys alphabetically before comparing
 *                   Example: {"b": 1, "a": 2} vs {"a": 2, "b": 1} will be identical
 *
 * - prettyPrint: Formats JSON with 2-space indentation for better readability
 *                Example: {"a":1,"b":2} becomes {\n  "a": 1,\n  "b": 2\n}
 *
 * - ignoreWhitespace: Removes all unnecessary whitespace from JSON
 *                     Example: {"a": 1,  "b": 2} vs {"a":1,"b":2} will be identical
 *
 * - semanticTypeDiff: Normalizes types for semantic comparison
 *                     Example: "123" (string) vs 123 (number) will be considered equal
 *                              "true" (string) vs true (boolean) will be considered equal
 */

import { useState, useCallback } from 'react';
import { diffLines } from 'diff';
import { UseJsonDiffOptions, UseJsonDiffReturn, DiffResult, DiffHunk, DiffLine } from './types';

function calculateModificationCount(hunks: DiffHunk[]): number {
    let modifications = 0;
    hunks.forEach((hunk) => {
        for (let i = 0; i < hunk.lines.length - 1; i++) {
            const current = hunk.lines[i];
            const next = hunk.lines[i + 1];
            // Count deletion followed by addition as a modification
            if (
                current.type === 'deletion' &&
                next.type === 'addition' &&
                current.oldLineNumber === next.newLineNumber
            ) {
                modifications++;
            }
        }
    });
    return modifications;
}

/**
 * Normalize value for semantic type comparison
 * Handles type coercion between strings, numbers, and booleans
 */
function normalizeValue(value: unknown): unknown {
    // If it's a string that looks like a number, convert to number
    if (typeof value === 'string') {
        // Try parsing as number
        if (/^-?\d+$/.test(value)) {
            return parseInt(value, 10);
        }
        if (/^-?\d+\.\d+$/.test(value)) {
            return parseFloat(value);
        }
        // Try parsing as boolean
        if (value.toLowerCase() === 'true') return true;
        if (value.toLowerCase() === 'false') return false;
        // Try parsing as null
        if (value.toLowerCase() === 'null') return null;
    }
    // If it's a number or boolean, try converting to string for comparison
    if (typeof value === 'number' || typeof value === 'boolean') {
        return String(value);
    }
    return value;
}

/**
 * Apply semantic type diff to normalize JSON values
 * This allows "123" and 123 to be considered equal
 */
function applySemanticTypeDiff(obj: unknown): unknown {
    if (obj === null || typeof obj !== 'object') {
        return normalizeValue(obj);
    }

    if (Array.isArray(obj)) {
        return obj.map(applySemanticTypeDiff);
    }

    const result: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(obj)) {
        result[key] = applySemanticTypeDiff(value);
    }
    return result;
}

/**
 * Sort object keys recursively for consistent comparison
 */
function sortObjectKeys(obj: unknown): unknown {
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
}

/**
 * Minify JSON by removing unnecessary whitespace
 */
function minifyJson(str: string): string {
    try {
        const parsed = JSON.parse(str);
        return JSON.stringify(parsed);
    } catch {
        return str;
    }
}

export function useJsonDiff(options: UseJsonDiffOptions): UseJsonDiffReturn {
    const [diff, setDiff] = useState<DiffResult | null>(null);
    const [error, setError] = useState<Error | null>(null);
    const [isComputing, setIsComputing] = useState(false);

    const computeDiff = useCallback(async () => {
        setIsComputing(true);
        setError(null);

        try {
            // Parse JSON
            let leftParsed = JSON.parse(options.leftContent);
            let rightParsed = JSON.parse(options.rightContent);

            // Apply Semantic Type Diff first (before other transformations)
            if (options.semanticTypeDiff) {
                leftParsed = applySemanticTypeDiff(leftParsed);
                rightParsed = applySemanticTypeDiff(rightParsed);
            }

            // Apply Ignore Key Order (sort object keys)
            if (options.ignoreKeyOrder) {
                leftParsed = sortObjectKeys(leftParsed);
                rightParsed = sortObjectKeys(rightParsed);
            }

            // Convert to strings
            let leftStr = JSON.stringify(leftParsed);
            let rightStr = JSON.stringify(rightParsed);

            // Apply Ignore Whitespace (minify first)
            if (options.ignoreWhitespace) {
                leftStr = minifyJson(leftStr);
                rightStr = minifyJson(rightStr);
            }

            // Apply Pretty Print (format with indentation)
            if (options.prettyPrint) {
                leftStr = JSON.stringify(JSON.parse(leftStr), null, 2);
                rightStr = JSON.stringify(JSON.parse(rightStr), null, 2);
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

            const modificationCount = calculateModificationCount(hunks);

            const result: DiffResult = {
                hunks,
                lineCount: oldLineNumber + newLineNumber - 2,
                additionCount,
                deletionCount,
                modificationCount,
            };

            setDiff(result);
        } catch (err) {
            setError(err as Error);
        } finally {
            setIsComputing(false);
        }
    }, [
        options.leftContent,
        options.rightContent,
        options.ignoreKeyOrder,
        options.prettyPrint,
        options.ignoreWhitespace,
        options.semanticTypeDiff,
    ]);

    return {
        diff,
        error,
        isComputing,
        computeDiff,
    };
}
