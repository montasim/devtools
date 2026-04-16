'use client';

import React from 'react';
import ReactDiffViewer, { ReactDiffViewerStylesOverride } from 'react-diff-viewer-continued';
import { FileText, CheckCircle } from 'lucide-react';
import { EmptyEditorPrompt } from '@/components/ui/empty-editor-prompt';
import type { TextDiffViewMode } from '@/components/text/diff-pane/view-mode-tabs';

interface DiffResultsProps {
    leftText: string;
    rightText: string;
    leftTitle?: string;
    rightTitle?: string;
    diffViewType?: TextDiffViewMode;
}

export function DiffResults({
    leftText,
    rightText,
    leftTitle = 'Original',
    rightTitle = 'Modified',
    diffViewType = 'split',
}: DiffResultsProps) {
    if (!leftText && !rightText) {
        return (
            <div className="flex items-center justify-center h-full w-full">
                <div className="border rounded-lg border-dashed px-4 py-8 sm:py-12 w-full">
                    <EmptyEditorPrompt
                        icon={FileText}
                        title="No Content"
                        description="Enter text in both panes to see the diff"
                        showActions={false}
                        className="border-0 p-0"
                    />
                </div>
            </div>
        );
    }

    // Check if texts are identical
    if (leftText === rightText) {
        return (
            <div className="flex items-center justify-center h-full w-full">
                <div className="border rounded-lg border-dashed px-4 py-8 sm:py-12 w-full">
                    <EmptyEditorPrompt
                        icon={CheckCircle}
                        title="No Differences"
                        description="The texts are identical"
                        showActions={false}
                        className="border-0 p-0"
                    />
                </div>
            </div>
        );
    }

    const customStyles: ReactDiffViewerStylesOverride = {
        variables: {
            dark: {
                diffViewerBackground: 'transparent',
                diffViewerColor: 'inherit',
                addedBackground: 'rgba(46, 160, 67, 0.15)',
                addedColor: 'inherit',
                removedBackground: 'rgba(248, 81, 73, 0.15)',
                removedColor: 'inherit',
                wordAddedBackground: 'rgba(46, 160, 67, 0.4)',
                wordRemovedBackground: 'rgba(248, 81, 73, 0.4)',
                addedGutterBackground: 'rgba(46, 160, 67, 0.3)',
                removedGutterBackground: 'rgba(248, 81, 73, 0.3)',
                gutterBackground: 'transparent',
                gutterBackgroundDark: 'transparent',
                highlightBackground: 'rgba(255, 255, 255, 0.1)',
                highlightGutterBackground: 'rgba(255, 255, 255, 0.1)',
                codeFoldGutterBackground: 'transparent',
                codeFoldBackground: 'transparent',
                emptyLineBackground: 'transparent',
                gutterColor: 'inherit',
                addedGutterColor: 'rgba(46, 160, 67, 0.9)',
                removedGutterColor: 'rgba(248, 81, 73, 0.9)',
                codeFoldContentColor: 'inherit',
                diffViewerTitleBackground: 'transparent',
                diffViewerTitleColor: 'inherit',
                diffViewerTitleBorderColor: 'hsl(var(--border))',
            },
        },
        line: {
            padding: '4px 8px',
            fontSize: '13px',
            fontFamily: 'monospace',
        },
        gutter: {
            padding: '0 8px',
            minWidth: '32px',
            fontSize: '12px',
        },
        contentText: {
            fontSize: '13px',
            lineHeight: '20px',
        },
        diffContainer: {
            borderRadius: '6px',
        },
    };

    return (
        <div className="border-t">
            <ReactDiffViewer
                oldValue={leftText || ''}
                newValue={rightText || ''}
                leftTitle={leftTitle}
                rightTitle={rightTitle}
                splitView={diffViewType === 'split'}
                useDarkTheme={true}
                styles={customStyles}
                showDiffOnly={false}
            />
        </div>
    );
}
