'use client';

import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Share2 } from 'lucide-react';
import { DiffPanelToolbarProps } from './types';
import { ViewModeTabs } from './view-mode-tabs';
import { DiffStatsDisplay } from './diff-stats-display';
import { DiffOptionsDropdown } from './diff-options-dropdown';

/**
 * DiffPanelToolbar - Toolbar component for diff panels
 *
 * Displays diff statistics, view mode controls, and action buttons for diff panels.
 * Provides quick access to view modes, statistics, sharing, and additional options.
 *
 * @example
 * ```tsx
 * <DiffPanelToolbar
 *   viewMode={viewMode}
 *   additionCount={5}
 *   deletionCount={2}
 *   modificationCount={3}
 *   totalLines={100}
 *   onViewModeChange={setViewMode}
 * />
 * ```
 */
export function DiffPanelToolbar({
    viewMode,
    additionCount,
    deletionCount,
    modificationCount,
    totalLines,
    onViewModeChange,
    onShare,
    onExport,
    onFilterChange,
    onPanelToggle,
    className,
}: DiffPanelToolbarProps) {
    // Calculate percentage changed
    const percentageChanged =
        totalLines > 0
            ? ((additionCount + deletionCount + modificationCount) / totalLines) *
              100
            : 0;

    return (
        <div
            className={`flex items-center justify-between gap-4 bg-gray-100 px-4 py-2 dark:bg-gray-800 ${className || ''}`}
            role="toolbar"
            aria-label="Diff panel toolbar"
        >
            {/* Left: View Mode Tabs */}
            <ViewModeTabs
                currentMode={viewMode}
                onModeChange={(mode) => onViewModeChange?.(mode)}
            />

            {/* Right: Stats and Actions */}
            <div className="flex items-center gap-3">
                {/* Stats Display */}
                <DiffStatsDisplay
                    additionCount={additionCount}
                    deletionCount={deletionCount}
                    modificationCount={modificationCount}
                    percentageChanged={percentageChanged}
                />

                {/* Separator */}
                <Separator orientation="vertical" className="h-6" />

                {/* Share Button */}
                <Button
                    variant="outline"
                    size="icon-sm"
                    onClick={onShare}
                    aria-label="Share this diff"
                    title="Share this diff"
                >
                    <Share2 className="h-4 w-4" />
                </Button>

                {/* Options Dropdown */}
                <DiffOptionsDropdown
                    additionCount={additionCount}
                    deletionCount={deletionCount}
                    modificationCount={modificationCount}
                    onExport={onExport}
                    onFilterChange={onFilterChange}
                    onPanelToggle={onPanelToggle}
                />
            </div>
        </div>
    );
}
