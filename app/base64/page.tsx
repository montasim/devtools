'use client';

import { Suspense } from 'react';
import { ToolPage } from '@/components/pages/tool-page';
import { BASE64_CONFIG } from '@/lib/config/tools';
import { createSavedTab, createSharedTab, createHistoryTab } from '@/lib/components/tab-factory';
import { MediaToBase64Tab } from '@/app/base64/tabs/media-to-base64-tab';
import { Base64ToMediaTab } from '@/app/base64/tabs/base64-to-media-tab';
import type { ComponentType } from 'react';

// Create components once (outside render function)
const Base64SavedTab = createSavedTab(BASE64_CONFIG.savedTabs!);
const Base64SharedTab = createSharedTab(BASE64_CONFIG.sharedTabs!);
const Base64HistoryTab = createHistoryTab(BASE64_CONFIG.historyTabs!);

function Base64PageContent() {
    const components = {
        'media-to-base64': MediaToBase64Tab,
        'base64-to-media': Base64ToMediaTab,
        saved: Base64SavedTab,
        shared: Base64SharedTab,
        history: Base64HistoryTab,
    } as unknown as Record<string, ComponentType<Record<string, unknown>>>;

    return <ToolPage config={BASE64_CONFIG} components={components} />;
}

export default function Base64Page() {
    return (
        <div className="min-h-screen">
            <Suspense fallback={<div className="min-h-screen" />}>
                <Base64PageContent />
            </Suspense>
        </div>
    );
}
