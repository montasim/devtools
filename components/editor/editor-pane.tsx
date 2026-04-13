'use client';

import { useState, useCallback, useEffect, useImperativeHandle, forwardRef, useRef } from 'react';
import { EditorPaneProps } from '@/components/editor/types';
import { JsonEditor } from '@/components/editor/json-editor';
import { DiffPanel } from '@/components/editor/diff-panel';
import { useJsonDiff } from '@/components/editor/use-json-diff';
import { Separator } from '@/components/ui/separator';
import { STORAGE_KEYS } from '@/lib/constants';

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
        onContentChange,
        className,
    },
    ref,
) {
    // Track if we've loaded shared data
    const leftSharedDataLoadedRef = useRef(!!initialLeftContent);
    const rightSharedDataLoadedRef = useRef(!!initialRightContent);

    // State with simplified initialization: shared content > localStorage > empty
    const [leftContent, setLeftContent] = useState<string>(() => {
        // Priority 1: Use initial content if provided (shared data)
        if (initialLeftContent) {
            leftSharedDataLoadedRef.current = true;
            return initialLeftContent;
        }
        // Priority 2: Load from localStorage
        try {
            const saved = localStorage.getItem(STORAGE_KEYS.JSON_DIFF_LEFT_CONTENT);
            if (saved) {
                return saved;
            }
        } catch (error) {
            console.error('Failed to load from localStorage:', error);
        }
        // Priority 3: Empty string
        return '';
    });

    const [rightContent, setRightContent] = useState<string>(() => {
        // Priority 1: Use initial content if provided (shared data)
        if (initialRightContent) {
            rightSharedDataLoadedRef.current = true;
            return initialRightContent;
        }
        // Priority 2: Load from localStorage
        try {
            const saved = localStorage.getItem(STORAGE_KEYS.JSON_DIFF_RIGHT_CONTENT);
            if (saved) {
                return saved;
            }
        } catch (error) {
            console.error('Failed to load from localStorage:', error);
        }
        // Priority 3: Empty string
        return '';
    });

    const [leftValid, setLeftValid] = useState<boolean>(false);
    const [rightValid, setRightValid] = useState<boolean>(false);

    // Save to localStorage whenever content changes (but not on initial render)
    const initialLeftContentRef = useRef(initialLeftContent);
    const initialRightContentRef = useRef(initialRightContent);

    // Update content when shared data arrives asynchronously
    useEffect(() => {
        // If shared data just arrived (was undefined, now has value)
        if (initialLeftContent && !leftSharedDataLoadedRef.current) {
            leftSharedDataLoadedRef.current = true;
            setLeftContent(initialLeftContent);
        }
        initialLeftContentRef.current = initialLeftContent;
    }, [initialLeftContent]);

    useEffect(() => {
        // If shared data just arrived (was undefined, now has value)
        if (initialRightContent && !rightSharedDataLoadedRef.current) {
            rightSharedDataLoadedRef.current = true;
            setRightContent(initialRightContent);
        }
        initialRightContentRef.current = initialRightContent;
    }, [initialRightContent]);

    // Notify parent of content changes
    useEffect(() => {
        onContentChange?.(leftContent, rightContent);
    }, [leftContent, rightContent, onContentChange]);

    // Notify parent of content changes
    useEffect(() => {
        onContentChange?.(leftContent, rightContent);
    }, [leftContent, rightContent, onContentChange]);

    useEffect(() => {
        // Only save if content is different from initial props
        if (leftContent !== initialLeftContentRef.current) {
            try {
                localStorage.setItem(STORAGE_KEYS.JSON_DIFF_LEFT_CONTENT, leftContent);
            } catch (error) {
                console.error('Failed to save left content to localStorage:', error);
            }
        }
    }, [leftContent]);

    useEffect(() => {
        // Only save if content is different from initial props
        if (rightContent !== initialRightContentRef.current) {
            try {
                localStorage.setItem(STORAGE_KEYS.JSON_DIFF_RIGHT_CONTENT, rightContent);
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
            <div className="flex flex-col lg:flex-row gap-3 lg:gap-4">
                <div className="w-full lg:w-1/2 min-w-0">
                    <JsonEditor
                        label="Original"
                        value={leftContent}
                        onChange={setLeftContent}
                        onError={(error) =>
                            setLeftValid(error === null && leftContent.trim().length > 0)
                        }
                        height="300px"
                    />
                </div>

                <Separator orientation="vertical" className="hidden lg:block" />
                <Separator orientation="horizontal" className="block lg:hidden" />

                <div className="w-full lg:w-1/2 min-w-0">
                    <JsonEditor
                        label="Modified"
                        value={rightContent}
                        onChange={setRightContent}
                        onError={(error) =>
                            setRightValid(error === null && rightContent.trim().length > 0)
                        }
                        height="300px"
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
