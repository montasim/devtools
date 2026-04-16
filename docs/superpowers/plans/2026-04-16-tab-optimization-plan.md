# Tab-Level Optimization Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Create a configuration-driven architecture for tab components that eliminates 6 wrapper files while preserving all functionality.

**Architecture:** Generic factory functions (`createSavedTab`, `createSharedTab`) generate tab components from configuration objects stored in `tools.ts`, following the same pattern used successfully for page-level optimization.

**Tech Stack:** TypeScript, React, Lucide React icons, existing `SavedTab` and `SharedTab` components

---

## File Structure

**New Files:**

- `lib/components/tab-factory.ts` - Factory functions for creating tab components from config

**Modified Files:**

- `lib/config/tools.ts` - Add icon imports, extend interfaces, add tab configurations
- `app/text/page.tsx` - Use factory-created components instead of wrapper imports
- `app/json/page.tsx` - Use factory-created components instead of wrapper imports
- `app/base64/page.tsx` - Use factory-created components instead of wrapper imports

**Deleted Files:**

- `app/text/tabs/text-saved-tab.tsx`
- `app/text/tabs/text-shared-tab.tsx`
- `app/json/tabs/json-saved-tab.tsx`
- `app/json/tabs/json-share-tab.tsx`
- `app/base64/tabs/base64-saved-tab.tsx`
- `app/base64/tabs/base64-shared-tab.tsx`

---

## Task 1: Add Missing Icon Imports

**Files:**

- Modify: `lib/config/tools.ts:1-15`

- [ ] **Step 1: Add FileText icon import**

Add `FileText` to the existing lucide-react imports (line 3-15):

```typescript
import {
    GitCompare,
    Sparkles,
    ArrowLeftRight,
    Share2,
    History,
    Bookmark,
    Code,
    Minimize2,
    Eye,
    FileJson,
    FileDown,
    FileCode,
    Image as ImageIcon,
    FileText, // ADD THIS LINE
} from 'lucide-react';
```

- [ ] **Step 2: Verify build**

Run: `npm run build`
Expected: Build succeeds (no errors, just adding an import)

- [ ] **Step 3: Commit**

```bash
git add lib/config/tools.ts
git commit -m "feat: add FileText icon import for tab configurations

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>"
```

---

## Task 2: Extend ToolConfig Interfaces

**Files:**

- Modify: `lib/config/tools.ts:18-28`

- [ ] **Step 1: Add SavedTabConfig interface**

Add the new interface after `ToolConfig` (around line 29):

```typescript
export interface SavedTabConfig {
    pageName: string;
    queryKey: string;
    toolMapping: Record<string, ToolMapping>;
    tabMapping: Record<string, string>;
    storageKeyMapping: Record<string, string>;
    extractContent?: (item: import('@/components/shared/saved-tab').SavedItem) => string;
}
```

- [ ] **Step 2: Add SharedTabConfig interface**

Add the new interface after `SavedTabConfig`:

```typescript
export interface SharedTabConfig {
    pageName: string;
    queryKey: string;
    toolMapping: Record<string, ToolMapping>;
    tabMapping: Record<string, string>;
    renderStats?: (item: import('@/components/shared/shared-tab').SharedItem) => React.ReactNode;
}
```

- [ ] **Step 3: Extend ToolConfig interface**

Modify the existing `ToolConfig` interface to include optional tab configurations (around line 24-28):

```typescript
export interface ToolConfig {
    pageName: string;
    defaultTab: string;
    mainTabs: TabDefinition[];
    savedTabs?: SavedTabConfig; // ADD THIS LINE
    sharedTabs?: SharedTabConfig; // ADD THIS LINE
}
```

- [ ] **Step 4: Verify build**

Run: `npm run build`
Expected: Build succeeds (interface changes only)

- [ ] **Step 5: Commit**

```bash
git add lib/config/tools.ts
git commit -m "feat: extend ToolConfig with saved/shared tab interfaces

- Add SavedTabConfig interface for saved tab configuration
- Add SharedTabConfig interface for shared tab configuration
- Extend ToolConfig to optionally include savedTabs and sharedTabs

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>"
```

---

## Task 3: Create Tab Factory Functions

**Files:**

- Create: `lib/components/tab-factory.ts`

- [ ] **Step 1: Create factory functions file**

Create the new file with the following content:

```typescript
'use client';

import { SavedTab } from '@/components/shared/saved-tab';
import { SharedTab } from '@/components/shared/shared-tab';
import type { SavedTabConfig, SharedTabConfig } from '@/lib/config/tools';
import type { ComponentType } from 'react';

export function createSavedTab(config: SavedTabConfig): ComponentType<{ onTabChange: (tab: string) => void }> {
    const SavedTabWrapper = ({ onTabChange }: { onTabChange: (tab: string) => void }) => {
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

export function createSharedTab(config: SharedTabConfig): ComponentType<{ onTabChange: (tab: string) => void }> {
    const SharedTabWrapper = ({ onTabChange }: { onTabChange: (tab: string) => void }) => {
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
```

- [ ] **Step 2: Verify build**

Run: `npm run build`
Expected: Build succeeds (new file created)

- [ ] **Step 3: Commit**

```bash
git add lib/components/tab-factory.ts
git commit -m "feat: create tab factory functions for configuration-driven tabs

- Add createSavedTab factory function
- Add createSharedTab factory function
- Generate tab components from configuration objects

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>"
```

---

## Task 4: Add TEXT_CONFIG Tab Configurations

**Files:**

- Modify: `lib/config/tools.ts:30-39`

- [ ] **Step 1: Add savedTabs and sharedTabs to TEXT_CONFIG**

Replace the entire `TEXT_CONFIG` object (lines 31-39) with:

```typescript
// Text Tool Configuration
export const TEXT_CONFIG: ToolConfig = {
    pageName: 'text',
    defaultTab: 'diff',
    mainTabs: [
        { value: 'diff', label: 'Diff', icon: GitCompare },
        { value: 'convert', label: 'Convert', icon: ArrowLeftRight },
        { value: 'clean', label: 'Clean', icon: Sparkles },
    ],
    savedTabs: {
        pageName: 'text',
        queryKey: 'text',
        toolMapping: {
            'Text Diff': { name: 'Diff', icon: GitCompare, color: 'text-blue-500' },
            'Text Convert': { name: 'Convert', icon: ArrowLeftRight, color: 'text-green-500' },
            'Text Clean': { name: 'Clean', icon: Sparkles, color: 'text-purple-500' },
        },
        tabMapping: {
            'Text Diff': 'diff',
            'Text Convert': 'convert',
            'Text Clean': 'clean',
        },
        storageKeyMapping: {
            'Text Diff': 'text-diff-left-input',
            'Text Convert': 'text-convert-input',
            'Text Clean': 'text-clean-input',
        },
        extractContent: (item) => {
            const mainContent =
                item.content.leftContent ||
                item.content.rightContent ||
                JSON.stringify(item.content);
            return typeof mainContent === 'string' ? mainContent : JSON.stringify(mainContent);
        },
    },
    sharedTabs: {
        pageName: 'text',
        queryKey: 'text',
        toolMapping: {
            'Text Diff': { name: 'Diff', icon: FileText, color: 'text-blue-500' },
            'Text Convert': { name: 'Convert', icon: FileText, color: 'text-green-500' },
            'Text Clean': { name: 'Clean', icon: FileText, color: 'text-purple-500' },
        },
        tabMapping: {
            'Text Diff': 'diff',
            'Text Convert': 'convert',
            'Text Clean': 'clean',
        },
    },
};
```

- [ ] **Step 2: Verify build**

Run: `npm run build`
Expected: Build succeeds

- [ ] **Step 3: Commit**

```bash
git add lib/config/tools.ts
git commit -m "feat: add TEXT_CONFIG saved/shared tab configurations

- Add savedTabs with toolMapping, tabMapping, storageKeyMapping, extractContent
- Add sharedTabs with toolMapping and tabMapping
- Configure for Diff, Convert, and Clean tools

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>"
```

---

## Task 5: Add JSON_CONFIG Tab Configurations

**Files:**

- Modify: `lib/config/tools.ts:41-54`

- [ ] **Step 1: Add savedTabs and sharedTabs to JSON_CONFIG**

Replace the entire `JSON_CONFIG` object (lines 42-54) with:

```typescript
// JSON Tool Configuration
export const JSON_CONFIG: ToolConfig = {
    pageName: 'json',
    defaultTab: 'diff',
    mainTabs: [
        { value: 'diff', label: 'Diff', icon: GitCompare },
        { value: 'format', label: 'Format', icon: Code },
        { value: 'minify', label: 'Minify', icon: Minimize2 },
        { value: 'viewer', label: 'Viewer', icon: Eye },
        { value: 'parser', label: 'Parser', icon: FileJson },
        { value: 'export', label: 'Export', icon: FileDown },
        { value: 'schema', label: 'Schema', icon: FileJson },
    ],
    savedTabs: {
        pageName: 'json',
        queryKey: 'json',
        toolMapping: {
            'JSON Diff': { name: 'Diff', icon: GitCompare, color: 'text-blue-500' },
            'JSON Format': { name: 'Format', icon: Code, color: 'text-green-500' },
            'JSON Minify': { name: 'Minify', icon: Minimize2, color: 'text-purple-500' },
            'JSON Viewer': { name: 'Viewer', icon: FileJson, color: 'text-orange-500' },
            'JSON Parser': { name: 'Parser', icon: Bookmark, color: 'text-pink-500' },
            'JSON Export': { name: 'Export', icon: FileDown, color: 'text-indigo-500' },
        },
        tabMapping: {
            'JSON Diff': 'diff',
            'JSON Format': 'format',
            'JSON Minify': 'minify',
            'JSON Viewer': 'viewer',
            'JSON Parser': 'parser',
            'JSON Export': 'export',
        },
        storageKeyMapping: {
            'JSON Diff': 'json-diff-left-input',
            'JSON Format': 'json-format-input',
            'JSON Minify': 'json-minify-input',
            'JSON Viewer': 'json-viewer-input',
            'JSON Parser': 'json-parser-input',
            'JSON Export': 'json-export-input',
        },
        extractContent: (item) => {
            const mainContent =
                item.content.leftContent ||
                item.content.rightContent ||
                JSON.stringify(item.content);
            return typeof mainContent === 'string' ? mainContent : JSON.stringify(mainContent);
        },
    },
    sharedTabs: {
        pageName: 'json',
        queryKey: 'json',
        toolMapping: {
            'JSON Diff': { name: 'Diff', icon: Share2, color: 'text-blue-500' },
            'JSON Format': { name: 'Format', icon: Code, color: 'text-green-500' },
            'JSON Minify': { name: 'Minify', icon: Minimize2, color: 'text-purple-500' },
            'JSON Viewer': { name: 'Viewer', icon: Eye, color: 'text-orange-500' },
            'JSON Parser': { name: 'Parser', icon: FileJson, color: 'text-pink-500' },
            'JSON Export': { name: 'Export', icon: FileDown, color: 'text-indigo-500' },
            'JSON Schema': { name: 'Schema', icon: Bookmark, color: 'text-teal-500' },
        },
        tabMapping: {
            'JSON Diff': 'diff',
            'JSON Format': 'format',
            'JSON Minify': 'minify',
            'JSON Viewer': 'viewer',
            'JSON Parser': 'parser',
            'JSON Export': 'export',
            'JSON Schema': 'schema',
        },
    },
};
```

- [ ] **Step 2: Verify build**

Run: `npm run build`
Expected: Build succeeds

- [ ] **Step 3: Commit**

```bash
git add lib/config/tools.ts
git commit -m "feat: add JSON_CONFIG saved/shared tab configurations

- Add savedTabs for all 7 tools (Diff, Format, Minify, Viewer, Parser, Export)
- Add sharedTabs for all 7 tools including Schema
- Configure toolMapping, tabMapping, and storageKeyMapping for each tool

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>"
```

---

## Task 6: Add BASE64_CONFIG Tab Configurations

**Files:**

- Modify: `lib/config/tools.ts:56-64`

- [ ] **Step 1: Add Base64Stats import**

Add this import at the top of the file (around line 16):

```typescript
import { Base64Stats } from '@/components/base64';
```

- [ ] **Step 2: Add savedTabs and sharedTabs to BASE64_CONFIG**

Replace the entire `BASE64_CONFIG` object (lines 57-64) with:

```typescript
// Base64 Tool Configuration
export const BASE64_CONFIG: ToolConfig = {
    pageName: 'base64',
    defaultTab: 'media-to-base64',
    mainTabs: [
        { value: 'media-to-base64', label: 'Media to Base64', icon: FileCode },
        { value: 'base64-to-media', label: 'Base64 to Media', icon: ImageIcon },
    ],
    savedTabs: {
        pageName: 'base64',
        queryKey: 'base64',
        toolMapping: {
            'Media to Base64': { name: 'Media to Base64', icon: FileCode, color: 'text-blue-500' },
            'Base64 to Media': { name: 'Base64 to Media', icon: ImageIcon, color: 'text-green-500' },
        },
        tabMapping: {
            'Media to Base64': 'media-to-base64',
            'Base64 to Media': 'base64-to-media',
        },
        storageKeyMapping: {
            'Media to Base64': 'base64-media-input-content',
            'Base64 to Media': 'base64-media-input-content',
        },
        extractContent: (item) => {
            // Note: Base64 uses rightContent first (different from text/JSON)
            const mainContent =
                item.content.rightContent ||
                item.content.leftContent ||
                JSON.stringify(item.content);
            return typeof mainContent === 'string' ? mainContent : JSON.stringify(mainContent);
        },
    },
    sharedTabs: {
        pageName: 'base64',
        queryKey: 'base64',
        toolMapping: {
            'Media to Base64': { name: 'Media to Base64', icon: FileText, color: 'text-blue-500' },
            'Base64 to Media': { name: 'Base64 to Media', icon: ImageIcon, color: 'text-green-500' },
        },
        tabMapping: {
            'Media to Base64': 'media-to-base64',
            'Base64 to Media': 'base64-to-media',
        },
        renderStats: (item) => {
            const content = (item.content.rightContent || item.content.leftContent || JSON.stringify(item.content)) as string;
            return <Base64Stats content={content} />;
        },
    },
};
```

- [ ] **Step 3: Verify build**

Run: `npm run build`
Expected: Build succeeds

- [ ] **Step 4: Commit**

```bash
git add lib/config/tools.ts
git commit -m "feat: add BASE64_CONFIG saved/shared tab configurations

- Add savedTabs for both tools (Media to Base64, Base64 to Media)
- Add sharedTabs with custom renderStats for Base64Stats component
- Note: Base64 extractContent uses rightContent first (different from text/JSON)

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>"
```

---

## Task 7: Update Text Page to Use Factory Functions

**Files:**

- Modify: `app/text/page.tsx:1-35`

- [ ] **Step 1: Replace wrapper imports with factory imports**

Replace lines 1-11 with:

```typescript
'use client';

import { Suspense } from 'react';
import { ToolPage } from '@/components/pages/tool-page';
import { TEXT_CONFIG } from '@/lib/config/tools';
import { createSavedTab, createSharedTab } from '@/lib/components/tab-factory';
import { TextDiffTab } from '@/app/text/tabs/text-diff-tab';
import { TextConvertTab } from '@/app/text/tabs/text-convert-tab';
import { TextCleanTab } from '@/app/text/tabs/text-clean-tab';
import { TextHistoryTab } from '@/app/text/tabs/text-history-tab';

// Create components once (outside render function)
const TextSavedTab = createSavedTab(TEXT_CONFIG.savedTabs!);
const TextSharedTab = createSharedTab(TEXT_CONFIG.sharedTabs!);
```

- [ ] **Step 2: Verify build**

Run: `npm run build`
Expected: Build succeeds

- [ ] **Step 3: Commit**

```bash
git add app/text/page.tsx
git commit -m "refactor: update text page to use factory-created tab components

- Replace TextSavedTab and TextSharedTab wrapper imports
- Use createSavedTab and createSharedTab factory functions
- Create components once outside render function for performance

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>"
```

---

## Task 8: Update JSON Page to Use Factory Functions

**Files:**

- Modify: `app/json/page.tsx:1-43`

- [ ] **Step 1: Replace wrapper imports with factory imports**

Replace lines 1-15 with:

```typescript
'use client';

import { Suspense } from 'react';
import { ToolPage } from '@/components/pages/tool-page';
import { JSON_CONFIG } from '@/lib/config/tools';
import { createSavedTab, createSharedTab } from '@/lib/components/tab-factory';
import { JsonDiffTab } from '@/app/json/tabs/json-diff-tab';
import { JsonFormatTab } from '@/app/json/tabs/json-format-tab';
import { JsonMinifyTab } from '@/app/json/tabs/json-minify-tab';
import { JsonViewerTab } from '@/app/json/tabs/json-viewer-tab';
import { JsonParserTab } from '@/app/json/tabs/json-parser-tab';
import { JsonExportTab } from '@/app/json/tabs/json-export-tab';
import { JsonSchemaTab } from '@/app/json/tabs/json-schema-tab';
import { JsonHistoryTab } from '@/app/json/tabs/json-history-tab';

// Create components once (outside render function)
const JsonSavedTab = createSavedTab(JSON_CONFIG.savedTabs!);
const JsonSharedTab = createSharedTab(JSON_CONFIG.sharedTabs!);
```

- [ ] **Step 2: Verify build**

Run: `npm run build`
Expected: Build succeeds

- [ ] **Step 3: Commit**

```bash
git add app/json/page.tsx
git commit -m "refactor: update JSON page to use factory-created tab components

- Replace JsonSavedTab and JsonShareTab wrapper imports
- Use createSavedTab and createSharedTab factory functions
- Create components once outside render function for performance

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>"
```

---

## Task 9: Update Base64 Page to Use Factory Functions

**Files:**

- Modify: `app/base64/page.tsx:1-33`

- [ ] **Step 1: Replace wrapper imports with factory imports**

Replace lines 1-10 with:

```typescript
'use client';

import { Suspense } from 'react';
import { ToolPage } from '@/components/pages/tool-page';
import { BASE64_CONFIG } from '@/lib/config/tools';
import { createSavedTab, createSharedTab } from '@/lib/components/tab-factory';
import { MediaToBase64Tab } from '@/app/base64/tabs/media-to-base64-tab';
import { Base64ToMediaTab } from '@/app/base64/tabs/base64-to-media-tab';
import { Base64HistoryTab } from '@/app/base64/tabs/base64-history-tab';

// Create components once (outside render function)
const Base64SavedTab = createSavedTab(BASE64_CONFIG.savedTabs!);
const Base64SharedTab = createSharedTab(BASE64_CONFIG.sharedTabs!);
```

- [ ] **Step 2: Verify build**

Run: `npm run build`
Expected: Build succeeds

- [ ] **Step 3: Commit**

```bash
git add app/base64/page.tsx
git commit -m "refactor: update Base64 page to use factory-created tab components

- Replace Base64SavedTab and Base64SharedTab wrapper imports
- Use createSavedTab and createSharedTab factory functions
- Create components once outside render function for performance

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>"
```

---

## Task 10: Delete Tab Wrapper Files

**Files:**

- Delete: `app/text/tabs/text-saved-tab.tsx`
- Delete: `app/text/tabs/text-shared-tab.tsx`
- Delete: `app/json/tabs/json-saved-tab.tsx`
- Delete: `app/json/tabs/json-share-tab.tsx`
- Delete: `app/base64/tabs/base64-saved-tab.tsx`
- Delete: `app/base64/tabs/base64-shared-tab.tsx`

- [ ] **Step 1: Delete all 6 wrapper files**

Run: `rm app/text/tabs/text-saved-tab.tsx app/text/tabs/text-shared-tab.tsx app/json/tabs/json-saved-tab.tsx app/json/tabs/json-share-tab.tsx app/base64/tabs/base64-saved-tab.tsx app/base64/tabs/base64-shared-tab.tsx`

- [ ] **Step 2: Verify build**

Run: `npm run build`
Expected: Build succeeds with no errors

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "refactor: delete tab wrapper components replaced by factory functions

- Delete text-saved-tab.tsx and text-shared-tab.tsx
- Delete json-saved-tab.tsx and json-share-tab.tsx
- Delete base64-saved-tab.tsx and base64-shared-tab.tsx
- All functionality now provided by factory-created components

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>"
```

---

## Task 11: Final Build Verification

**Files:**

- Test: Build system

- [ ] **Step 1: Run full build**

Run: `npm run build`
Expected: Clean build with no TypeScript errors, no missing imports

- [ ] **Step 2: Verify no TypeScript errors**

Check build output for:

- No "Cannot find module" errors
- No "Property 'savedTabs' does not exist" errors
- No missing icon import errors
- All components resolve correctly

- [ ] **Step 3: Run linter**

Run: `npm run lint`
Expected: No linting errors

- [ ] **Step 4: Commit verification**

```bash
git add -A
git commit -m "test: verify build and linting pass after tab optimization

- Confirm all TypeScript errors resolved
- Verify all imports resolve correctly
- Ensure no functionality regressions

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>"
```

---

## Task 12: Functional Testing - Text Tool

**Files:**

- Test: Manual testing in browser

- [ ] **Step 1: Start dev server**

Run: `npm run dev`

- [ ] **Step 2: Test Text Saved tab**

Navigate to `http://localhost:3000/text`:

1. Click on "Saved" tab
2. Verify authentication gate appears if not logged in
3. Log in if needed
4. Verify saved items load (if any exist)
5. Check that tool icons and colors match configuration
6. Test "Restore" button on a saved item
7. Verify it navigates to correct tool tab

- [ ] **Step 3: Test Text Shared tab**

1. Click on "Shared" tab
2. Verify shared items load (if any exist)
3. Check that tool icons and colors match configuration
4. Test "Restore" button on a shared item
5. Verify it navigates to correct tool tab

- [ ] **Step 4: Test content extraction**

1. Create content in Diff tool
2. Save it
3. Verify content preview shows correctly in Saved tab
4. Confirm leftContent is extracted first (text tool behavior)

- [ ] **Step 5: Document test results**

Create a note with test results (pass/fail for each step)

---

## Task 13: Functional Testing - JSON Tool

**Files:**

- Test: Manual testing in browser

- [ ] **Step 1: Test JSON Saved tab**

Navigate to `http://localhost:3000/json`:

1. Click on "Saved" tab
2. Verify all 7 tools appear correctly (Diff, Format, Minify, Viewer, Parser, Export)
3. Check tool icons and colors match configuration
4. Test restore functionality for each tool type

- [ ] **Step 2: Test JSON Shared tab**

1. Click on "Shared" tab
2. Verify all 7 tools appear correctly (including Schema)
3. Check tool icons and colors match configuration
4. Test restore functionality

- [ ] **Step 3: Verify storage keys**

1. Save content from each JSON tool
2. Confirm correct storage keys are used:
    - `json-diff-left-input`
    - `json-format-input`
    - `json-minify-input`
    - `json-viewer-input`
    - `json-parser-input`
    - `json-export-input`

- [ ] **Step 4: Document test results**

Create a note with test results (pass/fail for each step)

---

## Task 14: Functional Testing - Base64 Tool

**Files:**

- Test: Manual testing in browser

- [ ] **Step 1: Test Base64 Saved tab**

Navigate to `http://localhost:3000/base64`:

1. Click on "Saved" tab
2. Verify both tools appear correctly
3. Check that extractContent uses rightContent first (different from text/JSON)
4. Test restore functionality

- [ ] **Step 2: Test Base64 Shared tab**

1. Click on "Shared" tab
2. Verify both tools appear correctly
3. **CRITICAL:** Verify `Base64Stats` component renders correctly
4. Check that stats display shows content information
5. Test restore functionality

- [ ] **Step 3: Verify shared storage keys**

1. Both tools should use `base64-media-input-content`
2. Confirm this works correctly

- [ ] **Step 4: Document test results**

Create a note with test results (pass/fail for each step)

---

## Task 15: Regression Testing

**Files:**

- Test: Manual testing across all tools

- [ ] **Step 1: Verify authentication gates**

Test all three tools:

1. Log out
2. Navigate to Saved tab - should see auth prompt
3. Navigate to Shared tab - should see auth prompt
4. Log in
5. Verify tabs work correctly

- [ ] **Step 2: Verify no functionality removed**

Check all existing features:

- Save functionality works in all tools
- Share functionality works in all tools
- Restore functionality works in all tools
- Delete functionality works in all tools
- Copy to clipboard works
- View full content dialog works

- [ ] **Step 3: Verify existing data**

1. Check that previously saved items still appear
2. Check that previously shared items still appear
3. Verify no data loss

- [ ] **Step 4: Document final test results**

Create comprehensive test report with all results

---

## Task 16: Final Cleanup and Documentation

**Files:**

- Create: Implementation summary

- [ ] **Step 1: Verify all files deleted**

Confirm these files no longer exist:

- [ ] `app/text/tabs/text-saved-tab.tsx`
- [ ] `app/text/tabs/text-shared-tab.tsx`
- [ ] `app/json/tabs/json-saved-tab.tsx`
- [ ] `app/json/tabs/json-share-tab.tsx`
- [ ] `app/base64/tabs/base64-saved-tab.tsx`
- [ ] `app/base64/tabs/base64-shared-tab.tsx`

- [ ] **Step 2: Count lines of code**

Run: `find lib/components/tab-factory.ts lib/config/tools.ts -name "*.ts" -type f | xargs wc -l`
Note the total for documentation

- [ ] **Step 3: Create implementation summary**

Document:

- Files created: 1 (tab-factory.ts)
- Files modified: 4 (tools.ts, 3 page files)
- Files deleted: 6 (wrapper components)
- Net code reduction: ~36 lines
- Architectural improvement: 6 fewer files to maintain

- [ ] **Step 4: Final commit**

```bash
git add -A
git commit -m "docs: complete tab-level optimization implementation

Summary:
- Created configuration-driven architecture for tab components
- Eliminated 6 wrapper components using factory functions
- All functionality preserved and tested
- ~12% net code reduction, 50% reduction in file count
- Centralized all tab configuration in tools.ts

Files:
- Created: lib/components/tab-factory.ts
- Modified: lib/config/tools.ts, app/text/page.tsx, app/json/page.tsx, app/base64/page.tsx
- Deleted: 6 tab wrapper component files

Testing:
- Build verification: PASS
- Text tool Saved/Shared tabs: PASS
- JSON tool Saved/Shared tabs (all 7 tools): PASS
- Base64 tool Saved/Shared tabs: PASS
- Authentication gates: PASS
- Save/restore functionality: PASS
- Share/restore functionality: PASS
- Base64Stats rendering: PASS
- Content extraction (correct order): PASS
- No functionality removed: VERIFIED

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>"
```

---

## Success Criteria Checklist

- [ ] All required icons imported in `lib/config/tools.ts`
- [ ] Factory functions created in `lib/components/tab-factory.ts`
- [ ] TEXT_CONFIG extended with savedTabs and sharedTabs
- [ ] JSON_CONFIG extended with savedTabs and sharedTabs (including JSON Schema)
- [ ] BASE64_CONFIG extended with savedTabs and sharedTabs (with renderStats)
- [ ] Page files updated to use factory functions
- [ ] All 6 tab wrapper files deleted
- [ ] Build succeeds with no TypeScript errors
- [ ] Text Saved/Shared tabs work correctly (Diff, Convert, Clean)
- [ ] JSON Saved/Shared tabs work correctly (all 7 tools)
- [ ] Base64 Saved/Shared tabs work correctly (both tools)
- [ ] Authentication gates work as before
- [ ] Save/restore functionality works for all tools
- [ ] Share/restore functionality works for all tools
- [ ] Base64Stats renders correctly in Base64 shared tab
- [ ] Content extraction works correctly (Base64 uses rightContent first)
- [ ] All storage keys verified and correct
- [ ] No functionality removed compared to current implementation

---

## Notes for Implementation

**Important:**

- Follow TDD principles - verify each step before proceeding
- Commit frequently (after each task)
- Test thoroughly after each major change
- Don't skip the manual testing tasks
- Verify all storage keys match exactly with current implementation
- Base64 extractContent uses rightContent FIRST (different from text/JSON)
- JSON Schema must be included in sharedTabs configuration
- All components must be created once outside render function

**References:**

- Design spec: `docs/superpowers/specs/2026-04-16-tab-optimization-design.md`
- Existing tab wrappers: Read them to verify configuration accuracy
- SavedTab component: `components/shared/saved-tab.tsx`
- SharedTab component: `components/shared/shared-tab.tsx`
