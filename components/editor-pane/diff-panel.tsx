'use client';

import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { DiffPanelProps, DiffResult, ViewMode, DiffLine } from './types';
import { DiffPanelToolbar } from './diff-panel-toolbar';
import { ShareDialog } from './share-dialog';
import { ChevronRight, ChevronDown, X, CheckCircle } from 'lucide-react';
import { EmptyState } from '@/components/ui/empty-state';

/**
 * DiffPanel - Main component for displaying code diffs
 *
 * Renders diff with configurable view modes (split, unified, inline, tree).
 * Includes toolbar with statistics and action buttons.
 *
 * Features:
 * - Multiple diff view modes (Split, Unified, Inline, Tree)
 * - Filter by change type
 * - Export functionality (copy, download, HTML report)
 * - Side panels (tree, statistics, validation, bookmarks)
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
export function DiffPanel({
    diffResult,
    isLoading,
    leftContent = '',
    rightContent = '',
}: DiffPanelProps) {
    const [viewMode, setViewMode] = useState<ViewMode>('unified');
    const [showTreePanel, setShowTreePanel] = useState(false);
    const [filter, setFilter] = useState<'all' | 'additions' | 'deletions' | 'modifications'>(
        'all',
    );
    const [showStatistics, setShowStatistics] = useState(false);
    const [showValidation, setShowValidation] = useState(false);
    const [showBookmarks, setShowBookmarks] = useState(false);
    const [showShareDialog, setShowShareDialog] = useState(false);
    const [bookmarks, setBookmarks] = useState<number[]>([]);

    // Helper functions that need to be available before useEffect
    const copyToClipboard = useCallback((text: string) => {
        navigator.clipboard.writeText(text).then(() => {
            toast.success('Copied to clipboard!');
        });
    }, []);

    const generateJSONPatch = useCallback((diffResult: DiffResult) => {
        return diffResult.hunks.map((hunk) => ({
            op: 'replace',
            path: '/path',
            value: hunk.lines
                .filter((l) => l.type === 'addition' || l.type === 'unchanged')
                .map((l) => l.content)
                .join(''),
        }));
    }, []);

    const generateMergePatch = useCallback((diffResult: DiffResult) => {
        return diffResult.hunks.map((hunk) => ({
            conflict: 'modify',
            file: '/path',
            changes: hunk.lines.map((l) => l.content),
        }));
    }, []);

    const downloadPatch = useCallback((diffResult: DiffResult) => {
        const patch = diffResult.hunks
            .map((hunk) => {
                const header = `@@ -${hunk.oldStart},${hunk.oldLines} +${hunk.newStart},${hunk.newLines} @@`;
                const lines = hunk.lines
                    .map((line) => {
                        const prefix =
                            line.type === 'addition' ? '+' : line.type === 'deletion' ? '-' : ' ';
                        return `${prefix}${line.content}`;
                    })
                    .join('\n');
                return `${header}\n${lines}`;
            })
            .join('\n');

        const blob = new Blob([patch], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'changes.patch';
        a.click();
        URL.revokeObjectURL(url);
    }, []);

    const generateHTMLReport = useCallback((diffResult: DiffResult) => {
        const html = `<!DOCTYPE html>
<html>
<head>
    <title>Diff Report</title>
    <style>
        body { font-family: monospace; padding: 20px; }
        .addition { background: #d4edda; }
        .deletion { background: #f8d7da; }
        .hunk { margin-bottom: 20px; border: 1px solid #ddd; padding: 10px; }
    </style>
</head>
<body>
    <h1>Diff Report</h1>
    <p><strong>Changes:</strong> ${diffResult.additionCount} additions, ${diffResult.deletionCount} deletions, ${diffResult.modificationCount} modifications</p>
    ${diffResult.hunks
        .map(
            (hunk) => `
        <div class="hunk">
            <h2>@@ -${hunk.oldStart},${hunk.oldLines} +${hunk.newStart},${hunk.newLines} @@</h2>
            ${hunk.lines
                .map((line) => {
                    const className =
                        line.type === 'addition'
                            ? 'addition'
                            : line.type === 'deletion'
                              ? 'deletion'
                              : '';
                    return `<div class="${className}">${line.type === 'addition' ? '+' : line.type === 'deletion' ? '-' : ' '} ${line.content}</div>`;
                })
                .join('')}
        </div>
    `,
        )
        .join('')}
</body>
</html>`;
        const blob = new Blob([html], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        window.open(url, '_blank');
    }, []);

    const getJSONPaths = useCallback((diffResult: DiffResult) => {
        const paths: string[] = [];
        diffResult.hunks.forEach((hunk) => {
            hunk.lines.forEach((line) => {
                if (line.content.includes('/')) {
                    const match = line.content.match(/"([^"]+)"/);
                    if (match) paths.push(match[1]);
                }
            });
        });
        return [...new Set(paths)];
    }, []);

    const handleExport = useCallback(
        (format: string, diffResult: DiffResult) => {
            switch (format) {
                case 'json-patch':
                    copyToClipboard(JSON.stringify(generateJSONPatch(diffResult), null, 2));
                    break;
                case 'merge-patch':
                    copyToClipboard(JSON.stringify(generateMergePatch(diffResult), null, 2));
                    break;
                case 'download-patch':
                    downloadPatch(diffResult);
                    break;
                case 'html-report':
                    generateHTMLReport(diffResult);
                    break;
                case 'json-paths':
                    copyToClipboard(JSON.stringify(getJSONPaths(diffResult), null, 2));
                    break;
            }
        },
        [
            copyToClipboard,
            generateJSONPatch,
            generateMergePatch,
            downloadPatch,
            generateHTMLReport,
            getJSONPaths,
        ],
    );

    // Keyboard shortcuts handler
    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
            const cmdOrCtrl = isMac ? event.metaKey : event.ctrlKey;

            // Filter shortcuts
            if (cmdOrCtrl && !event.shiftKey && !event.altKey) {
                switch (event.key) {
                    case '1':
                        event.preventDefault();
                        setFilter('all');
                        break;
                    case '2':
                        event.preventDefault();
                        setFilter('additions');
                        break;
                    case '3':
                        event.preventDefault();
                        setFilter('deletions');
                        break;
                    case '4':
                        event.preventDefault();
                        setFilter('modifications');
                        break;
                }
            }

            // Export shortcuts (Cmd/Ctrl + Shift)
            if (cmdOrCtrl && event.shiftKey && !event.altKey && diffResult) {
                switch (event.key) {
                    case 'P':
                        event.preventDefault();
                        handleExport('json-patch', diffResult);
                        break;
                    case 'G':
                        event.preventDefault();
                        handleExport('merge-patch', diffResult);
                        break;
                    case 'D':
                        event.preventDefault();
                        handleExport('download-patch', diffResult);
                        break;
                    case 'H':
                        event.preventDefault();
                        handleExport('html-report', diffResult);
                        break;
                    case 'J':
                        event.preventDefault();
                        handleExport('json-paths', diffResult);
                        break;
                }
            }

            // Panel shortcuts (Cmd/Ctrl)
            if (cmdOrCtrl && !event.shiftKey && !event.altKey) {
                switch (event.key) {
                    case 'b':
                    case 'B':
                        event.preventDefault();
                        setShowBookmarks(!showBookmarks);
                        break;
                    case 't':
                    case 'T':
                        event.preventDefault();
                        setShowTreePanel(!showTreePanel);
                        break;
                    case 's':
                    case 'S':
                        event.preventDefault();
                        setShowStatistics(!showStatistics);
                        break;
                    case 'v':
                    case 'V':
                        event.preventDefault();
                        setShowValidation(!showValidation);
                        break;
                }
            }
        };

        // Add event listener when component mounts
        window.addEventListener('keydown', handleKeyDown);

        // Cleanup
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [
        filter,
        diffResult,
        showBookmarks,
        showTreePanel,
        showStatistics,
        showValidation,
        handleExport,
    ]);

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
        return <EmptyState icon={CheckCircle}>No differences found</EmptyState>;
    }

    const scrollToHunk = (index: number) => {
        const element = document.getElementById(`hunk-${index}`);
        element?.scrollIntoView({ behavior: 'smooth' });
    };

    const toggleBookmark = (hunkIndex: number) => {
        if (bookmarks.includes(hunkIndex)) {
            setBookmarks(bookmarks.filter((b) => b !== hunkIndex));
        } else {
            setBookmarks([...bookmarks, hunkIndex]);
        }
    };

    // Filter diff result based on selected filter
    const getFilteredDiff = () => {
        if (filter === 'all') return diffResult;

        const filteredHunks = diffResult.hunks
            .map((hunk) => {
                if (filter === 'additions') {
                    return { ...hunk, lines: hunk.lines.filter((l) => l.type === 'addition') };
                } else if (filter === 'deletions') {
                    return { ...hunk, lines: hunk.lines.filter((l) => l.type === 'deletion') };
                } else if (filter === 'modifications') {
                    const modLines: DiffLine[] = [];
                    for (let i = 0; i < hunk.lines.length - 1; i++) {
                        const current = hunk.lines[i];
                        const next = hunk.lines[i + 1];
                        if (current.type === 'deletion' && next.type === 'addition') {
                            modLines.push(current, next);
                            i++;
                        } else if (current.type === 'unchanged') {
                            modLines.push(current);
                        }
                    }
                    return { ...hunk, lines: modLines };
                }
                return hunk;
            })
            .filter((hunk) => hunk.lines.length > 0);

        return {
            ...diffResult,
            hunks: filteredHunks,
            additionCount:
                filter === 'additions'
                    ? diffResult.additionCount
                    : filter === 'deletions'
                      ? 0
                      : filter === 'modifications'
                        ? diffResult.modificationCount
                        : diffResult.additionCount,
            deletionCount:
                filter === 'deletions'
                    ? diffResult.deletionCount
                    : filter === 'additions'
                      ? 0
                      : filter === 'modifications'
                        ? 0
                        : diffResult.deletionCount,
            modificationCount: filter === 'modifications' ? diffResult.modificationCount : 0,
        };
    };

    const filteredDiff = getFilteredDiff();

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
                    setShowShareDialog(true);
                }}
                onExport={(format) => {
                    handleExport(format, diffResult);
                }}
                onFilterChange={setFilter}
                onPanelToggle={(panel) => {
                    if (panel === 'tree-panel') {
                        setShowTreePanel(!showTreePanel);
                    } else if (panel === 'statistics') {
                        setShowStatistics(!showStatistics);
                    } else if (panel === 'validation') {
                        setShowValidation(!showValidation);
                    } else if (panel === 'bookmarks') {
                        setShowBookmarks(!showBookmarks);
                    }
                }}
            />

            {/* Main content area with panels */}
            <div className="flex flex-col lg:flex-row">
                {/* Left Sidebar - Tree Panel */}
                {showTreePanel && (
                    <div className="w-full lg:w-64 border-r border-b lg:border-b-0 border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-900 p-3 lg:p-4 order-2 lg:order-1">
                        <div className="flex items-center justify-between mb-3">
                            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                                File Structure
                            </h3>
                            <button
                                onClick={() => setShowTreePanel(false)}
                                className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        </div>
                        <div className="space-y-1 max-h-48 lg:max-h-none overflow-y-auto">
                            {diffResult.hunks.map((hunk, index) => (
                                <div key={index} className="text-xs">
                                    <button
                                        className="flex items-center gap-1 hover:bg-gray-200 dark:hover:bg-gray-800 px-2 py-1 rounded w-full text-left"
                                        onClick={() => scrollToHunk(index)}
                                    >
                                        <ChevronRight className="h-3 w-3 shrink-0" />
                                        <span className="text-gray-600 dark:text-gray-400 truncate">
                                            Hunk {index + 1}
                                        </span>
                                        <span className="text-gray-400 dark:text-gray-500 text-[10px] ml-auto shrink-0">
                                            {hunk.oldStart}-{hunk.oldStart + hunk.oldLines}
                                        </span>
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Right Side Panels */}
                {showStatistics && (
                    <StatisticsPanel
                        diffResult={filteredDiff}
                        onClose={() => setShowStatistics(false)}
                    />
                )}
                {showValidation && (
                    <ValidationPanel
                        diffResult={filteredDiff}
                        onClose={() => setShowValidation(false)}
                    />
                )}
                {showBookmarks && (
                    <BookmarksPanel
                        bookmarks={bookmarks}
                        hunks={diffResult.hunks}
                        onToggleBookmark={toggleBookmark}
                        onClose={() => setShowBookmarks(false)}
                    />
                )}

                {/* Main diff content */}
                <div className="flex-1 overflow-auto max-h-[50vh] lg:max-h-96 order-1 lg:order-2">
                    {viewMode === 'unified' && (
                        <UnifiedView diffResult={filteredDiff} bookmarks={bookmarks} />
                    )}
                    {viewMode === 'split' && <SplitView diffResult={filteredDiff} />}
                    {viewMode === 'inline' && <InlineView diffResult={filteredDiff} />}
                    {viewMode === 'tree' && <TreeView diffResult={filteredDiff} />}
                </div>
            </div>

            {/* Share Dialog */}
            <ShareDialog
                diffResult={diffResult}
                leftContent={leftContent}
                rightContent={rightContent}
                open={showShareDialog}
                onOpenChange={setShowShareDialog}
            />
        </div>
    );
}

// Unified view - standard diff format
function UnifiedView({ diffResult, bookmarks }: { diffResult: DiffResult; bookmarks?: number[] }) {
    return (
        <pre className="text-xs sm:text-sm font-mono">
            {diffResult.hunks.map((hunk, index) => (
                <div
                    key={`hunk-${hunk.oldStart}-${hunk.newStart}`}
                    id={`hunk-${index}`}
                    className={
                        bookmarks?.includes(index) ? 'ring-2 ring-yellow-400 ring-offset-2' : ''
                    }
                >
                    {/* Hunk header */}
                    <div className="px-2 sm:px-4 py-1 bg-gray-100 text-xs text-gray-600 dark:bg-gray-800 dark:text-gray-400">
                        @@ -{hunk.oldStart},{hunk.oldLines} +{hunk.newStart},{hunk.newLines} @@
                    </div>

                    {/* Hunk lines */}
                    {hunk.lines.map((line, lineIndex) => (
                        <div
                            key={`line-${line.oldLineNumber || 'new'}-${line.newLineNumber || 'old'}-${lineIndex}`}
                            className={`flex px-2 sm:px-4 py-0.5 ${
                                line.type === 'addition'
                                    ? 'bg-green-50 dark:bg-green-900/20'
                                    : line.type === 'deletion'
                                      ? 'bg-red-50 dark:bg-red-900/20'
                                      : ''
                            }`}
                        >
                            <span className="w-8 sm:w-12 text-right text-gray-400 select-none mr-2 sm:mr-4 text-xs dark:text-gray-500 shrink-0 hidden sm:inline">
                                {line.oldLineNumber !== undefined ? line.oldLineNumber : ' '}
                            </span>
                            <span className="w-8 sm:w-12 text-right text-gray-400 select-none mr-2 sm:mr-4 text-xs dark:text-gray-500 shrink-0">
                                {line.newLineNumber !== undefined ? line.newLineNumber : ' '}
                            </span>
                            <span className="w-4 mr-2 select-none shrink-0">
                                {line.type === 'addition' ? (
                                    <span className="text-green-600 dark:text-green-400">+</span>
                                ) : line.type === 'deletion' ? (
                                    <span className="text-red-600 dark:text-red-400">-</span>
                                ) : (
                                    <span> </span>
                                )}
                            </span>
                            <span
                                className={`break-all ${
                                    line.type === 'addition'
                                        ? 'text-green-700 dark:text-green-300'
                                        : line.type === 'deletion'
                                          ? 'text-red-700 dark:text-red-300'
                                          : 'text-gray-700 dark:text-gray-300'
                                }`}
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
        <div className="text-xs sm:text-sm font-mono">
            {diffResult.hunks.map((hunk, index) => (
                <div key={`split-hunk-${index}`} id={`hunk-${index}`}>
                    {/* Hunk header */}
                    <div className="px-2 sm:px-4 py-1 bg-gray-100 text-xs text-gray-600 dark:bg-gray-800 dark:text-gray-400 flex">
                        <span className="flex-1 truncate">
                            @@ -{hunk.oldStart},{hunk.oldLines} +{hunk.newStart},{hunk.newLines} @@
                        </span>
                    </div>

                    <div className="flex flex-col sm:flex-row">
                        {/* Old file */}
                        <div className="flex-1 border-b sm:border-b-0 sm:border-r border-gray-300 dark:border-gray-600">
                            {hunk.lines
                                .filter((line) => line.type !== 'addition')
                                .map((line, lineIndex) => (
                                    <div
                                        key={`old-${lineIndex}`}
                                        className={`flex px-2 sm:px-4 py-0.5 ${
                                            line.type === 'deletion'
                                                ? 'bg-red-50 dark:bg-red-900/20'
                                                : ''
                                        }`}
                                    >
                                        <span className="w-8 sm:w-12 text-right text-gray-400 select-none mr-2 sm:mr-4 text-xs dark:text-gray-500 shrink-0">
                                            {line.oldLineNumber || ' '}
                                        </span>
                                        <span className="w-4 mr-2 select-none shrink-0">
                                            {line.type === 'deletion' ? (
                                                <span className="text-red-600 dark:text-red-400">
                                                    -
                                                </span>
                                            ) : (
                                                <span> </span>
                                            )}
                                        </span>
                                        <span
                                            className={`truncate ${
                                                line.type === 'deletion'
                                                    ? 'text-red-700 dark:text-red-300'
                                                    : 'text-gray-700 dark:text-gray-300'
                                            }`}
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
                                        className={`flex px-2 sm:px-4 py-0.5 ${
                                            line.type === 'addition'
                                                ? 'bg-green-50 dark:bg-green-900/20'
                                                : ''
                                        }`}
                                    >
                                        <span className="w-8 sm:w-12 text-right text-gray-400 select-none mr-2 sm:mr-4 text-xs dark:text-gray-500 shrink-0">
                                            {line.newLineNumber || ' '}
                                        </span>
                                        <span className="w-4 mr-2 select-none shrink-0">
                                            {line.type === 'addition' ? (
                                                <span className="text-green-600 dark:text-green-400">
                                                    +
                                                </span>
                                            ) : (
                                                <span> </span>
                                            )}
                                        </span>
                                        <span
                                            className={`truncate ${
                                                line.type === 'addition'
                                                    ? 'text-green-700 dark:text-green-300'
                                                    : 'text-gray-700 dark:text-gray-300'
                                            }`}
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
                            line.type === 'addition' && prevLine?.type === 'deletion';

                        if (isModification) return null;

                        return (
                            <div key={`inline-${lineIndex}`} className="flex items-center py-0.5">
                                <span className="w-24 text-right text-gray-400 select-none mr-4 text-xs dark:text-gray-500 shrink-0">
                                    {line.oldLineNumber || line.newLineNumber || ' '}
                                </span>
                                <span className="w-4 mr-2 select-none shrink-0">
                                    {line.type === 'deletion' &&
                                    hunk.lines[lineIndex + 1]?.type === 'addition' ? (
                                        <span className="text-orange-600 dark:text-orange-400">
                                            ~
                                        </span>
                                    ) : line.type === 'addition' ? (
                                        <span className="text-green-600 dark:text-green-400">
                                            +
                                        </span>
                                    ) : line.type === 'deletion' ? (
                                        <span className="text-red-600 dark:text-red-400">-</span>
                                    ) : (
                                        <span> </span>
                                    )}
                                </span>

                                {/* Deletion (old) */}
                                {line.type === 'deletion' && (
                                    <span className="px-2 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 mr-2">
                                        {line.content}
                                    </span>
                                )}

                                {/* Addition (new) */}
                                {line.type === 'addition' && (
                                    <span className="px-2 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300">
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

// Tree view - hierarchical JSON structure
function TreeView({ diffResult }: { diffResult: DiffResult }) {
    return (
        <div className="text-sm font-mono p-4">
            {diffResult.hunks.map((hunk, index) => (
                <div key={`tree-hunk-${index}`} id={`hunk-${index}`} className="mb-4">
                    {/* Hunk header */}
                    <div className="px-4 py-1 bg-gray-100 text-xs text-gray-600 dark:bg-gray-800 dark:text-gray-400 mb-2">
                        @@ -{hunk.oldStart},{hunk.oldLines} +{hunk.newStart},{hunk.newLines} @@
                    </div>

                    {/* Tree structure from hunk content */}
                    <div className="px-2">
                        {hunk.lines
                            .filter((line) => line.type !== 'unchanged')
                            .slice(0, 5)
                            .map((line, lineIndex) => (
                                <div key={`tree-line-${lineIndex}`} className="py-1">
                                    {line.type === 'addition' && (
                                        <div className="flex items-center gap-2 text-green-700 dark:text-green-300">
                                            <span className="text-green-600 dark:text-green-400 font-bold text-xs">
                                                +
                                            </span>
                                            <span className="w-px h-px bg-green-600 dark:bg-green-400 flex-1" />
                                            <span className="text-xs ml-2">{line.content}</span>
                                        </div>
                                    )}
                                    {line.type === 'deletion' && (
                                        <div className="flex items-center gap-2 text-red-700 dark:text-red-300">
                                            <span className="text-red-600 dark:text-red-400 font-bold text-xs">
                                                -
                                            </span>
                                            <span className="w-px h-px bg-red-600 dark:bg-red-400 flex-1" />
                                            <span className="text-xs ml-2 line-through opacity-60">
                                                {line.content}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            ))}
                        <div className="text-xs text-gray-500 italic mt-2">
                            {hunk.lines.filter((l) => l.type !== 'unchanged').length > 5
                                ? `+ ${hunk.lines.filter((l) => l.type !== 'unchanged').length - 5} more changes`
                                : 'End of hunk'}
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}

// Statistics Panel
function StatisticsPanel({ diffResult, onClose }: { diffResult: DiffResult; onClose: () => void }) {
    return (
        <div className="w-full lg:w-80 border-l border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 p-3 lg:p-4 order-3">
            <div className="flex items-center justify-between mb-3 lg:mb-4">
                <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Statistics
                </h3>
                <button
                    onClick={onClose}
                    className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                >
                    <X className="h-4 w-4" />
                </button>
            </div>
            <div className="space-y-2 lg:space-y-3 text-xs lg:text-sm">
                <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Total Lines:</span>
                    <span className="font-mono font-semibold text-gray-900 dark:text-gray-100">
                        {diffResult.lineCount}
                    </span>
                </div>
                <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Changes:</span>
                    <span className="font-mono font-semibold text-gray-900 dark:text-gray-100">
                        {diffResult.additionCount +
                            diffResult.deletionCount +
                            diffResult.modificationCount}
                    </span>
                </div>
                <div className="flex justify-between">
                    <span className="text-green-600 dark:text-green-400">Additions:</span>
                    <span className="font-mono font-semibold text-green-700 dark:text-green-300">
                        {diffResult.additionCount}
                    </span>
                </div>
                <div className="flex justify-between">
                    <span className="text-red-600 dark:text-red-400">Deletions:</span>
                    <span className="font-mono font-semibold text-red-700 dark:text-red-300">
                        {diffResult.deletionCount}
                    </span>
                </div>
                <div className="flex justify-between">
                    <span className="text-orange-600 dark:text-orange-400">Modifications:</span>
                    <span className="font-mono font-semibold text-orange-700 dark:text-orange-300">
                        {diffResult.modificationCount}
                    </span>
                </div>
                <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Hunks:</span>
                    <span className="font-mono font-semibold text-gray-900 dark:text-gray-100">
                        {diffResult.hunks.length}
                    </span>
                </div>
                <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Changed:</span>
                    <span className="font-mono font-semibold text-gray-900 dark:text-gray-100">
                        {(
                            ((diffResult.additionCount +
                                diffResult.deletionCount +
                                diffResult.modificationCount) /
                                diffResult.lineCount) *
                            100
                        ).toFixed(1)}
                        %
                    </span>
                </div>
            </div>
        </div>
    );
}

// Validation Panel
function ValidationPanel({ diffResult, onClose }: { diffResult: DiffResult; onClose: () => void }) {
    const issues = diffResult.hunks.reduce<string[]>((acc, hunk, index) => {
        if (hunk.lines.length === 0) {
            return [...acc, `Hunk ${index + 1}: Empty hunk`];
        }
        return acc;
    }, []);

    return (
        <div className="w-full lg:w-80 border-l border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 p-3 lg:p-4 order-3">
            <div className="flex items-center justify-between mb-3 lg:mb-4">
                <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Validation
                </h3>
                <button
                    onClick={onClose}
                    className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                >
                    <X className="h-4 w-4" />
                </button>
            </div>
            <div className="space-y-2 text-xs lg:text-sm">
                {issues.length === 0 ? (
                    <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                        <CheckCircle className="h-4 w-4" />
                        <span>No issues found</span>
                    </div>
                ) : (
                    issues.map((issue, index) => (
                        <div
                            key={index}
                            className="flex items-start gap-2 text-gray-700 dark:text-gray-300"
                        >
                            <span className="text-red-500 shrink-0">{index + 1}.</span>
                            <span className="break-words">{issue}</span>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}

// Bookmarks Panel
function BookmarksPanel({
    bookmarks,
    hunks,
    onToggleBookmark,
    onClose,
}: {
    bookmarks: number[];
    hunks: DiffResult['hunks'];
    onToggleBookmark: (index: number) => void;
    onClose: () => void;
}) {
    return (
        <div className="w-full lg:w-80 border-l border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 p-3 lg:p-4 order-3">
            <div className="flex items-center justify-between mb-3 lg:mb-4">
                <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Bookmarks
                </h3>
                <button
                    onClick={onClose}
                    className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                >
                    <X className="h-4 w-4" />
                </button>
            </div>
            {bookmarks.length === 0 ? (
                <p className="text-xs lg:text-sm text-gray-500 dark:text-gray-400 italic">
                    No bookmarks yet
                </p>
            ) : (
                <div className="space-y-1">
                    {bookmarks.map((bookmarkIndex) => {
                        const hunk = hunks[bookmarkIndex];
                        return (
                            <button
                                key={bookmarkIndex}
                                className="flex items-center gap-2 w-full px-2 py-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800 text-left"
                                onClick={() => {
                                    onToggleBookmark(bookmarkIndex);
                                    document
                                        .getElementById(`hunk-${bookmarkIndex}`)
                                        ?.scrollIntoView({ behavior: 'smooth' });
                                }}
                            >
                                <span className="text-yellow-600 dark:text-yellow-400 text-sm">
                                    ⭐
                                </span>
                                <span className="text-xs text-gray-700 dark:text-gray-300 truncate">
                                    Hunk {bookmarkIndex + 1} (lines {hunk.oldStart}-
                                    {hunk.oldStart + hunk.oldLines})
                                </span>
                            </button>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
