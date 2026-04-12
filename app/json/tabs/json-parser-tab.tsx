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
}

export function JsonParserTab({ onClear }: ParserTabProps) {
    const [parserShowTypes, setParserShowTypes] = useState(true);
    const [parserShowPaths, setParserShowPaths] = useState(true);
    const [parserShowStatistics, setParserShowStatistics] = useState(true);
    const [parserShareDialogOpen, setParserShareDialogOpen] = useState(false);
    const [parserContent, setParserContent] = useState('');
    const [showClearDialog, setShowClearDialog] = useState(false);

    // Load parser content from localStorage on mount and keep in sync
    useEffect(() => {
        const loadParserContent = () => {
            try {
                const content = localStorage.getItem(STORAGE_KEYS.JSON_PARSER_CONTENT) || '';
                setParserContent(content);
            } catch (error) {
                console.error('Failed to load parser content:', error);
            }
        };

        loadParserContent();

        // Listen for storage changes
        const handleStorageChange = () => {
            loadParserContent();
        };

        window.addEventListener('storage', handleStorageChange);
        return () => window.removeEventListener('storage', handleStorageChange);
    }, []);

    const handleError = (error: Error) => {
        console.error('Parser error:', error);
    };

    const handleParserShare = useCallback(() => {
        // Get the parser content from localStorage
        const parserContentData = localStorage.getItem(STORAGE_KEYS.JSON_PARSER_CONTENT);
        if (!parserContentData) {
            toast.error('No content to share. Please enter some JSON first.');
            return;
        }

        // Open the share dialog
        setParserShareDialogOpen(true);
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
                />
            </div>

            <ParserShareDialog
                content={parserContent}
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
