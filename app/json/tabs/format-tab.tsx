'use client';

import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { Toolbar } from '@/components/toolbar';
import { FormatPane, FormatShareDialog } from '@/components/format-pane';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { Trash2, Share2 } from 'lucide-react';

interface FormatTabProps {
    onClear: () => void;
}

export function FormatTab({ onClear }: FormatTabProps) {
    const [formatIndentation, setFormatIndentation] = useState(2);
    const [showClearDialog, setShowClearDialog] = useState(false);
    const [formatSortKeys, setFormatSortKeys] = useState(false);
    const [formatRemoveTrailingCommas, setFormatRemoveTrailingCommas] = useState(false);
    const [formatEscapeUnicode, setFormatEscapeUnicode] = useState(false);
    const [shareDialogOpen, setShareDialogOpen] = useState(false);
    const [formatContent, setFormatContent] = useState('');

    // Load format content from localStorage on mount and keep in sync
    useEffect(() => {
        const loadFormatContent = () => {
            try {
                const content = localStorage.getItem('json-format-left-content') || '';
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
        const formattedContent = localStorage.getItem('json-format-left-content');
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

    return (
        <>
            <div>
                <Toolbar
                    toggles={[
                        {
                            id: 'indentation',
                            label: 'Indentation',
                            checked: formatIndentation === 4,
                            onChange: () => setFormatIndentation(formatIndentation === 2 ? 4 : 2),
                        },
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
                    onIndentationChange={setFormatIndentation}
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
