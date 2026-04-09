'use client';

import { useState, useRef, useCallback } from 'react';
import { Toolbar } from '@/components/toolbar';
import { EditorPane, type EditorPaneRef } from '@/components/editor-pane';

export default function Home() {
    const [ignoreKeyOrder, setIgnoreKeyOrder] = useState(true);
    const [prettyPrint, setPrettyPrint] = useState(true);
    const [ignoreWhitespace, setIgnoreWhitespace] = useState(false);
    const [semanticTypeDiff, setSemanticTypeDiff] = useState(false);
    const [canCompare, setCanCompare] = useState(false);
    const [isComputing, setIsComputing] = useState(false);

    const editorPaneRef = useRef<EditorPaneRef>(null);

    const handleCompare = useCallback(
        (result: { hunks: unknown[]; additionCount: number; deletionCount: number }) => {
            console.log('Diff result:', result);
        },
        [],
    );

    const handleError = (error: Error) => {
        console.error('Diff error:', error);
    };

    const handleValidationChange = useCallback((isValid: boolean) => {
        setCanCompare(isValid);
        // Update computing state from ref
        setIsComputing(editorPaneRef.current?.isComputing ?? false);
    }, []);

    const handleClear = () => {
        // Reload page to clear all content
        window.location.reload();
    };

    const handleCompareClick = async () => {
        if (editorPaneRef.current) {
            setIsComputing(true);
            await editorPaneRef.current.triggerCompare();
            setIsComputing(false);
        }
    };

    return (
        <div className="min-h-screen">
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
                        onClick: handleClear,
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
                />
            </div>
        </div>
    );
}
