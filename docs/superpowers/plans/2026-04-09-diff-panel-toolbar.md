# Diff Panel Toolbar Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a reusable toolbar component for diff panels with view mode switching, statistics display, share functionality, and options menu.

**Architecture:** Component-based architecture using shadcn/ui primitives. Main toolbar container orchestrates child components (ViewModeTabs, DiffStatsDisplay, ShareButton, DiffOptionsDropdown). Controlled component pattern for view mode state.

**Tech Stack:** React, TypeScript, Tailwind CSS, shadcn/ui (Button, DropdownMenu, Separator, Tooltip), lucide-react icons

---

## File Structure

```
components/editor-pane/
├── types.ts                           # MODIFY: Add new types
├── use-json-diff.ts                   # MODIFY: Add modificationCount calculation
├── diff-panel.tsx                      # MODIFY: Update integration
├── diff-panel-toolbar.tsx              # MODIFY: Replace with new implementation
├── diff-stats-display.tsx              # CREATE: Stats display component
├── view-mode-tabs.tsx                  # CREATE: View mode tabs component
└── diff-options-dropdown.tsx           # CREATE: Options dropdown component
```

---

## Task 1: Extend Type Definitions

**Files:**
- Modify: `components/editor-pane/types.ts`

- [ ] **Step 1: Add type definitions for toolbar**

Add to `components/editor-pane/types.ts` after the `UseJsonDiffReturn` interface:

```typescript
// View modes for diff display
export type ViewMode = 'split' | 'unified' | 'inline';

// Export formats for the export menu
export type ExportFormat =
    | 'json-patch'
    | 'merge-patch'
    | 'download-patch'
    | 'html-report'
    | 'json-paths';

// Diff filter types
export type DiffFilter = 'all' | 'additions' | 'deletions' | 'modifications';

// Panel types for toggle menu
export type PanelType = 'bookmarks' | 'tree-panel' | 'statistics' | 'validation';

// Props for DiffPanelToolbar
export interface DiffPanelToolbarProps {
    // View mode (controlled component)
    viewMode: ViewMode;

    // Statistics
    additionCount: number;
    deletionCount: number;
    modificationCount: number;
    totalLines: number;

    // Callbacks
    onViewModeChange?: (mode: ViewMode) => void;
    onShare?: () => void;
    onExport?: (format: ExportFormat) => void;
    onFilterChange?: (filter: DiffFilter) => void;
    onPanelToggle?: (panel: PanelType) => void;

    // Styling
    className?: string;
}
```

- [ ] **Step 2: Add modificationCount to DiffResult**

Modify the `DiffResult` interface:

```typescript
// Complete diff result
export interface DiffResult {
    hunks: DiffHunk[];
    lineCount: number;
    additionCount: number;
    deletionCount: number;
    modificationCount: number;  // NEW FIELD
}
```

- [ ] **Step 3: Commit**

```bash
git add components/editor-pane/types.ts
git commit -m "feat(types): add diff panel toolbar types and modificationCount field"
```

---

## Task 2: Implement Modification Count Calculation

**Files:**
- Modify: `components/editor-pane/use-json-diff.ts`

- [ ] **Step 1: Add modification count calculation helper**

Add this function before the `useJsonDiff` hook:

```typescript
function calculateModificationCount(hunks: DiffHunk[]): number {
    let modifications = 0;
    hunks.forEach((hunk) => {
        for (let i = 0; i < hunk.lines.length - 1; i++) {
            const current = hunk.lines[i];
            const next = hunk.lines[i + 1];
            // Count deletion followed by addition as a modification
            if (
                current.type === 'deletion' &&
                next.type === 'addition' &&
                current.oldLineNumber === next.newLineNumber
            ) {
                modifications++;
            }
        }
    });
    return modifications;
}
```

- [ ] **Step 2: Update diff result creation**

Modify the result creation around line 138:

```typescript
const modificationCount = calculateModificationCount(hunks);

const result: DiffResult = {
    hunks,
    lineCount: oldLineNumber + newLineNumber - 2,
    additionCount,
    deletionCount,
    modificationCount,
};
```

- [ ] **Step 3: Run tests to ensure no regression**

```bash
npm test -- components/editor-pane/__tests__/use-json-diff.test.ts
```

Expected: All existing tests pass

- [ ] **Step 4: Commit**

```bash
git add components/editor-pane/use-json-diff.ts
git commit -m "feat(diff): add modification count calculation to diff result"
```

---

## Task 3: Create DiffStatsDisplay Component

**Files:**
- Create: `components/editor-pane/diff-stats-display.tsx`

- [ ] **Step 1: Create component file**

Create `components/editor-pane/diff-stats-display.tsx`:

```typescript
'use client';

import { cn } from '@/lib/utils';

interface DiffStatsDisplayProps {
    additionCount: number;
    deletionCount: number;
    modificationCount: number;
    percentageChanged: number;
    className?: string;
}

export function DiffStatsDisplay({
    additionCount,
    deletionCount,
    modificationCount,
    percentageChanged,
    className,
}: DiffStatsDisplayProps) {
    return (
        <div
            className={cn('flex items-center gap-2 text-sm', className)}
            role="status"
            aria-label={`Diff statistics: ${additionCount} additions, ${deletionCount} deletions, ${modificationCount} modifications, ${percentageChanged.toFixed(1)}% changed`}
        >
            <span
                className="font-semibold text-green-600 dark:text-green-400"
                aria-label="Additions"
            >
                +{additionCount}
            </span>
            <span
                className="font-semibold text-red-600 dark:text-red-400"
                aria-label="Deletions"
            >
                −{deletionCount}
            </span>
            <span
                className="font-semibold text-orange-600 dark:text-orange-400"
                aria-label="Modifications"
            >
                ~{modificationCount}
            </span>
            <span
                className="font-medium text-gray-600 dark:text-gray-400"
                aria-label="Percentage changed"
            >
                {percentageChanged.toFixed(1)}% changed
            </span>
        </div>
    );
}
```

- [ ] **Step 2: Commit**

```bash
git add components/editor-pane/diff-stats-display.tsx
git commit -m "feat(toolbar): add DiffStatsDisplay component"
```

---

## Task 4: Create ViewModeTabs Component

**Files:**
- Create: `components/editor-pane/view-mode-tabs.tsx`

- [ ] **Step 1: Create component file**

Create `components/editor-pane/view-mode-tabs.tsx`:

```typescript
'use client';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { ViewMode } from './types';

interface ViewModeTabsProps {
    currentMode: ViewMode;
    onModeChange: (mode: ViewMode) => void;
    className?: string;
}

const VIEW_MODES: { value: ViewMode; label: string }[] = [
    { value: 'split', label: 'Split' },
    { value: 'unified', label: 'Unified' },
    { value: 'inline', label: 'Inline' },
];

export function ViewModeTabs({
    currentMode,
    onModeChange,
    className,
}: ViewModeTabsProps) {
    return (
        <div
            className={cn('flex items-center gap-1', className)}
            role="tablist"
            aria-label="View mode"
        >
            {VIEW_MODES.map((mode) => (
                <Button
                    key={mode.value}
                    variant={currentMode === mode.value ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => onModeChange(mode.value)}
                    role="tab"
                    aria-selected={currentMode === mode.value}
                    aria-controls="diff-panel"
                    className="whitespace-nowrap"
                >
                    {mode.label}
                </Button>
            ))}
        </div>
    );
}
```

- [ ] **Step 2: Commit**

```bash
git add components/editor-pane/view-mode-tabs.tsx
git commit -m "feat(toolbar): add ViewModeTabs component"
```

---

## Task 5: Create DiffOptionsDropdown Component

**Files:**
- Create: `components/editor-pane/diff-options-dropdown.tsx`

- [ ] **Step 1: Create component file**

Create `components/editor-pane/diff-options-dropdown.tsx`:

```typescript
'use client';

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { MoreVertical } from 'lucide-react';
import { ExportFormat, DiffFilter, PanelType } from './types';

interface DiffOptionsDropdownProps {
    additionCount: number;
    deletionCount: number;
    modificationCount: number;
    onExport?: (format: ExportFormat) => void;
    onFilterChange?: (filter: DiffFilter) => void;
    onPanelToggle?: (panel: PanelType) => void;
}

export function DiffOptionsDropdown({
    additionCount,
    deletionCount,
    modificationCount,
    onExport,
    onFilterChange,
    onPanelToggle,
}: DiffOptionsDropdownProps) {
    const totalCount = additionCount + deletionCount + modificationCount;

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="outline"
                    size="icon-sm"
                    aria-label="More options"
                >
                    <MoreVertical className="h-4 w-4" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
                {/* Filter Changes Section */}
                <div className="px-2 py-1.5 text-xs font-semibold uppercase text-muted-foreground">
                    Filter Changes
                </div>
                <DropdownMenuItem onClick={() => onFilterChange?.('all')}>
                    <span className="text-foreground">All</span>
                    <span className="ml-auto text-muted-foreground">
                        {totalCount}
                    </span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onFilterChange?.('additions')}>
                    <span className="text-green-600 dark:text-green-400">
                        + Added
                    </span>
                    <span className="ml-auto text-muted-foreground">
                        {additionCount}
                    </span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onFilterChange?.('deletions')}>
                    <span className="text-red-600 dark:text-red-400">
                        − Deleted
                    </span>
                    <span className="ml-auto text-muted-foreground">
                        {deletionCount}
                    </span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onFilterChange?.('modifications')}>
                    <span className="text-orange-600 dark:text-orange-400">
                        ~ Modified
                    </span>
                    <span className="ml-auto text-muted-foreground">
                        {modificationCount}
                    </span>
                </DropdownMenuItem>

                <DropdownMenuSeparator />

                {/* Export Section */}
                <div className="px-2 py-1.5 text-xs font-semibold uppercase text-muted-foreground">
                    Export
                </div>
                <DropdownMenuItem onClick={() => onExport?.('json-patch')}>
                    Copy as JSON Patch
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onExport?.('merge-patch')}>
                    Copy as Merge Patch
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onExport?.('download-patch')}>
                    Download Patch
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onExport?.('html-report')}>
                    Export HTML Report
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onExport?.('json-paths')}>
                    Copy JSON Paths
                </DropdownMenuItem>

                <DropdownMenuSeparator />

                {/* Panels Section */}
                <div className="px-2 py-1.5 text-xs font-semibold uppercase text-muted-foreground">
                    Panels
                </div>
                <DropdownMenuItem onClick={() => onPanelToggle?.('bookmarks')}>
                    Bookmarks
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onPanelToggle?.('tree-panel')}>
                    Tree Panel
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onPanelToggle?.('statistics')}>
                    Statistics
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onPanelToggle?.('validation')}>
                    Validation
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
```

- [ ] **Step 2: Commit**

```bash
git add components/editor-pane/diff-options-dropdown.tsx
git commit -m "feat(toolbar): add DiffOptionsDropdown component"
```

---

## Task 6: Rewrite DiffPanelToolbar Component

**Files:**
- Modify: `components/editor-pane/diff-panel-toolbar.tsx`

- [ ] **Step 1: Replace toolbar implementation**

Replace the entire content of `components/editor-pane/diff-panel-toolbar.tsx`:

```typescript
'use client';

import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Share2 } from 'lucide-react';
import { DiffPanelToolbarProps } from './types';
import { ViewModeTabs } from './view-mode-tabs';
import { DiffStatsDisplay } from './diff-stats-display';
import { DiffOptionsDropdown } from './diff-options-dropdown';

export function DiffPanelToolbar({
    viewMode,
    additionCount,
    deletionCount,
    modificationCount,
    totalLines,
    onViewModeChange,
    onShare,
    onExport,
    onFilterChange,
    onPanelToggle,
    className,
}: DiffPanelToolbarProps) {
    // Calculate percentage changed
    const percentageChanged =
        totalLines > 0
            ? ((additionCount + deletionCount + modificationCount) / totalLines) *
              100
            : 0;

    return (
        <div
            className={`flex items-center justify-between gap-4 bg-gray-100 px-4 py-2 dark:bg-gray-800 ${className || ''}`}
            role="toolbar"
            aria-label="Diff panel toolbar"
        >
            {/* Left: View Mode Tabs */}
            <ViewModeTabs
                currentMode={viewMode}
                onModeChange={(mode) => onViewModeChange?.(mode)}
            />

            {/* Right: Stats and Actions */}
            <div className="flex items-center gap-3">
                {/* Stats Display */}
                <DiffStatsDisplay
                    additionCount={additionCount}
                    deletionCount={deletionCount}
                    modificationCount={modificationCount}
                    percentageChanged={percentageChanged}
                />

                {/* Separator */}
                <Separator orientation="vertical" className="h-6" />

                {/* Share Button */}
                <Button
                    variant="outline"
                    size="icon-sm"
                    onClick={onShare}
                    aria-label="Share this diff"
                    title="Share this diff"
                >
                    <Share2 className="h-4 w-4" />
                </Button>

                {/* Options Dropdown */}
                <DiffOptionsDropdown
                    additionCount={additionCount}
                    deletionCount={deletionCount}
                    modificationCount={modificationCount}
                    onExport={onExport}
                    onFilterChange={onFilterChange}
                    onPanelToggle={onPanelToggle}
                />
            </div>
        </div>
    );
}
```

- [ ] **Step 2: Commit**

```bash
git add components/editor-pane/diff-panel-toolbar.tsx
git commit -m "feat(toolbar): rewrite DiffPanelToolbar with new implementation"
```

---

## Task 7: Update DiffPanel Integration

**Files:**
- Modify: `components/editor-pane/diff-panel.tsx`

- [ ] **Step 1: Add view mode state**

Add this import at the top:
```typescript
import { useState } from 'react';
import { ViewMode } from './types';
```

Add state inside the DiffPanel component (after props destructuring):
```typescript
const [viewMode, setViewMode] = useState<ViewMode>('unified');
```

- [ ] **Step 2: Update toolbar props**

Modify the DiffPanelToolbar usage around line 38:

```typescript
<DiffPanelToolbar
    viewMode={viewMode}
    additionCount={diffResult.additionCount}
    deletionCount={diffResult.deletionCount}
    modificationCount={diffResult.modificationCount}
    totalLines={diffResult.lineCount}
    onViewModeChange={setViewMode}
    onShare={() => {
        // TODO: Implement share dialog
        console.log('Share clicked');
    }}
    onExport={(format) => {
        // TODO: Implement export handlers
        console.log('Export:', format);
    }}
    onFilterChange={(filter) => {
        // TODO: Implement filter logic
        console.log('Filter:', filter);
    }}
    onPanelToggle={(panel) => {
        // TODO: Implement panel toggles
        console.log('Panel:', panel);
    }}
/>
```

- [ ] **Step 3: Commit**

```bash
git add components/editor-pane/diff-panel.tsx
git commit -m "feat(panel): integrate new DiffPanelToolbar with view mode state"
```

---

## Task 8: Test the Implementation

**Files:**
- Test: All modified components

- [ ] **Step 1: Run development server**

```bash
npm run dev
```

Expected: Server starts without errors

- [ ] **Step 2: Manual testing checklist**

Test in browser at http://localhost:3000:

1. **Toolbar displays correctly**
   - Stats show correct numbers
   - Percentage is calculated accurately
   - Colors are correct (green/red/orange)

2. **View mode tabs work**
   - Click each tab (Split, Unified, Inline)
   - Active tab highlights correctly
   - Check console logs show mode changes

3. **Share button**
   - Click share button
   - Check console shows "Share clicked"

4. **Options dropdown**
   - Click three-dot menu
   - Verify all sections appear
   - Click each menu item
   - Check console logs for actions

5. **Dark mode**
   - Toggle dark mode
   - Verify colors invert correctly
   - Check contrast is readable

6. **Responsive**
   - Resize browser to mobile width
   - Verify toolbar remains usable
   - Check tabs scroll if needed

- [ ] **Step 3: Run type check**

```bash
npm run type-check
```

Expected: No TypeScript errors

- [ ] **Step 4: Run linter**

```bash
npm run lint
```

Expected: No linting errors

- [ ] **Step 5: Run existing tests**

```bash
npm test
```

Expected: All tests pass

- [ ] **Step 6: Commit if all tests pass**

```bash
git add .
git commit -m "test: verify implementation - all checks passing"
```

---

## Task 9: Accessibility Verification

**Files:**
- Test: Manual accessibility checks

- [ ] **Step 1: Keyboard navigation test**

1. Tab to toolbar
2. Use arrow keys to navigate between tabs
3. Press Enter/Space to activate
4. Tab through share button and menu
5. Verify focus indicators are visible

Expected: Full keyboard navigation works

- [ ] **Step 2: Screen reader test**

If you have a screen reader (NVDA, JAWS, VoiceOver):

1. Navigate to toolbar
2. Verify stats are announced correctly
3. Verify button labels are announced
4. Verify tab changes are announced

Expected: All elements properly announced

- [ ] **Step 3: ARIA attributes check**

Inspect DOM and verify:
- `role="toolbar"` on toolbar container
- `role="tablist"` and `role="tab"` on tabs
- `aria-selected` on active tab
- `aria-label` on icon buttons
- `role="status"` on stats display

Expected: All ARIA attributes present

- [ ] **Step 4: Color contrast check**

Use browser extension or online tool to verify:
- Green text on background: WCAG AA compliant
- Red text on background: WCAG AA compliant
- Orange text on background: WCAG AA compliant

Expected: All contrast ratios ≥ 4.5:1

- [ ] **Step 5: Commit**

```bash
git add .
git commit -m "test: verify accessibility compliance"
```

---

## Task 10: Documentation and Cleanup

**Files:**
- Create: Component documentation (optional)
- Modify: README if needed

- [ ] **Step 1: Add JSDoc comments to components**

Add JSDoc comments to exported components:

```typescript
/**
 * DiffPanelToolbar - Toolbar component for diff panels
 *
 * Displays diff statistics, view mode controls, and action buttons.
 *
 * @example
 * ```tsx
 * <DiffPanelToolbar
 *   viewMode={viewMode}
 *   additionCount={5}
 *   deletionCount={2}
 *   modificationCount={3}
 *   totalLines={100}
 *   onViewModeChange={setViewMode}
 * />
 * ```
 */
export function DiffPanelToolbar(props: DiffPanelToolbarProps) {
```

Repeat for other exported components.

- [ ] **Step 2: Update package.json if needed**

If you added new dependencies (unlikely for this task), update package.json.

- [ ] **Step 3: Final commit**

```bash
git add .
git commit -m "docs: add JSDoc comments and finalize implementation"
```

---

## Success Criteria Verification

After completing all tasks, verify:

- [ ] 1. Toolbar displays accurate diff statistics
- [ ] 2. View mode tabs work correctly and trigger callbacks
- [ ] 3. Share button triggers callback
- [ ] 4. Three-dot menu shows all sections and options
- [ ] 5. Menu items trigger appropriate callbacks
- [ ] 6. Component is fully typed with TypeScript
- [ ] 7. Dark mode works correctly
- [ ] 8. Responsive design passes mobile tests
- [ ] 9. Accessibility standards met
- [ ] 10. Integrates seamlessly with existing DiffPanel
- [ ] 11. No breaking changes to existing code

---

## Notes for Implementation

**Key Design Decisions:**
1. **Controlled component pattern** for view mode - parent owns state
2. **Modification count** uses simplified calculation (Math.min) for performance
3. **Callbacks are optional** - toolbar works without any handlers
4. **Responsive design** uses Tailwind's built-in breakpoints
5. **Accessibility first** - all interactive elements properly labeled

**Testing Strategy:**
- Manual testing required for UI components
- Existing tests should continue passing
- No unit tests added (follow existing project pattern)
- Focus on integration and accessibility testing

**Future Enhancements (Out of Scope):**
- Share dialog implementation
- Export handler implementations
- Panel toggle implementations
- Split/Unified/Inline view rendering
- Animation for view transitions
