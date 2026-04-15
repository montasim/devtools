'use client';

import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import { Toolbar } from '@/components/toolbar';
import { MinifyPane, MinifyShareDialog } from '@/components/minify';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { Trash2, Share2, Bookmark } from 'lucide-react';
import { saveJsonContent } from '@/lib/json-save-utils';

interface MinifyTabProps {
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

export function JsonMinifyTab({ onClear, sharedData }: MinifyTabProps) {
    const [minifySortKeys, setMinifySortKeys] = useState(false);
    const [minifyRemoveWhitespace, setMinifyRemoveWhitespace] = useState(true);
    const [minifyShareDialogOpen, setMinifyShareDialogOpen] = useState(false);
    const [currentContent, setCurrentContent] = useState('');
    const [showClearDialog, setShowClearDialog] = useState(false);

    const handleError = (error: Error) => {
        console.error('Minify error:', error);
    };

    const handleContentChange = useCallback((content: string) => {
        setCurrentContent(content);
    }, []);

    const handleMinifyShare = useCallback(() => {
        // Use the current content from state instead of localStorage
        if (!currentContent) {
            toast.error('No content to share. Please enter some JSON first.');
            return;
        }

        // Open the share dialog
        setMinifyShareDialogOpen(true);
    }, [currentContent]);

    const handleClearClick = () => {
        setShowClearDialog(true);
    };

    const handleConfirmClear = () => {
        setShowClearDialog(false);
        onClear();
    };

    const handleSave = useCallback(() => {
        saveJsonContent('JSON Minify', currentContent);
    }, [currentContent]);

    return (
        <>
            <div>
                <Toolbar
                    toggles={[
                        {
                            id: 'sortKeys',
                            label: 'Sort Keys',
                            checked: minifySortKeys,
                            onChange: setMinifySortKeys,
                        },
                        {
                            id: 'removeWhitespace',
                            label: 'Remove Whitespace',
                            checked: minifyRemoveWhitespace,
                            onChange: setMinifyRemoveWhitespace,
                        },
                    ]}
                    actions={[
                        {
                            id: 'save',
                            label: 'Save',
                            onClick: handleSave,
                            variant: 'outline',
                            icon: <Bookmark className="h-4 w-4" />,
                        },
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
                            onClick: handleMinifyShare,
                            variant: 'outline',
                            icon: <Share2 className="h-4 w-4" />,
                        },
                    ]}
                />

                <MinifyPane
                    className="mx-auto"
                    sortKeys={minifySortKeys}
                    removeWhitespace={minifyRemoveWhitespace}
                    onError={handleError}
                    onValidationChange={() => {}}
                    onContentChange={handleContentChange}
                    initialLeftContent={sharedData?.state?.input}
                />
            </div>

            <MinifyShareDialog
                content={currentContent}
                open={minifyShareDialogOpen}
                onOpenChange={setMinifyShareDialogOpen}
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
