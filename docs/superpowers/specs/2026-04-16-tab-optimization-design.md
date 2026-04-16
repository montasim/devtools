# Tab-Level Optimization Design

**Date:** 2026-04-16
**Status:** Approved
**Approach:** Generic Tab Factory Functions with Configuration-Driven Architecture

## Overview

This design extends the successful page-level optimization pattern to tab components, creating a configuration-driven architecture that eliminates code duplication while maintaining all functionality. The goal is to reduce the 6 tab wrapper components (Saved and Shared tabs for text, JSON, and Base64 tools) to a generic, configuration-based system.

**Scope:** This optimization covers Saved and Shared tabs only. History tabs are not in scope for this optimization.

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

**Icon Imports in `lib/config/tools.ts`:**

All icons used in configurations must be imported at the top of the file:

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
    FileText,
} from 'lucide-react';
```

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

**BASE64_CONFIG extension:**

```typescript
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
            const mainContent = item.content.rightContent || item.content.leftContent || JSON.stringify(item.content);
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

Similar configuration for `JSON_CONFIG` with all 7 tools including `'JSON Schema'`.

### Page File Usage

**Updated page files:**

```typescript
// app/text/page.tsx
import { TEXT_CONFIG } from '@/lib/config/tools';
import { createSavedTab, createSharedTab } from '@/lib/components/tab-factory';

// Create components once (outside render function)
const TextSavedTab = createSavedTab(TEXT_CONFIG.savedTabs!);
const TextSharedTab = createSharedTab(TEXT_CONFIG.sharedTabs!);

function TextPageContent() {
    const components = {
        diff: TextDiffTab,
        convert: TextConvertTab,
        clean: TextCleanTab,
        saved: TextSavedTab,  // Factory-created component
        shared: TextSharedTab, // Factory-created component
        history: TextHistoryTab,
    };

    return <ToolPage config={TEXT_CONFIG} components={components} />;
}

export default function TextPage() {
    return <TextPageContent />;
}
```

**Note:** Components are created once outside the render function to avoid recreating them on every render. The `ToolPage` component receives a `components` object, not individual tab props.

## Implementation Steps

1. **Add icon imports:** Import all required icons at the top of `lib/config/tools.ts`
2. **Create factory functions:** Create `lib/components/tab-factory.ts` with `createSavedTab` and `createSharedTab`
3. **Extend configuration:** Add `savedTabs` and `sharedTabs` to `TEXT_CONFIG`, `JSON_CONFIG`, and `BASE64_CONFIG` in `lib/config/tools.ts`
4. **Update page files:** Modify `app/text/page.tsx`, `app/json/page.tsx`, and `app/base64/page.tsx` to use factory functions
5. **Delete wrapper files:** Remove all 6 tab wrapper component files
6. **Verify build:** Run `npm run build` to ensure no TypeScript errors
7. **Functional testing:** Test all Saved/Shared tabs across all three tools

## Migration and Rollback

**Migration Strategy:**

- All changes can be deployed atomically in a single commit
- No database migrations required
- No API changes required
- Local storage keys remain unchanged (user data preserved)

**Rollback Plan:**

- Keep the implementation in a feature branch until testing is complete
- If issues arise, revert the single commit to restore previous functionality
- No data migration needed (local storage and database unchanged)
- Simple git revert will restore all deleted files and remove new code

**Deployment Safety:**

- Run full test suite before merging
- Test all three tools (text, JSON, Base64) thoroughly
- Verify authentication gates still work
- Confirm save/restore and share/restore functionality
- No gradual rollout needed - changes are purely structural

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

## Performance Considerations

**Factory Function Overhead:**

- Factory functions are called once per page load (module initialization), not on every render
- Components are created once and reused across renders
- No performance impact compared to current implementation

**Runtime Performance:**

- Configuration objects are created once at module load time
- No additional runtime overhead compared to hardcoded values
- React component rendering behavior unchanged

**Build Performance:**

- Minimal impact on build time (slight increase due to additional TypeScript type checking)
- No changes to bundle size (same components, just different organization)

## Testing Strategy

### Pre-Implementation Verification

**Configuration Accuracy:**

- Verify all tool names match exactly with current implementation
- Cross-reference all storage keys with actual usage
- Confirm all icon imports are included in `tools.ts`
- Verify `extractContent` functions match current logic (note: Base64 uses rightContent first)
- Ensure JSON Schema tool is included in shared tabs configuration

**Storage Key Verification:**

- Text Diff: `'text-diff-left-input'`
- Text Convert: `'text-convert-input'`
- Text Clean: `'text-clean-input'`
- JSON Diff: `'json-diff-left-input'`
- JSON Format: `'json-format-input'`
- JSON Minify: `'json-minify-input'`
- JSON Viewer: `'json-viewer-input'`
- JSON Parser: `'json-parser-input'`
- JSON Export: `'json-export-input'`
- Base64 (both tools): `'base64-media-input-content'`

### Build Verification

- Run `npm run build` to ensure no TypeScript errors
- Verify all imports resolve correctly
- Check for missing configuration fields
- Confirm all icon types are compatible

### Functional Testing

**Text Tool:**

- Test Saved tab for Diff, Convert, Clean
- Test Shared tab for Diff, Convert, Clean
- Verify authentication gates work correctly
- Test save/restore functionality for each tool
- Test share/restore functionality for each tool
- Verify content extraction uses correct order (leftContent first)

**JSON Tool:**

- Test Saved tab for all 7 tools (Diff, Format, Minify, Viewer, Parser, Export, Schema)
- Test Shared tab for all 7 tools
- Verify authentication gates work correctly
- Test save/restore functionality for each tool
- Test share/restore functionality for each tool
- Verify content extraction uses correct order (leftContent first)

**Base64 Tool:**

- Test Saved tab for both tools (Media to Base64, Base64 to Media)
- Test Shared tab for both tools
- Verify authentication gates work correctly
- Test save/restore functionality for each tool
- Test share/restore functionality for each tool
- Verify content extraction uses correct order (rightContent first)
- Verify `renderStats` displays `Base64Stats` component correctly

### Regression Testing

- Ensure no functionality is removed (key requirement)
- All existing features work identically
- No breaking changes to user experience
- API endpoints unchanged
- Local storage keys unchanged
- Existing saved/shared items still accessible
- URL structure unchanged

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
- [ ] Content extraction works correctly (note: Base64 uses rightContent first)
- [ ] All storage keys verified and correct
- [ ] No functionality removed compared to current implementation
