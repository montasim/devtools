'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { Toolbar } from '@/components/toolbar';
import { EditorPane, type EditorPaneRef } from '@/components/editor';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { STORAGE_KEYS } from '@/lib/constants';

interface JsonDiffTabProps {
    onClear: () => void;
    sharedData?: any;
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
                    initialLeftContent={sharedData?.state?.input}
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
