'use client';

import { Suspense } from 'react';
import { ToolPage } from '@/components/pages/tool-page';
import { TEXT_CONFIG } from '@/lib/config/tools';
import { TextDiffTab } from '@/app/text/tabs/text-diff-tab';
import { TextConvertTab } from '@/app/text/tabs/text-convert-tab';
import { TextCleanTab } from '@/app/text/tabs/text-clean-tab';
import { TextSavedTab } from '@/app/text/tabs/text-saved-tab';
import { TextHistoryTab } from '@/app/text/tabs/text-history-tab';
import { TextSharedTab } from '@/app/text/tabs/text-shared-tab';

function TextPageContent() {
    const components = {
        diff: TextDiffTab,
        convert: TextConvertTab,
        clean: TextCleanTab,
        saved: TextSavedTab,
        shared: TextSharedTab,
        history: TextHistoryTab,
    };

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
