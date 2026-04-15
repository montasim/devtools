'use client';

import { useState, useRef, useCallback } from 'react';
import { Toolbar } from '@/components/toolbar';
import { EditorPane, type EditorPaneRef } from '@/components/editor';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { Bookmark } from 'lucide-react';
import { saveJsonContent } from '@/lib/json-save-utils';

interface JsonDiffTabProps {
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

export function JsonDiffTab({ onClear, sharedData }: JsonDiffTabProps) {
    const [ignoreKeyOrder, setIgnoreKeyOrder] = useState(true);
    const [showClearDialog, setShowClearDialog] = useState(false);
    const [prettyPrint, setPrettyPrint] = useState(true);
    const [ignoreWhitespace, setIgnoreWhitespace] = useState(false);
    const [semanticTypeDiff, setSemanticTypeDiff] = useState(false);
    const [canCompare, setCanCompare] = useState(false);
    const [isComputing, setIsComputing] = useState(false);
    const [currentLeftContent, setCurrentLeftContent] = useState('');
    const [currentRightContent, setCurrentRightContent] = useState('');

    const editorPaneRef = useRef<EditorPaneRef | null>(null);

    const handleCompare = useCallback(() => {
        // Diff result handling - reserved for future use
    }, []);

    const handleError = (error: Error) => {
        console.error('Diff error:', error);
    };

    const handleValidationChange = useCallback((isValid: boolean) => {
        setCanCompare(isValid);
        setIsComputing(editorPaneRef.current?.isComputing ?? false);
    }, []);

    const handleContentChange = useCallback((leftContent: string, rightContent: string) => {
        setCurrentLeftContent(leftContent);
        setCurrentRightContent(rightContent);
    }, []);

    const handleCompareClick = async () => {
        if (editorPaneRef.current) {
            setIsComputing(true);
            await editorPaneRef.current.triggerCompare();
            setIsComputing(false);
        }
    };

    const handleClearClick = () => {
        setShowClearDialog(true);
    };

    const handleConfirmClear = () => {
        setShowClearDialog(false);
        onClear();
    };

    const handleSave = useCallback(() => {
        const contentToSave = currentLeftContent || currentRightContent;
        saveJsonContent('JSON Diff', contentToSave);
    }, [currentLeftContent, currentRightContent]);

    return (
        <div>
            <Toolbar
                toggles={[
                    {
                        id: 'ignoreKeyOrder',
                        label: 'Ignore Key Order',
                        checked: ignoreKeyOrder,
                        onChange: setIgnoreKeyOrder,
                    },
                    {
                        id: 'prettyPrint',
                        label: 'Pretty Print',
                        checked: prettyPrint,
                        onChange: setPrettyPrint,
                    },
                    {
                        id: 'ignoreWhitespace',
                        label: 'Ignore Whitespace',
                        checked: ignoreWhitespace,
                        onChange: setIgnoreWhitespace,
                    },
                    {
                        id: 'semanticTypeDiff',
                        label: 'Semantic Type Diff',
                        checked: semanticTypeDiff,
                        onChange: setSemanticTypeDiff,
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
                    },
                    {
                        id: 'compare',
                        label: isComputing ? 'Computing...' : 'Compare',
                        onClick: handleCompareClick,
                        variant: 'default',
                        disabled: !canCompare || isComputing,
                    },
                ]}
            />

            <div className="mx-auto">
                <EditorPane
                    ref={editorPaneRef}
                    ignoreKeyOrder={ignoreKeyOrder}
                    prettyPrint={prettyPrint}
                    ignoreWhitespace={ignoreWhitespace}
                    semanticTypeDiff={semanticTypeDiff}
                    onCompare={handleCompare}
                    onError={handleError}
                    onValidationChange={handleValidationChange}
                    onContentChange={handleContentChange}
                    initialLeftContent={sharedData?.state?.leftContent}
                    initialRightContent={sharedData?.state?.rightContent}
                />
            </div>

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
        </div>
    );
}
