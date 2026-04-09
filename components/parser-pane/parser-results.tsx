'use client';

import type { ParsedData } from './types';

interface ParserResultsProps {
    parsedData: ParsedData;
    showTypes: boolean;
    showPaths: boolean;
    showStatistics: boolean;
}

export function ParserResults({
    parsedData,
    showTypes,
    showPaths,
    showStatistics,
}: ParserResultsProps) {
    return (
        <div className="flex flex-col gap-4">
            {/* Statistics Section */}
            {showStatistics && (
                <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                    <h3 className="text-sm font-semibold mb-3 text-gray-700 dark:text-gray-300">
                        Statistics
                    </h3>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                        <div>
                            <span className="text-gray-600 dark:text-gray-400">Total Keys:</span>
                            <span className="ml-2 font-mono font-medium">
                                {parsedData.statistics.totalKeys}
                            </span>
                        </div>
                        <div>
                            <span className="text-gray-600 dark:text-gray-400">Total Values:</span>
                            <span className="ml-2 font-mono font-medium">
                                {parsedData.statistics.totalValues}
                            </span>
                        </div>
                        <div>
                            <span className="text-gray-600 dark:text-gray-400">Max Depth:</span>
                            <span className="ml-2 font-mono font-medium">
                                {parsedData.statistics.maxDepth}
                            </span>
                        </div>
                    </div>
                </div>
            )}

            {/* Types Distribution */}
            {showTypes &&
                parsedData.isValid &&
                Object.keys(parsedData.statistics.types).length > 0 && (
                    <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                        <h3 className="text-sm font-semibold mb-3 text-gray-700 dark:text-gray-300">
                            Type Distribution
                        </h3>
                        <div className="space-y-2 text-sm">
                            {Object.entries(parsedData.statistics.types)
                                .sort(([, a], [, b]) => b - a)
                                .map(([type, count]) => (
                                    <div key={type} className="flex justify-between">
                                        <span className="text-gray-600 dark:text-gray-400 capitalize">
                                            {type}:
                                        </span>
                                        <span className="font-mono font-medium">{count}</span>
                                    </div>
                                ))}
                        </div>
                    </div>
                )}

            {/* Paths Section */}
            {showPaths && parsedData.isValid && parsedData.paths.length > 0 && (
                <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                    <h3 className="text-sm font-semibold mb-3 text-gray-700 dark:text-gray-300">
                        JSON Paths ({parsedData.paths.length})
                    </h3>
                    <div className="max-h-64 overflow-auto text-sm">
                        <div className="font-mono space-y-1">
                            {parsedData.paths.map((path, index) => (
                                <div
                                    key={index}
                                    className="text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 px-2 py-1 rounded"
                                >
                                    {path}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
