'use client';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { ViewMode } from './types';
import { Columns, FileDiff, AlignLeft, FolderTree } from 'lucide-react';

interface ViewModeTabsProps {
    currentMode: ViewMode;
    onModeChange: (mode: ViewMode) => void;
    className?: string;
}

const VIEW_MODES: {
    value: ViewMode;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
}[] = [
    { value: 'split', label: 'Split', icon: Columns },
    { value: 'unified', label: 'Unified', icon: FileDiff },
    { value: 'inline', label: 'Inline', icon: AlignLeft },
    { value: 'tree', label: 'Tree', icon: FolderTree },
];

/**
 * ViewModeTabs - Tab component for switching between diff view modes
 *
 * Provides buttons to toggle between different diff visualization modes:
 * - Split: Side-by-side comparison
 * - Unified: Combined view with changes inline
 * - Inline: Condensed single-line view
 * - Tree: Hierarchical JSON structure view
 *
 * @example
 * ```tsx
 * <ViewModeTabs
 *   currentMode="unified"
 *   onModeChange={(mode) => setViewMode(mode)}
 * />
 * ```
 */
export function ViewModeTabs({ currentMode, onModeChange, className }: ViewModeTabsProps) {
    return (
        <div
            className={cn('flex items-center gap-1', className)}
            role="tablist"
            aria-label="View mode"
        >
            {VIEW_MODES.map((mode) => {
                const Icon = mode.icon;
                return (
                    <Button
                        key={mode.value}
                        variant={currentMode === mode.value ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => onModeChange(mode.value)}
                        role="tab"
                        aria-selected={currentMode === mode.value}
                        aria-controls="diff-panel"
                        className="whitespace-nowrap gap-2"
                    >
                        <Icon className="h-4 w-4" />
                        {mode.label}
                    </Button>
                );
            })}
        </div>
    );
}
