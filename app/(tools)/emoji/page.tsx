'use client';

import { Suspense } from 'react';
import BrowseContent from '@/features/tools/emoji/tabs/browse-tab';

export default function EmojiPage() {
    return (
        <Suspense>
            <BrowseContent />
        </Suspense>
    );
}
