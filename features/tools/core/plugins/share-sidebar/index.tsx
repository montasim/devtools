'use client';

import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { ShareForm } from './components/share-form';
import { ShareResult } from './components/share-result';
import { ShareActions } from './components/share-actions';
import { useShareMutation } from './hooks/use-share-mutation';
import { useState } from 'react';
import { toast } from 'sonner';
import type { ShareSidebarConfig } from './types';

interface ShareSidebarModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    config: ShareSidebarConfig;
}

export function ShareSidebarModal({ open, onOpenChange, config }: ShareSidebarModalProps) {
    const shareMutation = useShareMutation();
    const [shareUrl, setShareUrl] = useState('');

    const handleShare = (data: {
        title: string;
        comment: string;
        expiresAt: string | null;
        password: string;
    }) => {
        const state = config.getState();
        if (!state || Object.keys(state).length === 0) {
            toast.error('No content to share');
            return;
        }

        shareMutation.mutate(
            {
                pageName: config.pageName,
                tabName: config.tabName,
                title: data.title,
                comment: data.comment || undefined,
                expiresAt: data.expiresAt,
                password: data.password || undefined,
                state,
            },
            {
                onSuccess: (result) => {
                    const url = `${window.location.origin}/share/${config.pageName}/${result.id}`;
                    setShareUrl(url);
                    toast.success('Share link created!');
                },
            },
        );
    };

    const handleClose = (isOpen: boolean) => {
        if (!isOpen) {
            setShareUrl('');
        }
        onOpenChange(isOpen);
    };

    return (
        <Sheet open={open} onOpenChange={handleClose}>
            <SheetContent className="w-full sm:max-w-md">
                <SheetHeader>
                    <SheetTitle>Share</SheetTitle>
                </SheetHeader>
                <div className="flex flex-col gap-6 p-4">
                    {shareUrl ? (
                        <ShareResult url={shareUrl} />
                    ) : (
                        <ShareForm onSubmit={handleShare} isLoading={shareMutation.isPending} />
                    )}
                    {config.extraActions && config.extraActions.length > 0 && (
                        <ShareActions actions={config.extraActions} />
                    )}
                </div>
            </SheetContent>
        </Sheet>
    );
}
