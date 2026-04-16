'use client';

import { Suspense } from 'react';
import { ToolPage } from '@/components/pages/tool-page';
import { JSON_CONFIG } from '@/lib/config/tools';
import { JsonDiffTab } from '@/app/json/tabs/json-diff-tab';
import { JsonFormatTab } from '@/app/json/tabs/json-format-tab';
import { JsonMinifyTab } from '@/app/json/tabs/json-minify-tab';
import { JsonViewerTab } from '@/app/json/tabs/json-viewer-tab';
import { JsonParserTab } from '@/app/json/tabs/json-parser-tab';
import { JsonExportTab } from '@/app/json/tabs/json-export-tab';
import { JsonSchemaTab } from '@/app/json/tabs/json-schema-tab';
import { JsonSavedTab } from '@/app/json/tabs/json-saved-tab';
import { JsonHistoryTab } from '@/app/json/tabs/json-history-tab';
import { JsonShareTab } from '@/app/json/tabs/json-share-tab';

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
        shared: JsonShareTab,
        history: JsonHistoryTab,
    };

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
