'use client';

import { useState } from 'react';
import { useToolState } from '../../core/hooks/use-tool-state';
import { useToolActions } from '../../core/hooks/use-tool-actions';
import { ToolTabWrapper } from '../../core/components/tool-tab-wrapper';
import { DiffPanel } from '../../core/components/diff-panel';
import { ShareSidebarModal } from '../../core/plugins/share-sidebar';
import { STORAGE_KEYS } from '@/lib/utils/constants';
import { useJsonDiff } from '../hooks/use-json-diff';
import { useLocalStorage } from '@/lib/hooks/use-local-storage';
import type { TabComponentProps, SharedData } from '../../core/types/tool';

export default function DiffTab({ sharedData }: TabComponentProps) {
    const {
        content: leftContent,
        setContent: setLeftContent,
        isReady,
    } = useToolState({
        storageKey: STORAGE_KEYS.JSON_DIFF_LEFT_CONTENT,
        sharedData,
        tabId: 'diff',
    });
    const [rightContent, setRightContent] = useLocalStorage(
        STORAGE_KEYS.JSON_DIFF_RIGHT_CONTENT,
        '',
    );
    const [shareOpen, setShareOpen] = useState(false);
    const { stats } = useJsonDiff(leftContent, rightContent);

    const { actions } = useToolActions({
        pageName: 'json',
        tabId: 'diff',
        getContent: () => leftContent,
        onClear: () => {
            setLeftContent('');
            setRightContent('');
        },
        shareDialogOpen: shareOpen,
        setShareDialogOpen: setShareOpen,
    });

    if (!isReady) return null;

    return (
        <ToolTabWrapper actions={actions}>
            <DiffPanel
                leftContent={leftContent}
                rightContent={rightContent}
                leftLabel="Original JSON"
                rightLabel="Modified JSON"
                onLeftChange={setLeftContent}
                onRightChange={setRightContent}
                mode="json"
                diffStats={stats}
            />
            <ShareSidebarModal
                open={shareOpen}
                onOpenChange={setShareOpen}
                config={{
                    pageName: 'json',
                    tabName: 'diff',
                    getState: () => ({ leftContent, rightContent }),
                }}
            />
        </ToolTabWrapper>
    );
}
