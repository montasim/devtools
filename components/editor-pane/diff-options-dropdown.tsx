'use client';

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { MoreVertical } from 'lucide-react';
import { ExportFormat, DiffFilter, PanelType } from './types';

interface DiffOptionsDropdownProps {
    additionCount: number;
    deletionCount: number;
    modificationCount: number;
    onExport?: (format: ExportFormat) => void;
    onFilterChange?: (filter: DiffFilter) => void;
    onPanelToggle?: (panel: PanelType) => void;
}

/**
 * DiffOptionsDropdown - Dropdown menu for additional diff options
 *
 * Provides access to:
 * - Filter changes by type (all, additions, deletions, modifications)
 * - Export options (JSON Patch, Merge Patch, download, HTML report, JSON paths)
 * - Panel toggles (bookmarks, tree panel, statistics, validation)
 *
 * @example
 * ```tsx
 * <DiffOptionsDropdown
 *   additionCount={5}
 *   deletionCount={2}
 *   modificationCount={3}
 *   onExport={(format) => handleExport(format)}
 *   onFilterChange={(filter) => setFilter(filter)}
 *   onPanelToggle={(panel) => togglePanel(panel)}
 * />
 * ```
 */
export function DiffOptionsDropdown({
    additionCount,
    deletionCount,
    modificationCount,
    onExport,
    onFilterChange,
    onPanelToggle,
}: DiffOptionsDropdownProps) {
    const totalCount = additionCount + deletionCount + modificationCount;

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="outline"
                    size="icon-sm"
                    aria-label="More options"
                >
                    <MoreVertical className="h-4 w-4" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
                {/* Filter Changes Section */}
                <div className="px-2 py-1.5 text-xs font-semibold uppercase text-muted-foreground">
                    Filter Changes
                </div>
                <DropdownMenuItem onClick={() => onFilterChange?.('all')}>
                    <span className="text-foreground">All</span>
                    <span className="ml-auto text-muted-foreground">
                        {totalCount}
                    </span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onFilterChange?.('additions')}>
                    <span className="text-green-600 dark:text-green-400">
                        + Added
                    </span>
                    <span className="ml-auto text-muted-foreground">
                        {additionCount}
                    </span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onFilterChange?.('deletions')}>
                    <span className="text-red-600 dark:text-red-400">
                        − Deleted
                    </span>
                    <span className="ml-auto text-muted-foreground">
                        {deletionCount}
                    </span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onFilterChange?.('modifications')}>
                    <span className="text-orange-600 dark:text-orange-400">
                        ~ Modified
                    </span>
                    <span className="ml-auto text-muted-foreground">
                        {modificationCount}
                    </span>
                </DropdownMenuItem>

                <DropdownMenuSeparator />

                {/* Export Section */}
                <div className="px-2 py-1.5 text-xs font-semibold uppercase text-muted-foreground">
                    Export
                </div>
                <DropdownMenuItem onClick={() => onExport?.('json-patch')}>
                    Copy as JSON Patch
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onExport?.('merge-patch')}>
                    Copy as Merge Patch
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onExport?.('download-patch')}>
                    Download Patch
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onExport?.('html-report')}>
                    Export HTML Report
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onExport?.('json-paths')}>
                    Copy JSON Paths
                </DropdownMenuItem>

                <DropdownMenuSeparator />

                {/* Panels Section */}
                <div className="px-2 py-1.5 text-xs font-semibold uppercase text-muted-foreground">
                    Panels
                </div>
                <DropdownMenuItem onClick={() => onPanelToggle?.('bookmarks')}>
                    Bookmarks
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onPanelToggle?.('tree-panel')}>
                    Tree Panel
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onPanelToggle?.('statistics')}>
                    Statistics
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onPanelToggle?.('validation')}>
                    Validation
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
