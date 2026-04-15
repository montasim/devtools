'use client';

import { useState, useCallback } from 'react';
import { ConvertPane } from '@/components/text/convert-pane/convert-pane';

export interface TextConvertTabProps {
    onClear?: () => void;
    sharedData?: {
        tabName?: string;
        state?: {
            leftContent?: string;
            rightContent?: string;
        };
        title?: string;
        comment?: string;
        expiresAt?: string;
        hasPassword?: boolean;
        viewCount?: number;
        createdAt?: string;
    } | null;
}

export function TextConvertTab({ onClear, sharedData }: TextConvertTabProps) {
    // Track current content for real-time sharing
    const [currentLeftContent, setCurrentLeftContent] = useState('');
    const [currentRightContent, setCurrentRightContent] = useState('');

    const handleContentChange = useCallback((left: string, right: string) => {
        setCurrentLeftContent(left);
        setCurrentRightContent(right);
    }, []);

    return (
        <ConvertPane
            sharedData={sharedData}
            onContentChange={handleContentChange}
            currentLeftContent={currentLeftContent}
            currentRightContent={currentRightContent}
        />
    );
}
