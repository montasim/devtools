'use client';

import { useState } from 'react';
import { DiffPanelProps, DiffResult, ViewMode } from './types';
import { DiffPanelToolbar } from './diff-panel-toolbar';
import { ChevronRight } from 'lucide-react';

/**
 * DiffPanel - Main component for displaying code diffs
 *
 * Renders diff with configurable view modes (split, unified, inline).
 * Includes toolbar with statistics and action buttons.
 *
 * Features:
 * - Multiple diff view modes (Split, Unified, Inline)
 * - Tree panel for navigation
 * - Real-time statistics
 * - Responsive design with dark mode support
 *
 * @example
 * ```tsx
 * <DiffPanel
 *   diffResult={diffData}
 *   isLoading={false}
 * />
 * ```
 */
export function DiffPanel({ diffResult, isLoading }: DiffPanelProps) {
    const [viewMode, setViewMode] = useState<ViewMode>('unified');
    const [showTreePanel, setShowTreePanel] = useState(false);

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

    const scrollToHunk = (index: number) => {
        const element = document.getElementById(`hunk-${index}`);
        element?.scrollIntoView({ behavior: 'smooth' });
    };

    return (
        <div
            className="border border-gray-300 rounded-md overflow-hidden dark:border-gray-600"
            role="region"
            aria-label="Code diff"
        >
            {/* Header */}
            <DiffPanelToolbar
                viewMode={viewMode}
                additionCount={diffResult.additionCount}
                deletionCount={diffResult.deletionCount}
                modificationCount={diffResult.modificationCount}
                totalLines={diffResult.lineCount}
                onViewModeChange={setViewMode}
                onShare={() => {
                    console.log('Share clicked');
                }}
                onExport={(format) => {
                    console.log('Export:', format);
                }}
                onFilterChange={(filter) => {
                    console.log('Filter:', filter);
                }}
                onPanelToggle={(panel) => {
                    if (panel === 'tree-panel') {
                        setShowTreePanel(!showTreePanel);
                    }
                }}
            />

            {/* Main content area with tree panel */}
            <div className="flex">
                {/* Tree Panel Sidebar */}
                {showTreePanel && (
                    <div className="w-64 border-r border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-900 p-4">
                        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                            File Structure
                        </h3>
                        <div className="space-y-1">
                            {diffResult.hunks.map((hunk, index) => (
                                <div key={index} className="text-xs">
                                    <button
                                        className="flex items-center gap-1 hover:bg-gray-200 dark:hover:bg-gray-800 px-2 py-1 rounded w-full text-left"
                                        onClick={() => scrollToHunk(index)}
                                    >
                                        <ChevronRight className="h-3 w-3" />
                                        <span className="text-gray-600 dark:text-gray-400">
                                            Hunk {index + 1}
                                        </span>
                                        <span className="text-gray-400 dark:text-gray-500 text-[10px] ml-auto">
                                            {hunk.oldStart}-{hunk.oldStart + hunk.oldLines}
                                        </span>
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Diff content */}
                <div className="flex-1 overflow-auto max-h-96">
                    {viewMode === 'unified' && <UnifiedView diffResult={diffResult} />}
                    {viewMode === 'split' && <SplitView diffResult={diffResult} />}
                    {viewMode === 'inline' && <InlineView diffResult={diffResult} />}
                </div>
            </div>
        </div>
    );
}

// Unified view - standard diff format
function UnifiedView({ diffResult }: { diffResult: DiffResult }) {
    return (
        <pre className="text-sm font-mono">
            {diffResult.hunks.map((hunk, index) => (
                <div key={`hunk-${hunk.oldStart}-${hunk.newStart}`} id={`hunk-${index}`}>
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
                            <span className="w-12 text-right text-gray-400 select-none mr-4 text-xs dark:text-gray-500">
                                {line.oldLineNumber !== undefined ? line.oldLineNumber : ' '}
                            </span>
                            <span className="w-12 text-right text-gray-400 select-none mr-4 text-xs dark:text-gray-500">
                                {line.newLineNumber !== undefined ? line.newLineNumber : ' '}
                            </span>
                            <span className="w-4 mr-2 select-none">
                                {line.type === 'addition' ? (
                                    <span className="text-green-600 dark:text-green-400">+</span>
                                ) : line.type === 'deletion' ? (
                                    <span className="text-red-600 dark:text-red-400">-</span>
                                ) : (
                                    <span> </span>
                                )}
                            </span>
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
    );
}

// Split view - side by side comparison
function SplitView({ diffResult }: { diffResult: DiffResult }) {
    return (
        <div className="text-sm font-mono">
            {diffResult.hunks.map((hunk, index) => (
                <div key={`split-hunk-${index}`} id={`hunk-${index}`}>
                    {/* Hunk header */}
                    <div className="px-4 py-1 bg-gray-100 text-xs text-gray-600 dark:bg-gray-800 dark:text-gray-400 flex">
                        <span className="flex-1">
                            @@ -{hunk.oldStart},{hunk.oldLines} +{hunk.newStart},{hunk.newLines} @@
                        </span>
                    </div>

                    <div className="flex">
                        {/* Old file */}
                        <div className="flex-1 border-r border-gray-300 dark:border-gray-600">
                            {hunk.lines
                                .filter((line) => line.type !== 'addition')
                                .map((line, lineIndex) => (
                                    <div
                                        key={`old-${lineIndex}`}
                                        className={`flex px-4 py-0.5 ${
                                            line.type === 'deletion'
                                                ? 'bg-red-50 dark:bg-red-900/20'
                                                : ''
                                        }`}
                                    >
                                        <span className="w-12 text-right text-gray-400 select-none mr-4 text-xs dark:text-gray-500">
                                            {line.oldLineNumber || ' '}
                                        </span>
                                        <span className="w-4 mr-2 select-none">
                                            {line.type === 'deletion' ? (
                                                <span className="text-red-600 dark:text-red-400">-</span>
                                            ) : (
                                                <span> </span>
                                            )}
                                        </span>
                                        <span
                                            className={
                                                line.type === 'deletion'
                                                    ? 'text-red-700 dark:text-red-300'
                                                    : 'text-gray-700 dark:text-gray-300'
                                            }
                                        >
                                            {line.content}
                                        </span>
                                    </div>
                                ))}
                        </div>

                        {/* New file */}
                        <div className="flex-1">
                            {hunk.lines
                                .filter((line) => line.type !== 'deletion')
                                .map((line, lineIndex) => (
                                    <div
                                        key={`new-${lineIndex}`}
                                        className={`flex px-4 py-0.5 ${
                                            line.type === 'addition'
                                                ? 'bg-green-50 dark:bg-green-900/20'
                                                : ''
                                        }`}
                                    >
                                        <span className="w-12 text-right text-gray-400 select-none mr-4 text-xs dark:text-gray-500">
                                            {line.newLineNumber || ' '}
                                        </span>
                                        <span className="w-4 mr-2 select-none">
                                            {line.type === 'addition' ? (
                                                <span className="text-green-600 dark:text-green-400">+</span>
                                            ) : (
                                                <span> </span>
                                            )}
                                        </span>
                                        <span
                                            className={
                                                line.type === 'addition'
                                                    ? 'text-green-700 dark:text-green-300'
                                                    : 'text-gray-700 dark:text-gray-300'
                                            }
                                        >
                                            {line.content}
                                        </span>
                                    </div>
                                ))}
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}

// Inline view - compact single line display
function InlineView({ diffResult }: { diffResult: DiffResult }) {
    return (
        <div className="text-sm font-mono p-4">
            {diffResult.hunks.map((hunk, index) => (
                <div key={`inline-hunk-${index}`} id={`hunk-${index}`} className="mb-4">
                    {/* Hunk header */}
                    <div className="px-4 py-1 bg-gray-100 text-xs text-gray-600 dark:bg-gray-800 dark:text-gray-400 mb-2">
                        @@ -{hunk.oldStart},{hunk.oldLines} +{hunk.newStart},{hunk.newLines} @@
                    </div>

                    {/* Inline diff */}
                    {hunk.lines.map((line, lineIndex) => {
                        const prevLine = hunk.lines[lineIndex - 1];
                        const isModification =
                            line.type === 'addition' &&
                            prevLine?.type === 'deletion';

                        if (isModification) return null;

                        return (
                            <div key={`inline-${lineIndex}`} className="flex items-center py-0.5">
                                <span className="w-24 text-right text-gray-400 select-none mr-4 text-xs dark:text-gray-500 shrink-0">
                                    {line.oldLineNumber || line.newLineNumber || ' '}
                                </span>
                                <span className="w-4 mr-2 select-none shrink-0">
                                    {line.type === 'deletion' && hunk.lines[lineIndex + 1]?.type === 'addition' ? (
                                        <span className="text-orange-600 dark:text-orange-400">~</span>
                                    ) : line.type === 'addition' ? (
                                        <span className="text-green-600 dark:text-green-400">+</span>
                                    ) : line.type === 'deletion' ? (
                                        <span className="text-red-600 dark:text-red-400">-</span>
                                    ) : (
                                        <span> </span>
                                    )}
                                </span>

                                {/* Deletion (old) */}
                                {line.type === 'deletion' && (
                                    <span
                                        className="px-2 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 mr-2"
                                    >
                                        {line.content}
                                    </span>
                                )}

                                {/* Addition (new) */}
                                {line.type === 'addition' && (
                                    <span
                                        className="px-2 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300"
                                    >
                                        {line.content}
                                    </span>
                                )}

                                {/* Unchanged */}
                                {line.type === 'unchanged' && (
                                    <span className="px-2 text-gray-700 dark:text-gray-300">
                                        {line.content}
                                    </span>
                                )}
                            </div>
                        );
                    })}
                </div>
            ))}
        </div>
    );
}
