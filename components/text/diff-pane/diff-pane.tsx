'use client';

import { useState, useMemo, useEffect, useRef } from 'react';
import { MoreVertical, Plus, Minus, Replace, Percent } from 'lucide-react';
import { TextEditor } from '@/components/text/text-editor/text-editor';
import { DiffResults } from '@/components/text/diff-pane/diff-results';
import { TextDiffOperationsMenu } from '@/components/text/diff-pane/text-diff-operations-menu';
import { TextDiffShareDialog } from '@/components/text/diff-pane/text-diff-share-dialog';
import { TextDiffViewModeTabs } from '@/components/text/diff-pane/view-mode-tabs';
import { useTextDiff } from '@/components/text/diff-pane/use-text-diff';
import { useDebouncedSave } from '@/components/text/shared/use-debounced-save';
import { DropdownMenu, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { STORAGE_KEYS } from '@/lib/constants';
import type { TextDiffViewMode } from '@/components/text/diff-pane/view-mode-tabs';

export interface TextDiffPaneProps {
    shareDialogOpen?: boolean;
    onShareDialogOpenChange?: (open: boolean) => void;
    sharedData?: {
        tabName?: string;
        state?: {
            leftContent?: string;
            rightContent?: string;
        };
        title?: string;
        comment?: string;
        expiresAt?: string;
        hasPassword?: boolean;
        viewCount?: number;
        createdAt?: string;
    } | null;
    onContentChange?: (left: string, right: string) => void;
    currentLeftContent?: string;
    currentRightContent?: string;
}

export function TextDiffPane({
    shareDialogOpen,
    onShareDialogOpenChange,
    sharedData,
    onContentChange,
    currentLeftContent,
    currentRightContent,
}: TextDiffPaneProps) {
    // Track if we've loaded shared data for each side
    const leftSharedDataLoadedRef = useRef(false);
    const rightSharedDataLoadedRef = useRef(false);

    // Initialize state with shared content > localStorage > empty
    const [leftText, setLeftText] = useState<string>(() => {
        if (sharedData?.tabName === 'diff' && sharedData?.state?.leftContent) {
            return sharedData.state.leftContent;
        }
        if (typeof window !== 'undefined') {
            try {
                const saved = localStorage.getItem(STORAGE_KEYS.TEXT_DIFF_LEFT_CONTENT);
                if (saved) return saved;
            } catch (error) {
                console.error('Failed to load from localStorage:', error);
            }
        }
        return '';
    });

    const [rightText, setRightText] = useState<string>(() => {
        if (sharedData?.tabName === 'diff' && sharedData?.state?.rightContent) {
            return sharedData.state.rightContent;
        }
        if (typeof window !== 'undefined') {
            try {
                const saved = localStorage.getItem(STORAGE_KEYS.TEXT_DIFF_RIGHT_CONTENT);
                if (saved) return saved;
            } catch (error) {
                console.error('Failed to load from localStorage:', error);
            }
        }
        return '';
    });

    // Mark shared data as loaded if we used it
    useEffect(() => {
        if (sharedData?.tabName === 'diff' && sharedData?.state?.leftContent) {
            leftSharedDataLoadedRef.current = true;
        }
        if (sharedData?.tabName === 'diff' && sharedData?.state?.rightContent) {
            rightSharedDataLoadedRef.current = true;
        }
    }, [sharedData]);
    const [diffViewType, setDiffViewType] = useState<TextDiffViewMode>('split');

    // Track sharedData to detect async arrival
    const sharedDataRef = useRef(sharedData);

    // Error handlers (no-op for text diff)
    const handleLeftError = () => {};
    const handleRightError = () => {};

    // Debounced save to localStorage
    useDebouncedSave(leftText, STORAGE_KEYS.TEXT_DIFF_LEFT_CONTENT);
    useDebouncedSave(rightText, STORAGE_KEYS.TEXT_DIFF_RIGHT_CONTENT);

    // Notify parent of content changes for sharing
    useEffect(() => {
        onContentChange?.(leftText, rightText);
    }, [leftText, rightText, onContentChange]);

    // Handle async shared data arrival for left content
    useEffect(() => {
        // If shared data just arrived (was undefined/null, now has value with leftContent)
        if (
            sharedData?.tabName === 'diff' &&
            sharedData?.state?.leftContent &&
            !leftSharedDataLoadedRef.current
        ) {
            leftSharedDataLoadedRef.current = true;
            setTimeout(() => setLeftText(sharedData.state?.leftContent || ''), 0);
        }
        sharedDataRef.current = sharedData;
    }, [sharedData]);

    // Handle async shared data arrival for right content
    useEffect(() => {
        // If shared data just arrived (was undefined/null, now has value with rightContent)
        if (
            sharedData?.tabName === 'diff' &&
            sharedData?.state?.rightContent &&
            !rightSharedDataLoadedRef.current
        ) {
            rightSharedDataLoadedRef.current = true;
            setTimeout(() => setRightText(sharedData.state?.rightContent || ''), 0);
        }
    }, [sharedData]);

    const { stats } = useTextDiff(leftText, rightText);

    // Calculate percentage changed
    const changePercentage = useMemo(() => {
        if (!stats) return 0;
        const totalChanges = stats.addedLines + stats.removedLines;
        const totalLines = stats.addedLines + stats.removedLines + stats.unchangedLines;
        return totalLines > 0 ? Math.round((totalChanges / totalLines) * 100) : 0;
    }, [stats]);

    const hasContent = leftText.trim().length > 0 || rightText.trim().length > 0;

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
                leftContent={currentLeftContent ?? leftText}
                rightContent={currentRightContent ?? rightText}
                stats={stats}
                changePercentage={changePercentage}
                open={shareDialogOpen ?? false}
                onOpenChange={(open) => onShareDialogOpenChange?.(open)}
            />
        </div>
    );
}
