'use client';

import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { Toolbar } from '@/components/toolbar';
import { ExportPane, ExportShareDialog } from '@/components/export-pane';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { Trash2, Share2 } from 'lucide-react';

interface ExportTabProps {
    onClear: () => void;
}

export function ExportTab({ onClear }: ExportTabProps) {
    const [exportFormat] = useState<'csv' | 'xml' | 'yaml' | 'toml' | 'json'>('csv');
    const [exportShareDialogOpen, setExportShareDialogOpen] = useState(false);
    const [exportContent, setExportContent] = useState('');
    const [showClearDialog, setShowClearDialog] = useState(false);

    // Load export content from localStorage on mount and keep in sync
    useEffect(() => {
        const loadExportContent = () => {
            try {
                const content = localStorage.getItem('json-export-content') || '';
                setExportContent(content);
            } catch (error) {
                console.error('Failed to load export content:', error);
            }
        };

        loadExportContent();

        // Listen for storage changes
        const handleStorageChange = () => {
            loadExportContent();
        };

        window.addEventListener('storage', handleStorageChange);
        return () => window.removeEventListener('storage', handleStorageChange);
    }, []);

    const handleError = (error: Error) => {
        console.error('Export error:', error);
    };

    const handleExportShare = useCallback(() => {
        // Get the export content from localStorage
        const exportContentData = localStorage.getItem('json-export-content');
        if (!exportContentData) {
            toast.error('No content to share. Please enter some JSON first.');
            return;
        }

        // Open the share dialog
        setExportShareDialogOpen(true);
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
                    toggles={[]}
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
                            onClick: handleExportShare,
                            variant: 'outline',
                            icon: <Share2 className="h-4 w-4" />,
                        },
                    ]}
                />

                <ExportPane
                    className="mx-auto"
                    onError={handleError}
                    onValidationChange={() => {}}
                />
            </div>

            <ExportShareDialog
                content={exportContent}
                format={exportFormat}
                open={exportShareDialogOpen}
                onOpenChange={setExportShareDialogOpen}
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
