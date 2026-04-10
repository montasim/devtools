'use client';

import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { Toolbar } from '@/components/toolbar';
import { MinifyPane, MinifyShareDialog } from '@/components/minify-pane';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { Trash2, Share2 } from 'lucide-react';

interface MinifyTabProps {
    onClear: () => void;
}

export function MinifyTab({ onClear }: MinifyTabProps) {
    const [minifySortKeys, setMinifySortKeys] = useState(false);
    const [minifyRemoveWhitespace, setMinifyRemoveWhitespace] = useState(true);
    const [minifyShareDialogOpen, setMinifyShareDialogOpen] = useState(false);
    const [minifyContent, setMinifyContent] = useState('');
    const [showClearDialog, setShowClearDialog] = useState(false);

    // Load minify content from localStorage on mount and keep in sync
    useEffect(() => {
        const loadMinifyContent = () => {
            try {
                const content = localStorage.getItem('json-minify-left-content') || '';
                setMinifyContent(content);
            } catch (error) {
                console.error('Failed to load minify content:', error);
            }
        };

        loadMinifyContent();

        // Listen for storage changes
        const handleStorageChange = () => {
            loadMinifyContent();
        };

        window.addEventListener('storage', handleStorageChange);
        return () => window.removeEventListener('storage', handleStorageChange);
    }, []);

    const handleError = (error: Error) => {
        console.error('Minify error:', error);
    };

    const handleMinifyShare = useCallback(() => {
        // Get the minified content from localStorage
        const minifiedContent = localStorage.getItem('json-minify-left-content');
        if (!minifiedContent) {
            toast.error('No content to share. Please enter some JSON first.');
            return;
        }

        // Open the share dialog
        setMinifyShareDialogOpen(true);
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
                />
            </div>

            <MinifyShareDialog
                content={minifyContent}
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
