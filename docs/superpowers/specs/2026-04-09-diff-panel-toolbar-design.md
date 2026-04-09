# Diff Panel Toolbar Component - Design Specification

**Date:** 2026-04-09
**Status:** Draft
**Component:** `DiffPanelToolbar`

## Overview

A reusable toolbar component for diff panels that displays diff statistics, provides view mode switching, and offers export and sharing capabilities. The component follows shadcn/ui design patterns and integrates with the existing JSON diff viewer.

## Requirements

### Functional Requirements
1. Display diff statistics with color-coded additions, deletions, and modifications
2. Provide view mode switching between Split, Unified, and Inline views
3. Offer share functionality via dialog
4. Provide comprehensive menu with filter, export, and panel options
5. Support dark mode
6. Be fully responsive

### Non-Functional Requirements
1. Follow existing codebase patterns (Toolbar component)
2. Use shadcn/ui components exclusively
3. TypeScript with strict typing
4. Accessible keyboard navigation
5. Performance: Minimal re-renders

## Architecture

### Component Structure

```
DiffPanelToolbar (main container)
├── ViewModeTabs (left side)
│   ├── TabButton (Split)
│   ├── TabButton (Unified)
│   └── TabButton (Inline)
├── DiffStatsDisplay (center-right)
├── ShareButton (right side)
└── DiffOptionsDropdown (right side)
    └── DropdownMenu (grouped sections)
```

### Component Responsibilities

**DiffPanelToolbar**
- Manages toolbar state (view mode, dialog states)
- Calculates percentage from stats
- Coordinates between child components
- Handles responsive layout

**ViewModeTabs**
- Renders tab buttons for each view mode
- Manages active tab state
- Triggers `onViewModeChange` callback

**DiffStatsDisplay**
- Formats and displays statistics
- Color-codes additions (green), deletions (red), modifications (orange)
- Shows percentage calculation

**ShareButton**
- Icon button with tooltip
- Opens share dialog (separate component)
- Triggers `onShare` callback

**DiffOptionsDropdown**
- Three-dot menu with grouped sections
- Filter Changes section with counts
- Export section with multiple formats
- Panels section with toggles

## Data Flow

### State Management

**Local State:**
```typescript
{
  viewMode: 'split' | 'unified' | 'inline';  // default: 'unified'
  isShareDialogOpen: boolean;
  isOptionsMenuOpen: boolean;
}
```

**Props (Input):**
```typescript
interface DiffPanelToolbarProps {
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

**Derived State:**
```typescript
percentageChanged = ((additionCount + deletionCount + modificationCount) / totalLines) * 100
```

### Data Flow Diagram

```
Parent Component
    ↓ (props: additionCount, deletionCount, etc.)
DiffPanelToolbar
    ↓ (derives)
percentageChanged
    ↓ (displays)
DiffStatsDisplay
    ↓ (user interaction)
ViewModeTabs → onViewModeChange callback
ShareButton → onShare callback
DiffOptionsDropdown → onExport/onFilterChange/onPanelToggle callbacks
```

## Implementation Details

### UI Components & Styling

**View Mode Tabs:**
- Component: `Button` from shadcn/ui
- Variant: `outline` (inactive), `default` (active)
- Size: `sm`
- Layout: Horizontal flex container
- Active tab highlighted with primary color

**Diff Stats Display:**
- Layout: Horizontal flex with gaps
- Typography: `text-sm` for labels, `font-semibold` for numbers
- Colors:
  - Additions: `text-green-600 dark:text-green-400`
  - Deletions: `text-red-600 dark:text-red-400`
  - Modified: `text-orange-600 dark:text-orange-400`
  - Percentage: `text-gray-600 dark:text-gray-400`
- Separator: Vertical line using `Separator` component

**Share Button:**
- Component: `Button` with `size="icon-sm"`
- Icon: `Share2` from lucide-react
- Tooltip: "Share this diff"
- Variant: `outline`

**Options Dropdown:**
- Component: `DropdownMenu` from shadcn/ui
- Trigger: `Button` with `MoreVertical` icon
- Menu structure:
  1. **Filter Changes** section
     - All (5)
     - + Added (2)
     - - Deleted (1)
     - ~ Modified (2)
  2. **Export** section
     - Copy as JSON Patch
     - Copy as Merge Patch
     - Download Patch
     - Export HTML Report
     - Copy JSON Paths
  3. **Panels** section
     - Bookmarks
     - Tree Panel
     - Statistics
     - Validation

### Type Definitions

```typescript
// View modes
type ViewMode = 'split' | 'unified' | 'inline';

// Export formats
type ExportFormat =
  | 'json-patch'
  | 'merge-patch'
  | 'download-patch'
  | 'html-report'
  | 'json-paths';

// Diff filters
type DiffFilter = 'all' | 'additions' | 'deletions' | 'modifications';

// Panel types
type PanelType = 'bookmarks' | 'tree-panel' | 'statistics' | 'validation';

// Main props interface
interface DiffPanelToolbarProps {
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

### Responsive Design

**Desktop (>768px):**
- Full toolbar with all elements visible
- Tabs and stats on same row
- Horizontal spacing optimized

**Mobile (≤768px):**
- Tabs scroll horizontally if needed
- Stats maintain visibility
- Buttons remain touch-friendly (min 44×44px)
- Menu accessible via dropdown

**Accessibility:**
- Keyboard navigation (Tab, Arrow keys, Enter/Space)
- ARIA labels on icon buttons
- Focus indicators
- Screen reader announcements for stats

## Integration Points

### With Existing Components

**Current Integration:**
```typescript
// In diff-panel.tsx
<DiffPanelToolbar
  additionCount={diffResult.additionCount}
  deletionCount={diffResult.deletionCount}
/>
```

**New Integration:**
```typescript
// In diff-panel.tsx
<DiffPanelToolbar
  additionCount={diffResult.additionCount}
  deletionCount={diffResult.deletionCount}
  modificationCount={diffResult.modificationCount}  // NEW
  totalLines={diffResult.lineCount}                 // NEW
  onViewModeChange={(mode) => setViewMode(mode)}    // NEW
  onShare={() => openShareDialog()}                 // NEW
  onExport={(format) => handleExport(format)}       // NEW
  onFilterChange={(filter) => setFilter(filter)}    // NEW
/>
```

### Required Interface Changes

**Extend DiffResult Interface:**
```typescript
// In components/editor-pane/types.ts
export interface DiffResult {
  hunks: DiffHunk[];
  lineCount: number;
  additionCount: number;
  deletionCount: number;
  modificationCount: number;  // NEW FIELD
}
```

### Share Dialog (Future Component)

The share button will open a dialog component (to be implemented separately):
- Display shareable URL
- Copy to clipboard button
- Social sharing options (optional)
- Export options (alternative to menu)

## Testing Strategy

### Unit Tests
1. Component renders with all props
2. Stats display correctly with zero values
3. Percentage calculation accuracy
4. View mode switching triggers callback
5. Share button triggers callback
6. Dropdown menu renders all sections
7. Menu items trigger correct callbacks

### Integration Tests
1. Toolbar integration with DiffPanel
2. View mode changes propagate to parent
3. Export actions trigger parent handlers
4. Filter changes update diff display

### Accessibility Tests
1. Keyboard navigation flows correctly
2. Screen reader announces stats properly
3. Focus management in dropdown
4. Color contrast meets WCAG AA

### Visual Regression Tests
1. Light mode renders correctly
2. Dark mode renders correctly
3. Mobile breakpoint layouts
4. Hover/focus states

## File Structure

```
components/editor-pane/
├── diff-panel-toolbar.tsx           # Main toolbar component
├── diff-panel-toolbar-types.ts      # Type definitions (or use existing types.ts)
├── view-mode-tabs.tsx              # View mode tab group (optional extraction)
├── diff-stats-display.tsx          # Stats display (optional extraction)
└── diff-options-dropdown.tsx       # Options menu (optional extraction)
```

## Success Criteria

1. ✅ Toolbar displays accurate diff statistics
2. ✅ View mode tabs work correctly
3. ✅ Share button opens dialog
4. ✅ Three-dot menu shows all sections and options
5. ✅ Component is fully typed with TypeScript
6. ✅ Dark mode works correctly
7. ✅ Responsive design passes mobile tests
8. ✅ Accessibility standards met
9. ✅ Integrates seamlessly with existing DiffPanel
10. ✅ No breaking changes to existing code

## Open Questions

1. Should share dialog be implemented in this phase or as a follow-up?
2. Should panel toggles (Bookmarks, Tree Panel, etc.) be implemented now or stubbed?
3. Do we need animation for view mode transitions?

## Timeline Estimate

- Component implementation: 2-3 hours
- Integration and testing: 1-2 hours
- Share dialog (if included): +1-2 hours
- **Total: 3-5 hours** (depending on scope)
