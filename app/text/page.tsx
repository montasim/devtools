'use client';

import { Suspense } from 'react';
import { ToolPage } from '@/components/pages/tool-page';
import { TEXT_CONFIG } from '@/lib/config/tools';
import { createSavedTab, createSharedTab } from '@/lib/components/tab-factory';
import { TextDiffTab } from '@/app/text/tabs/text-diff-tab';
import { TextConvertTab } from '@/app/text/tabs/text-convert-tab';
import { TextCleanTab } from '@/app/text/tabs/text-clean-tab';
import { TextHistoryTab } from '@/app/text/tabs/text-history-tab';
import type { ComponentType } from 'react';

// Create components once (outside render function)
const TextSavedTab = createSavedTab(TEXT_CONFIG.savedTabs!);
const TextSharedTab = createSharedTab(TEXT_CONFIG.sharedTabs!);

function TextPageContent() {
    const components = {
        diff: TextDiffTab,
        convert: TextConvertTab,
        clean: TextCleanTab,
        saved: TextSavedTab,
        shared: TextSharedTab,
        history: TextHistoryTab,
    } as unknown as Record<string, ComponentType<Record<string, unknown>>>;

    return <ToolPage config={TEXT_CONFIG} components={components} />;
}

export default function Home() {
    return (
        <div className="min-h-screen">
            <Suspense fallback={<div className="min-h-screen" />}>
                <TextPageContent />
            </Suspense>
        </div>
    );
}
