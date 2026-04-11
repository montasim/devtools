'use client';

import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { Toolbar } from '@/components/toolbar';
import { ViewerPane, ViewerShareDialog } from '@/components/viewer-pane';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { Trash2, Share2 } from 'lucide-react';
import { STORAGE_KEYS } from '@/lib/constants';

interface ViewerTabProps {
    onClear: () => void;
}

export function ViewerTab({ onClear }: ViewerTabProps) {
    const [viewerShowTypes, setViewerShowTypes] = useState(false);
    const [viewerShowPaths, setViewerShowPaths] = useState(false);
    const [viewerSortKeys, setViewerSortKeys] = useState(false);
    const [viewerShareDialogOpen, setViewerShareDialogOpen] = useState(false);
    const [viewerContent, setViewerContent] = useState('');
    const [showClearDialog, setShowClearDialog] = useState(false);

    // Load viewer content from localStorage on mount and keep in sync
    useEffect(() => {
        const loadViewerContent = () => {
            try {
                const content = localStorage.getItem(STORAGE_KEYS.JSON_VIEWER_CONTENT) || '';
                setViewerContent(content);
            } catch (error) {
                console.error('Failed to load viewer content:', error);
            }
        };

        loadViewerContent();

        // Listen for storage changes
        const handleStorageChange = () => {
            loadViewerContent();
        };

        window.addEventListener('storage', handleStorageChange);
        return () => window.removeEventListener('storage', handleStorageChange);
    }, []);

    const handleError = (error: Error) => {
        console.error('Viewer error:', error);
    };

    const handleViewerShare = useCallback(() => {
        // Get the viewer content from localStorage
        const viewerContentData = localStorage.getItem(STORAGE_KEYS.JSON_VIEWER_CONTENT);
        if (!viewerContentData) {
            toast.error('No content to share. Please enter some JSON first.');
            return;
        }

        // Open the share dialog
        setViewerShareDialogOpen(true);
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
                            id: 'showTypes',
                            label: 'Show Types',
                            checked: viewerShowTypes,
                            onChange: setViewerShowTypes,
                        },
                        {
                            id: 'showPaths',
                            label: 'Show Paths',
                            checked: viewerShowPaths,
                            onChange: setViewerShowPaths,
                        },
                        {
                            id: 'sortKeys',
                            label: 'Sort Keys',
                            checked: viewerSortKeys,
                            onChange: setViewerSortKeys,
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
                            onClick: handleViewerShare,
                            variant: 'outline',
                            icon: <Share2 className="h-4 w-4" />,
                        },
                    ]}
                />

                <ViewerPane
                    className="mx-auto"
                    showTypes={viewerShowTypes}
                    showPaths={viewerShowPaths}
                    sortKeys={viewerSortKeys}
                    onError={handleError}
                    onValidationChange={() => {}}
                />
            </div>

            <ViewerShareDialog
                content={viewerContent}
                open={viewerShareDialogOpen}
                onOpenChange={setViewerShareDialogOpen}
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
