'use client';

import { Copy, Trash2, ArrowUpDown } from 'lucide-react';
import {
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuShortcut,
} from '@/components/ui/dropdown-menu';

export interface TextDiffOperationsMenuProps {
    leftText: string;
    rightText: string;
    onLeftTextChange: (text: string) => void;
    onRightTextChange: (text: string) => void;
    onClear: () => void;
}

export function TextDiffOperationsMenu({
    leftText,
    rightText,
    onLeftTextChange,
    onRightTextChange,
    onClear,
}: TextDiffOperationsMenuProps) {
    const handleCopyLeft = async () => {
        try {
            await navigator.clipboard.writeText(leftText);
        } catch {
            alert('Failed to copy to clipboard');
        }
    };

    const handleCopyRight = async () => {
        try {
            await navigator.clipboard.writeText(rightText);
        } catch {
            alert('Failed to copy to clipboard');
        }
    };

    const handleSwap = () => {
        const temp = leftText;
        onLeftTextChange(rightText);
        onRightTextChange(temp);
    };

    const handleClearLeft = () => {
        onLeftTextChange('');
    };

    const handleClearRight = () => {
        onRightTextChange('');
    };

    return (
        <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuItem onClick={handleCopyLeft} disabled={!leftText}>
                <Copy className="mr-2 h-4 w-4" />
                Copy Original
                <DropdownMenuShortcut>⌘⇧C</DropdownMenuShortcut>
            </DropdownMenuItem>

            <DropdownMenuItem onClick={handleCopyRight} disabled={!rightText}>
                <Copy className="mr-2 h-4 w-4" />
                Copy Modified
                <DropdownMenuShortcut>⌘C</DropdownMenuShortcut>
            </DropdownMenuItem>

            <DropdownMenuSeparator />

            <DropdownMenuItem onClick={handleSwap} disabled={!leftText && !rightText}>
                <ArrowUpDown className="mr-2 h-4 w-4" />
                Swap Left/Right
                <DropdownMenuShortcut>⌘⇧S</DropdownMenuShortcut>
            </DropdownMenuItem>

            <DropdownMenuSeparator />

            <DropdownMenuItem onClick={handleClearLeft} disabled={!leftText}>
                <Trash2 className="mr-2 h-4 w-4" />
                Clear Original
            </DropdownMenuItem>

            <DropdownMenuItem onClick={handleClearRight} disabled={!rightText}>
                <Trash2 className="mr-2 h-4 w-4" />
                Clear Modified
            </DropdownMenuItem>

            <DropdownMenuItem onClick={onClear} disabled={!leftText && !rightText}>
                <Trash2 className="mr-2 h-4 w-4" />
                Clear All
                <DropdownMenuShortcut>⌘⌫</DropdownMenuShortcut>
            </DropdownMenuItem>
        </DropdownMenuContent>
    );
}
