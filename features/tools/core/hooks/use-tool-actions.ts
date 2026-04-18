'use client';

import type { ActionItem } from '../types/tool';
import { Eraser, Save, Share2 } from 'lucide-react';
import { useAuth } from '@/features/auth/hooks/use-auth';
import { apiClient } from '@/lib/api/client';
import { handleApiError } from '@/lib/hooks/use-error-handler';

interface UseToolActionsOptions {
    pageName: string;
    tabId: string;
    getContent: () => string;
    onClear: () => void;
    shareDialogOpen: boolean;
    setShareDialogOpen: (open: boolean) => void;
}

export function useToolActions(options: UseToolActionsOptions) {
    const { onClear, shareDialogOpen, setShareDialogOpen } = options;
    const { isAuthenticated } = useAuth();

    const hasContent = options.getContent().trim().length > 0;

    const handleSave = async () => {
        try {
            const res = await apiClient.post('/api/saved', {
                pageName: options.pageName,
                tabName: options.tabId,
                content: options.getContent(),
            });
            if (!res.ok) {
                handleApiError('Failed to save', res.error);
            }
        } catch (error) {
            handleApiError('Failed to save', error);
        }
    };

    const actions: ActionItem[] = [];

    if (isAuthenticated) {
        actions.push({
            id: 'save',
            label: 'Save',
            icon: Save,
            onClick: handleSave,
            variant: 'outline',
            disabled: !hasContent,
        });
    }

    actions.push({
        id: 'share',
        label: 'Share',
        icon: Share2,
        onClick: () => setShareDialogOpen(!shareDialogOpen),
        variant: 'outline',
        className: 'bg-primary/10 text-primary hover:bg-primary/20',
        disabled: !hasContent,
    });

    actions.push({
        id: 'clear',
        label: 'Clear',
        icon: Eraser,
        onClick: onClear,
        variant: 'outline',
        className: 'bg-destructive/10 text-destructive hover:bg-destructive/20',
        disabled: !hasContent,
    });

    return { actions };
}
