'use client';

import { useState, useCallback, useEffect, useImperativeHandle, forwardRef, useRef } from 'react';
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
    // State with lazy initialization from localStorage
    const [leftContent, setLeftContent] = useState<string>(() => {
        if (initialLeftContent !== '') return initialLeftContent;
        try {
            return localStorage.getItem('json-diff-left-content') || initialLeftContent;
        } catch {
            return initialLeftContent;
        }
    });

    const [rightContent, setRightContent] = useState<string>(() => {
        if (initialRightContent !== '') return initialRightContent;
        try {
            return localStorage.getItem('json-diff-right-content') || initialRightContent;
        } catch {
            return initialRightContent;
        }
    });

    const [leftValid, setLeftValid] = useState<boolean>(false);
    const [rightValid, setRightValid] = useState<boolean>(false);

    // Save to localStorage whenever content changes (but not on initial render)
    const initialLeftContentRef = useRef(initialLeftContent);
    const initialRightContentRef = useRef(initialRightContent);

    useEffect(() => {
        initialLeftContentRef.current = initialLeftContent;
    }, [initialLeftContent]);

    useEffect(() => {
        initialRightContentRef.current = initialRightContent;
    }, [initialRightContent]);

    useEffect(() => {
        // Only save if content is different from initial props
        if (leftContent !== initialLeftContentRef.current) {
            try {
                localStorage.setItem('json-diff-left-content', leftContent);
            } catch (error) {
                console.error('Failed to save left content to localStorage:', error);
            }
        }
    }, [leftContent]);

    useEffect(() => {
        // Only save if content is different from initial props
        if (rightContent !== initialRightContentRef.current) {
            try {
                localStorage.setItem('json-diff-right-content', rightContent);
            } catch (error) {
                console.error('Failed to save right content to localStorage:', error);
            }
        }
    }, [rightContent]);

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
                <div className="w-full md:w-1/2">
                    <JsonEditor
                        label="Original"
                        value={leftContent}
                        onChange={setLeftContent}
                        onError={(error) =>
                            setLeftValid(error === null && leftContent.trim().length > 0)
                        }
                    />
                </div>

                <Separator orientation="vertical" className="hidden md:block" />
                <Separator orientation="horizontal" className="block md:hidden" />

                <div className="w-full md:w-1/2">
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
