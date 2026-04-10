'use client';

import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { Toolbar } from '@/components/toolbar';
import { SchemaPane, SchemaShareDialog } from '@/components/schema-pane';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { Trash2, Share2 } from 'lucide-react';

interface SchemaTabProps {
    onClear: () => void;
}

export function SchemaTab({ onClear }: SchemaTabProps) {
    const [schemaMode, setSchemaMode] = useState<'generate' | 'validate'>('generate');
    const [schemaShareDialogOpen, setSchemaShareDialogOpen] = useState(false);
    const [schemaContent, setSchemaContent] = useState('');
    const [showClearDialog, setShowClearDialog] = useState(false);

    // Load schema content from localStorage on mount and keep in sync
    useEffect(() => {
        const loadSchemaContent = () => {
            try {
                const content = localStorage.getItem('json-schema-json-content') || '';
                setSchemaContent(content);
            } catch (error) {
                console.error('Failed to load schema content:', error);
            }
        };

        loadSchemaContent();

        const handleStorageChange = () => {
            loadSchemaContent();
        };

        window.addEventListener('storage', handleStorageChange);
        return () => window.removeEventListener('storage', handleStorageChange);
    }, []);

    const handleError = (error: Error) => {
        console.error('Schema error:', error);
    };

    const handleSchemaShare = useCallback(() => {
        // Get the schema content from localStorage
        const schemaContentData = localStorage.getItem('json-schema-json-content');
        if (!schemaContentData) {
            toast.error('No content to share. Please enter some JSON first.');
            return;
        }

        // Open the share dialog
        setSchemaShareDialogOpen(true);
    }, []);

    const handleContentChange = (_jsonContent: string, schemaContent: string) => {
        setSchemaContent(schemaContent);
    };

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
                />
            </div>

            <SchemaShareDialog
                content={schemaContent}
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
