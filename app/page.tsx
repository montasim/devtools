'use client';

import { useState } from 'react';
import { Toolbar } from '@/components/toolbar';
import { EditorPane } from '@/components/editor-pane';

export default function Home() {
    const [ignoreKeyOrder, setIgnoreKeyOrder] = useState(true);
    const [prettyPrint, setPrettyPrint] = useState(true);
    const [ignoreWhitespace, setIgnoreWhitespace] = useState(false);
    const [semanticTypeDiff, setSemanticTypeDiff] = useState(false);

    const handleCompare = (result: any) => {
        console.log('Diff result:', result);
    };

    const handleError = (error: Error) => {
        console.error('Diff error:', error);
    };

    const handleClear = () => {
        // Reload page to clear all content
        window.location.reload();
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
                ]}
            />

            <div className="container mx-auto px-4 py-8">
                <h1 className="text-3xl font-bold mb-6 text-gray-900 dark:text-gray-100">
                    JSON Diff Viewer
                </h1>

                <EditorPane
                    ignoreKeyOrder={ignoreKeyOrder}
                    prettyPrint={prettyPrint}
                    ignoreWhitespace={ignoreWhitespace}
                    semanticTypeDiff={semanticTypeDiff}
                    initialLeftContent={`{\n  "name": "John Doe",\n  "age": 30\n}`}
                    initialRightContent={`{\n  "age": 30,\n  "name": "John Doe"\n}`}
                    onCompare={handleCompare}
                    onError={handleError}
                />
            </div>
        </div>
    );
}
