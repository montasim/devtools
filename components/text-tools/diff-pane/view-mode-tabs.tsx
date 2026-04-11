'use client';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Columns3, FileDiff } from 'lucide-react';

export type TextDiffViewMode = 'split' | 'unified';

interface TextDiffViewModeTabsProps {
    currentMode: TextDiffViewMode;
    onModeChange: (mode: TextDiffViewMode) => void;
    className?: string;
}

const VIEW_MODES: {
    value: TextDiffViewMode;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
}[] = [
    { value: 'split', label: 'Split', icon: Columns3 },
    { value: 'unified', label: 'Unified', icon: FileDiff },
];

/**
 * TextDiffViewModeTabs - Tab component for switching between text diff view modes
 *
 * Provides buttons to toggle between different diff visualization modes:
 * - Split: Side-by-side comparison
 * - Unified: Combined view with changes inline
 *
 * @example
 * ```tsx
 * <TextDiffViewModeTabs
 *   currentMode="unified"
 *   onModeChange={(mode) => setDiffViewType(mode)}
 * />
 * ```
 */
export function TextDiffViewModeTabs({
    currentMode,
    onModeChange,
    className,
}: TextDiffViewModeTabsProps) {
    return (
        <div
            className={cn('flex items-center gap-1', className)}
            role="tablist"
            aria-label="Diff view mode"
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
