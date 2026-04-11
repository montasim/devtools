'use client';

import { useState, useMemo } from 'react';
import { toast } from 'sonner';
import { Share2, MoreVertical, Plus, Minus, Replace, Percent } from 'lucide-react';
import { TextEditor } from '@/components/text-tools/text-editor/text-editor';
import { DiffResults } from '@/components/text-tools/diff-pane/diff-results';
import { TextDiffOperationsMenu } from '@/components/text-tools/diff-pane/text-diff-operations-menu';
import { TextDiffShareDialog } from '@/components/text-tools/diff-pane/text-diff-share-dialog';
import { TextDiffViewModeTabs } from '@/components/text-tools/diff-pane/view-mode-tabs';
import { useTextDiff } from '@/components/text-tools/diff-pane/use-text-diff';
import { useDebouncedSave } from '@/components/text-tools/shared/use-debounced-save';
import { DropdownMenu, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { STORAGE_KEYS } from '@/lib/constants';
import type { TextDiffViewMode } from '@/components/text-tools/diff-pane/view-mode-tabs';

export interface TextDiffPaneProps {
    shareDialogOpen?: boolean;
    onShareDialogOpenChange?: (open: boolean) => void;
}

export function TextDiffPane({ shareDialogOpen, onShareDialogOpenChange }: TextDiffPaneProps) {
    // Initialize state from localStorage
    const [leftText, setLeftText] = useState(() => {
        try {
            return localStorage.getItem(STORAGE_KEYS.TEXT_DIFF_LEFT_CONTENT) || '';
        } catch {
            return '';
        }
    });
    const [rightText, setRightText] = useState(() => {
        try {
            return localStorage.getItem(STORAGE_KEYS.TEXT_DIFF_RIGHT_CONTENT) || '';
        } catch {
            return '';
        }
    });
    const [diffViewType, setDiffViewType] = useState<TextDiffViewMode>('split');

    // Error handlers (no-op for text diff)
    const handleLeftError = () => {};
    const handleRightError = () => {};

    // Debounced save to localStorage
    useDebouncedSave(leftText, STORAGE_KEYS.TEXT_DIFF_LEFT_CONTENT);
    useDebouncedSave(rightText, STORAGE_KEYS.TEXT_DIFF_RIGHT_CONTENT);

    const { stats } = useTextDiff(leftText, rightText);

    // Calculate percentage changed
    const changePercentage = useMemo(() => {
        if (!stats) return 0;
        const totalChanges = stats.addedLines + stats.removedLines;
        const totalLines = stats.addedLines + stats.removedLines + stats.unchangedLines;
        return totalLines > 0 ? Math.round((totalChanges / totalLines) * 100) : 0;
    }, [stats]);

    const hasContent = leftText.trim().length > 0 || rightText.trim().length > 0;

    const handleShare = () => {
        if (!leftText && !rightText) {
            toast.error('No content to share. Please enter some text first.');
            return;
        }
        onShareDialogOpenChange?.(true);
    };

    const handleClear = () => {
        setLeftText('');
        setRightText('');
        try {
            localStorage.removeItem(STORAGE_KEYS.TEXT_DIFF_LEFT_CONTENT);
            localStorage.removeItem(STORAGE_KEYS.TEXT_DIFF_RIGHT_CONTENT);
        } catch (error) {
            console.error('Failed to clear content:', error);
        }
    };

    const handleClearLeft = () => {
        setLeftText('');
        try {
            localStorage.removeItem(STORAGE_KEYS.TEXT_DIFF_LEFT_CONTENT);
        } catch (error) {
            console.error('Failed to clear left content:', error);
        }
    };

    const handleClearRight = () => {
        setRightText('');
        try {
            localStorage.removeItem(STORAGE_KEYS.TEXT_DIFF_RIGHT_CONTENT);
        } catch (error) {
            console.error('Failed to clear right content:', error);
        }
    };

    return (
        <div className="">
            <div className="flex flex-col lg:flex-row gap-4">
                <div className="w-full lg:w-1/2 min-w-0">
                    <TextEditor
                        label="Original Text"
                        value={leftText}
                        onChange={setLeftText}
                        onError={handleLeftError}
                        onClear={handleClearLeft}
                        height="400px"
                        showEmptyPrompt={true}
                    />
                </div>

                <Separator orientation="vertical" className="hidden lg:block" />
                <Separator orientation="horizontal" className="block lg:hidden" />

                <div className="w-full lg:w-1/2 min-w-0">
                    <TextEditor
                        label="Modified Text"
                        value={rightText}
                        onChange={setRightText}
                        onError={handleRightError}
                        onClear={handleClearRight}
                        height="400px"
                        showEmptyPrompt={true}
                    />
                </div>
            </div>

            {hasContent && stats && (
                <div className="flex items-center justify-between gap-4 text-sm text-muted-foreground border-t">
                    {/* Left: Diff view type toggle */}
                    <TextDiffViewModeTabs
                        currentMode={diffViewType}
                        onModeChange={setDiffViewType}
                    />

                    {/* Middle: Statistics */}
                    <div className="flex items-center gap-4">
                        <span className="flex items-center gap-1 text-green-600 dark:text-green-400">
                            <Plus className="h-3.5 w-3.5" />
                            {stats.addedLines}
                        </span>
                        <span className="flex items-center gap-1 text-red-600 dark:text-red-400">
                            <Minus className="h-3.5 w-3.5" />
                            {stats.removedLines}
                        </span>
                        <span className="flex items-center gap-1 text-muted-foreground">
                            <Replace className="h-3.5 w-3.5" />
                            {stats.unchangedLines}
                        </span>
                        <Separator orientation="vertical" className="h-4" />
                        <span className="flex items-center gap-1 text-muted-foreground">
                            <Percent className="h-3.5 w-3.5" />
                            {changePercentage} changed
                        </span>
                    </div>

                    {/* Right: Three-dot menu */}
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                                <MoreVertical className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <TextDiffOperationsMenu
                            leftText={leftText}
                            rightText={rightText}
                            onLeftTextChange={setLeftText}
                            onRightTextChange={setRightText}
                            onClear={handleClear}
                        />
                    </DropdownMenu>
                </div>
            )}

            <DiffResults leftText={leftText} rightText={rightText} diffViewType={diffViewType} />

            {/* Share Dialog */}
            <TextDiffShareDialog
                leftContent={leftText}
                rightContent={rightText}
                stats={stats}
                changePercentage={changePercentage}
                open={shareDialogOpen ?? false}
                onOpenChange={(open) => onShareDialogOpenChange?.(open)}
            />
        </div>
    );
}
