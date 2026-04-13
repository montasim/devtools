'use client';

import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { Toolbar } from '@/components/toolbar';
import { ParserPane, ParserShareDialog } from '@/components/parser';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { Trash2, Share2 } from 'lucide-react';
import { STORAGE_KEYS } from '@/lib/constants';

interface ParserTabProps {
    onClear: () => void;
    sharedData?: any;
}

export function JsonParserTab({ onClear, sharedData }: ParserTabProps) {
    const [parserShowTypes, setParserShowTypes] = useState(true);
    const [parserShowPaths, setParserShowPaths] = useState(true);
    const [parserShowStatistics, setParserShowStatistics] = useState(true);
    const [parserShareDialogOpen, setParserShareDialogOpen] = useState(false);
    const [currentContent, setCurrentContent] = useState('');
    const [showClearDialog, setShowClearDialog] = useState(false);

    const handleError = (error: Error) => {
        console.error('Parser error:', error);
    };

    const handleContentChange = useCallback((content: string) => {
        setCurrentContent(content);
    }, []);

    const handleParserShare = useCallback(() => {
        // Use the current content from state instead of localStorage
        if (!currentContent) {
            toast.error('No content to share. Please enter some JSON first.');
            return;
        }

        // Open the share dialog
        setParserShareDialogOpen(true);
    }, [currentContent]);

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
                            checked: parserShowTypes,
                            onChange: setParserShowTypes,
                        },
                        {
                            id: 'showPaths',
                            label: 'Show Paths',
                            checked: parserShowPaths,
                            onChange: setParserShowPaths,
                        },
                        {
                            id: 'showStatistics',
                            label: 'Show Statistics',
                            checked: parserShowStatistics,
                            onChange: setParserShowStatistics,
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
                            onClick: handleParserShare,
                            variant: 'outline',
                            icon: <Share2 className="h-4 w-4" />,
                        },
                    ]}
                />

                <ParserPane
                    className="mx-auto"
                    showTypes={parserShowTypes}
                    showPaths={parserShowPaths}
                    showStatistics={parserShowStatistics}
                    onError={handleError}
                    onValidationChange={() => {}}
                    onContentChange={handleContentChange}
                    initialContent={sharedData?.state?.input}
                />
            </div>

            <ParserShareDialog
                content={currentContent}
                open={parserShareDialogOpen}
                onOpenChange={setParserShareDialogOpen}
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
