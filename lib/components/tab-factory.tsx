'use client';

import { SavedTab } from '@/components/shared/saved-tab';
import { SharedTab } from '@/components/shared/shared-tab';
import type { SavedTabConfig, SharedTabConfig } from '@/lib/config/tools';
import type { ComponentType } from 'react';

export function createSavedTab(config: SavedTabConfig): ComponentType<Record<string, unknown>> {
    const SavedTabWrapper = (props: Record<string, unknown>) => {
        const { onTabChange } = props as { onTabChange: (tab: string) => void };
        return (
            <SavedTab
                pageName={config.pageName}
                queryKey={config.queryKey}
                toolMapping={config.toolMapping}
                tabMapping={config.tabMapping}
                storageKeyMapping={config.storageKeyMapping}
                extractContent={config.extractContent}
                onTabChange={onTabChange}
            />
        );
    };

    SavedTabWrapper.displayName = `SavedTab(${config.pageName})`;
    return SavedTabWrapper;
}

export function createSharedTab(config: SharedTabConfig): ComponentType<Record<string, unknown>> {
    const SharedTabWrapper = (props: Record<string, unknown>) => {
        const { onTabChange } = props as { onTabChange: (tab: string) => void };
        return (
            <SharedTab
                pageName={config.pageName}
                queryKey={config.queryKey}
                toolMapping={config.toolMapping}
                tabMapping={config.tabMapping}
                renderStats={config.renderStats}
                onTabChange={onTabChange}
            />
        );
    };

    SharedTabWrapper.displayName = `SharedTab(${config.pageName})`;
    return SharedTabWrapper;
}
