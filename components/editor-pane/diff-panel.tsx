'use client';

import { DiffPanelProps } from './types';

export function DiffPanel({ diffResult, isLoading }: DiffPanelProps) {
    if (isLoading) {
        return (
            <div
                className="border border-gray-300 rounded-md p-8 text-center text-gray-500 dark:border-gray-600 dark:text-gray-400"
                role="status"
                aria-live="polite"
            >
                Computing diff...
            </div>
        );
    }

    if (!diffResult || diffResult.hunks.length === 0) {
        return (
            <div
                className="border border-gray-300 rounded-md p-8 text-center text-gray-500 dark:border-gray-600 dark:text-gray-400"
                role="status"
                aria-live="polite"
            >
                No differences found
            </div>
        );
    }

    return (
        <div
            className="border border-gray-300 rounded-md overflow-hidden dark:border-gray-600"
            role="region"
            aria-label="Code diff"
        >
            {/* Header */}
            <div className="px-4 py-2 bg-gray-100 border-b border-gray-300 flex items-center justify-between dark:bg-gray-800 dark:border-gray-600">
                <span className="text-sm font-medium text-gray-900 dark:text-gray-100">Diff</span>
                <div className="text-xs text-gray-600 dark:text-gray-400">
                    {diffResult.additionCount} additions, {diffResult.deletionCount} deletions
                </div>
            </div>

            {/* Diff content */}
            <div className="overflow-auto max-h-96">
                <pre className="text-sm font-mono">
                    {diffResult.hunks.map((hunk) => (
                        <div key={`hunk-${hunk.oldStart}-${hunk.newStart}`}>
                            {/* Hunk header */}
                            <div className="px-4 py-1 bg-gray-100 text-xs text-gray-600 dark:bg-gray-800 dark:text-gray-400">
                                @@ -{hunk.oldStart},{hunk.oldLines} +{hunk.newStart},{hunk.newLines}{' '}
                                @@
                            </div>

                            {/* Hunk lines */}
                            {hunk.lines.map((line, lineIndex) => (
                                <div
                                    key={`line-${line.oldLineNumber || 'new'}-${line.newLineNumber || 'old'}-${lineIndex}`}
                                    className={`flex px-4 py-0.5 ${
                                        line.type === 'addition'
                                            ? 'bg-green-50 dark:bg-green-900/20'
                                            : line.type === 'deletion'
                                              ? 'bg-red-50 dark:bg-red-900/20'
                                              : ''
                                    }`}
                                >
                                    {/* Line numbers */}
                                    <span
                                        className="w-12 text-right text-gray-400 select-none mr-4 text-xs dark:text-gray-500"
                                        aria-hidden="true"
                                    >
                                        {line.oldLineNumber !== undefined
                                            ? line.oldLineNumber
                                            : ' '}
                                    </span>
                                    <span
                                        className="w-12 text-right text-gray-400 select-none mr-4 text-xs dark:text-gray-500"
                                        aria-hidden="true"
                                    >
                                        {line.newLineNumber !== undefined
                                            ? line.newLineNumber
                                            : ' '}
                                    </span>

                                    {/* Line marker */}
                                    <span className="w-4 mr-2 select-none">
                                        {line.type === 'addition' ? (
                                            <span className="text-green-600 dark:text-green-400">
                                                +
                                            </span>
                                        ) : line.type === 'deletion' ? (
                                            <span className="text-red-600 dark:text-red-400">
                                                -
                                            </span>
                                        ) : (
                                            <span> </span>
                                        )}
                                    </span>

                                    {/* Line content */}
                                    <span
                                        className={
                                            line.type === 'addition'
                                                ? 'text-green-700 dark:text-green-300'
                                                : line.type === 'deletion'
                                                  ? 'text-red-700 dark:text-red-300'
                                                  : 'text-gray-700 dark:text-gray-300'
                                        }
                                    >
                                        {line.content}
                                    </span>
                                </div>
                            ))}
                        </div>
                    ))}
                </pre>
            </div>
        </div>
    );
}
