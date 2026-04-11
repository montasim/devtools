'use client';

import { useState, useMemo } from 'react';
import { toast } from 'sonner';
import { Share2, MoreVertical } from 'lucide-react';
import { TextEditor } from '@/components/text-tools/text-editor/text-editor';
import { DiffResults } from '@/components/text-tools/diff-pane/diff-results';
import { TextDiffOperationsMenu } from '@/components/text-tools/diff-pane/text-diff-operations-menu';
import { TextDiffShareDialog } from '@/components/text-tools/diff-pane/text-diff-share-dialog';
import { useTextDiff } from '@/components/text-tools/diff-pane/use-text-diff';
import { useDebouncedSave } from '@/components/text-tools/shared/use-debounced-save';
import { DropdownMenu, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Separator } from '@/components/ui/separator';
import { STORAGE_KEYS } from '@/lib/constants';

export function TextDiffPane() {
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
    const [shareDialogOpen, setShareDialogOpen] = useState(false);

    // Error handlers (no-op for text diff)
    const handleLeftError = () => {};
    const handleRightError = () => {};

    // Debounced save to localStorage
    useDebouncedSave(leftText, STORAGE_KEYS.TEXT_DIFF_LEFT_CONTENT);
    useDebouncedSave(rightText, STORAGE_KEYS.TEXT_DIFF_RIGHT_CONTENT);

    const { stats } = useTextDiff(leftText, rightText);

    // Calculate percentage changed
    const changePercentage = useMemo(() => {
        if (!stats || stats.unchangedLines === 0) return 0;
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
        setShareDialogOpen(true);
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

    return (
        <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
                <TextEditor
                    label="Original Text"
                    value={leftText}
                    onChange={setLeftText}
                    onError={handleLeftError}
                    height="400px"
                />

                <TextEditor
                    label="Modified Text"
                    value={rightText}
                    onChange={setRightText}
                    onError={handleRightError}
                    height="400px"
                />
            </div>

            {hasContent && stats && (
                <div className="flex items-center justify-between gap-4 text-sm text-muted-foreground border-t pt-4">
                    <div className="flex items-center gap-4">
                        <span className="font-medium text-green-600">+{stats.addedLines}</span>
                        <span className="font-medium text-red-600">−{stats.removedLines}</span>
                        <span className="font-medium">~{stats.unchangedLines}</span>
                        <Separator orientation="vertical" className="h-4" />
                        <span className="font-medium">{changePercentage}% changed</span>
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            onClick={handleShare}
                            className="h-8 w-8 inline-flex items-center justify-center rounded-md hover:bg-accent transition-colors"
                            title="Share diff"
                        >
                            <Share2 className="h-4 w-4" />
                        </button>

                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <button
                                    type="button"
                                    className="h-8 w-8 inline-flex items-center justify-center rounded-md hover:bg-accent transition-colors"
                                    title="More options"
                                >
                                    <MoreVertical className="h-4 w-4" />
                                </button>
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
                </div>
            )}

            <DiffResults leftText={leftText} rightText={rightText} />

            {/* Share Dialog */}
            <TextDiffShareDialog
                leftContent={leftText}
                rightContent={rightText}
                stats={stats}
                changePercentage={changePercentage}
                open={shareDialogOpen}
                onOpenChange={setShareDialogOpen}
            />
        </div>
    );
}
