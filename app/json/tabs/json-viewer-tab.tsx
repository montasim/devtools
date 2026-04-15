'use client';

import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import { Toolbar } from '@/components/toolbar';
import { ViewerPane, ViewerShareDialog } from '@/components/viewer';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { Trash2, Share2, Bookmark } from 'lucide-react';
import { saveJsonContent } from '@/lib/json-save-utils';

interface ViewerTabProps {
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

export function JsonViewerTab({ onClear, sharedData }: ViewerTabProps) {
    const [viewerShowTypes, setViewerShowTypes] = useState(false);
    const [viewerShowPaths, setViewerShowPaths] = useState(false);
    const [viewerSortKeys, setViewerSortKeys] = useState(false);
    const [viewerShareDialogOpen, setViewerShareDialogOpen] = useState(false);
    const [currentContent, setCurrentContent] = useState('');
    const [showClearDialog, setShowClearDialog] = useState(false);

    const handleError = (error: Error) => {
        console.error('Viewer error:', error);
    };

    const handleContentChange = useCallback((content: string) => {
        setCurrentContent(content);
    }, []);

    const handleViewerShare = useCallback(() => {
        // Use the current content from state instead of localStorage
        if (!currentContent) {
            toast.error('No content to share. Please enter some JSON first.');
            return;
        }

        // Open the share dialog
        setViewerShareDialogOpen(true);
    }, [currentContent]);

    const handleClearClick = () => {
        setShowClearDialog(true);
    };

    const handleConfirmClear = () => {
        setShowClearDialog(false);
        onClear();
    };

    const handleSave = useCallback(() => {
        saveJsonContent('JSON Viewer', currentContent);
    }, [currentContent]);

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
                    onContentChange={handleContentChange}
                    initialContent={sharedData?.state?.input}
                />
            </div>

            <ViewerShareDialog
                content={currentContent}
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
