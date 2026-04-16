'use client';

import { Suspense } from 'react';
import { ToolPage } from '@/components/pages/tool-page';
import { BASE64_CONFIG } from '@/lib/config/tools';
import { MediaToBase64Tab } from '@/app/base64/tabs/media-to-base64-tab';
import { Base64ToMediaTab } from '@/app/base64/tabs/base64-to-media-tab';
import { Base64SavedTab } from '@/app/base64/tabs/base64-saved-tab';
import { Base64HistoryTab } from '@/app/base64/tabs/base64-history-tab';
import { Base64SharedTab } from '@/app/base64/tabs/base64-shared-tab';

function Base64PageContent() {
    const components = {
        'media-to-base64': MediaToBase64Tab,
        'base64-to-media': Base64ToMediaTab,
        saved: Base64SavedTab,
        shared: Base64SharedTab,
        history: Base64HistoryTab,
    };

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
