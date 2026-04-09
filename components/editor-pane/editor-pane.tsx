'use client';

import { useState, useCallback } from 'react';
import { EditorPaneProps } from './types';
import { JsonEditor } from './json-editor';
import { DiffPanel } from './diff-panel';
import { useJsonDiff } from './use-json-diff';

export function EditorPane({
    ignoreKeyOrder,
    prettyPrint,
    ignoreWhitespace,
    semanticTypeDiff,
    initialLeftContent = '',
    initialRightContent = '',
    onCompare,
    onError,
    className,
}: EditorPaneProps) {
    // State
    const [leftContent, setLeftContent] = useState<string>(initialLeftContent);
    const [rightContent, setRightContent] = useState<string>(initialRightContent);
    const [leftValid, setLeftValid] = useState<boolean>(false);
    const [rightValid, setRightValid] = useState<boolean>(false);

    // Diff hook
    const { diff, error: diffError, isComputing, computeDiff } = useJsonDiff({
        leftContent,
        rightContent,
        ignoreKeyOrder,
        prettyPrint,
        ignoreWhitespace,
        semanticTypeDiff,
    });

    // Handle compare click
    const handleCompare = useCallback(async () => {
        if (!leftValid || !rightValid) return;

        try {
            await computeDiff();
            if (diff) {
                onCompare?.(diff);
            }
        } catch (err) {
            onError?.(err as Error);
        }
    }, [leftValid, rightValid, computeDiff, diff, onCompare, onError]);

    // Handle diff errors
    if (diffError) {
        onError?.(diffError);
    }

    const canCompare = leftValid && rightValid;

    return (
        <div className={className}>
            {/* Editor Panes */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <JsonEditor
                    label="Left"
                    value={leftContent}
                    onChange={setLeftContent}
                    onError={(error) => setLeftValid(error === null && leftContent.trim().length > 0)}
                />

                <JsonEditor
                    label="Right"
                    value={rightContent}
                    onChange={setRightContent}
                    onError={(error) => setRightValid(error === null && rightContent.trim().length > 0)}
                />
            </div>

            {/* Compare Button */}
            <div className="mb-4">
                <button
                    onClick={handleCompare}
                    disabled={!canCompare || isComputing}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
                >
                    {isComputing ? 'Computing...' : 'Compare'}
                </button>
            </div>

            {/* Diff Panel */}
            <DiffPanel diffResult={diff} isLoading={isComputing} />
        </div>
    );
}
