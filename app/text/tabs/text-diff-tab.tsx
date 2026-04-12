'use client';

import { useState } from 'react';
import { TextDiffPane } from '@/components/text/diff-pane/diff-pane';
import { Toolbar } from '@/components/toolbar/toolbar';

export interface TextDiffTabProps {
    onClear?: () => void;
}

export function TextDiffTab({ onClear }: TextDiffTabProps) {
    const [shareDialogOpen, setShareDialogOpen] = useState(false);

    const handleShare = () => {
        setShareDialogOpen(true);
    };

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
            />
        </>
    );
}
