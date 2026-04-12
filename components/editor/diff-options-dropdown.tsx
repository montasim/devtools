'use client';

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
    DropdownMenuShortcut,
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
import { ExportFormat, DiffFilter, PanelType } from '@/components/editor/types';

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
                    <DropdownMenuShortcut>⌘1</DropdownMenuShortcut>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onFilterChange?.('additions')}>
                    <Plus className="h-4 w-4 mr-2 text-green-600 dark:text-green-400" />
                    <span className="text-green-600 dark:text-green-400">Added</span>
                    <span className="ml-auto text-muted-foreground">{additionCount}</span>
                    <DropdownMenuShortcut>⌘2</DropdownMenuShortcut>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onFilterChange?.('deletions')}>
                    <Minus className="h-4 w-4 mr-2 text-red-600 dark:text-red-400" />
                    <span className="text-red-600 dark:text-red-400">Deleted</span>
                    <span className="ml-auto text-muted-foreground">{deletionCount}</span>
                    <DropdownMenuShortcut>⌘3</DropdownMenuShortcut>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onFilterChange?.('modifications')}>
                    <Replace className="h-4 w-4 mr-2 text-orange-600 dark:text-orange-400" />
                    <span className="text-orange-600 dark:text-orange-400">Modified</span>
                    <span className="ml-auto text-muted-foreground">{modificationCount}</span>
                    <DropdownMenuShortcut>⌘4</DropdownMenuShortcut>
                </DropdownMenuItem>

                <DropdownMenuSeparator />

                {/* Export Section */}
                <div className="px-2 py-1.5 text-xs font-semibold uppercase text-muted-foreground">
                    Export
                </div>
                <DropdownMenuItem onClick={() => onExport?.('json-patch')}>
                    <Copy className="h-4 w-4 mr-2" />
                    Copy as JSON Patch
                    <DropdownMenuShortcut>⌘⇧P</DropdownMenuShortcut>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onExport?.('merge-patch')}>
                    <Copy className="h-4 w-4 mr-2" />
                    Copy as Merge Patch
                    <DropdownMenuShortcut>⌘⇧G</DropdownMenuShortcut>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onExport?.('download-patch')}>
                    <Download className="h-4 w-4 mr-2" />
                    Download Patch
                    <DropdownMenuShortcut>⌘⇧D</DropdownMenuShortcut>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onExport?.('html-report')}>
                    <FileText className="h-4 w-4 mr-2" />
                    Export HTML Report
                    <DropdownMenuShortcut>⌘⇧H</DropdownMenuShortcut>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onExport?.('json-paths')}>
                    <Share2 className="h-4 w-4 mr-2" />
                    Copy JSON Paths
                    <DropdownMenuShortcut>⌘⇧J</DropdownMenuShortcut>
                </DropdownMenuItem>

                <DropdownMenuSeparator />

                {/* Panels Section */}
                <div className="px-2 py-1.5 text-xs font-semibold uppercase text-muted-foreground">
                    Panels
                </div>
                <DropdownMenuItem onClick={() => onPanelToggle?.('bookmarks')}>
                    <Bookmark className="h-4 w-4 mr-2" />
                    Bookmarks
                    <DropdownMenuShortcut>⌘B</DropdownMenuShortcut>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onPanelToggle?.('tree-panel')}>
                    <FolderTree className="h-4 w-4 mr-2" />
                    Tree Panel
                    <DropdownMenuShortcut>⌘T</DropdownMenuShortcut>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onPanelToggle?.('statistics')}>
                    <BarChart3 className="h-4 w-4 mr-2" />
                    Statistics
                    <DropdownMenuShortcut>⌘S</DropdownMenuShortcut>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onPanelToggle?.('validation')}>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Validation
                    <DropdownMenuShortcut>⌘V</DropdownMenuShortcut>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
