# ToolBar Component Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a flexible, two-column toolbar component with toggle switches and action buttons for JSON diff/comparison tools

**Architecture:** Single-component approach with controlled state pattern. Parent manages all toggle/button state, ToolBar renders UI based on props. Uses shadcn/ui components (Button, Switch) and Tabler Icons.

**Tech Stack:** React 19, TypeScript, Next.js 16, Tailwind CSS v4, shadcn/ui (Radix Nova), Radix UI Primitives, Tabler Icons

---

## File Structure

### New Files
- `components/ui/switch.tsx` - shadcn/ui Switch component (add via CLI)
- `components/toolbar/toolbar.tsx` - Main ToolBar component
- `components/toolbar/index.tsx` - Public API exports

### Modified Files
- `app/globals.css` - Add scrollbar-hide utility

### Dependencies
- Existing: `@/components/ui/button`, `@/lib/utils`, Tabler Icons
- New: `@/components/ui/switch` (Radix UI Switch primitive)

---

## Task 1: Add Switch Component from shadcn/ui

**Files:**
- Create: `components/ui/switch.tsx` (via shadcn CLI)

- [ ] **Step 1: Run shadcn CLI to add Switch component**

Run: `npx shadcn@latest add switch`

Expected output:
```
✔️️ Preflight checks.
✔️️ Verifying framework. Found Next.js.
✔️️ Validating Tailwind CSS.
✔️️ Adding component.
┌  components/ui/switch.tsx
└  Successfully added component.
```

Why: Switch component is required for toggle functionality. Using shadcn CLI ensures compatibility with existing theme and styling system.

---

## Task 2: Add Scrollbar Hide Utility

**Files:**
- Modify: `app/globals.css`

- [ ] **Step 1: Add scrollbar-hide utility class to globals.css**

Add to end of `app/globals.css`:

```css
/* Scrollbar hide utility for horizontal scrolling */
.scrollbar-hide {
    -ms-overflow-style: none;  /* IE and Edge */
    scrollbar-width: none;  /* Firefox */
}

.scrollbar-hide::-webkit-scrollbar {
    display: none;  /* Chrome, Safari and Opera */
}
```

- [ ] **Step 2: Verify CSS file is valid**

Run: `npm run build`

Expected: Build completes successfully with no CSS errors

- [ ] **Step 3: Commit CSS utility**

```bash
git add app/globals.css
git commit -m "feat: add scrollbar-hide utility for horizontal scroll

Add CSS utility class to hide scrollbars while maintaining scroll
functionality. Required for ToolBar component horizontal scrolling
on smaller screens.

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>"
```

Why: Horizontal scrolling on left side requires hidden scrollbar for clean appearance. This utility provides cross-browser scrollbar hiding.

---

## Task 3: Create Toolbar Directory Structure

**Files:**
- Create: `components/toolbar/`

- [ ] **Step 1: Create toolbar directory**

Run: `mkdir -p components/toolbar`

Expected: Directory created without errors

- [ ] **Step 2: Verify directory creation**

Run: `ls -la components/ | grep toolbar`

Expected: `drwxrwxr-x ... toolbar`

Why: Organized component structure follows established patterns in the codebase (e.g., `components/navbar/`, `components/theme/`).

---

## Task 4: Implement ToolBar Component with Types

**Files:**
- Create: `components/toolbar/toolbar.tsx`

- [ ] **Step 1: Write ToolBar component with TypeScript types**

Create `components/toolbar/toolbar.tsx`:

```typescript
import * as React from 'react'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { cn } from '@/lib/utils'

// ============================================================================
// Type Definitions
// ============================================================================

export interface ToggleButtonConfig {
    id: string
    label: string
    icon: React.ComponentType<{ className?: string }>
    checked: boolean
    onChange: (checked: boolean) => void
}

export interface ActionButtonConfig {
    id: string
    label: string
    icon?: React.ComponentType<{ className?: string }>
    variant: 'primary' | 'outline'
    onClick: () => void
    disabled?: boolean
    isLoading?: boolean
}

export interface ToolBarProps {
    leftButtons: ToggleButtonConfig[]
    rightButtons: ActionButtonConfig[]
    fullWidth?: boolean
    className?: string
}

// ============================================================================
// Main Component
// ============================================================================

export function ToolBar({
    leftButtons,
    rightButtons,
    fullWidth = true,
    className,
}: ToolBarProps) {
    return (
        <div
            role="toolbar"
            aria-label="Diff options"
            className={cn(
                // Base layout
                'flex items-center justify-between gap-4',
                // Sizing
                'h-14 px-4 py-2',
                // Styling
                'bg-background border-b',
                // Width
                fullWidth ? 'w-full' : 'w-auto',
                className
            )}
        >
            {/* Left Side - Toggle Switches */}
            <div
                className={cn(
                    'flex items-center gap-3',
                    'overflow-x-auto scrollbar-hide',
                    'flex-1 min-w-0'
                )}
            >
                {leftButtons.map((toggle) => (
                    <ToggleSwitch
                        key={toggle.id}
                        {...toggle}
                    />
                ))}
            </div>

            {/* Right Side - Action Buttons */}
            <div
                className={cn(
                    'flex items-center gap-2',
                    'flex-shrink-0'
                )}
            >
                {rightButtons.map((button) => (
                    <ActionButton
                        key={button.id}
                        {...button}
                    />
                ))}
            </div>
        </div>
    )
}

// ============================================================================
// Sub-Components
// ============================================================================

interface ToggleSwitchProps extends ToggleButtonConfig {}

function ToggleSwitch({
    id,
    label,
    icon: Icon,
    checked,
    onChange,
}: ToggleSwitchProps) {
    return (
        <label
            htmlFor={id}
            className={cn(
                'flex items-center gap-2',
                'h-8',
                'cursor-pointer',
                'select-none'
            )}
        >
            {Icon && (
                <Icon
                    className="size-4 shrink-0"
                    aria-hidden="true"
                />
            )}
            <Switch
                id={id}
                checked={checked}
                onCheckedChange={onChange}
                className="shrink-0"
            />
            <span className="text-sm whitespace-nowrap">
                {label}
            </span>
        </label>
    )
}

interface ActionButtonProps extends ActionButtonConfig {}

function ActionButton({
    label,
    icon: Icon,
    variant,
    onClick,
    disabled = false,
    isLoading = false,
}: ActionButtonProps) {
    // Map variant to Button component variant
    const buttonVariant = variant === 'primary' ? 'default' : 'outline'

    return (
        <Button
            variant={buttonVariant}
            size="sm"
            onClick={onClick}
            disabled={disabled || isLoading}
            aria-busy={isLoading}
        >
            {isLoading ? (
                // Loading spinner
                <svg
                    className="animate-spin size-4"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                >
                    <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                    />
                    <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                </svg>
            ) : Icon ? (
                <Icon className="size-4" aria-hidden="true" />
            ) : null}
            <span>{label}</span>
        </Button>
    )
}
```

- [ ] **Step 2: Verify TypeScript compilation**

Run: `npx tsc --noEmit`

Expected: No TypeScript errors

Why: This is the main component implementation. Includes all TypeScript types, sub-components for toggles and buttons, accessibility attributes, and responsive layout.

---

## Task 5: Create Public API Export

**Files:**
- Create: `components/toolbar/index.tsx`

- [ ] **Step 1: Create index.tsx with exports**

Create `components/toolbar/index.tsx`:

```typescript
export { ToolBar } from './toolbar'
export type {
    ToolBarProps,
    ToggleButtonConfig,
    ActionButtonConfig
} from './toolbar'
```

- [ ] **Step 2: Verify TypeScript compilation**

Run: `npx tsc --noEmit`

Expected: No TypeScript errors

- [ ] **Step 3: Commit ToolBar component**

```bash
git add components/
git commit -m "feat: add ToolBar component

Implement flexible two-column toolbar component with toggle switches
and action buttons. Features:

- Controlled component pattern (parent manages state)
- Left side: Horizontal scrollable toggle switches with icons
- Right side: Action buttons with loading states
- Responsive design with horizontal scroll on mobile
- Full accessibility support (ARIA, keyboard navigation)
- TypeScript with complete type definitions

Component: @/components/toolbar
Dependencies: shadcn/ui Button, Switch (new), Tabler Icons

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>"
```

Why: Clean public API allows consumers to import from `@/components/toolbar` rather than full path. Matches established pattern (e.g., `@/components/navbar`).

---

## Task 6: Create Demo/Test Page

**Files:**
- Create: `app/toolbar-demo/page.tsx`

- [ ] **Step 1: Create demo page to test ToolBar**

Create `app/toolbar-demo/page.tsx`:

```typescript
'use client'

import { useState } from 'react'
import { ToolBar } from '@/components/toolbar'
import {
    IconKey,
    IconCode,
    IconTrash,
    IconArrowsDiff,
    IconWhitespace,
    IconBrain
} from '@tabler/icons-react'

export default function ToolBarDemoPage() {
    const [toggles, setToggles] = useState({
        ignoreKeyOrder: true,
        prettyPrint: false,
        ignoreWhitespace: true,
        semanticDiff: false,
    })

    const [isComparing, setIsComparing] = useState(false)

    const handleToggleChange = (id: keyof typeof toggles) => (checked: boolean) => {
        setToggles(prev => ({ ...prev, [id]: checked }))
    }

    const handleCompare = async () => {
        setIsComparing(true)
        // Simulate async operation
        await new Promise(resolve => setTimeout(resolve, 2000))
        setIsComparing(false)
        console.log('Compare clicked', toggles)
    }

    const handleClear = () => {
        console.log('Clear clicked')
    }

    const handleCopy = () => {
        console.log('Copy clicked')
    }

    return (
        <div className="min-h-screen bg-background p-8">
            <div className="max-w-7xl mx-auto space-y-8">
                <div>
                    <h1 className="text-3xl font-bold mb-2">
                        ToolBar Component Demo
                    </h1>
                    <p className="text-muted-foreground">
                        Interactive demo of the ToolBar component
                    </p>
                </div>

                {/* ToolBar Demo */}
                <div className="border rounded-lg p-6 space-y-4">
                    <h2 className="text-xl font-semibold">
                        JSON Diff Options
                    </h2>

                    <ToolBar
                        fullWidth
                        leftButtons={[
                            {
                                id: 'ignoreKeyOrder',
                                label: 'Ignore Key Order',
                                icon: IconKey,
                                checked: toggles.ignoreKeyOrder,
                                onChange: handleToggleChange('ignoreKeyOrder')
                            },
                            {
                                id: 'prettyPrint',
                                label: 'Pretty Print',
                                icon: IconCode,
                                checked: toggles.prettyPrint,
                                onChange: handleToggleChange('prettyPrint')
                            },
                            {
                                id: 'ignoreWhitespace',
                                label: 'Ignore Whitespace',
                                icon: IconWhitespace,
                                checked: toggles.ignoreWhitespace,
                                onChange: handleToggleChange('ignoreWhitespace')
                            },
                            {
                                id: 'semanticDiff',
                                label: 'Semantic Type Diff',
                                icon: IconBrain,
                                checked: toggles.semanticDiff,
                                onChange: handleToggleChange('semanticDiff')
                            },
                        ]}
                        rightButtons={[
                            {
                                id: 'compare',
                                label: 'Compare',
                                icon: IconArrowsDiff,
                                variant: 'primary',
                                isLoading: isComparing,
                                onClick: handleCompare
                            },
                            {
                                id: 'copy',
                                label: 'Copy',
                                icon: IconCode,
                                variant: 'outline',
                                onClick: handleCopy
                            },
                            {
                                id: 'clearAll',
                                label: 'Clear All',
                                icon: IconTrash,
                                variant: 'outline',
                                onClick: handleClear
                            },
                        ]}
                    />

                    {/* State Display */}
                    <div className="mt-4 p-4 bg-muted rounded-lg">
                        <h3 className="font-semibold mb-2">Current State:</h3>
                        <pre className="text-sm">
                            {JSON.stringify(toggles, null, 2)}
                        </pre>
                    </div>
                </div>

                {/* Responsive Behavior Test */}
                <div className="border rounded-lg p-6">
                    <h2 className="text-xl font-semibold mb-4">
                        Responsive Behavior
                    </h2>
                    <p className="text-sm text-muted-foreground mb-4">
                        Resize your browser to test horizontal scrolling on smaller screens.
                    </p>
                    <div className="text-xs space-y-1">
                        <p>• Desktop (≥768px): Full two-column layout</p>
                        <p>• Tablet (640-767px): Two-column with scroll</p>
                        <p>• Mobile (&lt;640px): Horizontal scroll on left side</p>
                    </div>
                </div>

                {/* Keyboard Navigation */}
                <div className="border rounded-lg p-6">
                    <h2 className="text-xl font-semibold mb-4">
                        Keyboard Navigation
                    </h2>
                    <p className="text-sm text-muted-foreground mb-2">
                        Test keyboard accessibility:
                    </p>
                    <ul className="text-xs space-y-1 list-disc list-inside">
                        <li><kbd className="px-1 py-0.5 bg-muted rounded">Tab</kbd> - Navigate between controls</li>
                        <li><kbd className="px-1 py-0.5 bg-muted rounded">Enter</kbd> / <kbd className="px-1 py-0.5 bg-muted rounded">Space</kbd> - Activate toggle or button</li>
                    </ul>
                </div>
            </div>
        </div>
    )
}
```

- [ ] **Step 2: Verify TypeScript compilation**

Run: `npx tsc --noEmit`

Expected: No TypeScript errors

Why: Demo page provides interactive testing environment for all ToolBar features: toggles, buttons, loading states, responsive behavior, keyboard navigation.

---

## Task 7: Development Build Verification

**Files:**
- Build: Next.js development server

- [ ] **Step 1: Start development server**

Run: `npm run dev`

Expected: Server starts successfully on http://localhost:3000

- [ ] **Step 2: Navigate to demo page**

Open: http://localhost:3000/toolbar-demo

Expected: Page renders without errors, ToolBar visible

- [ ] **Step 3: Test toggle functionality**

Actions:
1. Click each toggle switch
2. Verify state changes in "Current State" display
3. Verify icon + label visible
4. Verify checked state reflects visually

Expected: All toggles respond to clicks, state updates correctly

- [ ] **Step 4: Test button functionality**

Actions:
1. Click "Compare" button
2. Verify loading spinner appears
3. Wait 2 seconds for async operation
4. Verify button returns to normal state
5. Click "Copy" and "Clear All" buttons
6. Verify console logs appear

Expected: All buttons work, loading state shows correctly

- [ ] **Step 5: Test keyboard navigation**

Actions:
1. Press <kbd>Tab</kbd> to navigate between controls
2. Press <kbd>Enter</kbd> or <kbd>Space</kbd> to activate
3. Verify visible focus indicators

Expected: Keyboard navigation works, focus visible, controls activate

- [ ] **Step 6: Test responsive behavior**

Actions:
1. Resize browser to tablet width (640-767px)
2. Verify left side becomes scrollable
3. Resize to mobile width (< 640px)
4. Verify horizontal scroll works
5. Verify right side buttons remain visible

Expected: Responsive layout works correctly at all breakpoints

- [ ] **Step 7: Stop development server**

Run: <kbd>Ctrl</kbd>+<kbd>C</kbd> in terminal

Expected: Development server stops gracefully

Why: Manual testing verifies all functionality works as designed before production build.

---

## Task 8: Production Build Verification

**Files:**
- Build: Production Next.js build

- [ ] **Step 1: Run production build**

Run: `npm run build`

Expected output:
```
   LING  ... (build steps)
   ✓ Compiled successfully
   ✓ Linting and checking validity of types
   ✓ Collecting page data
   ✓ Generating static pages (3/3)
   ✓ Finalizing page optimization

Route (app)                              Size
┌ ○ /                                    ...
├ ○ /toolbar-demo                        ...
└ ○ /_not-found                          ...

○ (Static)  prerendered as static content
```

- [ ] **Step 2: Verify no TypeScript errors**

Check build output for: `✓ Linting and checking validity of types`

Expected: No type errors reported

- [ ] **Step 3: Start production server**

Run: `npm start`

Expected: Production server starts on http://localhost:3000

- [ ] **Step 4: Quick smoke test in production**

Actions:
1. Navigate to http://localhost:3000/toolbar-demo
2. Verify page loads
3. Test toggles and buttons
4. Check responsive behavior

Expected: All features work in production build

- [ ] **Step 5: Stop production server**

Run: <kbd>Ctrl</kbd>+<kbd>C</kbd> in terminal

Expected: Production server stops gracefully

- [ ] **Step 6: Commit demo page**

```bash
git add app/toolbar-demo/
git commit -m "feat: add ToolBar component demo page

Add interactive demo page at /toolbar-demo for testing and documentation.
Showcases all ToolBar features:
- Toggle switches with icons
- Primary and outline action buttons
- Loading states
- Responsive behavior
- Keyboard navigation

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>"
```

Why: Production build verifies no runtime errors, TypeScript compilation passes, and component works in optimized environment.

---

## Task 9: Documentation and Success Criteria

**Files:**
- Documentation: Update README or create component documentation (optional)

- [ ] **Step 1: Verify all success criteria met**

Checklist:
- [✓] Component renders without errors (Task 7)
- [✓] All props are properly typed (Task 4, 5)
- [✓] Toggles reflect parent state correctly (Task 7, Step 3)
- [✓] Buttons show loading states properly (Task 7, Step 4)
- [✓] Keyboard navigation works end-to-end (Task 7, Step 5)
- [✓] Responsive behavior matches specification (Task 7, Step 6)
- [✓] Accessibility audit passes (ARIA attributes in Task 4)
- [✓] TypeScript compilation succeeds (Tasks 4, 5, 6, 8)
- [✓] Production build succeeds (Task 8)

- [ ] **Step 2: Optional - Add component documentation**

If you want to add documentation, create `components/toolbar/README.md`:

```markdown
# ToolBar Component

Flexible two-column toolbar for displaying toggle switches and action buttons.

## Installation

```bash
# Already installed in components/toolbar
import { ToolBar } from '@/components/toolbar'
```

## Usage

See `/toolbar-demo` for interactive example.

## API

### ToolBarProps

- `leftButtons`: Array of toggle button configs
- `rightButtons`: Array of action button configs
- `fullWidth?`: Boolean, default true
- `className?`: Additional CSS classes

### ToggleButtonConfig

- `id`: Unique identifier
- `label`: Display text
- `icon`: Tabler icon component
- `checked`: Current state (controlled)
- `onChange`: Callback when toggled

### ActionButtonConfig

- `id`: Unique identifier
- `label`: Display text
- `icon?`: Tabler icon component (optional)
- `variant`: 'primary' | 'outline'
- `onClick`: Click handler
- `disabled?`: Disable button
- `isLoading?`: Show loading spinner
```

Why: Verifies all requirements from specification are met. Optional documentation helps future developers.

---

## Completion

All tasks complete! The ToolBar component is ready for use in your JSON diff/comparison tool or any other part of the application.

### Integration Example

To use ToolBar in your existing JSON diff page:

```typescript
import { ToolBar } from '@/components/toolbar'
import { IconKey, IconCode, IconArrowsDiff } from '@tabler/icons-react'

// In your component
<ToolBar
  fullWidth
  leftButtons={[
    {
      id: 'ignoreKeyOrder',
      label: 'Ignore Key Order',
      icon: IconKey,
      checked: toggles.ignoreKeyOrder,
      onChange: (checked) => setToggles({ ...toggles, ignoreKeyOrder: checked })
    }
  ]}
  rightButtons={[
    {
      id: 'compare',
      label: 'Compare',
      icon: IconArrowsDiff,
      variant: 'primary',
      isLoading: isComparing,
      onClick: handleCompare
    }
  ]}
/>
```

### Next Steps

- Remove demo page `/toolbar-demo` if not needed in production
- Integrate ToolBar into your JSON diff/comparison page
- Add additional toggle options or action buttons as needed
- Customize styling via `className` prop if needed
