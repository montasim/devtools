'use client';

import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import { Toolbar } from '@/components/toolbar';
import { ExportPane, ExportShareDialog } from '@/components/export';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { Trash2, Share2, Bookmark } from 'lucide-react';
import { Combobox } from '@/components/ui/combobox';
import type { ExportFormat } from '@/components/export/types';
import { saveJsonContent } from '@/lib/json-save-utils';

interface JsonExportTabProps {
    onClear: () => void;
    sharedData?: {
        title?: string;
        comment?: string | null;
        expiresAt?: string | null;
        hasPassword?: boolean;
        viewCount?: number;
        createdAt?: string;
        tabName?: string;
        state?: {
            leftContent?: string;
            rightContent?: string;
        };
    } | null;
}

export function JsonExportTab({ onClear, sharedData }: JsonExportTabProps) {
    const [exportFormat, setExportFormat] = useState<ExportFormat>('csv');
    const [exportShareDialogOpen, setExportShareDialogOpen] = useState(false);
    const [currentContent, setCurrentContent] = useState('');
    const [showClearDialog, setShowClearDialog] = useState(false);

    const handleError = (error: Error) => {
        console.error('Export error:', error);
    };

    const handleContentChange = useCallback((content: string) => {
        setCurrentContent(content);
    }, []);

    const handleExportShare = useCallback(() => {
        // Use the current content from state instead of localStorage
        if (!currentContent) {
            toast.error('No content to share. Please enter some JSON first.');
            return;
        }

        // Open the share dialog
        setExportShareDialogOpen(true);
    }, [currentContent]);

    const handleClearClick = () => {
        setShowClearDialog(true);
    };

    const handleConfirmClear = () => {
        setShowClearDialog(false);
        onClear();
    };

    const handleSave = useCallback(() => {
        saveJsonContent('JSON Export', currentContent);
    }, [currentContent]);

    const formatOptions: { value: ExportFormat; label: string; extension: string }[] = [
        { value: 'csv', label: 'CSV', extension: 'csv' },
        { value: 'xml', label: 'XML', extension: 'xml' },
        { value: 'yaml', label: 'YAML', extension: 'yaml' },
        { value: 'toml', label: 'TOML', extension: 'toml' },
        { value: 'json', label: 'JSON', extension: 'json' },
    ];

    const formatSelector = (
        <Combobox
            options={formatOptions.map((opt) => ({ value: opt.value, label: opt.label }))}
            value={exportFormat}
            onChange={(value) => setExportFormat(value as ExportFormat)}
            placeholder="Format"
        />
    );

    return (
        <>
            <div>
                <Toolbar
                    toggles={[]}
                    leftContent={formatSelector}
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
                    onContentChange={handleContentChange}
                    exportFormat={exportFormat}
                    onExportFormatChange={setExportFormat}
                    initialContent={sharedData?.state?.leftContent}
                />
            </div>

            <ExportShareDialog
                content={currentContent}
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
