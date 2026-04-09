'use client';

import { useState, useCallback, useEffect, useImperativeHandle, forwardRef } from 'react';
import { EditorPaneProps } from './types';
import { JsonEditor } from './json-editor';
import { DiffPanel } from './diff-panel';
import { useJsonDiff } from './use-json-diff';
import { Separator } from '../ui/separator';

export interface EditorPaneRef {
    triggerCompare: () => Promise<void>;
    isComputing: boolean;
}

export const EditorPane = forwardRef<EditorPaneRef, EditorPaneProps>(function EditorPane(
    {
        ignoreKeyOrder,
        prettyPrint,
        ignoreWhitespace,
        semanticTypeDiff,
        initialLeftContent = '',
        initialRightContent = '',
        onCompare,
        onError,
        onValidationChange,
        className,
    },
    ref,
) {
    // State
    const [leftContent, setLeftContent] = useState<string>(initialLeftContent);
    const [rightContent, setRightContent] = useState<string>(initialRightContent);
    const [leftValid, setLeftValid] = useState<boolean>(false);
    const [rightValid, setRightValid] = useState<boolean>(false);

    // Diff hook
    const {
        diff,
        error: diffError,
        isComputing,
        computeDiff,
    } = useJsonDiff({
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

    // Expose methods to parent via ref
    useImperativeHandle(
        ref,
        () => ({
            triggerCompare: handleCompare,
            isComputing,
        }),
        [handleCompare, isComputing],
    );

    // Handle diff errors
    if (diffError) {
        onError?.(diffError);
    }

    const canCompare = leftValid && rightValid;

    // Notify parent when validation state changes
    useEffect(() => {
        onValidationChange?.(canCompare);
    }, [canCompare, onValidationChange]);

    return (
        <div className={className}>
            {/* Editor Panes */}
            <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                    <JsonEditor
                        label="Original"
                        value={leftContent}
                        onChange={setLeftContent}
                        onError={(error) =>
                            setLeftValid(error === null && leftContent.trim().length > 0)
                        }
                    />
                </div>

                <Separator orientation='vertical' className="hidden md:block" />
                <Separator orientation='horizontal' className="block md:hidden" />

                <div className="flex-1">
                    <JsonEditor
                        label="Modified"
                        value={rightContent}
                        onChange={setRightContent}
                        onError={(error) =>
                            setRightValid(error === null && rightContent.trim().length > 0)
                        }
                    />
                </div>
            </div>

            {/* Diff Panel */}
            <DiffPanel
                diffResult={diff}
                isLoading={isComputing}
                leftContent={leftContent}
                rightContent={rightContent}
            />
        </div>
    );
});
