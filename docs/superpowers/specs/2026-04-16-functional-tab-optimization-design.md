# Functional Tab Code Optimization Design

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this design task-by-task.

**Goal:** Eliminate code duplication across 12 functional tabs (2,693 lines) while preserving exact UI and functionality

**Architecture:** Layered architecture of reusable hooks and components for state management, dialogs, and actions

**Tech Stack:** React hooks, TypeScript, existing UI components, localStorage

---

## Problem Statement

Currently, 12 functional tabs across Text/JSON/Base64 tools contain significant code duplication:

**Current State:**

- **Text tabs**: 3 files (481 lines) - diff, convert, clean
- **JSON tabs**: 7 files (1,068 lines) - diff, format, minify, viewer, parser, export, schema
- **Base64 tabs**: 2 files (1,144 lines) - media-to-base64, base64-to-media
- **Total**: 12 files, 2,693 lines

**Duplication Patterns:**

1. State management (currentContent, share dialogs, clear dialogs)
2. Share/clear/save handlers with identical logic
3. Toolbar configuration (actions, toggles)
4. Dialog management (ConfirmDialog, Share\*Dialog)
5. localStorage persistence patterns
6. Shared data loading logic
7. Content change tracking

**Example:**

- 11 tabs use identical share dialog pattern
- 10 tabs use identical clear confirmation pattern
- All tabs track `currentContent` for sharing
- All tabs have similar content change handlers

## Solution: Layered Architecture

Create reusable primitives that all tabs can use while maintaining their exact current UI and functionality.

### Layer 1: Shared Hooks

**`useTabState`** - Content and persistence management

```typescript
interface UseTabStateOptions<T> {
    storageKey: string;
    initialContent?: string;
    sharedData?: SharedTabData;
}

interface UseTabStateReturn<T> {
    content: T;
    setContent: (content: T) => void;
    currentContent: T;
    hasContent: boolean;
    isSharedData: boolean;
}
```

**Responsibilities:**

- Manage content state (useState)
- Handle shared data loading on mount
- Track currentContent for sharing
- Provide hasContent boolean for UI conditionals
- Flag if content is from shared data

**`useShareDialog`** - Share dialog management

```typescript
interface UseShareDialogOptions {
    contentType: 'text' | 'json' | 'base64';
    toolName: string;
    onShare?: (data: ShareData) => void;
}

interface UseShareDialogReturn {
    isShareDialogOpen: boolean;
    openShareDialog: () => void;
    closeShareDialog: () => void;
    ShareDialogComponent: ComponentType<{ content: string }>;
}
```

**Responsibilities:**

- Manage share dialog open/close state
- Validate content before opening (not empty)
- Provide pre-configured ShareDialog component
- Call onShare callback when share completes

**`useClearDialog`** - Clear confirmation management

```typescript
interface UseClearDialogReturn {
    showClearDialog: boolean;
    openClearDialog: () => void;
    closeClearDialog: () => void;
    confirmClear: () => void;
    ClearDialogComponent: ComponentType;
}
```

**Responsibilities:**

- Manage clear dialog open/close state
- Call onClear callback on confirmation
- Provide pre-configured ConfirmDialog component

### Layer 2: Shared Components

**`ToolLayout`** - Main layout wrapper

```typescript
interface ToolLayoutProps<T> {
    toolName: string;
    contentType: 'text' | 'json' | 'base64';
    children: (props: ToolContentProps) => ReactNode;
    toolbarActions?: ToolbarAction[];
    toolbarToggles?: ToolbarToggle[];
    settings?: ReactNode;
    onClear?: () => void;
}
```

**Responsibilities:**

- Wrap children with Toolbar
- Wire up standard actions (Clear, Save, Share)
- Integrate share/clear dialogs
- Provide settings panel if provided
- Handle responsive layout

**`ToolActions`** - Standardized action buttons

```typescript
interface ToolActionsProps {
    toolName: string;
    contentType: 'text' | 'json' | 'base64';
    content: string;
    onClear: () => void;
    onShare: () => void;
}
```

**Responsibilities:**

- Render Clear, Save, Share buttons
- Consistent styling and behavior
- Icons from lucide-react

### Layer 3: Utility Functions

**`saveContent.ts`** - Unified save utilities

```typescript
export function saveContent(
    contentType: 'text' | 'json' | 'base64',
    toolName: string,
    content: string,
): void {
    // Delegates to existing save*Content functions
    const saveFn = {
        text: saveTextContent,
        json: saveJsonContent,
        base64: saveBase64Content,
    }[contentType];

    saveFn(toolName, content);
}
```

**`shareValidation.ts`** - Common validation logic

```typescript
export function validateContentForShare(
    content: string,
    contentType: string,
): { valid: boolean; error?: string } {
    if (!content?.trim()) {
        return {
            valid: false,
            error: `No ${contentType} content to share. Please enter some content first.`,
        };
    }
    return { valid: true };
}
```

## Data Flow Architecture

### Current Flow (Per Tab)

```
Tab Component
  ├─ useState (content, dialogs, settings)
  ├─ localStorage operations
  ├─ Toolbar → Actions (Clear/Save/Share)
  ├─ Dialog components
  └─ Tool-specific pane component
```

### Optimized Flow

```
Tab Component
  ├─ useTabState (content, persistence, shared data)
  ├─ useShareDialog (share state + component)
  ├─ useClearDialog (clear state + component)
  └─ ToolLayout
      ├─ Toolbar (standardized actions)
      ├─ ShareDialog (from hook)
      ├─ ClearDialog (from hook)
      └─ Children (tool-specific UI)
```

**Key Flow Changes:**

1. **Content Management**: `useTabState` owns all content state and persistence
2. **Dialog Management**: Hooks own dialog state and provide pre-built components
3. **Action Handlers**: ToolLayout wires up standard actions automatically
4. **Tab Simplicity**: Tabs focus on their unique logic only

## Error Handling Strategy

### Unified Error Handling

**Hook Errors:**

```typescript
// All hooks implement this pattern
interface HookErrors {
    loadError: Error | null;
    saveError: Error | null;
    clearError: Error | null;
}

// localStorage operations
try {
    const saved = localStorage.getItem(key);
    // ...
} catch (error) {
    console.error(`Failed to load from ${key}:`, error);
    toast.error('Failed to load saved data');
    setError(error);
}
```

**Share Validation:**

```typescript
const validateBeforeShare = (content: string) => {
    if (!content?.trim()) {
        toast.error('No content to share. Please enter some content first.');
        return false;
    }
    return true;
};
```

**Error Boundaries:**

- Wrap each tab in error boundary
- Graceful fallback UI on errors
- Console logging (not user-facing unless critical)

## Migration Strategy

### Incremental Migration (One Tab at a Time)

**Phase 1: Foundation** (Low risk, high validation)

1. Create shared hooks in `hooks/`
2. Migrate `text-convert-tab.tsx` (41 lines, simplest)
3. Verify UI unchanged visually
4. Test all functionality (share/save/clear)
5. Console check for errors

**Phase 2: Medium Complexity**

1. Create ToolLayout and ToolActions components
2. Migrate JSON format/minify/parser tabs
3. Validate with settings/toggles
4. Test share dialogs
5. Verify patterns scale

**Phase 3: Heavy Lifting**

1. Optimize Base64 tabs (534 + 610 lines)
2. Most complex state management
3. Validate full architecture
4. Performance check

**Phase 4: Final Migration**

1. Migrate remaining tabs
2. Full regression test
3. Clean up old patterns

### Validation After Each Migration

**Visual Regression:**

- Screenshot comparison before/after
- Verify toolbar layout identical
- Verify dialog appearance unchanged

**Functional Testing:**

- [ ] Content loads from localStorage on mount
- [ ] Content persists on change
- [ ] Share dialog opens/closes correctly
- [ ] Share validation works (empty content)
- [ ] Save functionality works
- [ ] Clear confirmation works
- [ ] Shared data loads correctly
- [ ] No console errors or warnings

**Code Quality:**

- TypeScript compilation passes
- ESLint passes
- Prettier formatting applied
- Build succeeds

## Testing Strategy

### Unit Tests

**Hook Tests:**

- `useTabState` - content management, localStorage, shared data loading
- `useShareDialog` - validation, dialog state, ShareDialog rendering
- `useClearDialog` - confirmation flow, callback execution

**Utility Tests:**

- `saveContent` - delegates to correct save function
- `shareValidation` - validates content correctly

### Integration Tests

**Component Tests:**

- ToolLayout with different tab types
- ToolActions button rendering and callbacks
- Share dialog with validation scenarios
- Clear dialog with confirmation flow

**Persistence Tests:**

- localStorage save/load across operations
- Shared data loading on mount
- Content change tracking

### Manual Testing Checklist

After each tab migration:

- [ ] Open tab, verify UI renders correctly
- [ ] Enter content, verify it persists
- [ ] Refresh page, verify content loads
- [ ] Click Share, verify dialog opens
- [ ] Try Share with empty content, verify error
- [ ] Share with content, verify success
- [ ] Click Save, verify saves correctly
- [ ] Click Clear, verify confirmation dialog
- [ ] Confirm Clear, verify content cleared
- [ ] Test shared data URL loading
- [ ] Check console for errors/warnings

## File Structure

```
src/
├── hooks/
│   ├── useTabState.ts
│   ├── useShareDialog.ts
│   └── useClearDialog.ts
├── components/
│   └── tool-layout/
│       ├── ToolLayout.tsx
│       └── ToolActions.tsx
├── lib/
│   └── utils/
│       ├── saveContent.ts
│       └── shareValidation.ts
└── app/
    ├── text/tabs/
    │   ├── text-convert-tab.tsx (migrated)
    │   ├── text-diff-tab.tsx (migrated)
    │   └── text-clean-tab.tsx (migrated)
    ├── json/tabs/
    │   ├── json-format-tab.tsx (migrated)
    │   ├── json-minify-tab.tsx (migrated)
    │   └── ... (all migrated)
    └── base64/tabs/
        ├── media-to-base64-tab.tsx (migrated)
        └── base64-to-media-tab.tsx (migrated)
```

## Success Criteria

1. **Code Reduction**: 40-50% reduction in tab code (1,000+ lines eliminated)
2. **UI Unchanged**: Visual regression shows zero differences
3. **Functionality Preserved**: All features work exactly as before
4. **Type Safety**: Full TypeScript coverage, no any types
5. **Error Handling**: Consistent error handling across all tabs
6. **Test Coverage**: Unit and integration tests for shared code
7. **Build Success**: Production build passes without errors
8. **Console Clean**: No errors or warnings during usage

## Risks and Mitigations

| Risk                            | Mitigation                                    |
| ------------------------------- | --------------------------------------------- |
| Breaking existing functionality | Incremental migration, test after each change |
| UI/UX changes                   | Visual regression, screenshot comparison      |
| Type errors                     | Strong TypeScript types, strict compilation   |
| Performance issues              | Benchmark before/after, optimize hot paths    |
| localStorage edge cases         | Comprehensive error handling, fallbacks       |
| Shared data loading issues      | Test shared URLs, handle missing data         |

## Implementation Notes

- **Zero UI Changes**: This is purely a code refactoring, users see no difference
- **Backward Compatible**: Existing shared URLs continue to work
- **LocalStorage Preserved**: User data remains in same keys
- **Progressive Enhancement**: Migrate incrementally, can rollback at any step
- **Developer Experience**: Easier to add new tabs in the future

## Related Work

- Built on top of existing Saved/Shared/History tab optimization
- Uses same configuration-driven patterns where applicable
- Leverages existing share/save utilities (saveTextContent, etc.)
- Reuses existing UI components (Toolbar, ConfirmDialog, etc.)
