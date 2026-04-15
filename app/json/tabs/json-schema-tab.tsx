'use client';

import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import { Toolbar } from '@/components/toolbar';
import { SchemaPane, SchemaShareDialog } from '@/components/schema';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { Trash2, Share2, Bookmark } from 'lucide-react';
import { saveJsonContent } from '@/lib/json-save-utils';

interface SchemaTabProps {
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

export function JsonSchemaTab({ onClear, sharedData }: SchemaTabProps) {
    const [schemaMode, setSchemaMode] = useState<'generate' | 'validate'>('generate');
    const [schemaShareDialogOpen, setSchemaShareDialogOpen] = useState(false);
    const [currentJsonContent, setCurrentJsonContent] = useState('');
    const [showClearDialog, setShowClearDialog] = useState(false);

    const handleError = (error: Error) => {
        console.error('Schema error:', error);
    };

    const handleContentChange = useCallback((jsonContent: string) => {
        setCurrentJsonContent(jsonContent);
    }, []);

    const handleSchemaShare = useCallback(() => {
        // Use the current content from state instead of localStorage
        if (!currentJsonContent) {
            toast.error('No content to share. Please enter some JSON first.');
            return;
        }

        // Open the share dialog
        setSchemaShareDialogOpen(true);
    }, [currentJsonContent]);

    const handleClearClick = () => {
        setShowClearDialog(true);
    };

    const handleConfirmClear = () => {
        setShowClearDialog(false);
        onClear();
    };

    const handleSave = useCallback(() => {
        saveJsonContent('JSON Schema', currentJsonContent);
    }, [currentJsonContent]);

    return (
        <>
            <div>
                <Toolbar
                    toggles={[
                        {
                            id: 'schema-generate',
                            label: 'Generate Schema',
                            checked: schemaMode === 'generate',
                            onChange: () => setSchemaMode('generate'),
                        },
                        {
                            id: 'schema-validate',
                            label: 'Validate JSON',
                            checked: schemaMode === 'validate',
                            onChange: () => setSchemaMode('validate'),
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
                            onClick: handleSchemaShare,
                            variant: 'outline',
                            icon: <Share2 className="h-4 w-4" />,
                        },
                    ]}
                />

                <SchemaPane
                    mode={schemaMode}
                    className="mx-auto"
                    onError={handleError}
                    onValidationChange={() => {}}
                    onContentChange={handleContentChange}
                    initialJsonContent={sharedData?.state?.input}
                />
            </div>

            <SchemaShareDialog
                content={currentJsonContent}
                mode={schemaMode}
                open={schemaShareDialogOpen}
                onOpenChange={setSchemaShareDialogOpen}
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
