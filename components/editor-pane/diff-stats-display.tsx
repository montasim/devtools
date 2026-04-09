'use client';

import { cn } from '@/lib/utils';

interface DiffStatsDisplayProps {
    additionCount: number;
    deletionCount: number;
    modificationCount: number;
    percentageChanged: number;
    className?: string;
}

/**
 * DiffStatsDisplay - Displays diff statistics with color-coded counts
 *
 * Shows the number of additions, deletions, modifications, and the overall
 * percentage changed. Each type is color-coded for quick visual recognition.
 *
 * @example
 * ```tsx
 * <DiffStatsDisplay
 *   additionCount={5}
 *   deletionCount={2}
 *   modificationCount={3}
 *   percentageChanged={10.5}
 * />
 * ```
 */
export function DiffStatsDisplay({
    additionCount,
    deletionCount,
    modificationCount,
    percentageChanged,
    className,
}: DiffStatsDisplayProps) {
    return (
        <div
            className={cn('flex items-center gap-2 text-sm', className)}
            role="status"
            aria-label={`Diff statistics: ${additionCount} additions, ${deletionCount} deletions, ${modificationCount} modifications, ${percentageChanged.toFixed(1)}% changed`}
        >
            <span
                className="font-semibold text-green-600 dark:text-green-400"
                aria-label="Additions"
            >
                +{additionCount}
            </span>
            <span
                className="font-semibold text-red-600 dark:text-red-400"
                aria-label="Deletions"
            >
                −{deletionCount}
            </span>
            <span
                className="font-semibold text-orange-600 dark:text-orange-400"
                aria-label="Modifications"
            >
                ~{modificationCount}
            </span>
            <span
                className="font-medium text-gray-600 dark:text-gray-400"
                aria-label="Percentage changed"
            >
                {percentageChanged.toFixed(1)}% changed
            </span>
        </div>
    );
}
