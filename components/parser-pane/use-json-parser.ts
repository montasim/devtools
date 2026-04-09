import { useMemo } from 'react';
import type { ParserOptions, ParsedData } from './types';

export function useJsonParser(json: string, options: ParserOptions): ParsedData {
    return useMemo(() => {
        if (!json || json.trim().length === 0) {
            return {
                isValid: false,
                error: null,
                statistics: {
                    totalKeys: 0,
                    totalValues: 0,
                    maxDepth: 0,
                    types: {},
                },
                paths: [],
                structure: null,
            };
        }

        try {
            const parsed = JSON.parse(json);

            // Calculate statistics
            const stats = {
                totalKeys: 0,
                totalValues: 0,
                maxDepth: 0,
                types: {} as Record<string, number>,
            };

            const paths: string[] = [];

            // Recursive function to analyze structure
            const analyze = (obj: any, path: string = '$', depth: number = 0) => {
                stats.maxDepth = Math.max(stats.maxDepth, depth);

                if (obj === null) {
                    stats.types.null = (stats.types.null || 0) + 1;
                    stats.totalValues++;
                    return;
                }

                if (typeof obj === 'boolean') {
                    stats.types.boolean = (stats.types.boolean || 0) + 1;
                    stats.totalValues++;
                    return;
                }

                if (typeof obj === 'number') {
                    stats.types.number = (stats.types.number || 0) + 1;
                    stats.totalValues++;
                    return;
                }

                if (typeof obj === 'string') {
                    stats.types.string = (stats.types.string || 0) + 1;
                    stats.totalValues++;
                    return;
                }

                if (Array.isArray(obj)) {
                    stats.types.array = (stats.types.array || 0) + 1;
                    stats.totalKeys++;

                    if (options.showPaths) {
                        paths.push(path);
                    }

                    obj.forEach((item, index) => {
                        analyze(item, `${path}[${index}]`, depth + 1);
                    });
                    return;
                }

                if (typeof obj === 'object') {
                    stats.types.object = (stats.types.object || 0) + 1;
                    stats.totalKeys++;

                    if (options.showPaths) {
                        paths.push(path);
                    }

                    Object.keys(obj).forEach(key => {
                        stats.totalKeys++;
                        analyze(obj[key], `${path}.${key}`, depth + 1);
                    });
                    return;
                }
            };

            analyze(parsed);

            return {
                isValid: true,
                error: null,
                statistics: stats,
                paths: options.showPaths ? paths.sort() : [],
                structure: parsed,
            };
        } catch (error) {
            return {
                isValid: false,
                error: (error as Error).message,
                statistics: {
                    totalKeys: 0,
                    totalValues: 0,
                    maxDepth: 0,
                    types: {},
                },
                paths: [],
                structure: null,
            };
        }
    }, [json, options.showTypes, options.showPaths, options.showStatistics]);
}
