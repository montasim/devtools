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
6. Shared data loading logic (including async arrival pattern)
7. Content change tracking
8. Error handling inconsistencies

**Example:**

- 11 tabs use identical share dialog pattern
- 10 tabs use identical clear confirmation pattern
- All tabs track `currentContent` for sharing
- All tabs have similar content change handlers
- All tabs handle shared data loading with similar patterns

## Solution: Layered Architecture

Create reusable primitives that all tabs can use while maintaining their exact current UI and functionality.

### Type Definitions

**Unified shared data types:**

```typescript
// types/tab-data.ts
export interface SharedTabData {
    tabName?: string;
    state?: {
        leftContent?: string;
        rightContent?: string;
    };
    title?: string;
    comment?: string | null;
    expiresAt?: string | null;
    hasPassword?: boolean;
    viewCount?: number;
    createdAt?: string;
}

export type TabContentType = 'text' | 'json' | 'base64';

export interface SinglePaneTabState {
    content: string;
    currentContent: string;
    hasContent: boolean;
    isSharedData: boolean;
}

export interface DualPaneTabState {
    content: { left: string; right: string };
    currentContent: { left: string; right: string };
    hasContent: boolean;
    isSharedData: boolean;
}
```

### Layer 1: Shared Hooks

**`useTabState`** - Content and persistence management

```typescript
interface UseTabStateOptions {
    // Support single or dual-pane tabs
    storageKeys:
        | string // Single pane: 'text-convert-input'
        | { left: string; right: string }; // Dual pane: { left: 'text-diff-left', right: 'text-diff-right' }
    initialContent?: string | { left: string; right: string };
    sharedData?: SharedTabData;
    tabName: string; // For detecting relevant shared data
}

type UseTabStateReturn = SinglePaneTabState | DualPaneTabState;

// Generic version with proper constraints
interface UseTabStateReturn<T extends string | Record<string, string>> {
    content: T;
    setContent: (content: T) => void;
    currentContent: T;
    hasContent: boolean;
    isSharedData: boolean;
    loadError: Error | null;
}
```

**Responsibilities:**

- Manage content state (useState with proper typing)
- Handle shared data loading on mount (including async arrival pattern)
- Track currentContent for sharing
- Provide hasContent boolean for UI conditionals
- Flag if content is from shared data
- Handle localStorage errors gracefully
- Support both single-pane (string) and dual-pane (Record) tabs
- Avoid hydration mismatches with careful initialization

**Dual-pane example:**

```typescript
// For diff tabs with left/right content
const { content, setContent } = useTabState<{
    left: string;
    right: string;
}>({
    storageKeys: {
        left: 'text-diff-left-input',
        right: 'text-diff-right-input',
    },
    tabName: 'diff',
    sharedData,
});
```

**Async shared data arrival pattern:**

```typescript
// Hook handles the pattern where sharedData arrives after mount
useEffect(() => {
    if (sharedData?.tabName === tabName && sharedData?.state && !isSharedData) {
        // Load shared data when it arrives
        loadSharedContent(sharedData.state);
    }
}, [sharedData, tabName, isSharedData]);
```

**`useShareDialog`** - Share dialog management

```typescript
interface UseShareDialogOptions {
    contentType: TabContentType;
    toolName: string;
    getContent: () => string; // Callback to get current content
    onShare?: (data: ShareData) => void;
}

interface UseShareDialogReturn {
    isShareDialogOpen: boolean;
    openShareDialog: () => void;
    closeShareDialog: () => void;
    // Render props pattern to avoid component recreation
    renderShareDialog: (content: string) => ReactNode;
}
```

**Responsibilities:**

- Manage share dialog open/close state
- Validate content before opening (not empty)
- Provide render props for ShareDialog (avoids component recreation on each render)
- Call onShare callback when share completes
- Handle validation errors with toast notifications

**`useClearDialog`** - Clear confirmation management

```typescript
interface UseClearDialogOptions {
    onConfirm: () => void;
    toolName: string; // For dialog message
}

interface UseClearDialogReturn {
    showClearDialog: boolean;
    openClearDialog: () => void;
    closeClearDialog: () => void;
    confirmClear: () => void;
    // Render props pattern to avoid component recreation
    renderClearDialog: () => ReactNode;
}
```

**Responsibilities:**

- Manage clear dialog open/close state
- Call onConfirm callback on confirmation
- Provide render props for ConfirmDialog (avoids component recreation)
- Include tool name in dialog message

### Layer 2: Shared Components

**Split responsibilities into focused components:**

**`ToolLayout`** - Layout wrapper only

```typescript
interface ToolLayoutProps {
    toolbar: ReactNode; // Composed toolbar
    dialogs?: ReactNode; // Dialog components
    children: ReactNode;
}

export function ToolLayout({ toolbar, dialogs, children }: ToolLayoutProps) {
    return (
        <>
            {toolbar}
            {children}
            {dialogs}
        </>
    );
}
```

**Responsibilities:**

- Layout structure only
- No business logic
- Compose toolbar, dialogs, and children

**`ToolToolbar`** - Toolbar composition

```typescript
interface ToolToolbarProps {
    leftContent?: ReactNode;
    actions?: ToolbarAction[];
    toggles?: ToolbarToggle[];
    settings?: ReactNode;
}

export function ToolToolbar({
    leftContent,
    actions,
    toggles,
    settings,
}: ToolToolbarProps) {
    return (
        <Toolbar
            leftContent={leftContent}
            actions={actions}
            toggles={toggles}
        />
    );
}
```

**Responsibilities:**

- Compose Toolbar component
- Layout of toolbar elements
- No state management

**`ToolDialogs`** - Dialog container

```typescript
interface ToolDialogsProps {
    shareDialog?: ReactNode;
    clearDialog?: ReactNode;
}

export function ToolDialogs({ shareDialog, clearDialog }: ToolDialogsProps) {
    return (
        <>
            {shareDialog}
            {clearDialog}
        </>
    );
}
```

**Responsibilities:**

- Render dialog components
- No dialog state (state in hooks)
- Simple composition

**`StandardActions`** - Action button factory

```typescript
interface StandardActionsProps {
    onClear: () => void;
    onShare: () => void;
    onSave: () => void;
    toolName: string;
}

export function StandardActions({
    onClear,
    onShare,
    onSave,
    toolName,
}: StandardActionsProps) {
    const actions: ToolbarAction[] = [
        {
            id: 'clear',
            label: 'Clear All',
            onClick: onClear,
            variant: 'outline',
            icon: <Trash2 className="h-4 w-4" />,
        },
        {
            id: 'save',
            label: 'Save',
            onClick: onSave,
            variant: 'outline',
            icon: <Bookmark className="h-4 w-4" />,
        },
        {
            id: 'share',
            label: 'Share',
            onClick: onShare,
            variant: 'default',
            icon: <Share2 className="h-4 w-4" />,
        },
    ];

    return <ActionButtonGroup actions={actions} />;
}
```

**Responsibilities:**

- Render Clear, Save, Share buttons
- Consistent styling and behavior
- Icons from lucide-react
- No share/save logic (callbacks provided)

### Layer 3: Utility Functions

**`saveContent.ts`** - Unified save utilities

```typescript
export function saveContent(contentType: TabContentType, toolName: string, content: string): void {
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
    contentType: TabContentType,
): { valid: boolean; error?: string } {
    if (!content?.trim()) {
        return {
            valid: false,
            error: `No ${contentType} content to share. Please enter some content first.`,
        };
    }
    return { valid: true };
}

export function validateBeforeShare(content: string): boolean {
    if (!content?.trim()) {
        toast.error('No content to share. Please enter some content first.');
        return false;
    }
    return true;
}
```

## Data Flow Architecture

### Current Flow (Per Tab)

```
Tab Component
  ├─ useState (content, dialogs, settings)
  ├─ localStorage operations (manual, error-prone)
  ├─ Toolbar → Actions (Clear/Save/Share)
  ├─ Dialog components (managed per tab)
  └─ Tool-specific pane component
```

### Optimized Flow

```
Tab Component
  ├─ useTabState (content, persistence, shared data, errors)
  ├─ useShareDialog (share state + render props)
  ├─ useClearDialog (clear state + render props)
  └─ ToolLayout
      ├─ ToolToolbar (composed actions/toggles)
      ├─ ToolDialogs (share + clear dialogs)
      └─ Children (tool-specific UI)
```

**Key Flow Changes:**

1. **Content Management**: `useTabState` owns all content state and persistence
2. **Dialog Management**: Hooks own dialog state and provide render props (no component recreation)
3. **Action Handlers**: Tabs provide callbacks, StandardActions renders buttons
4. **Tab Simplicity**: Tabs focus on their unique logic only
5. **Error Handling**: Consistent error handling in hooks

## Performance Analysis

### Hook Composition Overhead

**Concern:** 3 hooks per tab might increase render cycles

**Analysis:**

- Current approach: Each tab has 5-10 useState calls + multiple useEffect hooks
- Optimized approach: 3 consolidated hooks replace scattered state
- **Net effect**: Fewer render cycles due to consolidated state updates

**Benchmarking strategy:**

1. Measure current tab render frequency with React DevTools
2. Measure after migration with same user actions
3. Compare localStorage read/write performance
4. Validate no hydration errors

### Component Re-creation Prevention

**Problem:** Providing components from hooks causes re-renders

**Solution:** Use render props pattern

```typescript
// ❌ Bad - Component recreation
interface UseShareDialogReturn {
    ShareDialogComponent: ComponentType<{ content: string }>;
}

// ✅ Good - Render props
interface UseShareDialogReturn {
    renderShareDialog: (content: string) => ReactNode;
}
```

**Benefits:**

- No component recreation on each render
- Stable component references
- Better React.memo effectiveness

### Hydration Safety

**Current issue:** Tabs initialize state carefully to avoid Next.js hydration errors

**Solution:**

```typescript
const [content, setContent] = useState<string>(() => {
    // Lazy initialization avoids hydration mismatch
    if (typeof window === 'undefined') return '';
    try {
        return localStorage.getItem(key) || '';
    } catch {
        return '';
    }
});
```

## Error Handling Strategy

### Unified Error Handling

**Hook Errors:**

```typescript
interface HookErrors {
    loadError: Error | null;
    saveError: Error | null;
    clearError: Error | null;
}

// All localStorage operations wrapped
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

**Edge Cases Handled:**

1. **localStorage quota exceeded** - Catch and show error toast
2. **localStorage disabled** - Graceful fallback to memory-only state
3. **Hydration mismatch** - Lazy initialization with typeof window check
4. **Malformed shared data** - Try/catch with error fallback
5. **Async shared data arrival** - useEffect detects and loads when available

## Migration Strategy

### Incremental Migration (One Tab at a Time)

**Phase 1: Foundation** (Low risk, high validation)

1. Create type definitions in `types/tab-data.ts`
2. Create `useTabState` hook with single-pane support
3. Create `useShareDialog` and `useClearDialog` hooks
4. Migrate `text-convert-tab.tsx` (41 lines, simplest single-pane tab)
5. Verify UI unchanged visually
6. Test all functionality (share/save/clear/shared data)
7. Console check for errors

**Phase 2: Dual-Pane Support**

1. Extend `useTabState` to support dual-pane tabs
2. Create `ToolLayout`, `ToolToolbar`, `ToolDialogs` components
3. Create `StandardActions` component
4. Migrate `text-diff-tab.tsx` (validates dual-pane support)
5. Verify both left/right content work correctly
6. Test shared data loading for dual-pane

**Phase 3: Medium Complexity**

1. Migrate JSON format/minify/parser tabs
2. Validate with settings/toggles
3. Test share dialogs
4. Verify patterns scale with tool-specific features

**Phase 4: Heavy Lifting**

1. Optimize Base64 tabs (534 + 610 lines)
2. Most complex state management
3. Validate full architecture
4. Performance check

**Phase 5: Final Migration**

1. Migrate remaining tabs
2. Full regression test
3. Clean up old patterns
4. Update documentation

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
- [ ] Shared data loads correctly (including async arrival)
- [ ] Dual-pane tabs work correctly
- [ ] No console errors or warnings
- [ ] No hydration mismatches

**Code Quality:**

- TypeScript compilation passes
- ESLint passes
- Prettier formatting applied
- Build succeeds

**Performance:**

- No increase in render cycles
- localStorage operations performant
- No memory leaks
- Smooth UI interactions

### Rollback Strategy

**If issues found after migration:**

1. **Immediate rollback:** Revert the specific tab's migration commit
2. **Fix issue:** Address the problem in the shared code
3. **Retry migration:** Apply the fixed migration

**Process:**

- Each tab migration is a separate commit
- Commits are atomic (can be reverted independently)
- Shared infrastructure commits separate from tab migrations

**Example:**

```
commit 1: Add useTabState hook
commit 2: Migrate text-convert-tab to use hooks
commit 3: Migrate text-diff-tab to use hooks
# If commit 3 has issues:
git revert commit 3
# Fix useTabState for dual-pane
commit 4: Fix dual-pane support in useTabState
commit 5: Re-migrate text-diff-tab
```

## Testing Strategy

### Unit Tests

**Hook Tests:**

```typescript
// hooks/useTabState.test.ts
describe('useTabState', () => {
    it('should load content from localStorage on mount', () => {
        // Test localStorage loading
    });

    it('should handle shared data loading', () => {
        // Test shared data logic
    });

    it('should handle async shared data arrival', () => {
        // Test useEffect pattern
    });

    it('should handle localStorage errors gracefully', () => {
        // Test error handling
    });

    it('should support dual-pane tabs', () => {
        // Test left/right content
    });
});

// hooks/useShareDialog.test.ts
describe('useShareDialog', () => {
    it('should validate content before opening', () => {
        // Test validation
    });

    it('should not open dialog with empty content', () => {
        // Test error case
    });
});

// hooks/useClearDialog.test.ts
describe('useClearDialog', () => {
    it('should call onConfirm when confirmed', () => {
        // Test confirmation flow
    });
});
```

**Utility Tests:**

```typescript
// utils/shareValidation.test.ts
describe('validateContentForShare', () => {
    it('should validate non-empty content', () => {
        // Test valid case
    });

    it('should reject empty content', () => {
        // Test invalid case
    });
});
```

### Integration Tests

**Component Tests:**

```typescript
// components/tool-layout/ToolLayout.test.tsx
describe('ToolLayout', () => {
    it('should compose toolbar and dialogs correctly', () => {
        // Test composition
    });
});

// components/tool-layout/StandardActions.test.tsx
describe('StandardActions', () => {
    it('should render action buttons', () => {
        // Test rendering
    });

    it('should call callbacks correctly', () => {
        // Test interactions
    });
});
```

**Persistence Tests:**

```typescript
// hooks/useTabState.integration.test.ts
describe('useTabState integration', () => {
    it('should persist content to localStorage', () => {
        // Test save/load cycle
    });

    it('should handle shared data loading on mount', () => {
        // Test shared URL loading
    });

    it('should handle async shared data arrival', () => {
        // Test delayed shared data
    });
});
```

### Manual Testing Checklist

After each tab migration:

**Basic Functionality:**

- [ ] Open tab, verify UI renders correctly
- [ ] Enter content, verify it persists
- [ ] Refresh page, verify content loads
- [ ] Clear content, verify it's removed

**Share Functionality:**

- [ ] Click Share, verify dialog opens
- [ ] Try Share with empty content, verify error toast
- [ ] Share with content, verify success
- [ ] Copy share URL, verify it works
- [ ] Test shared URL in new tab/incognito

**Save Functionality:**

- [ ] Click Save, verify saves correctly
- [ ] Check Saved tab, verify item appears
- [ ] Load from Saved tab, verify content restores

**Clear Functionality:**

- [ ] Click Clear, verify confirmation dialog
- [ ] Cancel clear, verify content remains
- [ ] Confirm clear, verify content removed

**Dual-Pane Tabs (if applicable):**

- [ ] Both left and right content work
- [ ] Shared data loads both panes
- [ ] localStorage saves both panes
- [ ] Clear removes both panes

**Error Handling:**

- [ ] Check console for errors
- [ ] Test with localStorage disabled
- [ ] Test with malformed shared data
- [ ] Test with localStorage quota exceeded

**Performance:**

- [ ] No noticeable lag in interactions
- [ ] Content updates feel responsive
- [ ] No janky animations
- [ ] Memory usage stable

## Realistic Code Reduction Estimate

### Current State

- Text tabs: 481 lines (3 files)
- JSON tabs: 1,068 lines (7 files)
- Base64 tabs: 1,144 lines (2 files)
- **Total: 2,693 lines**

### New Infrastructure Code

**Type Definitions:** ~50 lines

- `types/tab-data.ts` - 50 lines

**Hooks:** ~250 lines

- `hooks/useTabState.ts` - 120 lines (single + dual pane support)
- `hooks/useShareDialog.ts` - 70 lines
- `hooks/useClearDialog.ts` - 60 lines

**Components:** ~150 lines

- `components/tool-layout/ToolLayout.tsx` - 20 lines
- `components/tool-layout/ToolToolbar.tsx` - 30 lines
- `components/tool-layout/ToolDialogs.tsx` - 20 lines
- `components/tool-layout/StandardActions.tsx` - 80 lines

**Utilities:** ~80 lines

- `lib/utils/saveContent.ts` - 30 lines
- `lib/utils/shareValidation.ts` - 50 lines

**Tests:** ~400 lines

- Hook tests: 200 lines
- Component tests: 100 lines
- Utility tests: 50 lines
- Integration tests: 50 lines

**Infrastructure Total:** ~930 lines

### Migrated Tab Code (Estimated)

**Before:** 2,693 lines
**After:** ~1,200 lines (average 100 lines per tab)
**Reduction:** ~1,493 lines (55% reduction in tab code)

**Examples:**

- `text-convert-tab.tsx`: 41 → 30 lines (27% reduction)
- `json-format-tab.tsx`: 190 → 120 lines (37% reduction)
- `json-minify-tab.tsx`: 139 → 90 lines (35% reduction)
- `media-to-base64-tab.tsx`: 534 → 280 lines (48% reduction)

### Net Code Reduction

**Before:** 2,693 lines (tabs only)
**After:** 2,130 lines (930 infrastructure + 1,200 migrated tabs)
**Net Reduction:** 563 lines (21% reduction)

**With Tests:**
**Before:** 2,693 lines (no tests)
**After:** 2,530 lines (930 infrastructure + 1,200 migrated tabs + 400 tests)
**Net Reduction:** 163 lines (6% reduction, but with comprehensive test coverage)

### Value Beyond Code Reduction

**Benefits not captured by line count:**

1. **Consistency:** All tabs behave identically for share/save/clear
2. **Maintainability:** Bug fixes apply to all tabs automatically
3. **Type Safety:** Strong TypeScript types prevent runtime errors
4. **Test Coverage:** Comprehensive tests for shared code
5. **Developer Experience:** Easier to add new tabs in the future
6. **Error Handling:** Consistent error handling across all tabs
7. **Documentation:** Clear patterns for future developers

**Long-term Savings:**

- Adding a new tab: ~200 lines → ~80 lines (60% reduction)
- Fixing a share bug: Fix in 1 place instead of 11 tabs
- Adding a new action: Add to StandardActions once

## File Structure

```
src/
├── types/
│   └── tab-data.ts (NEW - 50 lines)
├── hooks/
│   ├── useTabState.ts (NEW - 120 lines)
│   ├── useShareDialog.ts (NEW - 70 lines)
│   └── useClearDialog.ts (NEW - 60 lines)
├── components/
│   └── tool-layout/
│       ├── ToolLayout.tsx (NEW - 20 lines)
│       ├── ToolToolbar.tsx (NEW - 30 lines)
│       ├── ToolDialogs.tsx (NEW - 20 lines)
│       └── StandardActions.tsx (NEW - 80 lines)
├── lib/
│   └── utils/
│       ├── saveContent.ts (NEW - 30 lines)
│       └── shareValidation.ts (NEW - 50 lines)
├── __tests__/
│   ├── hooks/
│   │   ├── useTabState.test.ts (NEW - 200 lines)
│   │   ├── useShareDialog.test.ts (NEW - 70 lines)
│   │   └── useClearDialog.test.ts (NEW - 60 lines)
│   ├── components/
│   │   ├── ToolLayout.test.tsx (NEW - 50 lines)
│   │   └── StandardActions.test.tsx (NEW - 50 lines)
│   └── utils/
│       └── shareValidation.test.ts (NEW - 50 lines)
└── app/
    ├── text/tabs/
    │   ├── text-convert-tab.tsx (MIGRATED - 41→30 lines)
    │   ├── text-diff-tab.tsx (MIGRATED - 87→60 lines)
    │   └── text-clean-tab.tsx (MIGRATED - 353→200 lines)
    ├── json/tabs/
    │   ├── json-format-tab.tsx (MIGRATED - 190→120 lines)
    │   ├── json-minify-tab.tsx (MIGRATED - 139→90 lines)
    │   ├── json-parser-tab.tsx (MIGRATED - 147→100 lines)
    │   └── ... (all migrated)
    └── base64/tabs/
        ├── media-to-base64-tab.tsx (MIGRATED - 534→280 lines)
        └── base64-to-media-tab.tsx (MIGRATED - 610→320 lines)
```

## Integration with Recent Work

**Relationship to Tab-Level Optimization (Saved/Shared/History):**

The recent tab-level optimization introduced factory functions for Saved, Shared, and History tabs. This functional tab optimization is complementary but separate:

**Tab-Level Optimization (Completed):**

- Factory functions for generic tabs (Saved, Shared, History)
- Configuration-driven approach
- Eliminated 9 wrapper files

**Functional Tab Optimization (This Spec):**

- Shared hooks and components for functional tabs (diff, format, minify, etc.)
- Code duplication reduction
- Preserves unique functionality of each tool

**How They Work Together:**

```typescript
// Page structure after both optimizations
function TextPage() {
    const components = {
        // Functional tabs (use shared hooks)
        diff: TextDiffTab,        // Uses useTabState, useShareDialog, etc.
        convert: TextConvertTab,  // Uses useTabState, useShareDialog, etc.
        clean: TextCleanTab,      // Uses useTabState, useShareDialog, etc.

        // Generic tabs (factory-created)
        saved: createSavedTab(TEXT_CONFIG.savedTabs!),
        shared: createSharedTab(TEXT_CONFIG.sharedTabs!),
        history: createHistoryTab(TEXT_CONFIG.historyTabs!),
    };

    return <ToolPage config={TEXT_CONFIG} components={components} />;
}
```

**Shared Patterns:**

- Both use configuration-driven approach
- Both emphasize type safety
- Both follow single responsibility principle
- Both prioritize maintainability

**Distinct Concerns:**

- Tab-level optimization: Generic tabs with same UI, different data
- Functional tab optimization: Unique tool logic, shared infrastructure

## Success Criteria

1. **Code Quality:**
    - [ ] 21% net code reduction (563 lines)
    - [ ] All tabs use shared hooks and components
    - [ ] No code duplication in share/save/clear logic
    - [ ] TypeScript strict mode, no any types

2. **UI Unchanged:**
    - [ ] Visual regression shows zero differences
    - [ ] All functionality preserved
    - [ ] No behavior changes

3. **Functionality:**
    - [ ] All features work exactly as before
    - [ ] Share/save/clear work consistently
    - [ ] Shared URLs load correctly
    - [ ] Dual-pane tabs work correctly

4. **Error Handling:**
    - [ ] Consistent error handling across all tabs
    - [ ] Graceful fallbacks for localStorage issues
    - [ ] User-friendly error messages

5. **Test Coverage:**
    - [ ] Unit tests for all hooks
    - [ ] Integration tests for components
    - [ ] Manual testing checklist complete

6. **Performance:**
    - [ ] No increase in render cycles
    - [ ] No performance regression
    - [ ] Smooth UI interactions

7. **Build Success:**
    - [ ] Production build passes
    - [ ] No TypeScript errors
    - [ ] No ESLint warnings
    - [ ] Console clean during usage

## Risks and Mitigations

| Risk                            | Likelihood | Impact | Mitigation                                                          |
| ------------------------------- | ---------- | ------ | ------------------------------------------------------------------- |
| Breaking existing functionality | Medium     | High   | Incremental migration, test after each change, rollback strategy    |
| UI/UX changes                   | Low        | High   | Visual regression, screenshot comparison, manual testing            |
| Type errors                     | Medium     | Medium | Strong TypeScript types, strict compilation, prototype first        |
| Performance regression          | Low        | Medium | Benchmark before/after, optimize hot paths, monitor render cycles   |
| localStorage edge cases         | Medium     | Low    | Comprehensive error handling, fallbacks, tests for edge cases       |
| Shared data loading issues      | Medium     | High   | Test async arrival pattern, handle missing data, validate URLs      |
| Hydration mismatches            | Low        | High   | Lazy initialization, typeof window checks, careful state management |
| Dual-pane complexity            | Medium     | Medium | Prototype with diff tab first, comprehensive testing                |
| Component re-creation issues    | Low        | Medium | Use render props pattern, avoid component-in-hook pattern           |
| Code reduction overestimate     | High       | Low    | Realistic estimates include infrastructure code, long-term benefits |

## Implementation Notes

- **Zero UI Changes:** This is purely a code refactoring, users see no difference
- **Backward Compatible:** Existing shared URLs continue to work
- **LocalStorage Preserved:** User data remains in same keys
- **Progressive Enhancement:** Migrate incrementally, can rollback at any step
- **Developer Experience:** Easier to add new tabs in the future
- **Test-Driven:** Write tests alongside implementation (TDD approach)
- **Performance Conscious:** Benchmark and monitor, optimize hot paths
- **Type Safe:** Leverage TypeScript for compile-time guarantees

## Related Work

- Built on top of existing Saved/Shared/History tab optimization
- Uses same configuration-driven patterns where applicable
- Leverages existing share/save utilities (saveTextContent, etc.)
- Reuses existing UI components (Toolbar, ConfirmDialog, etc.)
- Extends rather than replaces recent architectural improvements
