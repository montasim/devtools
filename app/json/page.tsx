'use client';

import { Suspense } from 'react';
import { ToolPage } from '@/components/pages/tool-page';
import { JSON_CONFIG } from '@/lib/config/tools';
import { createSavedTab, createSharedTab, createHistoryTab } from '@/lib/components/tab-factory';
import { JsonDiffTab } from '@/app/json/tabs/json-diff-tab';
import { JsonFormatTab } from '@/app/json/tabs/json-format-tab';
import { JsonMinifyTab } from '@/app/json/tabs/json-minify-tab';
import { JsonViewerTab } from '@/app/json/tabs/json-viewer-tab';
import { JsonParserTab } from '@/app/json/tabs/json-parser-tab';
import { JsonExportTab } from '@/app/json/tabs/json-export-tab';
import { JsonSchemaTab } from '@/app/json/tabs/json-schema-tab';
import type { ComponentType } from 'react';

// Create components once (outside render function)
const JsonSavedTab = createSavedTab(JSON_CONFIG.savedTabs!);
const JsonSharedTab = createSharedTab(JSON_CONFIG.sharedTabs!);
const JsonHistoryTab = createHistoryTab(JSON_CONFIG.historyTabs!);

function JsonPageContent() {
    const components = {
        diff: JsonDiffTab,
        format: JsonFormatTab,
        minify: JsonMinifyTab,
        viewer: JsonViewerTab,
        parser: JsonParserTab,
        export: JsonExportTab,
        schema: JsonSchemaTab,
        saved: JsonSavedTab,
        shared: JsonSharedTab,
        history: JsonHistoryTab,
    } as unknown as Record<string, ComponentType<Record<string, unknown>>>;

    return <ToolPage config={JSON_CONFIG} components={components} />;
}

export default function Home() {
    return (
        <div className="min-h-screen">
            <Suspense fallback={<div className="min-h-screen" />}>
                <JsonPageContent />
            </Suspense>
        </div>
    );
}
