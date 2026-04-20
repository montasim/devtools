'use client';

import { useState } from 'react';
import { useToolState } from '../../core/hooks/use-tool-state';
import { useToolActions } from '../../core/hooks/use-tool-actions';
import { ToolTabWrapper } from '../../core/components/tool-tab-wrapper';
import { DiffPanel } from '../../core/components/diff-panel';
import { ShareSidebarModal } from '../../core/plugins/share-sidebar';
import { STORAGE_KEYS } from '@/lib/utils/constants';
import { useLocalStorage } from '@/lib/hooks/use-local-storage';
import type { TabComponentProps } from '../../core/types/tool';

export default function TextDiffTab({ sharedData, readOnly }: TabComponentProps) {
    const {
        content: leftContent,
        setContent: setLeftContent,
        isReady,
    } = useToolState({
        storageKey: STORAGE_KEYS.TEXT_DIFF_LEFT_CONTENT,
        sharedData,
        tabId: 'diff',
        readOnly,
    });
    const [rightContent, setRightContent] = useLocalStorage(
        STORAGE_KEYS.TEXT_DIFF_RIGHT_CONTENT,
        '',
    );
    const [shareOpen, setShareOpen] = useState(false);

    const { actions } = useToolActions({
        pageName: 'text',
        tabId: 'diff',
        getContent: () => leftContent,
        onClear: () => {
            setLeftContent('');
            setRightContent('');
        },
        shareDialogOpen: shareOpen,
        setShareDialogOpen: setShareOpen,
        readOnly,
    });

    if (!isReady) return null;

    return (
        <ToolTabWrapper actions={actions}>
            <DiffPanel
                leftContent={leftContent}
                rightContent={rightContent}
                leftLabel="Original Text"
                rightLabel="Modified Text"
                onLeftChange={setLeftContent}
                onRightChange={setRightContent}
                readOnly={readOnly}
            />
            <ShareSidebarModal
                open={shareOpen}
                onOpenChange={setShareOpen}
                config={{
                    pageName: 'text',
                    tabName: 'diff',
                    getState: () => ({ leftContent, rightContent }),
                }}
            />
        </ToolTabWrapper>
    );
}
