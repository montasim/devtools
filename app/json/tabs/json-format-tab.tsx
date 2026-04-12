'use client';

import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { Toolbar } from '@/components/toolbar';
import { FormatPane, FormatShareDialog } from '@/components/format';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { Trash2, Share2 } from 'lucide-react';
import { STORAGE_KEYS } from '@/lib/constants';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';

interface JsonFormatTabProps {
    onClear: () => void;
}

export function JsonFormatTab({ onClear }: JsonFormatTabProps) {
    const [formatIndentation, setFormatIndentation] = useState(2);
    const [showClearDialog, setShowClearDialog] = useState(false);
    const [formatSortKeys, setFormatSortKeys] = useState(false);
    const [formatRemoveTrailingCommas, setFormatRemoveTrailingCommas] = useState(false);
    const [formatEscapeUnicode, setFormatEscapeUnicode] = useState(false);
    const [shareDialogOpen, setShareDialogOpen] = useState(false);
    const [formatContent, setFormatContent] = useState('');

    const spacingOptions = [
        { value: '2', label: '2 spaces' },
        { value: '4', label: '4 spaces' },
        { value: '8', label: '8 spaces' },
    ];

    // Load format content from localStorage on mount and keep in sync
    useEffect(() => {
        const loadFormatContent = () => {
            try {
                const content = localStorage.getItem(STORAGE_KEYS.JSON_FORMAT_LEFT_CONTENT) || '';
                setFormatContent(content);
            } catch (error) {
                console.error('Failed to load format content:', error);
            }
        };

        loadFormatContent();

        // Listen for storage changes
        const handleStorageChange = () => {
            loadFormatContent();
        };

        window.addEventListener('storage', handleStorageChange);
        return () => window.removeEventListener('storage', handleStorageChange);
    }, []);

    const handleError = (error: Error) => {
        console.error('Format error:', error);
    };

    const handleFormatShare = useCallback(() => {
        // Get the formatted content from localStorage
        const formattedContent = localStorage.getItem(STORAGE_KEYS.JSON_FORMAT_LEFT_CONTENT);
        if (!formattedContent) {
            toast.error('No content to share. Please enter some JSON first.');
            return;
        }

        // Open the share dialog
        setShareDialogOpen(true);
    }, []);

    const handleClearClick = () => {
        setShowClearDialog(true);
    };

    const handleConfirmClear = () => {
        setShowClearDialog(false);
        onClear();
    };

    const handleIndentChange = (value: string) => {
        const indent = parseInt(value);
        if (!isNaN(indent) && indent > 0) {
            setFormatIndentation(indent);
        }
    };

    const spacingSelector = (
        <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Spacing:</span>
            <Select value={String(formatIndentation)} onValueChange={handleIndentChange}>
                <SelectTrigger className="h-8 w-[100px] text-xs">
                    <SelectValue placeholder="Spaces" />
                </SelectTrigger>
                <SelectContent>
                    {spacingOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                            {option.label}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
            <Separator orientation="vertical" className="h-8" />
        </div>
    );

    return (
        <>
            <div>
                <Toolbar
                    leftContent={spacingSelector}
                    toggles={[
                        {
                            id: 'sortKeys',
                            label: 'Sort Keys',
                            checked: formatSortKeys,
                            onChange: setFormatSortKeys,
                        },
                        {
                            id: 'removeTrailingCommas',
                            label: 'Remove Trailing Commas',
                            checked: formatRemoveTrailingCommas,
                            onChange: setFormatRemoveTrailingCommas,
                        },
                        {
                            id: 'escapeUnicode',
                            label: 'Escape Unicode',
                            checked: formatEscapeUnicode,
                            onChange: setFormatEscapeUnicode,
                        },
                    ]}
                    actions={[
                        {
                            id: 'clear',
                            label: 'Clear All',
                            onClick: handleClearClick,
                            variant: 'outline',
                            icon: <Trash2 className="h-4 w-4" />,
                        },
                        {
                            id: 'share',
                            label: 'Share',
                            onClick: handleFormatShare,
                            variant: 'outline',
                            icon: <Share2 className="h-4 w-4" />,
                        },
                    ]}
                />

                <FormatPane
                    className="mx-auto"
                    indentation={formatIndentation}
                    sortKeys={formatSortKeys}
                    removeTrailingCommas={formatRemoveTrailingCommas}
                    escapeUnicode={formatEscapeUnicode}
                    onError={handleError}
                    onValidationChange={() => {}}
                />
            </div>

            <FormatShareDialog
                content={formatContent}
                open={shareDialogOpen}
                onOpenChange={setShareDialogOpen}
            />

            <ConfirmDialog
                open={showClearDialog}
                onOpenChange={setShowClearDialog}
                title="Clear All Content"
                description="Are you sure you want to clear all content? This will reload the page and remove all unsaved data."
                confirmLabel="Clear All"
                cancelLabel="Cancel"
                onConfirm={handleConfirmClear}
                variant="destructive"
            />
        </>
    );
}
