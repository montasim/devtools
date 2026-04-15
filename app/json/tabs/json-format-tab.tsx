'use client';

import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import { Toolbar } from '@/components/toolbar';
import { FormatPane, FormatShareDialog } from '@/components/format';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { Trash2, Share2, Bookmark } from 'lucide-react';
import { saveJsonContent } from '@/lib/json-save-utils';
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
    sharedData?: {
        title?: string;
        comment?: string;
        expiresAt?: string;
        hasPassword?: boolean;
        viewCount?: number;
        createdAt?: string;
    };
}

export function JsonFormatTab({ onClear, sharedData }: JsonFormatTabProps) {
    const [formatIndentation, setFormatIndentation] = useState(2);
    const [showClearDialog, setShowClearDialog] = useState(false);
    const [formatSortKeys, setFormatSortKeys] = useState(false);
    const [formatRemoveTrailingCommas, setFormatRemoveTrailingCommas] = useState(false);
    const [formatEscapeUnicode, setFormatEscapeUnicode] = useState(false);
    const [shareDialogOpen, setShareDialogOpen] = useState(false);
    const [currentContent, setCurrentContent] = useState('');

    const spacingOptions = [
        { value: '2', label: '2 spaces' },
        { value: '4', label: '4 spaces' },
        { value: '8', label: '8 spaces' },
    ];

    const handleError = (error: Error) => {
        console.error('Format error:', error);
    };

    const handleContentChange = useCallback((content: string) => {
        setCurrentContent(content);
    }, []);

    const handleFormatShare = useCallback(() => {
        // Use the current content from state instead of localStorage
        if (!currentContent) {
            toast.error('No content to share. Please enter some JSON first.');
            return;
        }

        // Open the share dialog
        setShareDialogOpen(true);
    }, [currentContent]);

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

    const handleSave = useCallback(() => {
        saveJsonContent('JSON Format', currentContent);
    }, [currentContent]);

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
                            id: 'save',
                            label: 'Save',
                            onClick: handleSave,
                            variant: 'outline',
                            icon: <Bookmark className="h-4 w-4" />,
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
                    onContentChange={handleContentChange}
                    initialLeftContent={sharedData?.state?.input}
                />
            </div>

            <FormatShareDialog
                content={currentContent}
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
