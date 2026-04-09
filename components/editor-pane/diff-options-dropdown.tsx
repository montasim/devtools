'use client';

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import {
    MoreVertical,
    List,
    Plus,
    Minus,
    Replace,
    Copy,
    Download,
    FileText,
    Share2,
    Bookmark,
    FolderTree,
    BarChart3,
    CheckCircle,
} from 'lucide-react';
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
                <Button variant="outline" size="icon-sm" aria-label="More options">
                    <MoreVertical className="h-4 w-4" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
                {/* Filter Changes Section */}
                <div className="px-2 py-1.5 text-xs font-semibold uppercase text-muted-foreground">
                    Filter Changes
                </div>
                <DropdownMenuItem onClick={() => onFilterChange?.('all')}>
                    <List className="h-4 w-4 mr-2" />
                    <span className="text-foreground">All</span>
                    <span className="ml-auto text-muted-foreground">{totalCount}</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onFilterChange?.('additions')}>
                    <Plus className="h-4 w-4 mr-2 text-green-600 dark:text-green-400" />
                    <span className="text-green-600 dark:text-green-400">Added</span>
                    <span className="ml-auto text-muted-foreground">{additionCount}</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onFilterChange?.('deletions')}>
                    <Minus className="h-4 w-4 mr-2 text-red-600 dark:text-red-400" />
                    <span className="text-red-600 dark:text-red-400">Deleted</span>
                    <span className="ml-auto text-muted-foreground">{deletionCount}</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onFilterChange?.('modifications')}>
                    <Replace className="h-4 w-4 mr-2 text-orange-600 dark:text-orange-400" />
                    <span className="text-orange-600 dark:text-orange-400">Modified</span>
                    <span className="ml-auto text-muted-foreground">{modificationCount}</span>
                </DropdownMenuItem>

                <DropdownMenuSeparator />

                {/* Export Section */}
                <div className="px-2 py-1.5 text-xs font-semibold uppercase text-muted-foreground">
                    Export
                </div>
                <DropdownMenuItem onClick={() => onExport?.('json-patch')}>
                    <Copy className="h-4 w-4 mr-2" />
                    Copy as JSON Patch
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onExport?.('merge-patch')}>
                    <Copy className="h-4 w-4 mr-2" />
                    Copy as Merge Patch
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onExport?.('download-patch')}>
                    <Download className="h-4 w-4 mr-2" />
                    Download Patch
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onExport?.('html-report')}>
                    <FileText className="h-4 w-4 mr-2" />
                    Export HTML Report
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onExport?.('json-paths')}>
                    <Share2 className="h-4 w-4 mr-2" />
                    Copy JSON Paths
                </DropdownMenuItem>

                <DropdownMenuSeparator />

                {/* Panels Section */}
                <div className="px-2 py-1.5 text-xs font-semibold uppercase text-muted-foreground">
                    Panels
                </div>
                <DropdownMenuItem onClick={() => onPanelToggle?.('bookmarks')}>
                    <Bookmark className="h-4 w-4 mr-2" />
                    Bookmarks
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onPanelToggle?.('tree-panel')}>
                    <FolderTree className="h-4 w-4 mr-2" />
                    Tree Panel
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onPanelToggle?.('statistics')}>
                    <BarChart3 className="h-4 w-4 mr-2" />
                    Statistics
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onPanelToggle?.('validation')}>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Validation
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
