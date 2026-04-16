# Tab-Level Optimization Design

**Date:** 2026-04-16
**Status:** Approved
**Approach:** Generic Tab Factory Functions with Configuration-Driven Architecture

## Overview

This design extends the successful page-level optimization pattern to tab components, creating a configuration-driven architecture that eliminates code duplication while maintaining all functionality. The goal is to reduce the 6 tab wrapper components across text, JSON, and Base64 tools to a generic, configuration-based system.

## Problem Statement

Currently, each tool (text, JSON, Base64) has separate tab wrapper components:

- `TextSavedTab`, `TextSharedTab`
- `JsonSavedTab`, `JsonShareTab`
- `Base64SavedTab`, `Base64SharedTab`

These wrappers are thin configuration layers that pass hardcoded values to the shared `SavedTab` and `SharedTab` components. This results in:

- Code duplication across 6 files (~200 lines)
- Scattered configuration across multiple files
- Maintenance burden when adding new tools
- Inconsistent with the already-optimized page-level architecture

## Solution

### Architecture

Create generic factory functions that generate tab components from configuration, following the same pattern used successfully for page optimization.

### Configuration Structure

**Extended `lib/config/tools.ts`:**

```typescript
export interface ToolConfig {
    pageName: string;
    defaultTab: string;
    mainTabs: TabDefinition[];
    savedTabs?: SavedTabConfig;
    sharedTabs?: SharedTabConfig;
}

export interface SavedTabConfig {
    pageName: string;
    queryKey: string;
    toolMapping: Record<string, ToolMapping>;
    tabMapping: Record<string, string>;
    storageKeyMapping: Record<string, string>;
    extractContent?: (item: SavedItem) => string;
}

export interface SharedTabConfig {
    pageName: string;
    queryKey: string;
    toolMapping: Record<string, ToolMapping>;
    tabMapping: Record<string, string>;
    renderStats?: (item: SharedItem) => ReactNode;
}
```

### Component Factory

**New file: `lib/components/tab-factory.ts`**

```typescript
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

### Configuration Examples

**TEXT_CONFIG extension:**

```typescript
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

Similar configurations for `JSON_CONFIG` and `BASE64_CONFIG`.

### Page File Usage

**Updated page files:**

```typescript
// app/text/page.tsx
import { TEXT_CONFIG } from '@/lib/config/tools';
import { createSavedTab, createSharedTab } from '@/lib/components/tab-factory';

const TextSavedTab = createSavedTab(TEXT_CONFIG.savedTabs!);
const TextSharedTab = createSharedTab(TEXT_CONFIG.sharedTabs!);

export default function TextPage() {
    return (
        <ToolPage
            config={TEXT_CONFIG}
            savedTab={TextSavedTab}
            sharedTab={TextSharedTab}
        />
    );
}
```

## Implementation Steps

1. **Create factory functions:** Create `lib/components/tab-factory.ts` with `createSavedTab` and `createSharedTab`
2. **Extend configuration:** Add `savedTabs` and `sharedTabs` to `TEXT_CONFIG`, `JSON_CONFIG`, and `BASE64_CONFIG` in `lib/config/tools.ts`
3. **Update page files:** Modify `app/text/page.tsx`, `app/json/page.tsx`, and `app/base64/page.tsx` to use factory functions
4. **Delete wrapper files:** Remove all 6 tab wrapper component files
5. **Verify build:** Run `npm run build` to ensure no TypeScript errors
6. **Functional testing:** Test all Saved/Shared tabs across all three tools

## Data Flow

1. User navigates to `/text`, `/json`, or `/base64` page
2. Page component imports configuration (`TEXT_CONFIG`, `JSON_CONFIG`, or `BASE64_CONFIG`)
3. Factory functions create tab components with injected configuration
4. `ToolPage` renders tab components when user switches to Saved/Shared tabs
5. Tab components use injected config for API calls, storage keys, and content extraction
6. No change to existing data flow - configuration is just moved

## Error Handling

- All existing error handling in `SavedTab` and `SharedTab` components remains unchanged
- Configuration validation at build time (TypeScript ensures required fields)
- Missing configuration shows clear TypeScript errors
- Runtime behavior identical to current implementation

## Type Safety

- All configurations are fully typed
- Factory functions preserve component prop types
- No `any` types or type assertions needed
- TypeScript will catch missing required fields

## Testing Strategy

### Build Verification

- Run `npm run build` to ensure no TypeScript errors
- Verify all imports resolve correctly
- Check for missing configuration fields

### Functional Testing

- **Text Tool:** Test Saved/Shared tabs for Diff, Convert, Clean
- **JSON Tool:** Test Saved/Shared tabs for all 7 tools
- **Base64 Tool:** Test Saved/Shared tabs for both tools
- Verify authentication gates work correctly
- Test save/restore functionality for each tool
- Test share/restore functionality for each tool
- Verify content extraction works correctly

### Regression Testing

- Ensure no functionality is removed (key requirement)
- All existing features work identically
- No breaking changes to user experience
- API endpoints unchanged
- Local storage keys unchanged

## Benefits

- **~85% code reduction** in tab-related code (eliminate 6 wrapper files, ~200 lines)
- **Centralized configuration** - all tab configuration in `tools.ts`
- **Easier maintenance** - add new tools by adding configuration only
- **Consistency** - follows the same pattern as page optimization
- **Type safety** - fully typed with TypeScript
- **No functionality removed** - purely structural optimization

## Impact

- **Breaking changes:** Import changes in page files (acceptable per requirements)
- **User-facing changes:** None - all functionality preserved
- **API changes:** None
- **Storage changes:** None - same keys used

## Files Changed

### New Files

- `lib/components/tab-factory.ts`

### Modified Files

- `lib/config/tools.ts` - extend configurations
- `app/text/page.tsx` - use factory functions
- `app/json/page.tsx` - use factory functions
- `app/base64/page.tsx` - use factory functions

### Deleted Files

- `app/text/tabs/text-saved-tab.tsx`
- `app/text/tabs/text-shared-tab.tsx`
- `app/json/tabs/json-saved-tab.tsx`
- `app/json/tabs/json-share-tab.tsx`
- `app/base64/tabs/base64-saved-tab.tsx`
- `app/base64/tabs/base64-shared-tab.tsx`

## Success Criteria

- [ ] Build succeeds with no TypeScript errors
- [ ] All 6 tab wrapper files deleted
- [ ] Factory functions created and working
- [ ] All three tools have complete configurations
- [ ] Saved tabs work correctly for all tools
- [ ] Shared tabs work correctly for all tools
- [ ] Authentication gates work as before
- [ ] Save/restore functionality works
- [ ] Share/restore functionality works
- [ ] No functionality removed compared to current implementation
