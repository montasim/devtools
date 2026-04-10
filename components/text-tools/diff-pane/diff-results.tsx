'use client';

import React from 'react';
import ReactDiffViewer, { ReactDiffViewerStylesOverride } from 'react-diff-viewer-continued';

interface DiffResultsProps {
    leftText: string;
    rightText: string;
    leftTitle?: string;
    rightTitle?: string;
}

export function DiffResults({
    leftText,
    rightText,
    leftTitle = 'Original',
    rightTitle = 'Modified',
}: DiffResultsProps) {
    if (!leftText && !rightText) {
        return (
            <div className="flex items-center justify-center h-full text-muted-foreground">
                <p>Enter text in both panes to see the diff</p>
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
                splitView={true}
                useDarkTheme={true}
                styles={customStyles}
                showDiffOnly={false}
            />
        </div>
    );
}
