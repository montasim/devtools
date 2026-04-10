'use client';

import { Button } from '@/components/ui/button';
import { RotateCcw, Trash } from 'lucide-react';

interface HistoryActionButtonsProps {
    onRestoreAll: () => void;
    onClearAll: () => void;
    disabled?: boolean;
    restoreDisabled?: boolean;
    clearDisabled?: boolean;
    restoreLabel?: string;
    clearLabel?: string;
    className?: string;
}

export function HistoryActionButtons({
    onRestoreAll,
    onClearAll,
    disabled = false,
    restoreDisabled = false,
    clearDisabled = false,
    restoreLabel = 'Restore All',
    clearLabel = 'Clear All',
    className,
}: HistoryActionButtonsProps) {
    return (
        <div className={`flex gap-2 sm:self-start ${className || ''}`}>
            <Button
                variant="outline"
                size="sm"
                onClick={onRestoreAll}
                disabled={disabled || restoreDisabled}
                className="gap-2"
            >
                <RotateCcw className="h-4 w-4" />
                <span className="hidden sm:inline">{restoreLabel}</span>
                <span className="sm:hidden">Restore</span>
            </Button>
            <Button
                variant="outline"
                size="sm"
                onClick={onClearAll}
                disabled={disabled || clearDisabled}
                className="gap-2"
            >
                <Trash className="h-4 w-4" />
                <span className="hidden sm:inline">{clearLabel}</span>
                <span className="sm:hidden">Clear</span>
            </Button>
        </div>
    );
}
