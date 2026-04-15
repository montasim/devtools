'use client';

import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import { TextDiffPane } from '@/components/text/diff-pane/diff-pane';
import { Toolbar } from '@/components/toolbar/toolbar';
import { Bookmark } from 'lucide-react';
import { saveTextContent } from '@/lib/text-save-utils';

export interface TextDiffTabProps {
    onClear?: () => void;
    sharedData?: {
        title?: string;
        comment?: string;
        expiresAt?: string;
        hasPassword?: boolean;
        viewCount?: number;
        createdAt?: string;
    };
}

export function TextDiffTab({ onClear, sharedData }: TextDiffTabProps) {
    const [shareDialogOpen, setShareDialogOpen] = useState(false);

    // Track current content for real-time sharing
    const [currentLeftContent, setCurrentLeftContent] = useState('');
    const [currentRightContent, setCurrentRightContent] = useState('');

    const handleContentChange = useCallback((left: string, right: string) => {
        setCurrentLeftContent(left);
        setCurrentRightContent(right);
    }, []);

    const handleShare = () => {
        if (!currentLeftContent && !currentRightContent) {
            toast.error('No content to share. Please enter some text first.');
            return;
        }
        setShareDialogOpen(true);
    };

    const handleSave = useCallback(() => {
        const contentToSave = currentLeftContent || currentRightContent;
        saveTextContent('Text Diff', contentToSave);
    }, [currentLeftContent, currentRightContent]);

    return (
        <>
            <Toolbar
                actions={[
                    {
                        id: 'clear',
                        label: 'Clear All',
                        onClick: onClear || (() => {}),
                        variant: 'outline',
                    },
                    {
                        id: 'save',
                        label: 'Save',
                        onClick: handleSave,
                        variant: 'outline',
                        icon: <Bookmark className="h-4 w-4" />,
                    },
                    {
                        id: 'share',
                        label: 'Share',
                        onClick: handleShare,
                        variant: 'outline',
                    },
                ]}
            />
            <TextDiffPane
                shareDialogOpen={shareDialogOpen}
                onShareDialogOpenChange={setShareDialogOpen}
                sharedData={sharedData}
                onContentChange={handleContentChange}
                currentLeftContent={currentLeftContent}
                currentRightContent={currentRightContent}
            />
        </>
    );
}
